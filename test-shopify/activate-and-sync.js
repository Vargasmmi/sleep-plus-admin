const axios = require('axios');

// Configuración
const SERVER_URL = 'http://localhost:3001';

async function activateAndSync() {
  console.log('🚀 Activating Shopify integration and syncing data...\n');

  try {
    // Paso 1: Obtener configuración actual
    console.log('📍 Step 1: Getting current settings...');
    const currentSettings = await axios.get(`${SERVER_URL}/shopifySettings/shop-001`);
    console.log('✅ Current settings loaded');
    
    // Paso 2: Activar la integración
    console.log('\n📍 Step 2: Activating integration...');
    const updatedSettings = {
      ...currentSettings.data,
      isActive: true,
      lastSync: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await axios.put(`${SERVER_URL}/shopifySettings/shop-001`, updatedSettings);
    console.log('✅ Integration activated!');
    
    // Paso 3: Sincronizar productos
    console.log('\n📍 Step 3: Syncing products...');
    console.log('⏳ This might take a moment...');
    
    const productsResponse = await axios.post(`${SERVER_URL}/api/shopify/products`, {
      shopifyDomain: currentSettings.data.shopifyDomain,
      accessToken: currentSettings.data.accessToken
    });
    
    const products = productsResponse.data.products;
    console.log(`✅ Found ${products.length} products to sync`);
    
    // Guardar cada producto
    let savedCount = 0;
    for (const product of products.slice(0, 10)) { // Solo los primeros 10 para la demo
      try {
        const transformedProduct = {
          shopifyId: product.id.toString(),
          title: product.title,
          handle: product.handle,
          description: product.body_html || '',
          vendor: product.vendor || '',
          productType: product.product_type || '',
          status: product.status,
          tags: product.tags ? product.tags.split(', ') : [],
          images: product.images.map((img) => ({
            id: img.id.toString(),
            src: img.src,
            alt: img.alt || '',
          })),
          variants: product.variants.map((variant) => ({
            id: variant.id.toString(),
            title: variant.title,
            price: variant.price,
            compareAtPrice: variant.compare_at_price,
            sku: variant.sku || '',
            inventoryQuantity: variant.inventory_quantity || 0,
          })),
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          publishedAt: product.published_at,
        };
        
        // Verificar si existe
        const existing = await axios.get(`${SERVER_URL}/shopifyProducts?shopifyId=${product.id}`);
        
        if (existing.data.length > 0) {
          // Actualizar
          await axios.put(`${SERVER_URL}/shopifyProducts/${existing.data[0].id}`, transformedProduct);
        } else {
          // Crear nuevo
          await axios.post(`${SERVER_URL}/shopifyProducts`, {
            ...transformedProduct,
            id: `sp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          });
        }
        
        savedCount++;
        process.stdout.write(`\r   Saved: ${savedCount}/${10} products`);
      } catch (error) {
        console.error(`\n   ❌ Error saving product ${product.title}:`, error.message);
      }
    }
    
    console.log(`\n✅ Synced ${savedCount} products successfully!`);
    
    // Paso 4: Sincronizar algunos clientes
    console.log('\n📍 Step 4: Syncing customers...');
    
    const customersResponse = await axios.post(`${SERVER_URL}/api/shopify/customers`, {
      shopifyDomain: currentSettings.data.shopifyDomain,
      accessToken: currentSettings.data.accessToken
    });
    
    const customers = customersResponse.data.customers;
    console.log(`✅ Found ${customers.length} customers to sync`);
    
    // Guardar algunos clientes
    let customersSaved = 0;
    for (const customer of customers.slice(0, 5)) { // Solo los primeros 5 para la demo
      try {
        const transformedCustomer = {
          shopifyId: customer.id.toString(),
          email: customer.email || '',
          firstName: customer.first_name || '',
          lastName: customer.last_name || '',
          phone: customer.phone || '',
          acceptsMarketing: customer.accepts_marketing || false,
          totalSpent: customer.total_spent || '0',
          ordersCount: customer.orders_count || 0,
          state: customer.state || 'enabled',
          tags: customer.tags ? customer.tags.split(', ') : [],
          note: customer.note || '',
          verifiedEmail: customer.verified_email || false,
          taxExempt: customer.tax_exempt || false,
          currency: customer.currency || 'USD',
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
          lastOrderId: customer.last_order_id?.toString() || null,
          lastOrderName: customer.last_order_name || null,
          addresses: customer.addresses?.map((addr) => ({
            id: addr.id.toString(),
            address1: addr.address1 || '',
            address2: addr.address2 || '',
            city: addr.city || '',
            province: addr.province || '',
            country: addr.country || '',
            zip: addr.zip || '',
            phone: addr.phone || '',
            default: addr.default || false,
          })) || [],
        };
        
        // Verificar si existe
        const existing = await axios.get(`${SERVER_URL}/shopifyCustomers?shopifyId=${customer.id}`);
        
        if (existing.data.length > 0) {
          await axios.put(`${SERVER_URL}/shopifyCustomers/${existing.data[0].id}`, transformedCustomer);
        } else {
          await axios.post(`${SERVER_URL}/shopifyCustomers`, {
            ...transformedCustomer,
            id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          });
        }
        
        customersSaved++;
        process.stdout.write(`\r   Saved: ${customersSaved}/${5} customers`);
      } catch (error) {
        console.error(`\n   ❌ Error saving customer:`, error.message);
      }
    }
    
    console.log(`\n✅ Synced ${customersSaved} customers successfully!`);
    
    // Resumen final
    console.log('\n====================================');
    console.log('🎉 Synchronization Complete!');
    console.log('====================================');
    console.log(`✅ Integration activated`);
    console.log(`✅ ${savedCount} products synced`);
    console.log(`✅ ${customersSaved} customers synced`);
    console.log('\nYou can now:');
    console.log('1. Go to the app and check "Shopify Store > Products"');
    console.log('2. Check "Shopify Store > Customers"');
    console.log('3. Use "Sync All Now" button to sync all data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run activation and sync
console.log('====================================');
console.log('Shopify Integration Activation');
console.log('====================================\n');

activateAndSync();
