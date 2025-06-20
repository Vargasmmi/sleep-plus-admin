const axios = require('axios');

// Configuración
const SERVER_URL = 'http://localhost:3001';
const SHOPIFY_DOMAIN = 'la-mattress.myshopify.com';
const ACCESS_TOKEN = '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';

async function testDiscounts() {
  console.log('🎟️ Testing Shopify Discounts/Coupons...\n');

  try {
    // Test 1: Get Price Rules
    console.log('📍 Test 1: Getting price rules...');
    try {
      const priceRulesResponse = await axios.post(`${SERVER_URL}/api/shopify/price-rules`, {
        shopifyDomain: SHOPIFY_DOMAIN,
        accessToken: ACCESS_TOKEN
      });
      
      const priceRules = priceRulesResponse.data.price_rules || [];
      console.log(`✅ Found ${priceRules.length} price rules`);
      
      if (priceRules.length > 0) {
        priceRules.slice(0, 3).forEach((rule, index) => {
          console.log(`   ${index + 1}. ${rule.title} - ${rule.value_type} ${rule.value}`);
        });
        
        // Test 2: Get Discount Codes for first price rule
        if (priceRules[0]) {
          console.log(`\n📍 Test 2: Getting discount codes for rule "${priceRules[0].title}"...`);
          try {
            const codesResponse = await axios.post(
              `${SERVER_URL}/api/shopify/discount-codes/${priceRules[0].id}`,
              {
                shopifyDomain: SHOPIFY_DOMAIN,
                accessToken: ACCESS_TOKEN
              }
            );
            
            const codes = codesResponse.data.discount_codes || [];
            console.log(`✅ Found ${codes.length} discount codes`);
            codes.slice(0, 3).forEach((code, index) => {
              console.log(`   ${index + 1}. ${code.code} - Used ${code.usage_count} times`);
            });
          } catch (error) {
            console.error('❌ Error getting discount codes:', error.response?.data || error.message);
          }
        }
      } else {
        console.log('⚠️ No price rules found. You may need to create discounts in Shopify first.');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Discount API not accessible. This could mean:');
        console.log('   - Your app doesn\'t have permission to read discounts');
        console.log('   - The API endpoint has changed');
        console.log('   - There are no discounts in your store');
      } else {
        console.error('❌ Error getting price rules:', error.response?.data || error.message);
      }
    }

    // Test 3: Direct API test (alternative method)
    console.log('\n📍 Test 3: Testing direct discount API...');
    try {
      const directResponse = await axios.get(
        `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/discounts.json`,
        {
          headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const discounts = directResponse.data.discounts || [];
      console.log(`✅ Found ${discounts.length} discounts via direct API`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ Discounts endpoint not available - using price_rules API is correct');
      } else {
        console.log('ℹ️ Direct discount API not accessible:', error.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

// Run tests
console.log('====================================');
console.log('Shopify Discounts Test');
console.log('====================================');
console.log(`Server: ${SERVER_URL}`);
console.log(`Domain: ${SHOPIFY_DOMAIN}`);
console.log('====================================\n');

testDiscounts();
