export const meta = {
  name: 'generate-devastore-app',
  description: 'Generate the full DEVA STORE React Native Expo app with Supabase backend',
  phases: [
    { title: 'Setup', detail: 'Generate App.tsx, navigation, and Supabase service' },
    { title: 'ClientScreens', detail: 'Generate home, product details, payment, order timeline, favorites screens' },
    { title: 'AdminScreens', detail: 'Generate admin login, dashboard, product CRUD, shipping/coupons, payment audit, webhook screens' },
    { title: 'Utils', detail: 'Generate theme, constants, helpers' },
    { title: 'I18n', detail: 'Generate English and Arabic translation files' },
    { title: 'WriteFiles', detail: 'Write all generated files to disk' }
  ]
};

let allFiles = [];

function addFiles(files) {
  allFiles = [...allFiles, ...files];
}

// Phase 1: Setup
phase('Setup');
const setupFiles = await agent(`Generate the following files for the DEVA STORE app:
1. App.tsx - the root component that sets up SupabaseProvider, Navigation, and I18next.
2. navigation/AppNavigator.tsx - the main navigation stack using react-navigation.
3. services/supabase.ts - Supabase client initialization and helper functions.
4. services/auth.ts - Authentication functions (login, logout, get current user).
5. services/productService.ts - CRUD operations for products.
6. services/orderService.ts - CRUD operations for orders.
7. services/cityService.ts - CRUD operations for cities.
8. services/couponService.ts - CRUD operations for coupons.
9. services/searchAnalyticsService.ts - Operations for search analytics.

Use TypeScript and follow the latest Expo and React Native best practices.
Make sure to include proper error handling and loading states.

Return the files as an array of objects with { path, content }.`, {
  phase: 'Setup',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  }
});

addFiles(setupFiles);

// Phase 2: Client Screens
phase('ClientScreens');
const clientScreensFiles = await agent(`Generate the following client screens for the DEVA STORE app:
1. screens/HomeScreen.tsx - Luxury home screen with animated sliders (using react-native-reanimated/moti) and staggered grids for products.
2. screens/ProductDetailsScreen.tsx - Product details screen with zoom gallery (using react-native-gesture-handler and reanimated), dynamic views & live stock counter.
3. screens/PaymentScreen.tsx - Payment screen showing Yemeni bank transfer details and a document/file picker for uploading transfer screenshot.
4. screens/OrderTimelineScreen.tsx - Animated order timeline showing steps from processing to delivery.
5. screens/FavoritesScreen.tsx - Screen showing user's favorite products with sync to Supabase.
6. screens/CartScreen.tsx - Shopping cart screen (if needed, but we can combine with home or have separate).

Use TypeScript, react-native-reanimated, moti for animations, and follow the luxury dark mode theme with gold/neon accents.
Implement run-time bilingual toggle for English (LTR) and Arabic (RTL) using I18nManager.

Return the files as an array of objects with { path, content }.`, {
  phase: 'ClientScreens',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  }
});

addFiles(clientScreensFiles);

// Phase 3: Admin Screens
phase('AdminScreens');
const adminScreensFiles = await agent(`Generate the following admin screens for the DEVA STORE app (hardcoded super admin: abnbwh@gmail.com / Abod#7822):
1. screens/admin/AdminLoginScreen.tsx - Login screen for admin.
2. screens/admin/AdminDashboardScreen.tsx - Live analytics & top searches dashboard.
3. screens/admin/AdminProductCRUDScreen.tsx - Full product CRUD (create, read, update, delete).
4. screens/admin/AdminShippingCouponManagerScreen.tsx - Dynamic shipping & coupons manager.
5. screens/admin/AdminPaymentAuditScreen.tsx - Anti-fraud split-screen payment audit ("Mark as Paid").
6. screens/admin/AdminWhatsAppWebhookScreen.tsx - Screen to configure or view WhatsApp trigger webhook (for +967782282586).

Use TypeScript and follow the same luxury dark theme.
Implement real-time updates where applicable.

Return the files as an array of objects with { path, content }.`, {
  phase: 'AdminScreens',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  }
});

addFiles(adminScreensFiles);

// Phase 4: Utils
phase('Utils');
const utilsFiles = await agent(`Generate the following utility files for the DEVA STORE app:
1. utils/theme.ts - Luxury dark mode theme with high contrast, gold/neon accents, and amoled blacks.
2. utils/constants.ts - Application constants (e.g., API endpoints, Supabase table names, etc.).
3. utils/helpers.ts - Helper functions (e.g., formatCurrency, formatDate, etc.).
4. utils/navigationHelper.ts - Navigation helper functions (if any).
5. utils/storageHelper.ts - Helper for async storage (if needed beyond redux-persist).

Return the files as an array of objects with { path, content }.`, {
  phase: 'Utils',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  }
});

addFiles(utilsFiles);

// Phase 5: I18n
phase('I18n');
const i18nFiles = await agent(`Generate the internationalization files for the DEVA STORE app:
1. i18n/en.json - English translations.
2. i18n/ar.json - Arabic translations.

Include translations for all screens: home, product details, payment, order timeline, favorites, cart, and admin screens.

Return the files as an array of objects with { path, content }.`, {
  phase: 'I18n',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  }
});

addFiles(i18nFiles);

// Phase 6: WriteFiles
phase('WriteFiles');
return allFiles;