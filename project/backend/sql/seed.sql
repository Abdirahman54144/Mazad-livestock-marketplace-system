-- ============================================================
-- Mazad Marketplace — Seed Data
-- Run after schema.sql
-- ============================================================

-- ============================================================
-- Users — 1 admin, 3 sellers, 2 buyers
-- Passwords are plaintext for demo purposes.
-- ============================================================
INSERT INTO users (id, email, password, full_name, role, location, phone) VALUES
    (1, 'admin@mazad.local',   'admin123',   'Admin',            'admin',   'Dubai',             '+971 50 123 4567'),
    (2, 'ahmed@farms.ae',      'seller123',  'Ahmed Al-Rashid',  'seller',  'Al Ain',            '+971 50 111 2222'),
    (3, 'omar@desert.ae',      'seller123',  'Omar Bin Saeed',   'seller',  'Sharjah',           '+971 50 555 6666'),
    (4, 'khalid@farms.ae',     'seller123',  'Khalid Al-Naimi',  'seller',  'Ras Al Khaimah',    '+971 50 999 0000'),
    (5, 'fatima@buyers.ae',    'buyer123',   'Fatima Hassan',    'buyer',   'Abu Dhabi',         '+971 50 333 4444'),
    (6, 'layla@market.ae',     'buyer123',   'Layla Mansour',    'buyer',   'Dubai',             '+971 50 777 8888');

-- ============================================================
-- Listings — 12 livestock listings across all types
-- ============================================================
INSERT INTO listings (id, seller_id, title, type, price, location, description, image_url, status) VALUES
    (1,  2, 'Champion Racing Camel — 3 Years Old',    'Camel',  45000, 'Al Ain',          'Purebred Arabian racing camel, excellent bloodline. Trained for endurance racing. Vaccinated and in peak health. Won 3 local competitions.', 'https://images.unsplash.com/photo-1598113972215-96c018fb1a0b?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (2,  3, 'Premium Dairy Goat Herd — 12 Goats',      'Goat',   8400,  'Sharjah',         'Mixed herd of 12 healthy dairy goats (Saanen and Alpine breeds). High milk yield. All vaccinated and dewormed. Ages 1-4 years.', 'https://images.unsplash.com/photo-1524024973431-2ad916746881?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (3,  2, 'Fat-Tailed Sheep — Group of 20',          'Sheep',  16000, 'Al Ain',          'Awassi breed fat-tailed sheep, prized for milk and meat. 20 sheep available, all healthy and well-fed. Ages 6 months to 3 years.', 'https://images.unsplash.com/photo-1732732508099-4a78c5dac234?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (4,  4, 'Beef Cattle — Angus Bull',                'Cattle', 22000, 'Ras Al Khaimah',  'Purebred Angus bull, 2.5 years old. Excellent temperament, ideal for breeding. Fully vaccinated. Weight approximately 850kg.', 'https://images.unsplash.com/photo-1681404397581-74a0da15a31e?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (5,  3, 'Young Camel Calf — 8 Months',             'Camel',  12000, 'Sharjah',         'Healthy camel calf, 8 months old. Good temperament, already weaned. Dam is a champion racer. Vaccinated and registered.', 'https://images.unsplash.com/photo-1553983658-0d7afeb5c53f?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (6,  4, 'Boer Goat Breeding Pair',                 'Goat',   5500,  'Ras Al Khaimah',  'One male and one female Boer goat, both 2 years old. Excellent for breeding. Strong genetics, disease-free. Registered with breed society.', 'https://images.unsplash.com/photo-1573578160998-4f4c7b023aec?fm=jpg&q=60&w=800&auto=format&fit=crop', 'sold'),
    (7,  2, 'Merino Sheep Flock — 30 Ewes',            'Sheep',  27000, 'Al Ain',          '30 Merino ewes, ages 2-5 years. Known for premium wool quality. All pregnant or with lambs. Recently sheared and vaccinated.', 'https://images.unsplash.com/photo-1652737612003-76e526b0126b?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (8,  3, 'Holstein Dairy Cattle — 5 Cows',          'Cattle', 35000, 'Sharjah',         '5 Holstein-Friesian dairy cows in peak lactation. Average 28L milk/day per cow. All healthy, vaccinated, and TB-tested. Ages 3-5 years.', 'https://images.unsplash.com/photo-1681404397581-74a0da15a31e?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (9,  4, 'White Arabian Camel — Female',            'Camel',  38000, 'Ras Al Khaimah',  'Rare white Arabian female camel, 4 years old. Excellent for breeding programs. Gentle temperament, fully vaccinated. Registered pedigree.', 'https://images.unsplash.com/photo-1598113972215-96c018fb1a0b?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (10, 2, 'Nubian Dairy Goats — 8 Does',             'Goat',   9600,  'Al Ain',          '8 Nubian dairy does, known for high butterfat milk. Ages 1-3 years. All vaccinated, healthy, and producing well. Great for small farms.', 'https://images.unsplash.com/photo-1588466585717-f8041aec7875?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (11, 3, 'Dorper Sheep — 15 Lambs',                 'Sheep',  18000, 'Sharjah',         '15 Dorper lambs, 4-6 months old. Fast-growing meat breed. All weaned, vaccinated, and dewormed. Ready for fattening or breeding.', 'https://images.unsplash.com/photo-1732732508099-4a78c5dac234?fm=jpg&q=60&w=800&auto=format&fit=crop', 'available'),
    (12, 4, 'Brahman Cattle — Breeding Bull',          'Cattle', 28000, 'Ras Al Khaimah',  'Purebred Brahman bull, 3 years old. Heat-tolerant breed ideal for UAE climate. Excellent for crossbreeding programs. Fully vaccinated.', 'https://images.unsplash.com/photo-1681404397581-74a0da15a31e?fm=jpg&q=60&w=800&auto=format&fit=crop', 'sold');

-- ============================================================
-- Orders — 7 sample orders with various statuses
-- ============================================================
INSERT INTO orders (id, listing_id, buyer_id, seller_id, quantity, total_price, status, notes) VALUES
    (1, 6,  5, 4, 1, 5500,  'completed', 'Pickup arranged for Saturday morning.'),
    (2, 12, 6, 4, 1, 28000, 'completed', 'Transport arranged via livestock truck.'),
    (3, 1,  5, 2, 1, 45000, 'pending',   'Interested in viewing before purchase.'),
    (4, 4,  6, 4, 1, 22000, 'confirmed', 'Will pick up next Tuesday.'),
    (5, 2,  5, 3, 2, 16800, 'pending',   'Need delivery to Abu Dhabi farm.'),
    (6, 7,  6, 2, 1, 27000, 'completed', 'Bulk wool purchase, very satisfied.'),
    (7, 3,  5, 2, 1, 16000, 'cancelled', 'Found a closer supplier.');
