// Ejemplo de datos para probar la integración con Shopify

export const shopifyProductExample = {
  "id": "sp-example-001",
  "shopifyId": "7894561230",
  "title": "Colchón Premium Memory Foam Queen",
  "handle": "colchon-premium-memory-foam-queen",
  "description": "<p>Experimenta el máximo confort con nuestro colchón de memory foam de alta densidad.</p>",
  "vendor": "LA Mattress Store",
  "productType": "Colchones",
  "status": "active",
  "tags": ["memory-foam", "queen", "premium"],
  "images": [
    {
      "id": "img-001",
      "src": "https://placehold.co/600x400/87CEEB/ffffff?text=Colchón+Premium",
      "alt": "Colchón Premium Memory Foam Queen"
    }
  ],
  "variants": [
    {
      "id": "var-001",
      "title": "Queen Size",
      "price": "899.99",
      "compareAtPrice": "1299.99",
      "sku": "MF-QUEEN-001",
      "inventoryQuantity": 15
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-06-12T15:30:00Z",
  "publishedAt": "2024-01-15T10:00:00Z"
};

export const shopifyCustomerExample = {
  "id": "sc-example-001",
  "shopifyId": "5678901234",
  "email": "ejemplo@cliente.com",
  "firstName": "María",
  "lastName": "González",
  "phone": "+1 (555) 123-4567",
  "acceptsMarketing": true,
  "totalSpent": "2456.78",
  "ordersCount": 3,
  "state": "enabled",
  "tags": ["vip", "repeat-customer"],
  "note": "Cliente preferencial, siempre pide envío express",
  "verifiedEmail": true,
  "taxExempt": false,
  "currency": "USD",
  "createdAt": "2023-03-20T14:00:00Z",
  "updatedAt": "2024-06-10T09:15:00Z",
  "lastOrderId": "4567890123",
  "lastOrderName": "#1234",
  "addresses": [
    {
      "id": "addr-001",
      "address1": "123 Main Street",
      "address2": "Apt 4B",
      "city": "Los Angeles",
      "province": "CA",
      "country": "US",
      "zip": "90001",
      "phone": "+1 (555) 123-4567",
      "default": true
    }
  ]
};

export const shopifyCouponExample = {
  "id": "scp-example-001",
  "shopifyId": "9876543210",
  "priceRuleId": "1234567890",
  "title": "Descuento de Verano 2024",
  "code": "VERANO20",
  "status": "active",
  "discountType": "percentage",
  "value": "20",
  "appliesTo": "all_products",
  "minimumRequirement": {
    "type": "minimum_amount",
    "value": 100
  },
  "customerEligibility": "all",
  "usageLimit": 1000,
  "oncePerCustomer": true,
  "usageCount": 245,
  "startsAt": "2024-06-01T00:00:00Z",
  "endsAt": "2024-08-31T23:59:59Z",
  "createdAt": "2024-05-25T10:00:00Z",
  "updatedAt": "2024-06-12T14:00:00Z",
  "targetSelection": [],
  "targetType": "all"
};

// Función para agregar datos de ejemplo
export const addShopifyExampleData = async () => {
  try {
    // Agregar producto de ejemplo
    await fetch('http://localhost:3001/shopifyProducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopifyProductExample)
    });

    // Agregar cliente de ejemplo
    await fetch('http://localhost:3001/shopifyCustomers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopifyCustomerExample)
    });

    // Agregar cupón de ejemplo
    await fetch('http://localhost:3001/shopifyCoupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopifyCouponExample)
    });

    console.log('Datos de ejemplo agregados exitosamente');
  } catch (error) {
    console.error('Error al agregar datos de ejemplo:', error);
  }
};
