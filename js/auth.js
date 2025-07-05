// Authentication Manager using Auth0
class AuthManager {
    constructor() {
        this.auth0 = null;
        this.user = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        try {
            // For demo purposes, we'll use a simple auth system
            // In production, replace this with actual Auth0 implementation
            this.loadUserFromStorage();
            this.setupEventListeners();
            this.updateUI();
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.showDemoAuthInfo();
        }
    }

    setupEventListeners() {
        // Login button
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.showLoginModal();
        });

        // Register button
        document.getElementById('registerBtn')?.addEventListener('click', () => {
            this.showRegisterModal();
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // User menu toggle
        document.getElementById('userMenuButton')?.addEventListener('click', () => {
            this.toggleUserDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userMenu')) {
                this.closeUserDropdown();
            }
        });
    }

    showLoginModal() {
        // Create and show login modal
        const modal = this.createAuthModal('login');
        document.body.appendChild(modal);
        
        // Focus on email input
        setTimeout(() => {
            modal.querySelector('input[type="email"]').focus();
        }, 100);
    }

    showRegisterModal() {
        // Create and show register modal
        const modal = this.createAuthModal('register');
        document.body.appendChild(modal);
        
        // Focus on email input
        setTimeout(() => {
            modal.querySelector('input[type="email"]').focus();
        }, 100);
    }

    createAuthModal(type) {
        const isLogin = type === 'login';
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
        modal.id = `${type}Modal`;

        modal.innerHTML = `
            <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 animate-slide-up">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">
                        ${isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <button class="text-gray-500 hover:text-gray-700 close-modal">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form class="auth-form" data-type="${type}">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="email" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                   placeholder="Enter your email">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" name="password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                   placeholder="Enter your password">
                        </div>
                        
                        ${!isLogin ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" name="name" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                   placeholder="Enter your full name">
                        </div>
                        ` : ''}
                    </div>
                    
                    <button type="submit" 
                            class="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        ${isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-600">
                        ${isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button class="text-primary-600 hover:text-primary-700 font-medium switch-auth" data-switch="${isLogin ? 'register' : 'login'}">
                            ${isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
                
                <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700">
                        <i class="fas fa-info-circle mr-1"></i>
                        Demo: Use any email and password to ${isLogin ? 'login' : 'register'}
                    </p>
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.querySelector('.switch-auth').addEventListener('click', (e) => {
            const switchTo = e.target.dataset.switch;
            this.closeModal(modal);
            if (switchTo === 'login') {
                this.showLoginModal();
            } else {
                this.showRegisterModal();
            }
        });

        modal.querySelector('.auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit(e.target, modal);
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        return modal;
    }

    async handleAuthSubmit(form, modal) {
        const formData = new FormData(form);
        const type = form.dataset.type;
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create user object
            const user = {
                id: Date.now().toString(),
                email: email,
                name: name || email.split('@')[0],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0ea5e9&color=fff`
            };

            this.setUser(user);
            this.closeModal(modal);
            
            window.notificationManager.show(
                `Welcome ${type === 'login' ? 'back' : 'to EliteShop'}, ${user.name}!`,
                'success'
            );

        } catch (error) {
            console.error('Auth error:', error);
            window.notificationManager.show('Authentication failed. Please try again.', 'error');
        } finally {
            // Reset button state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = submitBtn.textContent.replace('Processing...', 
                type === 'login' ? 'Sign In' : 'Create Account');
            submitBtn.disabled = false;
        }
    }

    closeModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 200);
    }

    setUser(user) {
        this.user = user;
        this.isAuthenticated = true;
        localStorage.setItem(CONFIG.APP.USER_STORAGE_KEY, JSON.stringify(user));
        this.updateUI();
        
        // Update cart checkout availability
        if (window.cartManager) {
            window.cartManager.updateCheckoutButton();
        }
    }

    loadUserFromStorage() {
        const userData = localStorage.getItem(CONFIG.APP.USER_STORAGE_KEY);
        if (userData) {
            this.user = JSON.parse(userData);
            this.isAuthenticated = true;
        }
    }

    logout() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem(CONFIG.APP.USER_STORAGE_KEY);
        
        // Clear cart
        if (window.cartManager) {
            window.cartManager.clearCart();
        }
        
        this.updateUI();
        window.notificationManager.show('You have been logged out successfully', 'info');
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');

        if (this.isAuthenticated && this.user) {
            authButtons.classList.add('hidden');
            userMenu.classList.remove('hidden');
            
            // Update user info
            document.getElementById('userName').textContent = this.user.name;
            document.getElementById('userAvatar').src = this.user.avatar;
        } else {
            authButtons.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('hidden');
    }

    closeUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.add('hidden');
    }

    showDemoAuthInfo() {
        console.log('Demo Auth Mode: Use any email/password combination to authenticate');
    }

    // Public methods
    getCurrentUser() {
        return this.user;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();