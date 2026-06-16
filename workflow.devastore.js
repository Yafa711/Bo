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

// We'll have each phase return an array of file objects: { path: string, content: string }
// The final phase will collect all files and return them for writing.

let allFiles = [];

// Helper function to add files to the collection
function addFiles(files) {
  allFiles = [...allFiles, ...files];
}

// Phase 1: Setup
phase('Setup');
const setupFiles = await agent('Generate the following files for the DEVA STORE app:\n\
1. App.tsx - the root component that sets up SupabaseProvider, Navigation, and I18next.\n\
2. navigation/AppNavigator.tsx - the main navigation stack using react-navigation.\n\
3. services/supabase.ts - Supabase client initialization and helper functions.\n\
4. services/auth.ts - Authentication functions (login, logout, get current user).\n\
5. services/productService.ts - CRUD operations for products.\n\
6. services/orderService.ts - CRUD operations for orders.\n\
7. services/cityService.ts - CRUD operations for cities.\n\
8. services/couponService.ts - CRUD operations for coupons.\n\
9. services/searchAnalyticsService.ts - Operations for search analytics.\n\
\n\
Use TypeScript and follow the latest Expo and React Native best practices.\n\
Make sure to include proper error handling and loading states.\n\
\n\
Return the files as an array of objects with { path, content }.',
{ phase: 'Setup', schema: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  }
}});

// Add the generated files to our collection
addFiles(setupFiles);

// Phase 2: Client Screens
phase('ClientScreens');
const clientScreensFiles = await agent('Generate the following client screens for the DEVA STORE app:\n\
1. screens/HomeScreen.tsx - Luxury home screen with animated sliders (using react-native-reanimated/moti) and staggered grids for products.\n\
2. screens/ProductDetailsScreen.tsx - Product details screen with zoom gallery (using react-native-gesture-handler and reanimated), dynamic views & live stock counter.\n\
3. screens/PaymentScreen.tsx - Payment screen showing Yemeni bank transfer details and a document/file picker for uploading transfer screenshot.\n\
4. screens/OrderTimelineScreen.tsx - Animated order timeline showing steps from processing to delivery.\n\
5. screens/FavoritesScreen.tsx - Screen showing user's favorite products with sync to Supabase.\n\
6. screens/CartScreen.tsx - Shopping cart screen (if needed, but we can combine with home or have separate).\n\
\n\
Use TypeScript, react-native-reanimated, moti for animations, and follow the luxury dark mode theme with gold/neon accents.\n\
Implement run-time bilingual toggle for English (LTR) and Arabic (RTL) using I18nManager.\n\
\n\
Return the files as an array of objects with { path, content }.',
{ phase: 'ClientScreens', schema: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  }
}});

addFiles(clientScreensFiles);

// Phase 3: Admin Screens
phase('AdminScreens');
const adminScreensFiles = await agent('Generate the following admin screens for the DEVA STORE app (hardcoded super admin: abnbwh@gmail.com / Abod#7822):\n\
1. screens/admin/AdminLoginScreen.tsx - Login screen for admin.\n\
2. screens/admin/AdminDashboardScreen.tsx - Live analytics & top searches dashboard.\n\
3. screens/admin/AdminProductCRUDScreen.tsx - Full product CRUD (create, read, update, delete).\n\
4. screens/admin/AdminShippingCouponManagerScreen.tsx - Dynamic shipping & coupons manager.\n\
5. screens/admin/AdminPaymentAuditScreen.tsx - Anti-fraud split-screen payment audit ("Mark as Paid").\n\
6. screens/admin/AdminWhatsAppWebhookScreen.tsx - Screen to configure or view WhatsApp trigger webhook (for +967782282586).\n\
\n\
Use TypeScript and follow the same luxury dark theme.\n\
Implement real-time updates where applicable.\n\
\n\
Return the files as an array of objects with { path, content }.',
{ phase: 'AdminScreens', schema: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  }
}});

addFiles(adminScreensFiles);

// Phase 4: Utils
phase('Utils');
const utilsFiles = await agent('Generate the following utility files for the DEVA STORE app:\n\
1. utils/theme.ts - Luxury dark mode theme with high contrast, gold/neon accents, and amoled blacks.\n\
2. utils/constants.ts - Application constants (e.g., API endpoints, Supabase table names, etc.).\n\
3. utils/helpers.ts - Helper functions (e.g., formatCurrency, formatDate, etc.).\n\
4. utils/navigationHelper.ts - Navigation helper functions (if any).\n\
5. utils/storageHelper.ts - Helper for async storage (if needed beyond redux-persist).\n\
\n\
Return the files as an array of objects with { path, content }.',
{ phase: 'Utils', schema: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  }
}});

addFiles(utilsFiles);

// Phase 5: I18n
phase('I18n');
const i18nFiles = await agent('Generate the internationalization files for the DEVA STORE app:\n\
1. i18n/en.json - English translations.\n\
2. i18n/ar.json - Arabic translations.\n\
\n\
Include translations for all screens: home, product details, payment, order timeline, favorites, cart, and admin screens.\n\
\n\
Return the files as an array of objects with { path, content }.',
{ phase: 'I18n', schema: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  }
}});

addFiles(i18nFiles);

// Phase 6: WriteFiles - This phase doesn't generate new files but returns the collected files for writing.
// We'll return the allFiles array so that the workflow result contains the files to write.
phase('WriteFiles');
return allFiles;