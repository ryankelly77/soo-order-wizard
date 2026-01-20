-- Migration: Guest Orders Support
-- Allows orders to be created without user authentication

-- Make user_id nullable and add guest_email
ALTER TABLE orders
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Add constraint: either user_id OR guest_email must be set
ALTER TABLE orders
  ADD CONSTRAINT orders_user_or_guest_check
  CHECK (
    (user_id IS NOT NULL) OR (guest_email IS NOT NULL)
  );

-- Create index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email) WHERE guest_email IS NOT NULL;

-- Update RLS policies to allow guest order creation
-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Allow authenticated users to create orders with their user_id
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow anonymous users to create guest orders (no user_id, must have guest_email)
CREATE POLICY "Anonymous users can create guest orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL AND
    guest_email IS NOT NULL
  );

-- Drop existing select policy if it exists
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Allow authenticated users to view their own orders
CREATE POLICY "Authenticated users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow anyone to view orders by share_token (for order tracking)
CREATE POLICY "Anyone can view orders by share token"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (share_token IS NOT NULL);

-- Allow guest to view their own order right after creation (by guest_email match in session)
-- This is handled via the share_token policy above - guests receive share_token after payment

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Allow authenticated users to update their own orders
CREATE POLICY "Authenticated users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow service role to update any order (for webhooks, admin operations)
-- Note: Service role bypasses RLS by default, but we can be explicit
CREATE POLICY "Service role can manage all orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment explaining the guest checkout flow
COMMENT ON COLUMN orders.guest_email IS 'Email for guest checkout orders. Either user_id or guest_email must be set.';
COMMENT ON CONSTRAINT orders_user_or_guest_check ON orders IS 'Ensures every order has either a user_id (authenticated) or guest_email (guest checkout).';
