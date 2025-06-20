const axios = require('axios');

// Configuración
const SERVER_URL = 'http://localhost:3001';
const SHOPIFY_DOMAIN = 'la-mattress.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE';

async function updateShopifySettings() {
  console.log('🔧 Updating Shopify settings in database...\n');

  try {
    // Datos actualizados
    const updatedSettings = {
      id: "shop-001",
      storeName: "LA Mattress Store",
      shopifyDomain: SHOPIFY_DOMAIN,
      apiKey: "9e4750922a98ea71d540b5212121a130",
      apiSecretKey: "0616e3d4d89e2ea1c3464636c024e6b8",
      accessToken: ACCESS_TOKEN,
      webhookApiVersion: "2024-01",
      isActive: true,
      lastSync: null,
      syncSettings: {
        autoSyncProducts: true,
        autoSyncCustomers: true,
        autoSyncOrders: true,
        syncInterval: 30
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Actualizar settings
    const response = await axios.put(
      `${SERVER_URL}/shopifySettings/shop-001`,
      updatedSettings
    );

    console.log('✅ Settings updated successfully!');
    console.log('   Store:', response.data.storeName);
    console.log('   Domain:', response.data.shopifyDomain);
    console.log('   Token:', response.data.accessToken.substring(0, 10) + '...');
    console.log('   Active:', response.data.isActive);

  } catch (error) {
    console.error('❌ Error updating settings:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run update
console.log('====================================');
console.log('Update Shopify Settings');
console.log('====================================\n');

updateShopifySettings();
