// Main application initialization and coordination
class App {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      console.log('Initializing eCommerce Platform...');
      
      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showError('Failed to initialize application');
    }
  }

  async start() {
    try {
      // Wait a bit for Firebase auth to initialize
      await this.waitForAuth();
      
      // Load products
      if (window.productManager) {
        await window.productManager.loadProducts();
      }
      
      // Update cart display
      if (window.cartManager) {
        window.cartManager.updateCartDisplay();
        window.cartManager.updateCheckoutButton();
      }
      
      this.initialized = true;
      console.log('eCommerce Platform initialized successfully');
      
      // Setup additional event listeners
      this.setupGlobalEventListeners();
      
    } catch (error) {
      console.error('Error starting app:', error);
      this.showError('Failed to start application');
    }
  }

  async waitForAuth() {
    // Wait for auth manager to be available
    let attempts = 0;
    while (!window.authManager && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.authManager) {
      console.warn('Auth manager not available');
    }
  }

  setupGlobalEventListeners() {
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.showMessage('Connection restored', 'success');
      if (window.productManager) {
        window.productManager.loadProducts();
      }
    });

    window.addEventListener('offline', () => {
      this.showMessage('You are offline. Some features may not work.', 'error');
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.initialized) {
        // Page became visible, refresh data if needed
        this.refreshData();
      }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
          modal.style.display = 'none';
        });
      }
    });

    // Handle form submissions to prevent default behavior
    document.addEventListener('submit', (e) => {
      // Let auth forms handle their own submission
      if (e.target.id === 'loginForm' || e.target.id === 'registerForm') {
        return;
      }
      e.preventDefault();
    });
  }

  async refreshData() {
    try {
      if (window.productManager) {
        await window.productManager.loadProducts();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  showError(message) {
    const main = document.querySelector('main');
    if (main) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'message error';
      errorDiv.textContent = message;
      main.insertBefore(errorDiv, main.firstChild);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }

  showMessage(message, type = 'info') {
    const main = document.querySelector('main');
    if (main) {
      // Remove existing messages of the same type
      const existingMessages = main.querySelectorAll(`.message.${type}`);
      existingMessages.forEach(msg => msg.remove());
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = message;
      main.insertBefore(messageDiv, main.firstChild);
      
      setTimeout(() => {
        messageDiv.remove();
      }, 3000);
    }
  }

  // Utility methods for other components
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  static debounce(func, wait) {
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

  static throttle(func, limit) {
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
}

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// Initialize the application
window.app = new App();

// Make utility functions globally available
window.AppUtils = {
  formatCurrency: App.formatCurrency,
  formatDate: App.formatDate,
  debounce: App.debounce,
  throttle: App.throttle
};