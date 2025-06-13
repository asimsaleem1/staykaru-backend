/*
  # Analytics Enhancement

  1. New Tables
    - `booking_analytics`
      - `id` (uuid, primary key)
      - `booking_id` (text)
      - `user_id` (uuid)
      - `accommodation_id` (text)
      - `status` (text)
      - `total_price` (numeric)
      - `duration_days` (integer)
      - `created_at` (timestamp)

    - `order_analytics`
      - `id` (uuid, primary key)
      - `order_id` (text)
      - `user_id` (uuid)
      - `provider_id` (text)
      - `status` (text)
      - `total_amount` (numeric)
      - `item_count` (integer)
      - `created_at` (timestamp)

    - `payment_analytics`
      - `id` (uuid, primary key)
      - `payment_id` (text)
      - `user_id` (uuid)
      - `amount` (numeric)
      - `method` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create booking analytics table
CREATE TABLE IF NOT EXISTS booking_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  accommodation_id text NOT NULL,
  status text NOT NULL,
  total_price numeric NOT NULL,
  duration_days integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create order analytics table
CREATE TABLE IF NOT EXISTS order_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  provider_id text NOT NULL,
  status text NOT NULL,
  total_amount numeric NOT NULL,
  item_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create payment analytics table
CREATE TABLE IF NOT EXISTS payment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  method text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE booking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;

-- Admin policies for all tables
CREATE POLICY "Admins can read booking analytics"
  ON booking_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can read order analytics"
  ON order_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can read payment analytics"
  ON payment_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.supabase_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- System policies for inserting analytics
CREATE POLICY "System can insert booking analytics"
  ON booking_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can insert order analytics"
  ON order_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can insert payment analytics"
  ON payment_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);