# Full-Stack eCommerce Platform

A modern, responsive eCommerce platform built with HTML, CSS, JavaScript, Firebase Authentication, and MongoDB Atlas.

## Features

- 🛒 **Shopping Cart**: Add, remove, and manage products in cart
- 🔐 **User Authentication**: Firebase-powered login/registration
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🗄️ **Database Integration**: MongoDB Atlas for product and order storage
- 🎨 **Modern UI**: Clean, professional interface with smooth animations
- 🔄 **Real-time Updates**: Dynamic cart updates and user state management
- 📦 **Order Management**: Place and track orders
- 🛡️ **Security**: Input validation and secure authentication

## Project Structure

```
ecommerce-platform/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # Styling
│   └── js/
│       ├── main.js        # App initialization
│       ├── auth.js        # Authentication logic
│       ├── products.js    # Product management
│       └── cart.js        # Shopping cart logic
├── server/                # Backend files
│   ├── index.js          # Express server
│   ├── routes/           # API routes
│   │   ├── products.js   # Product endpoints
│   │   └── orders.js     # Order endpoints
│   ├── models/           # Database models
│   │   ├── Product.js    # Product schema
│   │   └── Order.js      # Order schema
│   ├── package.json      # Dependencies
│   └── .env             # Environment variables
├── firebase.json         # Firebase configuration
└── README.md            # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Firebase account (optional, for authentication)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ecommerce-platform/server
npm install
```

### 2. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string from the Atlas dashboard
4. Update the `MONGODB_URI` in `server/.env` with your credentials

### 3. Firebase Setup (Optional)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Get your Firebase config from Project Settings
4. Update the `firebaseConfig` object in `public/index.html`

### 4. Environment Configuration

Update `server/.env` with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority
PORT=12001
```

### 5. Running the Application

#### Start the Backend Server

```bash
cd server
npm start
```

The server will run on port 12001 and automatically seed sample products.

#### Serve the Frontend

You can serve the frontend using any static file server:

**Option 1: Using Python (if installed)**
```bash
cd public
python -m http.server 12000
```

**Option 2: Using Node.js serve**
```bash
npm install -g serve
cd public
serve -p 12000
```

**Option 3: Using Firebase CLI**
```bash
npm install -g firebase-tools
firebase serve --port 12000
```

### 6. Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:12000`
- Backend API: `http://localhost:12001`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Health Check
- `GET /health` - Server health status

## Usage

### For Users
1. **Browse Products**: View available products on the homepage
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Manage Cart**: Adjust quantities or remove items in the cart sidebar
4. **Authentication**: Register or login to place orders
5. **Checkout**: Complete your purchase with the checkout button

### For Developers
1. **Add Products**: Use the POST `/api/products` endpoint
2. **Manage Orders**: Monitor orders through the orders API
3. **Customize UI**: Modify CSS and JavaScript files
4. **Extend Features**: Add new routes and functionality

## Sample Product Data

The application automatically seeds sample products:
- Wireless Headphones ($99.99)
- Smartphone ($699.99)
- Laptop ($1299.99)
- Smart Watch ($299.99)

## Security Features

- Input validation and sanitization
- CORS configuration
- Secure authentication with Firebase
- Error handling and logging
- XSS protection through HTML escaping

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your connection string in `.env`
   - Check network access in MongoDB Atlas
   - Ensure your IP is whitelisted

2. **Firebase Authentication Not Working**
   - Verify Firebase config in `index.html`
   - Check if Email/Password auth is enabled
   - Ensure domain is authorized in Firebase console

3. **CORS Errors**
   - Backend includes CORS middleware
   - Check if frontend and backend URLs match

4. **Products Not Loading**
   - Verify backend server is running
   - Check API URL in `products.js`
   - Check browser console for errors

### Development Tips

- Use browser developer tools for debugging
- Check console logs for error messages
- Verify network requests in Network tab
- Test with different browsers and devices

## Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Admin dashboard for product management
- [ ] User profiles and order history
- [ ] Product search and filtering
- [ ] Product reviews and ratings
- [ ] Email notifications
- [ ] Inventory management
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) features
- [ ] Advanced analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review browser console errors
3. Verify all setup steps were completed
4. Check MongoDB Atlas and Firebase configurations

---

Built with ❤️ using modern web technologies.