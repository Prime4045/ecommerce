const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// In-memory data storage (for demo purposes)
let products = [
  {
    _id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    description: 'High-quality wireless headphones with noise cancellation',
    imageUrl: 'https://via.placeholder.com/200x200?text=Headphones',
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Smartphone',
    price: 699.99,
    description: 'Latest smartphone with advanced features',
    imageUrl: 'https://via.placeholder.com/200x200?text=Smartphone',
    stock: 30,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'Laptop',
    price: 1299.99,
    description: 'Powerful laptop for work and gaming',
    imageUrl: 'https://via.placeholder.com/200x200?text=Laptop',
    stock: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '4',
    name: 'Smart Watch',
    price: 299.99,
    description: 'Fitness tracking smartwatch',
    imageUrl: 'https://via.placeholder.com/200x200?text=Watch',
    stock: 40,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '5',
    name: 'Bluetooth Speaker',
    price: 79.99,
    description: 'Portable Bluetooth speaker with excellent sound quality',
    imageUrl: 'https://via.placeholder.com/200x200?text=Speaker',
    stock: 60,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '6',
    name: 'Gaming Mouse',
    price: 49.99,
    description: 'High-precision gaming mouse with RGB lighting',
    imageUrl: 'https://via.placeholder.com/200x200?text=Mouse',
    stock: 75,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let orders = [];

// Product Routes
app.get('/api/products', (req, res) => {
  try {
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p._id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const product = {
      _id: uuidv4(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    products.push(product);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const index = products.findIndex(p => p._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    products[index] = {
      ...products[index],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json(products[index]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const index = products.findIndex(p => p._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    products.splice(index, 1);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Order Routes
app.get('/api/orders/user/:userId', (req, res) => {
  try {
    const userOrders = orders.filter(order => order.userId === req.params.userId);
    res.json(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const order = {
      _id: uuidv4(),
      ...req.body,
      status: 'pending',
      createdAt: new Date()
    };
    
    // Update product stock
    order.products.forEach(orderProduct => {
      const product = products.find(p => p._id === orderProduct.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - orderProduct.quantity);
      }
    });
    
    orders.push(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/orders/:id', (req, res) => {
  try {
    const index = orders.findIndex(o => o._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    orders[index] = {
      ...orders[index],
      status: req.body.status,
      updatedAt: new Date()
    };
    
    res.json(orders[index]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running (Demo Mode)', 
    timestamp: new Date().toISOString(),
    products: products.length,
    orders: orders.length
  });
});

// Get all orders (for admin purposes)
app.get('/api/orders', (req, res) => {
  try {
    res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 12001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Demo server running on port ${PORT}`);
  console.log(`Products loaded: ${products.length}`);
  console.log('Note: Using in-memory storage for demonstration');
});