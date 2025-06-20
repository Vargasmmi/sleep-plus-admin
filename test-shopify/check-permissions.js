const axios = require('axios');

// Configuración
const SHOPIFY_DOMAIN = 'la-mattress.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE';

async function checkPermissions() {
  console.log('🔍 Checking Shopify API Permissions...\n');

  const endpoints = [
    { name: 'Shop Info', url: '/admin/api/2024-01/shop.json' },
    { name: 'Products', url: '/admin/api/2024-01/products.json?limit=1' },
    { name: 'Customers', url: '/admin/api/2024-01/customers.json?limit=1' },
    { name: 'Orders', url: '/admin/api/2024-01/orders.json?limit=1' },
    { name: 'Price Rules', url: '/admin/api/2024-01/price_rules.json?limit=1' },
    { name: 'Discounts', url: '/admin/api/2024-01/discounts.json?limit=1' },
    { name: 'Marketing Events', url: '/admin/api/2024-01/marketing_events.json?limit=1' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(
        `https://${SHOPIFY_DOMAIN}${endpoint.url}`,
        {
          headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
          validateStatus: () => true, // No lanzar error por status HTTP
        }
      );

      if (response.status === 200) {
        console.log(`✅ ${endpoint.name}: ACCESIBLE`);
      } else if (response.status === 403) {
        console.log(`❌ ${endpoint.name}: SIN PERMISOS (403 Forbidden)`);
      } else if (response.status === 404) {
        console.log(`⚠️  ${endpoint.name}: NO ENCONTRADO (404) - Puede que el endpoint no exista`);
      } else {
        console.log(`❓ ${endpoint.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 ${endpoint.name}: ERROR - ${error.message}`);
    }
  }

  console.log('\n📋 Resumen:');
  console.log('Si ves errores 403, necesitas agregar esos permisos a tu App Privada en Shopify.');
  console.log('\nPara agregar permisos:');
  console.log('1. Ve a tu Admin de Shopify');
  console.log('2. Settings > Apps and sales channels > Develop apps');
  console.log('3. Selecciona tu app');
  console.log('4. En "Configuration", haz clic en "Configure"');
  console.log('5. En "Admin API access scopes", busca y activa:');
  console.log('   - read_discounts');
  console.log('   - write_discounts (si quieres crear/editar)');
  console.log('   - read_price_rules');
  console.log('   - write_price_rules (si quieres crear/editar)');
  console.log('6. Guarda los cambios');
  console.log('7. Es posible que necesites generar un nuevo Access Token');
}

// Run check
console.log('====================================');
console.log('Shopify API Permissions Check');
console.log('====================================');
console.log(`Domain: ${SHOPIFY_DOMAIN}`);
console.log(`Token: ${ACCESS_TOKEN.substring(0, 10)}...`);
console.log('====================================\n');

checkPermissions();
