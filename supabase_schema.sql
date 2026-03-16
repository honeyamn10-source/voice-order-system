-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS orders (
  id               BIGSERIAL PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT now(),
  customer_name    TEXT NOT NULL,
  phone            TEXT NOT NULL,
  items            TEXT[] NOT NULL,
  total            NUMERIC(8,2) DEFAULT 0,
  pickup_time      TEXT,
  type             TEXT DEFAULT 'order',
  appointment_reason TEXT
);

-- Row Level Security: public can INSERT and SELECT, nothing else
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public select"
  ON orders FOR SELECT
  TO anon
  USING (true);

-- Handy views for your dashboard pages

-- Recent orders (last 24h)
CREATE OR REPLACE VIEW recent_orders AS
SELECT id, created_at, customer_name, phone, items, total, pickup_time, type
FROM orders
WHERE created_at >= now() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Daily summary (today)
CREATE OR REPLACE VIEW daily_summary AS
SELECT
  COUNT(*)                           AS total_orders,
  SUM(total)                         AS total_revenue,
  COUNT(*) FILTER (WHERE 'pizza'  = ANY(items)) AS pizza_count,
  COUNT(*) FILTER (WHERE 'burger' = ANY(items)) AS burger_count,
  COUNT(*) FILTER (WHERE 'salad'  = ANY(items)) AS salad_count
FROM orders
WHERE type = 'order'
  AND DATE(created_at) = CURRENT_DATE;
