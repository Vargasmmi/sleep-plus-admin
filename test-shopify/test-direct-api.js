const axios = require('axios');

// Configuración de Shopify
const SHOPIFY_DOMAIN = 'la-mattress.myshopify.com';
const ACCESS_TOKEN = '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';

async function testDirectAPI() {
  console.log('🔌 Testing direct Shopify API connection...\n');

  try {
    // Test 1: Shop info
    console.log('📍 Test 1: Getting shop info...');
    const shopResponse = await axios.get(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Shop:', shopResponse.data.shop.name);
    console.log('   Email:', shopResponse.data.shop.email);
    console.log('   Domain:', shopResponse.data.shop.domain);
    console.log('');

    // Test 2: Products
    console.log('📍 Test 2: Getting products...');
    const productsResponse = await axios.get(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json?limit=5`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Found ${productsResponse.data.products.length} products`);
    productsResponse.data.products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} - $${product.variants[0]?.price || 'N/A'}`);
    });
    console.log('');

    // Test 3: Customers
    console.log('📍 Test 3: Getting customers...');
    const customersResponse = await axios.get(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/customers.json?limit=5`,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Found ${customersResponse.data.customers.length} customers`);
    customersResponse.data.customers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.first_name} ${customer.last_name} - ${customer.email}`);
    });
    console.log('');

    console.log('🎉 All tests passed! Direct API connection works correctly.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('');
    console.error('Response status:', error.response?.status);
    console.error('Response headers:', error.response?.headers);
  }
}

// Run the test
console.log('====================================');
console.log('Shopify Direct API Test');
console.log('====================================');
console.log(`Domain: ${SHOPIFY_DOMAIN}`);
console.log(`Token: ${ACCESS_TOKEN.substring(0, 10)}...`);
console.log('====================================\n');

testDirectAPI();
