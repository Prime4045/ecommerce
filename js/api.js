// API Manager for handling all backend communications
class APIManager {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Products API
    async getProducts() {
        return this.request(CONFIG.API.ENDPOINTS.PRODUCTS);
    }

    async getProduct(id) {
        return this.request(`${CONFIG.API.ENDPOINTS.PRODUCTS}/${id}`);
    }

    async createProduct(productData) {
        return this.request(CONFIG.API.ENDPOINTS.PRODUCTS, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.request(`${CONFIG.API.ENDPOINTS.PRODUCTS}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.request(`${CONFIG.API.ENDPOINTS.PRODUCTS}/${id}`, {
            method: 'DELETE'
        });
    }

    // Orders API
    async getOrders(userId) {
        return this.request(`${CONFIG.API.ENDPOINTS.ORDERS}/user/${userId}`);
    }

    async getOrder(id) {
        return this.request(`${CONFIG.API.ENDPOINTS.ORDERS}/${id}`);
    }

    async createOrder(orderData) {
        return this.request(CONFIG.API.ENDPOINTS.ORDERS, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrderStatus(id, status) {
        return this.request(`${CONFIG.API.ENDPOINTS.ORDERS}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Initialize API manager
window.apiManager = new APIManager();