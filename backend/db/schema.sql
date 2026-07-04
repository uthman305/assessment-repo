-- LocalBuka Intern Case Study Database Schema
-- Database target: PostgreSQL

-- 1. Restaurants Table
CREATE TABLE restaurants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    price_range INT NOT NULL CHECK (price_range BETWEEN 1 AND 4),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.0,
    is_open INT NOT NULL DEFAULT 1 CHECK (is_open IN (0, 1)),
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX idx_restaurants_coords ON restaurants(latitude, longitude);

-- 2. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    referred_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Reviews Table
CREATE TABLE reviews (
    id VARCHAR(50) PRIMARY KEY,
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: A user can only review a restaurant once
    CONSTRAINT uq_user_restaurant_review UNIQUE (user_id, restaurant_id)
);

CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);

-- 4. Points Ledger / Transaction Table
CREATE TABLE points_ledger (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'check-in', 'review', 'referral', 'redeem'
    restaurant_id VARCHAR(50) REFERENCES restaurants(id) ON DELETE SET NULL,
    points INT NOT NULL, -- positive for earn, negative for redeem
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_user ON points_ledger(user_id);
-- NOTE: The original provided index below used `(created_at::DATE)` which Postgres
-- rejects with "functions in index expression must be marked IMMUTABLE" (timestamptz
-- casts are not immutable across timezones). Fixed by indexing the raw columns instead;
-- the "once per day" check is done in application code with a `created_at >= date_trunc('day', now())`
-- range query, which this index still supports efficiently. See SOLUTION.md for details.
CREATE INDEX idx_ledger_checkin_limit ON points_ledger(user_id, restaurant_id, action, created_at);

-- Additive column: REQUIREMENTS.md specifies that a referral can only be awarded if
-- "the referred user exists and has placed at least one completed order (simulated or
-- flagged in DB)". The provided schema has no orders table (out of scope for this
-- assessment), so we simulate that flag directly on the user record.
ALTER TABLE users ADD COLUMN has_completed_order BOOLEAN NOT NULL DEFAULT false;


-- ===========================================================================
-- SEED DATA
-- ===========================================================================

INSERT INTO restaurants (id, name, cuisine, price_range, latitude, longitude, address, tags, avg_rating, is_open, images) VALUES
('buka_001', 'Mama Cass Kitchen', 'Nigerian', 2, 6.5244, 3.3792, 'Herbert Macaulay Way, Yaba, Lagos', ARRAY['jollof', 'swallow', 'spicy'], 4.5, 1, ARRAY['https://images.unsplash.com/photo-1546069901-ba9599a7e63c']),
('buka_002', 'White House Buka', 'Traditional Nigerian', 1, 6.5182, 3.3701, 'Chapel Street, Yaba, Lagos', ARRAY['amala', 'ewedu', 'gbegiri'], 4.8, 1, ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836']),
('buka_003', 'Bukateria Supreme', 'Fast Food', 3, 9.0765, 7.3986, 'Wuse II, Abuja', ARRAY['sharwama', 'chicken', 'fries'], 4.2, 0, ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38']),
('buka_004', 'Calabar Kitchen', 'South-South Nigerian', 2, 4.9757, 8.3417, 'Marian Road, Calabar', ARRAY['afang', 'edikaikong', 'seafood'], 4.7, 1, ARRAY[]::TEXT[]),
('buka_005', 'The London Buka', 'Afro-Fusion', 4, 51.5074, -0.1278, 'Peckham, London', ARRAY['suya-tacos', 'jollof-risotto'], 4.6, 1, ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1']);

INSERT INTO users (id, name, email, referred_by) VALUES
('user_101', 'Chijioke Adebayo', 'chijioke@localbuka.com', NULL),
('user_102', 'Amaka Igwe', 'amaka@localbuka.com', 'user_101'),
('user_103', 'Tunde Bakare', 'tunde@localbuka.com', NULL);

INSERT INTO reviews (id, restaurant_id, user_id, rating, comment, tags, created_at) VALUES
('rev_201', 'buka_001', 'user_101', 5, 'The best jollof rice in Yaba, hands down!', ARRAY['jollof', 'spicy'], '2026-06-28 12:00:00+01'),
('rev_202', 'buka_002', 'user_102', 4, 'Amala was piping hot and soft. The soup was tasty.', ARRAY['amala', 'ewedu'], '2026-06-29 14:30:00+01');

INSERT INTO points_ledger (id, user_id, action, restaurant_id, points, created_at) VALUES
('tx_301', 'user_101', 'review', 'buka_001', 20, '2026-06-28 12:00:00+01'),
('tx_302', 'user_102', 'check-in', 'buka_002', 50, '2026-06-29 14:15:00+01');

-- Mark user_101 as having a completed order so referral tests against them can succeed.
UPDATE users SET has_completed_order = true WHERE id = 'user_101';
