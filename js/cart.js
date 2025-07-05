// Shopping Cart Manager
class CartManager {
    constructor() {
        this.cart = this.loadCartFromStorage();
        this.isOpen = false;
        this.setupEventListeners();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        // Cart toggle
        document.getElementById('cartToggle').addEventListener('click', () => {
            this.toggleCart();
        });

        // Close cart
        document.getElementById('closeCart').addEventListener('click', () => {
            this.closeCart();
        });

        // Cart overlay
        document.getElementById('cartOverlay').addEventListener('click', () => {
            this.closeCart();
        });

        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });

        // Clear cart button
        document.getElementById('clearCartBtn').addEventListener('click', () => {
            this.clearCart();
        });
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product._id);

        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                window.notificationManager.show(
                    'Cannot add more items. Stock limit reached.',
                    'warning'
                );
                return false;
            }
            existingItem.quantity += quantity;
        } else {
            if (quantity > product.stock) {
                window.notificationManager.show(
                    'Not enough stock available.',
                    'warning'
                );
                return false;
            }
            
            this.cart.push({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.imageUrl,
                quantity: quantity,
                stock: product.stock
            });
        }

        this.saveCartToStorage();
        this.updateCartDisplay();
        this.updateCartBadge();
        
        window.notificationManager.show(
            `${product.name} added to cart!`,
            'success'
        );

        return true;
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            
            this.saveCartToStorage();
            this.updateCartDisplay();
            this.updateCartBadge();
            
            window.notificationManager.show(
                `${item.name} removed from cart`,
                'info'
            );
        }
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        if (newQuantity > item.stock) {
            window.notificationManager.show(
                'Cannot exceed available stock',
                'warning'
            );
            return;
        }

        item.quantity = newQuantity;
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.updateCartBadge();
    }

    clearCart() {
        if (this.cart.length === 0) {
            window.notificationManager.show('Cart is already empty', 'info');
            return;
        }

        // Create confirmation modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-sm mx-4">
                <h3 class="text-lg font-semibold mb-4">Clear Cart</h3>
                <p class="text-gray-600 mb-6">Are you sure you want to remove all items from your cart?</p>
                <div class="flex space-x-3">
                    <button class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors cancel-btn">
                        Cancel
                    </button>
                    <button class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors confirm-btn">
                        Clear Cart
                    </button>
                </div>
            </div>
        `;

        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            this.cart = [];
            this.saveCartToStorage();
            this.updateCartDisplay();
            this.updateCartBadge();
            modal.remove();
            
            window.notificationManager.show('Cart cleared successfully', 'success');
        });

        document.body.appendChild(modal);
    }

    async checkout() {
        if (!window.authManager.isUserAuthenticated()) {
            window.notificationManager.show('Please log in to checkout', 'warning');
            window.authManager.showLoginModal();
            return;
        }

        if (this.cart.length === 0) {
            window.notificationManager.show('Your cart is empty', 'warning');
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            const orderData = {
                userId: user.id,
                products: this.cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price
                })),
                total: this.getCartTotal(),
                status: 'pending'
            };

            // Show loading state
            const checkoutBtn = document.getElementById('checkoutBtn');
            const originalText = checkoutBtn.textContent;
            checkoutBtn.textContent = 'Processing...';
            checkoutBtn.disabled = true;

            const order = await window.apiManager.createOrder(orderData);
            
            // Clear cart after successful order
            this.cart = [];
            this.saveCartToStorage();
            this.updateCartDisplay();
            this.updateCartBadge();
            this.closeCart();
            
            window.notificationManager.show(
                `Order placed successfully! Order ID: ${order._id}`,
                'success'
            );

            // Refresh products to update stock
            if (window.productManager) {
                window.productManager.loadProducts();
            }

        } catch (error) {
            console.error('Checkout error:', error);
            window.notificationManager.show(
                'Failed to place order. Please try again.',
                'error'
            );
        } finally {
            // Reset button state
            const checkoutBtn = document.getElementById('checkoutBtn');
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    }

    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        this.isOpen = true;
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartOverlay').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        this.isOpen = false;
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.add('hidden');
        document.body.style.overflow = '';
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        const emptyCart = document.getElementById('emptyCart');

        if (this.cart.length === 0) {
            emptyCart.classList.remove('hidden');
            cartFooter.classList.add('hidden');
            return;
        }

        emptyCart.classList.add('hidden');
        cartFooter.classList.remove('hidden');

        cartItemsContainer.innerHTML = `
            <div class="space-y-4">
                ${this.cart.map(item => `
                    <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img src="${item.image || 'https://via.placeholder.com/60x60'}" 
                             alt="${item.name}" 
                             class="w-15 h-15 object-cover rounded-lg">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-900">${this.escapeHtml(item.name)}</h4>
                            <p class="text-sm text-gray-600">${CONFIG.APP.CURRENCY_SYMBOL}${item.price.toFixed(2)} each</p>
                            <div class="flex items-center space-x-2 mt-2">
                                <button onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity - 1})" 
                                        class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <span class="w-8 text-center font-medium">${item.quantity}</span>
                                <button onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity + 1})" 
                                        class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-gray-900">
                                ${CONFIG.APP.CURRENCY_SYMBOL}${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <button onclick="window.cartManager.removeFromCart('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 text-sm mt-1">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Update total
        document.getElementById('cartTotal').textContent = 
            `${CONFIG.APP.CURRENCY_SYMBOL}${this.getCartTotal().toFixed(2)}`;

        this.updateCheckoutButton();
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        const itemCount = this.getCartItemCount();

        if (itemCount > 0) {
            badge.textContent = itemCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        const isAuthenticated = window.authManager.isUserAuthenticated();
        const hasItems = this.cart.length > 0;

        checkoutBtn.disabled = !isAuthenticated || !hasItems;

        if (!isAuthenticated) {
            checkoutBtn.textContent = 'Login to Checkout';
        } else if (!hasItems) {
            checkoutBtn.textContent = 'Cart Empty';
        } else {
            checkoutBtn.textContent = `Checkout (${CONFIG.APP.CURRENCY_SYMBOL}${this.getCartTotal().toFixed(2)})`;
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    saveCartToStorage() {
        try {
            localStorage.setItem(CONFIG.APP.CART_STORAGE_KEY, JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem(CONFIG.APP.CART_STORAGE_KEY);
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

    // Public API
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