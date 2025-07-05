const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get all orders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('products.productId', 'name imageUrl');

    const total = await Order.countDocuments({ userId: req.params.userId });

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId', 'name imageUrl description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Create new order
router.post('/', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('userEmail').isEmail().withMessage('Valid email is required'),
  body('products').isArray({ min: 1 }).withMessage('Products array is required'),
  body('products.*.productId').notEmpty().withMessage('Product ID is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { products, ...orderData } = req.body;

    // Validate products and update stock
    const validatedProducts = [];
    let calculatedTotal = 0;

    for (const orderProduct of products) {
      const product = await Product.findById(orderProduct.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({ 
          message: `Product ${orderProduct.productId} not found or inactive` 
        });
      }

      if (product.stock < orderProduct.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      // Update product stock
      product.stock -= orderProduct.quantity;
      await product.save();

      validatedProducts.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: orderProduct.quantity,
        imageUrl: product.imageUrl
      });

      calculatedTotal += product.price * orderProduct.quantity;
    }

    // Create order
    const order = new Order({
      ...orderData,
      products: validatedProducts,
      total: calculatedTotal
    });

    const newOrder = await order.save();
    
    // Populate product details for response
    await newOrder.populate('products.productId', 'name imageUrl');
    
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(400).json({ message: 'Error creating order' });
  }
});

// Update order status
router.put('/:id/status', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(400).json({ message: 'Error updating order status' });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be cancelled' 
      });
    }

    // Restore product stock
    for (const orderProduct of order.products) {
      const product = await Product.findById(orderProduct.productId);
      if (product) {
        product.stock += orderProduct.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Get all orders (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('products.productId', 'name imageUrl');

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

module.exports = router;