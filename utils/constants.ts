/**
 * Application constants for DEVA STORE
 */

// Supabase constants
export const SUPABASE_URL = 'https://zmaxtxyilpqhtymbhfre.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_Vp7Gtc-wvTIbBnN-49N4zA_2Qea5g9Y';

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CITIES: 'cities',
  COUPONS: 'coupons',
  SEARCH_ANALYTICS: 'search_analytics',
  FAVORITES: 'favorites',
  CART: 'cart',
};

// API endpoints (if needed for external services)
export const API_ENDPOINTS = {
  // For example, if we had external payment gateway
  // PAYMENT_GATEWAY: 'https://api.paymentgateway.com/v1/charges',
};

// App constants
export const APP_CONSTANTS = {
  APP_NAME: 'DEVA STORE',
  VERSION: '1.0.0',
  // Animation durations
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  // Pagination limits
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  // Image settings
  IMAGES: {
    PLACEHOLDER: require('../assets/images/placeholder.png'),
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Payment constants (Yemeni banks)
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
};

// Yemeni bank details for transfers
export const YEMENI_BANKS = [
  {
    id: 'yemen_bank_for_reconstruction_and_development',
    name: 'Yemen Bank for Reconstruction and Development (YBRD)',
    accountNumber: 'AE450000000012345678901',
    accountName: 'DEVA STORE',
    swiftCode: 'YBRDAEAD',
  },
  {
    id: 'national_bank_of_yemen',
    name: 'National Bank of Yemen',
    accountNumber: 'AE980000000098765432109',
    accountName: 'DEVA STORE',
    swiftCode: 'NBYEAEAD',
  },
];

// Cities with shipping fees (example data - should come from Supabase)
export const DEFAULT_CITIES = [
  { id: '1', name: 'Sana\'a', fee: 0 }, // Capital, free shipping
  { id: '2', name: 'Aden', fee: 500 },
  { id: '3', name: 'Taiz', fee: 500 },
  { id: '4', name: 'Hodeidah', fee: 700 },
  { id: '5', name: 'Hadhramaut', fee: 1000 },
  { id: '6', name: 'Mahrah', fee: 1200 },
];

// Default coupon codes
export const DEFAULT_COUPONS = [
  { id: '1', code: 'WELCOME10', discount_percent: 10, active: true },
  { id: '2', code: 'DEVA20', discount_percent: 20, active: true },
  { id: '3', code: 'RAMADAN15', discount_percent: 15, active: true },
];

// Animation configuration for staggered grids
export const STAGGER_CONFIG = {
  delay: 70, // ms between each item
  duration: 300, // animation duration
};

// Screen names for navigation
export const ROUTES = {
  // Client routes
  HOME: 'Home',
  PRODUCT_DETAILS: 'ProductDetails',
  PAYMENT: 'Payment',
  ORDER_TIMELINE: 'OrderTimeline',
  FAVORITES: 'Favorites',
  CART: 'Cart',

  // Admin routes
  ADMIN_LOGIN: 'AdminLogin',
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_PRODUCT_CRUD: 'AdminProductCRUD',
  ADMIN_SHIPPING_COUPON_MANAGER: 'AdminShippingCouponManager',
  ADMIN_PAYMENT_AUDIT: 'AdminPaymentAudit',
  ADMIN_WHATSAPP_WEBHOOK: 'AdminWhatsAppWebhook',
};

// Status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Content types for file uploads
export const CONTENT_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  DOCUMENT: ['application/pdf', 'image/jpeg', 'image/png'],
};