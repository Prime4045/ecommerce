// Products Manager
class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentSort = 'default';
        this.searchQuery = '';
        this.setupEventListeners();
        this.loadProducts();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', this.debounce((e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterAndDisplayProducts();
        }, CONFIG.UI.DEBOUNCE_DELAY));

        // Sort functionality
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.filterAndDisplayProducts();
        });

        // Category filters
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                // Add category filtering logic here
                console.log('Category clicked:', card.textContent.trim());
            });
        });
    }

    async loadProducts() {
        try {
            this.showLoading(true);
            this.products = await window.apiManager.getProducts();
            this.filteredProducts = [...this.products];
            this.displayProducts();
            console.log(`Loaded ${this.products.length} products`);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please try again later.');
        } finally {
            this.showLoading(false);
        }
    }

    filterAndDisplayProducts() {
        // Apply search filter
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = !this.searchQuery || 
                product.name.toLowerCase().includes(this.searchQuery) ||
                (product.description && product.description.toLowerCase().includes(this.searchQuery));
            
            return matchesSearch;
        });

        // Apply sorting
        this.sortProducts();
        
        // Display results
        this.displayProducts();
    }

    sortProducts() {
        switch (this.currentSort) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                // Keep original order
                break;
        }
    }

    displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredProducts.length === 0) {
            productsGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        productsGrid.classList.remove('hidden');

        productsGrid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div class="relative">
                    <img src="${product.imageUrl || this.getPlaceholderImage(product.name)}" 
                         alt="${product.name}" 
                         class="w-full h-48 object-cover"
                         onerror="this.src='${this.getPlaceholderImage(product.name)}'">
                    
                    ${product.stock <= 5 ? `
                        <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ${product.stock === 0 ? 'Out of Stock' : `Only ${product.stock} left`}
                        </div>
                    ` : ''}
                    
                    <div class="absolute top-2 right-2">
                        <button class="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                            <i class="fas fa-heart text-gray-400 hover:text-red-500"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        ${this.escapeHtml(product.name)}
                    </h3>
                    
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                        ${this.escapeHtml(product.description || 'No description available')}
                    </p>
                    
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-1">
                            ${this.generateStarRating(product.rating || 4.5)}
                            <span class="text-sm text-gray-500 ml-1">(${product.reviews || Math.floor(Math.random() * 100) + 10})</span>
                        </div>
                        <span class="text-sm text-gray-500">Stock: ${product.stock}</span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                            <span class="text-2xl font-bold text-primary-600">
                                ${CONFIG.APP.CURRENCY_SYMBOL}${product.price.toFixed(2)}
                            </span>
                            ${product.originalPrice && product.originalPrice > product.price ? `
                                <span class="text-sm text-gray-500 line-through">
                                    ${CONFIG.APP.CURRENCY_SYMBOL}${product.originalPrice.toFixed(2)}
                                </span>
                            ` : ''}
                        </div>
                        
                        <button onclick="window.cartManager.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                                ${product.stock <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            <span>${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add animation to newly loaded products
        const productCards = productsGrid.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fade-in');
        });
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-yellow-400"></i>';
        }
        
        return stars;
    }

    getPlaceholderImage(productName) {
        const encodedName = encodeURIComponent(productName);
        return `https://via.placeholder.com/300x200/0ea5e9/ffffff?text=${encodedName}`;
    }

    showLoading(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        if (show) {
            loadingSpinner.classList.remove('hidden');
            productsGrid.classList.add('hidden');
            emptyState.classList.add('hidden');
        } else {
            loadingSpinner.classList.add('hidden');
        }
    }

    showError(message) {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <button onclick="window.productManager.loadProducts()" 
                        class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                    <i class="fas fa-redo mr-2"></i>Try Again
                </button>
            </div>
        `;
        productsGrid.classList.remove('hidden');
    }

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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods
    getProduct(productId) {
        return this.products.find(product => product._id === productId);
    }

    searchProducts(query) {
        this.searchQuery = query.toLowerCase();
        document.getElementById('searchInput').value = query;
        this.filterAndDisplayProducts();
    }

    filterByCategory(category) {
        // Implement category filtering
        console.log('Filtering by category:', category);
    }
}

// Initialize product manager
window.productManager = new ProductManager();