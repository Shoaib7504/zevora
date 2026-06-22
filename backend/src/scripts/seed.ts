import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User, Product, Review } from '../models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI env variable is missing.');
  process.exit(1);
}

const mockUsers = [
  { firstName: 'Shoaib', lastName: 'Hossain', email: 'shoaibhossain188@gmail.com', role: 'admin', password: 'Showaib244' },
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', role: 'admin', password: 'password123' },
  { firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', role: 'manager', password: 'password123' },
  { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', role: 'user', password: 'password123' },
  { firstName: 'Diana', lastName: 'Prince', email: 'diana@example.com', role: 'user', password: 'password123' },
  { firstName: 'Evan', lastName: 'Wright', email: 'evan@example.com', role: 'user', password: 'password123' },
  { firstName: 'Fiona', lastName: 'Gallagher', email: 'fiona@example.com', role: 'user', password: 'password123' },
  { firstName: 'George', lastName: 'Costanza', email: 'george@example.com', role: 'user', password: 'password123' },
  { firstName: 'Hannah', lastName: 'Baker', email: 'hannah@example.com', role: 'user', password: 'password123' },
  { firstName: 'Ian', lastName: 'Malcolm', email: 'ian@example.com', role: 'user', password: 'password123' },
  { firstName: 'Julia', lastName: 'Roberts', email: 'julia@example.com', role: 'user', password: 'password123' },
];

const categories = ['Electronics', 'Accessories', 'Audio', 'Fitness'];

const productTemplates = [
  // Electronics
  { name: 'Minimalist Wireless Keyboard', category: 'Electronics', price: 89.99, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=400', description: 'Sleek, low-profile mechanical keyboard with silent linear switches and multi-device Bluetooth syncing.' },
  { name: 'Ergonomic Vertical Mouse', category: 'Electronics', price: 59.99, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400', description: 'Scientifically designed vertical mouse to reduce wrist strain and improve posture during long working hours.' },
  { name: 'Ultra-thin USB-C Hub', category: 'Electronics', price: 34.99, image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=400', description: '6-in-1 multi-port adapter featuring 4K HDMI, USB 3.0 ports, and high-speed SD card readers.' },
  { name: 'Dual Monitor Desk Mount', category: 'Electronics', price: 79.50, image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=400', description: 'Heavy-duty adjustable gas spring arm mount supporting two screens up to 27 inches.' },
  { name: 'Wireless Charging Dock', category: 'Electronics', price: 29.99, image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=400', description: '3-in-1 fast inductive charging station compatible with smart phones, watches, and wireless earbuds.' },
  { name: 'Mechanical Numpad', category: 'Electronics', price: 39.99, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400', description: 'Programmable standalone numeric keypad with hot-swappable tactile switches and RGB lighting.' },
  { name: 'Laptop Cooling Pad', category: 'Electronics', price: 24.99, image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=400', description: 'Quiet dual-fan cooling pad with adjustable height settings to keep your notebook cool under heavy loads.' },
  { name: 'RGB LED Desk Mat', category: 'Electronics', price: 19.99, image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=400', description: 'Extra-large microfiber mouse pad featuring water-resistant fabric and customizable edge glow settings.' },
  { name: 'Portable SSD 1TB', category: 'Electronics', price: 109.99, image: 'https://images.unsplash.com/photo-1597872200319-382d49a282b0?auto=format&fit=crop&q=80&w=400', description: 'Compact external solid state drive delivering read/write speeds up to 1050 MB/s.' },
  { name: 'Webcam 1080p AutoFocus', category: 'Electronics', price: 49.99, image: 'https://images.unsplash.com/photo-1603184017968-902045b6514b?auto=format&fit=crop&q=80&w=400', description: 'High definition streaming camera with integrated stereo microphones and ring light control.' },
  
  // Accessories
  { name: 'Leather Everyday Backpack', category: 'Accessories', price: 129.50, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400', description: 'Handcrafted full-grain leather backpack featuring padded compartments for 15-inch laptops and commuters.' },
  { name: 'Minimalist Slim Wallet', category: 'Accessories', price: 24.99, image: 'https://images.unsplash.com/photo-1627124118974-8d807d906f63?auto=format&fit=crop&q=80&w=400', description: 'RFID-blocking carbon fiber wallet holding up to 12 cards with an integrated spring money clip.' },
  { name: 'Travel Cable Organizer Bag', category: 'Accessories', price: 18.50, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400', description: 'Waterproof nylon carrying pouch designed to pack charger bricks, power banks, and flash drives.' },
  { name: 'Felt Desk Writing Pad', category: 'Accessories', price: 22.00, image: 'https://images.unsplash.com/photo-1632292224971-0d45778bd364?auto=format&fit=crop&q=80&w=400', description: 'Soft premium merino wool felt desk protector mat providing optimal mouse gliding friction.' },
  { name: 'Aluminum Laptop Stand', category: 'Accessories', price: 29.99, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=400', description: 'Ergonomic riser stand that lifts laptop screens to eye level, improving neck comfort.' },
  { name: 'Leather Key Organizer', category: 'Accessories', price: 19.99, image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400', description: 'Compact key holder sleeve locking up to 7 keys in a quiet, pocket-friendly stack.' },
  { name: 'Hard Shell Glasses Case', category: 'Accessories', price: 14.99, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400', description: 'Durable protective eyeglasses case lined with soft velvet to prevent lens scratches.' },
  { name: 'Microfiber Cleaning Kit', category: 'Accessories', price: 9.99, image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&q=80&w=400', description: 'Spray solution and lint-free cloths to safely wipe smudges off screen monitors and lenses.' },
  { name: 'Canvas Tote Weekender Bag', category: 'Accessories', price: 45.00, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400', description: 'Heavy-duty cotton canvas bag with leather trim and shoulder straps for short weekend travels.' },
  { name: 'Stainless Steel Coffee Tumbler', category: 'Accessories', price: 27.50, image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=400', description: 'Double-walled vacuum insulated travel mug keeping drinks hot for 6 hours or cold for 12.' },

  // Audio
  { name: 'Noise Cancelling Headphones', category: 'Audio', price: 249.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400', description: 'Hybrid active noise cancellation headphones with 40-hour battery life and custom audio equalizer presets.' },
  { name: 'True Wireless Earbuds', category: 'Audio', price: 79.99, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400', description: 'In-ear sports earbuds with touch controls, IPX7 sweat-proof rating, and a compact charging case.' },
  { name: 'Portable Bluetooth Speaker', category: 'Audio', price: 49.99, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400', description: 'Compact waterproof wireless speaker delivering punchy bass and 360-degree stereo sound output.' },
  { name: 'Studio Condenser Microphone', category: 'Audio', price: 119.00, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400', description: 'Cardioid USB microphone kit with pop filter and scissor arm stand, optimized for podcasting and streaming.' },
  { name: 'Home Theater Soundbar', category: 'Audio', price: 159.99, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=400', description: 'Sleek soundbar speaker with wireless subwoofer, supporting Dolby Audio and optical connections.' },
  { name: 'Retro Wooden Radio', category: 'Audio', price: 69.99, image: 'https://images.unsplash.com/photo-1563330232-57114bb0823c?auto=format&fit=crop&q=80&w=400', description: 'Vintage style FM radio cabinet combining classic aesthetic design with modern Bluetooth speakers.' },
  { name: 'Desktop Studio Monitors', category: 'Audio', price: 199.99, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400', description: 'Active bookshelf reference speakers delivering flat frequency responses for audio editors.' },
  { name: 'Gaming Headset with Mic', category: 'Audio', price: 59.99, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400', description: 'Over-ear surround sound headset with noise-isolating boom microphone and soft memory foam padding.' },
  { name: 'Audio Interface USB', category: 'Audio', price: 99.00, image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&q=80&w=400', description: '2x2 preamp interface offering low-latency recording for guitars and condenser vocals.' },
  { name: 'Hi-Fi DAC Headphone Amp', category: 'Audio', price: 129.99, image: 'https://images.unsplash.com/photo-1558089687-f282ffcbd1d5?auto=format&fit=crop&q=80&w=400', description: 'Portable digital-to-analog converter that boosts audio resolution and drives high-impedance headphones.' },

  // Fitness
  { name: 'Smart Stainless Steel Bottle', category: 'Fitness', price: 39.00, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400', description: 'Vacuum-sealed smart water bottle tracking your hydration goals and giving glowing drink reminders.' },
  { name: 'Non-slip Yoga Exercise Mat', category: 'Fitness', price: 29.99, image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&q=80&w=400', description: 'Eco-friendly high-density TPE yoga pad providing optimal joint cushioning and alignment lines.' },
  { name: 'Adjustable Dumbbells Set', category: 'Fitness', price: 299.99, image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&q=80&w=400', description: 'All-in-one selectorized dumbbells set adjustable from 5 to 50 lbs, replacing 10 weight pairs.' },
  { name: 'Fitness Activity Tracker', category: 'Fitness', price: 49.99, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=400', description: 'Lightweight wrist band tracking steps, heart rate patterns, active calories, and sleep cycles.' },
  { name: 'Deep Tissue Massage Gun', category: 'Fitness', price: 89.00, image: 'https://images.unsplash.com/photo-1617625802912-c74139e8379f?auto=format&fit=crop&q=80&w=400', description: 'Percussion muscle massager with 30 speed levels and 6 massage heads to relieve soreness.' },
  { name: 'Resistance Exercise Bands', category: 'Fitness', price: 15.99, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400', description: 'Set of 5 heavy-duty latex loop bands with varying resistance levels for strength workout routines.' },
  { name: 'Speed Jump Rope', category: 'Fitness', price: 12.50, image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=400', description: 'Tangle-free steel cable jump rope with ball bearings for smooth, fast cardio rotations.' },
  { name: 'Exercise Stability Ball', category: 'Fitness', price: 19.99, image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&q=80&w=400', description: 'Anti-burst heavy-duty balance ball designed for core training, yoga, and desk chair seating.' },
  { name: 'Foam Roller for Muscles', category: 'Fitness', price: 17.99, image: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?auto=format&fit=crop&q=80&w=400', description: 'High-density foam roller for physical therapy and trigger point deep tissue release.' },
  { name: 'Waterproof Running Belt', category: 'Fitness', price: 11.99, image: 'https://images.unsplash.com/photo-1530143311094-34d807799e8f?auto=format&fit=crop&q=80&w=400', description: 'Slim expandable waist pack pouch that fits keys, wallets, and large smart phones securely.' },
];

const mockReviewComments = [
  { rating: 5, comment: 'Absolutely incredible product! Exceeded all my expectations. Highly recommended.' },
  { rating: 5, comment: 'Premium build quality, works exactly as described. Worth every single cent.' },
  { rating: 4, comment: 'Very happy with the purchase. Good build quality, though shipping took an extra day.' },
  { rating: 4, comment: 'Solid features and works great. Ergonomics are very comfortable.' },
  { rating: 3, comment: 'Decent performance, but the instruction manual is a bit confusing to read.' },
  { rating: 2, comment: 'Not satisfied. The connection drops occasionally and battery life is shorter than advertised.' },
  { rating: 1, comment: 'Item arrived defective. Returning immediately. Disappointed.' },
];

async function seedDatabase() {
  try {
    console.log('[Seed]: Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('[Seed]: Connected successfully.');

    // 1. Clear existing database collections
    console.log('[Seed]: Clearing existing models...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('[Seed]: Database cleared.');

    // 2. Seed Users
    console.log('[Seed]: Seeding users...');
    const createdUsers = await User.insertMany(mockUsers);
    console.log(`[Seed]: Seeded ${createdUsers.length} users.`);

    // 3. Seed Products (50 items total, replicate templates to reach 50)
    console.log('[Seed]: Seeding products...');
    const adminUser = createdUsers.find(u => u.role === 'admin') || createdUsers[0];
    const productsData: any[] = [];

    // Combine templates and replicate items to match 50
    for (let i = 0; i < 50; i++) {
      const template = productTemplates[i % productTemplates.length];
      const suffix = i >= productTemplates.length ? ` (v${Math.floor(i / productTemplates.length) + 1})` : '';
      
      // Randomize price slightly for variation
      const priceOffset = (Math.random() - 0.5) * (template.price * 0.1);
      const randomizedPrice = Math.max(5, parseFloat((template.price + priceOffset).toFixed(2)));
      
      productsData.push({
        name: `${template.name}${suffix}`,
        category: template.category,
        price: randomizedPrice,
        description: template.description,
        stock: Math.floor(Math.random() * 90) + 10,
        images: [template.image],
        seller: adminUser._id,
        ratings: {
          average: 0,
          count: 0
        }
      });
    }

    const createdProducts = await Product.insertMany(productsData);
    console.log(`[Seed]: Seeded ${createdProducts.length} products.`);

    // 4. Seed Reviews (20 reviews total)
    console.log('[Seed]: Seeding reviews...');
    const reviewsData: any[] = [];
    
    // Choose 20 random products to receive reviews
    const productsForReviews = createdProducts.slice(0, 20);

    for (let i = 0; i < 20; i++) {
      const product = productsForReviews[i];
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const reviewTemplate = mockReviewComments[Math.floor(Math.random() * mockReviewComments.length)];

      reviewsData.push({
        product: product._id,
        user: randomUser._id,
        rating: reviewTemplate.rating,
        comment: reviewTemplate.comment
      });
    }

    const createdReviews = await Review.insertMany(reviewsData);
    console.log(`[Seed]: Seeded ${createdReviews.length} reviews.`);

    // 5. Update Product rating averages and counts based on generated reviews
    console.log('[Seed]: Aggregating reviews and updating product rating averages...');
    for (const review of createdReviews) {
      const productReviews = createdReviews.filter(r => r.product.toString() === review.product.toString());
      const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const average = parseFloat((sum / productReviews.length).toFixed(1));
      
      await Product.findByIdAndUpdate(review.product, {
        'ratings.average': average,
        'ratings.count': productReviews.length
      });
    }
    console.log('[Seed]: Product ratings successfully aggregated.');

    console.log('[Seed]: Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]: Database seeding failed. Error:', error);
    process.exit(1);
  }
}

seedDatabase();
