require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// ─── MongoDB Connection ───
mongoose.connect(MONGO_URI)
  .then(() => { console.log('Connected to MongoDB'); })
  .catch(err => { console.error('MongoDB connection error:', err); });

// ─── User Schema ───
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// ─── Product Schema ───
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  price: Number,
  oldPrice: Number,
  image: String,
  badge: String,
  rating: Number,
  variant: String,
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// ─── Order Schema ───
const orderSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  items: Array,
  subtotal: Number,
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ─── JWT Helper ───
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── Auth Middleware ───
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ═══════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════

// Register
app.post('/api/auth/register', async (req, res) => {
  console.log('Register request received:', req.body);
  try {
    const { name, email, phone, password } = req.body;

    console.log('Validation check');
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email already exists
    console.log('Checking existing user');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Create user
    console.log('Creating user');
    const user = new User({ name, email: email.toLowerCase(), phone: phone || '', password });
    await user.save();
    console.log('User saved successfully');

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Server error. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    // Find user by email or phone
    const isEmail = identifier.includes('@');
    const query = isEmail
      ? { email: identifier.toLowerCase() }
      : { phone: identifier.replace(/\D/g, '') };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ error: isEmail ? 'No account found with this email' : 'No account found with this phone number' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Get current user (protected)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════
//  PRODUCT ROUTES
// ═══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Luxe API is running' });
});

app.get('/api/products', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      badge, 
      minRating,
      sort = '-createdAt',
      page = 1,
      limit = 20,
      search
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (badge) query.badge = badge;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    if (products.length === 0) {
      const defaultProducts = [
        { id: 1, name: 'Tailored Wool Blazer', category: 'men', price: 485, oldPrice: 620, image: 'Assests/Blazer.jpg', badge: 'Sale', rating: 5, variant: 'Navy / M' },
        { id: 2, name: 'Oxford Cotton Shirt', category: 'men', price: 145, image: 'Assests/cotton shirt.jpg', badge: 'New', rating: 5, variant: 'White / L' },
        { id: 3, name: 'Slim Fit Chinos', category: 'men', price: 125, image: 'Assests/Pant.jpg', rating: 4, variant: 'Beige / 32' },
        { id: 4, name: 'Leather Oxford Shoes', category: 'men', price: 395, image: 'Assests/boots.jpg', badge: null, rating: 5, variant: 'Black / 42' },
        { id: 5, name: 'Cashmere V-Neck Sweater', category: 'men', price: 320, image: 'Assests/Sweater.jfif', badge: null, rating: 5, variant: 'Grey / XL' },
        { id: 6, name: 'Silk Wrap Dress', category: 'women', price: 580, image: 'Assests/Silk dress.jpg', badge: 'New', rating: 5, variant: 'Emerald / S' },
        { id: 7, name: 'Gold Chain Necklace', category: 'women', price: 245, image: 'Assests/Chain.jfif', badge: 'New', rating: 5, variant: '18K Gold' },
        { id: 8, name: 'Suede Stiletto Heels', category: 'women', price: 395, oldPrice: 495, image: 'Assests/Heels.jfif', badge: 'Sale', rating: 4, variant: 'Nude / 38' },
        { id: 9, name: 'Leather Crossbody Bag', category: 'women', price: 380, image: 'Assests/Leather bag.jfif', rating: 5, variant: 'Tan' },
        { id: 10, name: 'Oversized Linen Blouse', category: 'women', price: 165, image: 'Assests/Oversized blouse.jfif', badge: null, rating: 4, variant: 'White / M' },
        { id: 11, name: 'Kids Sneakers', category: 'kids', price: 85, image: 'Assests/Kids shoes.jfif', badge: 'New', rating: 5, variant: 'Age 6-8' },
        { id: 12, name: 'Cotton Dinosaur T-Shirt', category: 'kids', price: 45, image: 'Assests/Tshirt for kids.jfif', badge: null, rating: 4, variant: 'Age 4-6' },
        { id: 13, name: 'Denim Jacket', category: 'kids', price: 95, oldPrice: 120, image: 'Assests/DEnim Jacket.jfif', badge: 'Sale', rating: 5, variant: 'Age 8-10' },
        { id: 14, name: 'Floral Summer Dress', category: 'kids', price: 75, image: 'Assests/FLoral Dress for kids.jfif', badge: null, rating: 4, variant: 'Age 5-7' },
        { id: 15, name: 'Kids Backpack', category: 'kids', price: 65, image: 'Assests/BAg for kids.jfif', badge: 'New', rating: 5, variant: 'Blue' },
        { id: 16, name: 'Artisan Soy Candle Set', category: 'accessories', price: 89, image: 'Assests/Candles.jfif', badge: 'New', rating: 4, variant: 'Set of 3' },
        { id: 17, name: 'Leather Wallet', category: 'accessories', price: 145, image: 'Assests/Wallet.jfif', rating: 5, variant: 'Black' },
        { id: 18, name: 'Sunglasses', category: 'accessories', price: 195, oldPrice: 250, image: 'Assests/Sun Glasses.jfif', badge: 'Sale', rating: 4, variant: 'Aviator' },
        { id: 19, name: 'Platform Sneakers', category: 'sale', price: 190, oldPrice: 290, image: 'Assests/Platform sneakers.jfif', badge: '-40%', rating: 4, variant: 'White / 39' },
        { id: 20, name: 'Silk Scarf', category: 'sale', price: 95, oldPrice: 150, image: 'Assests/Scraf.jfif', badge: '-35%', rating: 5, variant: 'Burgundy' }
      ];
      await Product.insertMany(defaultProducts);
      return res.json({
        products: defaultProducts,
        pagination: { total: defaultProducts.length, page: 1, limit, pages: 1 }
      });
    }
    res.json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════
//  ORDER ROUTES (protected)
// ═══════════════════════════════════════════

app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      userId: req.user.id,
      userEmail: req.user.email
    });
    await order.save();
    res.status(201).json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files (for frontend)
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});