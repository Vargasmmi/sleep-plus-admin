const axios = require('axios');

// Configuración
const SERVER_URL = 'http://localhost:3001';
const SHOPIFY_DOMAIN = 'la-mattress.myshopify.com';
const ACCESS_TOKEN = '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';

async function testProxyEndpoints() {
  console.log('🔌 Testing Server Proxy Endpoints...\n');

  try {
    // Test 1: Test Connection
    console.log('📍 Test 1: Testing connection through proxy...');
    const testResponse = await axios.post(`${SERVER_URL}/api/shopify/test-connection`, {
      shopifyDomain: SHOPIFY_DOMAIN,
      accessToken: ACCESS_TOKEN
    });
    
    console.log('✅ Connection test result:');
    console.log('   Success:', testResponse.data.success);
    console.log('   Message:', testResponse.data.message);
    if (testResponse.data.shop) {
      console.log('   Shop:', testResponse.data.shop.name);
    }
    console.log('');

    // Test 2: Get Products
    console.log('📍 Test 2: Getting products through proxy...');
    const productsResponse = await axios.post(`${SERVER_URL}/api/shopify/products`, {
      shopifyDomain: SHOPIFY_DOMAIN,
      accessToken: ACCESS_TOKEN
    });
    
    console.log(`✅ Found ${productsResponse.data.products.length} products`);
    productsResponse.data.products.slice(0, 3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title}`);
    });
    console.log('');

    // Test 3: Get Customers
    console.log('📍 Test 3: Getting customers through proxy...');
    const customersResponse = await axios.post(`${SERVER_URL}/api/shopify/customers`, {
      shopifyDomain: SHOPIFY_DOMAIN,
      accessToken: ACCESS_TOKEN
    });
    
    console.log(`✅ Found ${customersResponse.data.customers.length} customers`);
    customersResponse.data.customers.slice(0, 3).forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.first_name} ${customer.last_name}`);
    });
    console.log('');

    console.log('🎉 All proxy tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test settings endpoint
async function testSettingsEndpoint() {
  console.log('\n📍 Test 4: Testing settings endpoint...');
  
  try {
    const response = await axios.get(`${SERVER_URL}/shopifySettings/shop-001`);
    console.log('✅ Current settings:');
    console.log('   Store:', response.data.storeName);
    console.log('   Domain:', response.data.shopifyDomain);
    console.log('   Active:', response.data.isActive);
  } catch (error) {
    console.error('❌ Error getting settings:', error.message);
  }
}

// Run tests
console.log('====================================');
console.log('Shopify Proxy Server Test');
console.log('====================================');
console.log(`Server: ${SERVER_URL}`);
console.log(`Shopify Domain: ${SHOPIFY_DOMAIN}`);
console.log('====================================\n');

async function runAllTests() {
  await testProxyEndpoints();
  await testSettingsEndpoint();
}

runAllTests();
