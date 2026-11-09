import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type Role = 'buyer' | 'seller' | 'admin';
export type AnimalType = 'Camel' | 'Goat' | 'Sheep' | 'Cattle';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  location: string | null;
  phone: string | null;
  created_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  type: AnimalType;
  price: number;
  location: string;
  description: string;
  image_url: string | null;
  status: 'available' | 'sold';
  created_at: string;
};

export type Order = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  listing?: Listing;
  buyer?: Profile;
  seller?: Profile;
};
