// Shopping Cart Management
class CartManager {
  constructor() {
    this.cart = this.loadCartFromStorage();
    this.apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:12001/api' 
      : 'https://work-2-kppmwwrjxyyidufy.prod-runtime.all-hands.dev/api';
    this.setupEventListeners();
    this.updateCartDisplay();
  }

  setupEventListeners() {
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      this.checkout();
    });

    // Clear cart button
    document.getElementById('clearCartBtn').addEventListener('click', () => {
      this.clearCart();
    });
  }

  addToCart(productId) {
    const product = window.productManager.getProduct(productId);
    if (!product) {
      this.showMessage('Product not found', 'error');
      return;
    }

    if (product.stock <= 0) {
      this.showMessage('Product is out of stock', 'error');
      return;
    }

    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        this.showMessage('Cannot add more items. Stock limit reached.', 'error');
        return;
      }
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      });
    }

    this.saveCartToStorage();
    this.updateCartDisplay();
    this.showMessage(`${product.name} added to cart!`, 'success');
    
    // Update checkout button state
    this.updateCheckoutButton();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.updateCheckoutButton();
  }

  updateQuantity(productId, newQuantity) {
    const item = this.cart.find(item => item.id === productId);
    if (!item) return;

    const product = window.productManager.getProduct(productId);
    if (newQuantity > product.stock) {
      this.showMessage('Cannot exceed available stock', 'error');
      return;
    }

    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    item.quantity = newQuantity;
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.updateCheckoutButton();
  }

  updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');

    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
      cartTotalContainer.innerHTML = '';
      return;
    }

    // Display cart items
    cartItemsContainer.innerHTML = this.cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <div class="cart-item-name">${this.escapeHtml(item.name)}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
        </div>
        <div class="cart-item-controls">
          <button class="quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          <button class="btn btn-danger btn-sm" onclick="window.cartManager.removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');

    // Display total
    const total = this.getCartTotal();
    cartTotalContainer.innerHTML = `
      <div>Total: $${total.toFixed(2)}</div>
      <div style="font-size: 0.9rem; color: #666;">Items: ${this.getCartItemCount()}</div>
    `;
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart() {
    if (this.cart.length === 0) {
      this.showMessage('Cart is already empty', 'error');
      return;
    }

    if (confirm('Are you sure you want to clear your cart?')) {
      this.cart = [];
      this.saveCartToStorage();
      this.updateCartDisplay();
      this.updateCheckoutButton();
      this.showMessage('Cart cleared', 'success');
    }
  }

  async checkout() {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
      this.showMessage('Please log in to checkout', 'error');
      return;
    }

    if (this.cart.length === 0) {
      this.showMessage('Your cart is empty', 'error');
      return;
    }

    try {
      const user = window.authManager.getCurrentUser();
      const orderData = {
        userId: user.uid,
        products: this.cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        })),
        total: this.getCartTotal()
      };

      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      
      // Clear cart after successful order
      this.cart = [];
      this.saveCartToStorage();
      this.updateCartDisplay();
      this.updateCheckoutButton();
      
      this.showMessage(`Order placed successfully! Order ID: ${order._id}`, 'success');
      
      // Optionally reload products to update stock
      if (window.productManager) {
        window.productManager.loadProducts();
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      this.showMessage('Failed to place order. Please try again.', 'error');
    }
  }

  updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const isAuthenticated = window.authManager && window.authManager.isAuthenticated();
    const hasItems = this.cart.length > 0;
    
    checkoutBtn.disabled = !isAuthenticated || !hasItems;
    
    if (!isAuthenticated) {
      checkoutBtn.textContent = 'Login to Checkout';
    } else if (!hasItems) {
      checkoutBtn.textContent = 'Cart Empty';
    } else {
      checkoutBtn.textContent = `Checkout ($${this.getCartTotal().toFixed(2)})`;
    }
  }

  saveCartToStorage() {
    try {
      localStorage.setItem('ecommerce_cart', JSON.stringify(this.cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('ecommerce_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return [];
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert at the top of main content
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  // Get cart data for external use
  getCartData() {
    return {
      items: this.cart,
      total: this.getCartTotal(),
      itemCount: this.getCartItemCount()
    };
  }
}

// Initialize cart manager
window.cartManager = new CartManager();