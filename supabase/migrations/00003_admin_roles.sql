-- =============================================================================
-- ADMIN ROLES AND POLICIES
-- =============================================================================

-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- =============================================================================
-- ADMIN HELPER FUNCTION
-- =============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ADMIN RLS POLICIES FOR MENU_ITEMS
-- =============================================================================

-- Admins can insert menu items
CREATE POLICY "Admins can insert menu items"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update menu items
CREATE POLICY "Admins can update menu items"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete menu items
CREATE POLICY "Admins can delete menu items"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- ADMIN RLS POLICIES FOR BREAKFAST_PACKAGES
-- =============================================================================

-- Admins can insert breakfast packages
CREATE POLICY "Admins can insert breakfast packages"
  ON public.breakfast_packages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update breakfast packages
CREATE POLICY "Admins can update breakfast packages"
  ON public.breakfast_packages FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete breakfast packages
CREATE POLICY "Admins can delete breakfast packages"
  ON public.breakfast_packages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- ADMIN RLS POLICIES FOR SNACK_PACKAGES
-- =============================================================================

-- Admins can insert snack packages
CREATE POLICY "Admins can insert snack packages"
  ON public.snack_packages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update snack packages
CREATE POLICY "Admins can update snack packages"
  ON public.snack_packages FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete snack packages
CREATE POLICY "Admins can delete snack packages"
  ON public.snack_packages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- ADMIN RLS POLICIES FOR ORDERS
-- =============================================================================

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update any order
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- ADMIN RLS POLICIES FOR LUNCH_SELECTIONS
-- =============================================================================

-- Admins can view all lunch selections
CREATE POLICY "Admins can view all lunch selections"
  ON public.lunch_selections FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- ADMIN RLS POLICIES FOR PROFILES
-- =============================================================================

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update all profiles (for managing admin status)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- ADMIN RLS POLICIES FOR PROMOTIONS
-- =============================================================================

-- Admins can manage all promotions
CREATE POLICY "Admins can insert promotions"
  ON public.promotions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update promotions"
  ON public.promotions FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete promotions"
  ON public.promotions FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all promotions"
  ON public.promotions FOR SELECT
  TO authenticated
  USING (public.is_admin());
