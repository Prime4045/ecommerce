// Demo Authentication Module (No Firebase required)
class AuthManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('demoUser')) || null;
    this.initializeAuth();
    this.setupEventListeners();
  }

  initializeAuth() {
    // Initialize with stored user if exists
    this.updateUI(this.currentUser);
    
    if (this.currentUser) {
      console.log('User signed in:', this.currentUser.email);
      this.showMessage('Welcome back!', 'success');
    } else {
      console.log('User signed out');
    }
  }

  setupEventListeners() {
    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
      this.showModal('loginModal');
    });

    // Register button
    document.getElementById('registerBtn').addEventListener('click', () => {
      this.showModal('registerModal');
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout();
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      this.login(email, password);
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      this.register(email, password);
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        this.hideModal(e.target.closest('.modal').id);
      });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.hideModal(e.target.id);
      }
    });
  }

  async login(email, password) {
    try {
      // Demo authentication - simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Demo credentials
      if (email === 'test@example.com' && password === 'password123') {
        this.currentUser = {
          uid: 'demo-user-123',
          email: email,
          displayName: 'Demo User'
        };
        localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
        this.updateUI(this.currentUser);
        this.hideModal('loginModal');
        this.clearForm('loginForm');
        this.showMessage('Successfully logged in!', 'success');
      } else {
        throw new Error('Invalid credentials. Use test@example.com / password123');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage(error.message, 'error');
    }
  }

  async register(email, password) {
    try {
      // Demo registration - simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }
      
      this.currentUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: 'New User'
      };
      localStorage.setItem('demoUser', JSON.stringify(this.currentUser));
      this.updateUI(this.currentUser);
      this.hideModal('registerModal');
      this.clearForm('registerForm');
      this.showMessage('Account created successfully!', 'success');
    } catch (error) {
      console.error('Registration error:', error);
      this.showMessage(error.message, 'error');
    }
  }

  async logout() {
    try {
      this.currentUser = null;
      localStorage.removeItem('demoUser');
      this.updateUI(null);
      this.showMessage('Successfully logged out!', 'success');
      // Clear cart when logging out
      if (window.cartManager) {
        window.cartManager.clearCart();
      }
    } catch (error) {
      console.error('Logout error:', error);
      this.showMessage('Error logging out', 'error');
    }
  }

  updateUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (user) {
      // User is signed in
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      userInfo.style.display = 'flex';
      userEmail.textContent = user.email;
      
      // Enable checkout if cart has items
      if (window.cartManager && window.cartManager.getCartItemCount() > 0) {
        checkoutBtn.disabled = false;
      }
    } else {
      // User is signed out
      loginBtn.style.display = 'inline-block';
      registerBtn.style.display = 'inline-block';
      userInfo.style.display = 'none';
      checkoutBtn.disabled = true;
    }
  }

  showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
  }

  hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  clearForm(formId) {
    document.getElementById(formId).reset();
  }

  getErrorMessage(errorMessage) {
    return errorMessage || 'An error occurred. Please try again.';
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

    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});