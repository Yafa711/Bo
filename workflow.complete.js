export const meta = {
  name: 'complete-devastore-app',
  description: 'Complete the DEVA STORE React Native Expo app with all missing components and services',
  phases: [
    { title: 'Services', detail: 'Create profiles service and update existing services to match exact schema' },
    { title: 'AdminScreens', detail: 'Create missing admin screens: ShippingCouponManager, PaymentAudit, WhatsAppWebhook' },
    { title: 'WriteFiles', detail: 'Write all generated files to disk' }
  ]
};

var allFiles = [];

function addFiles(files) {
  allFiles = allFiles.concat(files);
}

// Phase 1: Services
phase('Services');
var servicesFiles = await agent('Generate the following service files for the DEVA STORE app with EXACT schema matching the requirements:\n\n1. services/profilesService.ts - For the profiles table: (id, role, name, phone)\n2. services/citiesService.ts - UPDATE to match exact schema: (id, name, fee) - current version missing fee field\n3. services/couponsService.ts - UPDATE to match exact schema: (id, code, discount_percent, active) - current version has different fields\n4. services/searchAnalyticsService.ts - UPDATE to match exact schema: (id, query, count) - current version has different fields\n\nFor each service, include:\n- Proper TypeScript interfaces matching the EXACT schema from requirements\n- CRUD operations where appropriate\n- Proper error handling\n- Use the existing supabaseFetch helper pattern\n- Export all functions\n\nUse TypeScript and follow the existing patterns in the services directory.\n\nReturn the files as an array of objects with { path, content }.', {
  phase: 'Services',
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

addFiles(servicesFiles);

// Phase 2: Admin Screens
phase('AdminScreens');
var adminScreensFiles = await agent('Generate the following missing admin screens for the DEVA STORE app:\n\n1. screens/admin/AdminShippingCouponManagerScreen.tsx - Dynamic shipping & coupons manager\n2. screens/admin/AdminPaymentAuditScreen.tsx - Anti-fraud split-screen payment audit ("Mark as Paid")\n3. screens/admin/AdminWhatsAppWebhookScreen.tsx - Screen to configure or view WhatsApp trigger webhook (for +967782282586)\n\nEach screen should:\n- Use TypeScript\n- Follow the luxury dark mode theme (consistent with existing admin screens)\n- Implement real-time updates where applicable using Supabase subscriptions\n- Include proper loading states and error handling\n- For ShippingCouponManager: Allow managing cities (with fee) and coupons\n- For PaymentAudit: Show orders with transfer screenshots, allow marking as paid\n- For WhatsAppWebhook: Display webhook status and allow testing/configuration\n\nReturn the files as an array of objects with { path, content }.', {
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

// Phase 3: WriteFiles
phase('WriteFiles');
return allFiles;