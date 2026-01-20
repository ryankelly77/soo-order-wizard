-- gen_random_uuid() is built into PostgreSQL 13+ and Supabase

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE menu_category AS ENUM (
  'breakfast_package', 'lunch_entree', 'lunch_side',
  'lunch_salad', 'snack_package', 'drink_package'
);

CREATE TYPE order_status AS ENUM (
  'draft', 'pending_selections', 'selections_complete',
  'payment_pending', 'paid', 'preparing',
  'out_for_delivery', 'delivered', 'cancelled'
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'draft',
  event_details JSONB NOT NULL,
  breakfast JSONB,
  snacks JSONB,
  delivery JSONB NOT NULL,
  payment JSONB DEFAULT '{}',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 25,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  promotion_code TEXT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  share_token TEXT,
  share_token_expires_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  shipday_order_id TEXT,
  delivery_tracking JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lunch selections table
CREATE TABLE public.lunch_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  attendee_id UUID DEFAULT gen_random_uuid(),
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  menu_item_id TEXT NOT NULL,
  menu_item_name TEXT NOT NULL,
  special_instructions TEXT,
  dietary_restrictions TEXT[],
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category menu_category NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  serving_size TEXT,
  calories INTEGER,
  preparation_time INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Breakfast packages table
CREATE TABLE public.breakfast_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('continental', 'hot', 'premium')),
  description TEXT NOT NULL,
  price_per_person DECIMAL(10, 2) NOT NULL,
  minimum_head_count INTEGER NOT NULL DEFAULT 10,
  included_items TEXT[] NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Snack packages table
CREATE TABLE public.snack_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('basic', 'premium', 'custom')),
  description TEXT NOT NULL,
  price_per_person DECIMAL(10, 2) NOT NULL,
  minimum_head_count INTEGER NOT NULL DEFAULT 10,
  included_items TEXT[] NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promotions table
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_delivery', 'free_item')),
  value DECIMAL(10, 2) NOT NULL,
  minimum_order_amount DECIMAL(10, 2),
  maximum_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'expired', 'disabled')),
  applicable_categories TEXT[],
  excluded_items TEXT[],
  first_time_customer_only BOOLEAN NOT NULL DEFAULT false,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promotion usages table
CREATE TABLE public.promotion_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order templates table
CREATE TABLE public.order_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_share_token ON public.orders(share_token);
CREATE INDEX idx_lunch_selections_order_id ON public.lunch_selections(order_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_promotions_code ON public.promotions(code);
CREATE INDEX idx_order_templates_user_id ON public.order_templates(user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment promotion usage
CREATE OR REPLACE FUNCTION increment_promotion_usage(promo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.promotions
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auth trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at triggers for all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lunch_selections_updated_at
  BEFORE UPDATE ON public.lunch_selections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_breakfast_packages_updated_at
  BEFORE UPDATE ON public.breakfast_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_snack_packages_updated_at
  BEFORE UPDATE ON public.snack_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_order_templates_updated_at
  BEFORE UPDATE ON public.order_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lunch_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakfast_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snack_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_usages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Lunch selections policies
CREATE POLICY "Users can view lunch selections for their orders"
  ON public.lunch_selections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = lunch_selections.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone with share token can add lunch selections"
  ON public.lunch_selections FOR INSERT
  WITH CHECK (true);

-- Menu items policies (public read access)
CREATE POLICY "Menu items are public"
  ON public.menu_items FOR SELECT
  TO authenticated, anon
  USING (true);

-- Breakfast packages policies (public read access)
CREATE POLICY "Breakfast packages are public"
  ON public.breakfast_packages FOR SELECT
  TO authenticated, anon
  USING (true);

-- Snack packages policies (public read access)
CREATE POLICY "Snack packages are public"
  ON public.snack_packages FOR SELECT
  TO authenticated, anon
  USING (true);

-- Promotions policies
CREATE POLICY "Users can view active promotions"
  ON public.promotions FOR SELECT
  USING (
    status = 'active'
    OR customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = promotions.source_order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Promotion usages policies
CREATE POLICY "Users can view their own promotion usages"
  ON public.promotion_usages FOR SELECT
  USING (auth.uid() = user_id);

-- Order templates policies
CREATE POLICY "Users can view own templates"
  ON public.order_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create templates"
  ON public.order_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.order_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.order_templates FOR DELETE
  USING (auth.uid() = user_id);
