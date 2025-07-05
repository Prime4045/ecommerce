// Main Application Controller
class App {
    constructor() {
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing EliteShop...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        } catch (error) {
            console.error('❌ App initialization error:', error);
            this.showCriticalError('Failed to initialize application');
        }
    }

    async start() {
        try {
            // Show loading state
            this.showAppLoading(true);

            // Check API health
            const isAPIHealthy = await this.checkAPIHealth();
            if (!isAPIHealthy) {
                console.warn('⚠️ API health check failed, using fallback mode');
            }

            // Initialize all managers (they're already initialized globally)
            await this.waitForManagers();

            // Setup global event listeners
            this.setupGlobalEventListeners();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Setup performance monitoring
            this.setupPerformanceMonitoring();

            // Mark as initialized
            this.initialized = true;
            
            console.log('✅ EliteShop initialized successfully');
            
            // Show welcome message for first-time users
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ App start error:', error);
            this.showCriticalError('Failed to start application');
        } finally {
            this.showAppLoading(false);
        }
    }

    async checkAPIHealth() {
        try {
            return await window.apiManager.healthCheck();
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }

    async waitForManagers() {
        const managers = ['authManager', 'cartManager', 'productManager', 'notificationManager'];
        const maxAttempts = 50;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const allReady = managers.every(manager => window[manager]);
            if (allReady) {
                console.log('✅ All managers ready');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Managers failed to initialize within timeout');
    }

    setupGlobalEventListeners() {
        // Online/Offline status
        window.addEventListener('online', () => {
            window.notificationManager.success('Connection restored');
            if (window.productManager) {
                window.productManager.loadProducts();
            }
        });

        window.addEventListener('offline', () => {
            window.notificationManager.warning('You are offline. Some features may not work.');
        });

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.initialized) {
                this.handlePageVisible();
            }
        });

        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Prevent form submissions (except auth forms)
        document.addEventListener('submit', (e) => {
            if (!e.target.closest('.auth-form')) {
                e.preventDefault();
            }
        });

        // Global click handler for analytics
        document.addEventListener('click', (e) => {
            this.trackUserInteraction(e);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape key - close modals/cart
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }

            // Ctrl/Cmd + K - focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }

            // Ctrl/Cmd + Shift + C - toggle cart
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                window.cartManager?.toggleCart();
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('📊 Page Load Performance:', {
                    loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                    totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
                });
            }, 0);
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('⚠️ High memory usage detected');
                }
            }, 30000);
        }
    }

    handlePageVisible() {
        // Refresh data when page becomes visible
        if (window.productManager) {
            window.productManager.loadProducts();
        }
    }

    handleWindowResize() {
        // Handle responsive adjustments
        const width = window.innerWidth;
        
        if (width < 768 && window.cartManager?.isOpen) {
            // Auto-close cart on mobile when resizing
            window.cartManager.closeCart();
        }
    }

    handleEscapeKey() {
        // Close any open modals
        const modals = document.querySelectorAll('.fixed.inset-0');
        modals.forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                modal.remove();
            }
        });

        // Close cart if open
        if (window.cartManager?.isOpen) {
            window.cartManager.closeCart();
        }

        // Close user dropdown
        if (window.authManager) {
            window.authManager.closeUserDropdown();
        }
    }

    trackUserInteraction(event) {
        // Basic interaction tracking
        const element = event.target;
        const action = element.tagName.toLowerCase();
        const classes = element.className;
        
        // Log significant interactions
        if (element.matches('button, a, .product-card, .category-card')) {
            console.log('👆 User interaction:', {
                action,
                element: element.textContent?.trim().substring(0, 50),
                classes: classes.substring(0, 100)
            });
        }
    }

    showWelcomeMessage() {
        const hasVisited = localStorage.getItem('eliteshop_visited');
        if (!hasVisited) {
            setTimeout(() => {
                window.notificationManager.info(
                    'Welcome to EliteShop! Discover amazing products with great deals.',
                    8000
                );
                localStorage.setItem('eliteshop_visited', 'true');
            }, 2000);
        }
    }

    showAppLoading(show) {
        // You can implement a global loading overlay here if needed
        if (show) {
            console.log('🔄 Loading application...');
        } else {
            console.log('✅ Application loaded');
        }
    }

    showCriticalError(message) {
        // Show critical error that prevents app from working
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-600 text-white flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-exclamation-triangle text-6xl mb-4"></i>
                <h2 class="text-2xl font-bold mb-4">Application Error</h2>
                <p class="mb-6">${message}</p>
                <button onclick="window.location.reload()" 
                        class="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                    Reload Page
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: CONFIG.APP.CURRENCY
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
}

// Global error handlers
window.addEventListener('error', (e) => {
    console.error('🚨 Global error:', e.error);
    if (window.notificationManager) {
        window.notificationManager.error('An unexpected error occurred');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    if (window.notificationManager) {
        window.notificationManager.error('A network error occurred');
    }
});

// Initialize the application
window.app = new App();

// Make utility functions globally available
window.AppUtils = {
    formatCurrency: (amount) => window.app.formatCurrency(amount),
    formatDate: (date) => window.app.formatDate(date),
    debounce: (func, wait) => window.app.debounce(func, wait),
    throttle: (func, limit) => window.app.throttle(func, limit)
};

// Development helpers
if (process?.env?.NODE_ENV === 'development') {
    window.dev = {
        config: CONFIG,
        managers: {
            auth: () => window.authManager,
            cart: () => window.cartManager,
            products: () => window.productManager,
            notifications: () => window.notificationManager
        },
        utils: window.AppUtils
    };
}