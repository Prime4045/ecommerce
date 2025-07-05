const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../index.html'));
  } else {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
      
      // Seed sample data if needed
      await seedSampleData();
    } else {
      console.log('⚠️ No MongoDB URI provided, using fallback mode');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('🔄 Continuing with fallback mode...');
  }
};

// Seed sample data
const seedSampleData = async () => {
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    
    if (count === 0) {
      const sampleProducts = [
        {
          name: 'Premium Wireless Headphones',
          price: 299.99,
          originalPrice: 399.99,
          description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort.',
          imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
          category: 'Electronics',
          stock: 45,
          rating: 4.8,
          reviews: 127,
          featured: true,
          tags: ['wireless', 'noise-cancelling', 'premium']
        },
        {
          name: 'Smart Fitness Watch',
          price: 249.99,
          originalPrice: 299.99,
          description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.',
          imageUrl: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500',
          category: 'Electronics',
          stock: 32,
          rating: 4.6,
          reviews: 89,
          featured: true,
          tags: ['fitness', 'smartwatch', 'health']
        },
        {
          name: 'Professional Camera Lens',
          price: 899.99,
          description: 'Capture stunning photos with this professional-grade camera lens. Perfect for portraits and landscape photography.',
          imageUrl: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=500',
          category: 'Electronics',
          stock: 18,
          rating: 4.9,
          reviews: 56,
          featured: false,
          tags: ['photography', 'professional', 'lens']
        },
        {
          name: 'Ergonomic Office Chair',
          price: 399.99,
          originalPrice: 499.99,
          description: 'Work comfortably all day with this ergonomic office chair featuring lumbar support and adjustable height.',
          imageUrl: 'https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg?auto=compress&cs=tinysrgb&w=500',
          category: 'Furniture',
          stock: 25,
          rating: 4.7,
          reviews: 143,
          featured: true,
          tags: ['office', 'ergonomic', 'comfort']
        },
        {
          name: 'Wireless Gaming Mouse',
          price: 79.99,
          originalPrice: 99.99,
          description: 'Dominate your games with this high-precision wireless gaming mouse featuring RGB lighting and programmable buttons.',
          imageUrl: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=500',
          category: 'Electronics',
          stock: 67,
          rating: 4.5,
          reviews: 234,
          featured: false,
          tags: ['gaming', 'wireless', 'rgb']
        },
        {
          name: 'Portable Bluetooth Speaker',
          price: 129.99,
          description: 'Take your music anywhere with this waterproof portable speaker delivering rich, powerful sound.',
          imageUrl: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=500',
          category: 'Electronics',
          stock: 41,
          rating: 4.4,
          reviews: 178,
          featured: false,
          tags: ['portable', 'waterproof', 'bluetooth']
        }
      ];
      
      await Product.insertMany(sampleProducts);
      console.log('✅ Sample products seeded successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:3000`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);

module.exports = app;