/*
  # Real-time Notifications and Analytics Setup

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `read` (boolean)
      - `data` (jsonb)
      - `created_at` (timestamp)

    - `analytics_events`
      - `id` (uuid, primary key)
      - `event_type` (text)
      - `user_id` (uuid, references auth.users)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Analytics policies
CREATE POLICY "System can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);