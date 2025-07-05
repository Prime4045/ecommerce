const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();
const app = express();

// In-memory storage as fallback
let products = [
  {
    _id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    description: 'High-quality wireless headphones with noise cancellation',
    imageUrl: 'https://via.placeholder.com/200x200?text=No+Image',
    stock: 48
  },
  {
    _id: '2',
    name: 'Smartphone',
    price: 699.99,
    description: 'Latest smartphone with advanced features',
    imageUrl: 'https://via.placeholder.com/200x200?text=No+Image',
    stock: 28
  },
  {
    _id: '3',
    name: 'Laptop',
    price: 1299.99,
    description: 'Powerful laptop for work and gaming',
    imageUrl: 'https://via.placeholder.com/200x200?text=No+Image',
    stock: 19
  },
  {
    _id: '4',
    name: 'Smart Watch',
    price: 299.99,
    description: 'Fitness tracking smartwatch',
    imageUrl: 'https://via.placeholder.com/200x200?text=No+Image',
    stock: 38
  },
  {
    _id: '5',
    name: 'Bluetooth Speaker',
    price: 79.99,
    description: 'Portable Bluetooth speaker with excellent sound quality',
    imageUrl: 'https://via.placeholder.com/200x200?text=No+Image',
    stock: 59
  },
  {
    _id: '6',
    name: 'Gaming Mouse',
    price: 49.99,
    description: 'High-precision gaming mouse with RGB lighting',
    imageUrl: 'https://via.placeholder.com/200x200?text=No+Image',
    stock: 74
  }
];

let orders = [];
let mongoConnected = false;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Fallback routes for when MongoDB is not available
app.get('/api/products', (req, res) => {
  if (!mongoConnected) {
    return res.json(products);
  }
  // If MongoDB is connected, this will be handled by the route file
});

app.post('/api/products', (req, res) => {
  if (!mongoConnected) {
    const newProduct = {
      _id: uuidv4(),
      ...req.body
    };
    products.push(newProduct);
    return res.status(201).json(newProduct);
  }
  // If MongoDB is connected, this will be handled by the route file
});

app.get('/api/orders', (req, res) => {
  if (!mongoConnected) {
    return res.json(orders);
  }
  // If MongoDB is connected, this will be handled by the route file
});

app.post('/api/orders', (req, res) => {
  if (!mongoConnected) {
    const order = {
      _id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    // Update stock levels
    order.products.forEach(orderProduct => {
      const product = products.find(p => p._id === orderProduct.productId);
      if (product) {
        product.stock -= orderProduct.quantity;
        // Add product details to order
        orderProduct.name = product.name;
        orderProduct.price = product.price;
      }
    });
    
    orders.push(order);
    return res.status(201).json(order);
  }
  // If MongoDB is connected, this will be handled by the route file
});

// MongoDB routes (only used if MongoDB connects)
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    database: mongoConnected ? 'MongoDB' : 'In-Memory',
    products: products.length,
    orders: orders.length
  });
});

// MongoDB connection (optional)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB Atlas');
    mongoConnected = true;
    
    // Seed some sample products if none exist
    const Product = require('./models/Product');
    Product.countDocuments().then(count => {
      if (count === 0) {
        const sampleProducts = [
          {
            name: 'Wireless Headphones',
            price: 99.99,
            description: 'High-quality wireless headphones with noise cancellation',
            imageUrl: 'https://via.placeholder.com/200x200?text=Headphones',
            stock: 50
          },
          {
            name: 'Smartphone',
            price: 699.99,
            description: 'Latest smartphone with advanced features',
            imageUrl: 'https://via.placeholder.com/200x200?text=Smartphone',
            stock: 30
          },
          {
            name: 'Laptop',
            price: 1299.99,
            description: 'Powerful laptop for work and gaming',
            imageUrl: 'https://via.placeholder.com/200x200?text=Laptop',
            stock: 20
          },
          {
            name: 'Smart Watch',
            price: 299.99,
            description: 'Fitness tracking smartwatch',
            imageUrl: 'https://via.placeholder.com/200x200?text=Watch',
            stock: 40
          }
        ];
        
        Product.insertMany(sampleProducts).then(() => {
          console.log('Sample products added to database');
        });
      }
    });
  }).catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Falling back to in-memory storage');
  });
} else {
  console.log('No MongoDB URI provided, using in-memory storage');
}

const PORT = process.env.PORT || 12001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});