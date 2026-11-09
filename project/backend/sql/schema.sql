-- ============================================================
-- Mazad Marketplace — Database Schema
-- Database: SQLite (database.sqlite)
-- ============================================================

-- Drop existing tables (for clean re-init)
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;

-- ============================================================
-- Users table — accounts for buyers, sellers, and admins
-- ============================================================
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    full_name   TEXT    NOT NULL DEFAULT '',
    role        TEXT    NOT NULL DEFAULT 'buyer'
                        CHECK (role IN ('buyer', 'seller', 'admin')),
    location    TEXT,
    phone       TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- Listings table — livestock for sale
-- ============================================================
CREATE TABLE listings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id   INTEGER NOT NULL,
    title       TEXT    NOT NULL,
    type        TEXT    NOT NULL
                        CHECK (type IN ('Camel', 'Goat', 'Sheep', 'Cattle')),
    price       REAL    NOT NULL DEFAULT 0 CHECK (price >= 0),
    location    TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    image_url   TEXT,
    status      TEXT    NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available', 'sold')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_type     ON listings(type);
CREATE INDEX idx_listings_status   ON listings(status);

-- ============================================================
-- Orders table — transactions between buyers and sellers
-- ============================================================
CREATE TABLE orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id  INTEGER NOT NULL,
    buyer_id    INTEGER NOT NULL,
    seller_id   INTEGER NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price REAL    NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes       TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_buyer_id   ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id  ON orders(seller_id);
CREATE INDEX idx_orders_listing_id ON orders(listing_id);
CREATE INDEX idx_orders_status     ON orders(status);
