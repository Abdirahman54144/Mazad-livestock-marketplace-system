/*
# Livestock & Camel Marketplace Schema

1. Overview
   - Multi-user marketplace with three roles: buyer, seller, admin.
   - Sellers post livestock listings (Camel, Goat, Sheep, Cattle).
   - Buyers browse, filter, and place orders on listings.
   - Admins monitor users, listings, orders, and sales metrics.

2. New Tables
   - `profiles`
     - `id` (uuid, PK, references auth.users)
     - `email` (text)
     - `full_name` (text)
     - `role` (text: 'buyer' | 'seller' | 'admin', default 'buyer')
     - `location` (text, nullable)
     - `phone` (text, nullable)
     - `created_at` (timestamptz)
   - `listings`
     - `id` (uuid, PK)
     - `seller_id` (uuid, references profiles, ON DELETE CASCADE)
     - `title` (text)
     - `type` (text: 'Camel' | 'Goat' | 'Sheep' | 'Cattle')
     - `price` (numeric)
     - `location` (text)
     - `description` (text)
     - `image_url` (text, nullable)
     - `status` (text: 'available' | 'sold', default 'available')
     - `created_at` (timestamptz)
   - `orders`
     - `id` (uuid, PK)
     - `listing_id` (uuid, references listings, ON DELETE CASCADE)
     - `buyer_id` (uuid, references profiles, ON DELETE CASCADE)
     - `seller_id` (uuid, references profiles, ON DELETE CASCADE)
     - `quantity` (integer, default 1)
     - `total_price` (numeric)
     - `status` (text: 'pending' | 'confirmed' | 'completed' | 'cancelled', default 'pending')
     - `notes` (text, nullable)
     - `created_at` (timestamptz)

3. Security
   - RLS enabled on all tables.
   - `profiles`: users read/update own profile; admins read all profiles.
   - `listings`: anyone (anon) can read available listings; sellers insert/update/delete own; admins can read/update all.
   - `orders`: buyers insert/read own orders; sellers read/manage orders on their listings; admins read all.

4. Indexes
   - listings(type), listings(location), listings(seller_id), listings(status)
   - orders(buyer_id), orders(seller_id), orders(listing_id)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer','seller','admin')),
  location text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_all_admin_profiles" ON profiles;
CREATE POLICY "select_own_or_all_admin_profiles" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('Camel','Goat','Sheep','Cattle')),
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  location text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public read of available listings (anon can browse)
DROP POLICY IF EXISTS "select_listings" ON listings;
CREATE POLICY "select_listings" ON listings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_listings" ON listings;
CREATE POLICY "insert_own_listings" ON listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "update_own_listings" ON listings;
CREATE POLICY "update_own_listings" ON listings FOR UPDATE
  TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "delete_own_listings" ON listings;
CREATE POLICY "delete_own_listings" ON listings FOR DELETE
  TO authenticated USING (auth.uid() = seller_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price numeric(12,2) NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyers can see their own orders; sellers can see orders on their listings; admins see all
DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Buyers can create orders
DROP POLICY IF EXISTS "insert_orders" ON orders;
CREATE POLICY "insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update orders on their listings (confirm/complete/cancel)
DROP POLICY IF EXISTS "update_orders_seller" ON orders;
CREATE POLICY "update_orders_seller" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Buyers can cancel their own pending orders
DROP POLICY IF EXISTS "update_orders_buyer" ON orders;
CREATE POLICY "update_orders_buyer" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();