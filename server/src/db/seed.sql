-- E-Commerce Seed Data

-- Clear existing products (safe for re-running)
DELETE FROM products;

-- Reset auto-increment
ALTER TABLE products AUTO_INCREMENT = 1;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for travel and work.', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics', 45),

('Smart Fitness Watch', 'Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water-resistant up to 50m.', 249.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Fitness', 67),

('Minimalist Leather Backpack', 'Handcrafted genuine leather backpack with laptop compartment, multiple pockets, and adjustable straps. Perfect for daily commute.', 189.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'Fashion', 32),

('4K Ultra HD Webcam', 'Professional webcam with 4K resolution, auto-focus, built-in microphone, and adjustable tripod. Ideal for streaming and video calls.', 149.99, 'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?w=500', 'Electronics', 89),

('Ergonomic Office Chair', 'Premium mesh office chair with lumbar support, adjustable armrests, and breathable fabric. Designed for all-day comfort.', 399.99, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500', 'Home', 23),

('Stainless Steel Water Bottle', 'Insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof, and eco-friendly.', 34.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 'Fitness', 156),

('Wireless Mechanical Keyboard', 'Compact mechanical keyboard with RGB backlighting, hot-swappable switches, and multi-device connectivity. Perfect for productivity.', 179.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 'Electronics', 54),

('Designer Sunglasses', 'Polarized UV400 protection sunglasses with lightweight titanium frame. Stylish and durable for everyday wear.', 159.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 'Fashion', 78),

('Yoga Mat with Carrying Strap', 'Extra-thick non-slip yoga mat made from eco-friendly TPE material. Includes carrying strap and storage bag.', 49.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 'Fitness', 112),

('Smart LED Desk Lamp', 'Adjustable LED desk lamp with touch control, USB charging port, and multiple brightness levels. Energy-efficient and eye-friendly.', 79.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 'Home', 91),

('Leather Crossbody Bag', 'Compact genuine leather crossbody bag with adjustable strap and multiple compartments. Perfect for everyday essentials.', 129.99, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', 'Accessories', 43),

('Portable Bluetooth Speaker', 'Waterproof portable speaker with 360-degree sound, 20-hour battery life, and built-in microphone. Perfect for outdoor adventures.', 89.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 'Electronics', 68);
