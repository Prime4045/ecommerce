// Products Management
class ProductManager {
  constructor() {
    this.products = [];
    this.apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:12001/api' 
      : 'https://work-2-kppmwwrjxyyidufy.prod-runtime.all-hands.dev/api';
  }

  async loadProducts() {
    try {
      this.showLoading(true);
      const response = await fetch(`${this.apiUrl}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.products = await response.json();
      this.displayProducts();
      console.log('Products loaded:', this.products.length);
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products. Please try again later.');
    } finally {
      this.showLoading(false);
    }
  }

  displayProducts() {
    const productsContainer = document.getElementById('products');
    
    if (this.products.length === 0) {
      productsContainer.innerHTML = '<p class="empty-products">No products available.</p>';
      return;
    }

    productsContainer.innerHTML = this.products.map(product => `
      <div class="product" data-id="${product._id}">
        <img src="${product.imageUrl || 'https://via.placeholder.com/200x200?text=Product'}" 
             alt="${product.name}" 
             onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
        <h3>${this.escapeHtml(product.name)}</h3>
        <p class="description">${this.escapeHtml(product.description || 'No description available')}</p>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p class="stock">Stock: ${product.stock} available</p>
        <button class="btn btn-primary" 
                onclick="window.cartManager.addToCart('${product._id}')"
                ${product.stock <= 0 ? 'disabled' : ''}>
          ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    `).join('');
  }

  getProduct(productId) {
    return this.products.find(product => product._id === productId);
  }

  showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const productsSection = document.getElementById('productsSection');
    
    if (show) {
      loadingSpinner.style.display = 'block';
      productsSection.style.display = 'none';
    } else {
      loadingSpinner.style.display = 'none';
      productsSection.style.display = 'block';
    }
  }

  showError(message) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button class="btn btn-primary" onclick="window.productManager.loadProducts()">
          Try Again
        </button>
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Search functionality (for future enhancement)
  searchProducts(query) {
    const filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    const productsContainer = document.getElementById('products');
    if (filteredProducts.length === 0) {
      productsContainer.innerHTML = '<p class="empty-products">No products found matching your search.</p>';
      return;
    }

    // Display filtered products (reuse display logic)
    const originalProducts = this.products;
    this.products = filteredProducts;
    this.displayProducts();
    this.products = originalProducts;
  }

  // Filter by price range (for future enhancement)
  filterByPrice(minPrice, maxPrice) {
    const filteredProducts = this.products.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );
    
    const originalProducts = this.products;
    this.products = filteredProducts;
    this.displayProducts();
    this.products = originalProducts;
  }

  // Sort products (for future enhancement)
  sortProducts(sortBy) {
    let sortedProducts = [...this.products];
    
    switch (sortBy) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        sortedProducts.sort((a, b) => b.stock - a.stock);
        break;
      default:
        return;
    }
    
    const originalProducts = this.products;
    this.products = sortedProducts;
    this.displayProducts();
    this.products = originalProducts;
  }
}

// Initialize product manager
window.productManager = new ProductManager();