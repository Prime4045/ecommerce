// Configuration settings
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api',
        ENDPOINTS: {
            PRODUCTS: '/products',
            ORDERS: '/orders',
            USERS: '/users'
        }
    },
    
    // Auth0 Configuration
    AUTH0: {
        domain: 'your-auth0-domain.auth0.com',
        clientId: 'your-auth0-client-id',
        redirectUri: window.location.origin,
        audience: 'your-api-identifier'
    },
    
    // Application Settings
    APP: {
        NAME: 'EliteShop',
        VERSION: '1.0.0',
        CURRENCY: 'USD',
        CURRENCY_SYMBOL: '$',
        ITEMS_PER_PAGE: 12,
        CART_STORAGE_KEY: 'eliteshop_cart',
        USER_STORAGE_KEY: 'eliteshop_user'
    },
    
    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 5000,
        DEBOUNCE_DELAY: 300
    }
};

// Make config globally available
window.CONFIG = CONFIG;