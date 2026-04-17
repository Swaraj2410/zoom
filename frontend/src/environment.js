// Use environment variable to detect production mode
// In production, set REACT_APP_BACKEND_URL to your Render backend URL
// For local development, it will default to localhost

// Check if we're running on a production domain (not localhost)
const isProductionDomain = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';

const IS_PROD = process.env.NODE_ENV === 'production' || isProductionDomain;

const DEFAULT_PROD_BACKEND_URL = "https://zoom-video-app-backend.onrender.com";

// Priority: 
// 1. localStorage override (for testing - set window.BACKEND_URL_OVERRIDE in console)
// 2. REACT_APP_BACKEND_URL env var (set during build)
// 3. Production default
// 4. Localhost
let BACKEND_URL;

if (typeof window !== 'undefined') {
    // Check for localStorage override (useful for testing)
    const override = localStorage.getItem('BACKEND_URL_OVERRIDE');
    if (override) {
        BACKEND_URL = override;
    } else {
        BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 
            (IS_PROD ? DEFAULT_PROD_BACKEND_URL : "http://localhost:8000");
    }
} else {
    // Server-side rendering (shouldn't happen, but just in case)
    BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
}

// Log for debugging (remove in production if needed)
if (typeof window !== 'undefined') {
    console.log('=== Backend Configuration ===');
    console.log('Backend URL:', BACKEND_URL);
    console.log('Is Production:', IS_PROD);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
    console.log('Hostname:', window.location.hostname);
    console.log('============================');
    
    // Warn if using localhost in production
    if (IS_PROD && BACKEND_URL.includes('localhost')) {
        console.warn('⚠️ WARNING: Running on production domain but using localhost backend!');
        console.warn('⚠️ Set REACT_APP_BACKEND_URL environment variable and rebuild.');
    }
}

const server = BACKEND_URL;

export default server;
