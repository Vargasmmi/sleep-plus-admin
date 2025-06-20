import axios from 'axios';

/**
 * Agrega datos de ejemplo de cupones para probar la funcionalidad
 */
export async function addShopifyExampleCoupons(): Promise<void> {
  const backendUrl = '';
  
  const exampleCoupons = [
    {
      id: "scp-example-001",
      shopifyId: "123456789",
      priceRuleId: "987654321",
      title: "Descuento de Verano 2024",
      code: "SUMMER2024",
      status: "active",
      discountType: "percentage",
      value: "20",
      appliesTo: "all_products",
      minimumRequirement: {
        type: "minimum_amount",
        value: 100
      },
      customerEligibility: "all",
      usageLimit: 100,
      oncePerCustomer: true,
      usageCount: 23,
      startsAt: "2024-06-01T00:00:00Z",
      endsAt: "2024-08-31T23:59:59Z",
      createdAt: "2024-05-15T10:00:00Z",
      updatedAt: "2024-06-11T15:30:00Z",
      targetSelection: [],
      targetType: "line_item"
    },
    {
      id: "scp-example-002",
      shopifyId: "223456789",
      priceRuleId: "887654321",
      title: "Envío Gratis",
      code: "FREESHIP",
      status: "active",
      discountType: "free_shipping",
      value: "0",
      appliesTo: "all_products",
      minimumRequirement: {
        type: "minimum_amount",
        value: 50
      },
      customerEligibility: "all",
      usageLimit: null,
      oncePerCustomer: false,
      usageCount: 156,
      startsAt: "2024-01-01T00:00:00Z",
      endsAt: null,
      createdAt: "2023-12-15T09:00:00Z",
      updatedAt: "2024-06-10T12:00:00Z",
      targetSelection: [],
      targetType: "shipping_line"
    },
    {
      id: "scp-example-003",
      shopifyId: "323456789",
      priceRuleId: "787654321",
      title: "Cliente VIP - $50 OFF",
      code: "VIP50OFF",
      status: "active",
      discountType: "fixed_amount",
      value: "50",
      appliesTo: "specific_collections",
      minimumRequirement: {
        type: "minimum_amount",
        value: 200
      },
      customerEligibility: "specific_customers",
      usageLimit: 50,
      oncePerCustomer: true,
      usageCount: 45,
      startsAt: "2024-05-01T00:00:00Z",
      endsAt: "2024-07-31T23:59:59Z",
      createdAt: "2024-04-20T14:00:00Z",
      updatedAt: "2024-06-11T09:00:00Z",
      targetSelection: ["Colchones Premium", "Colchones King Size"],
      targetType: "line_item"
    },
    {
      id: "scp-example-004",
      shopifyId: "423456789",
      priceRuleId: "687654321",
      title: "Nuevo Cliente - 15% OFF",
      code: "WELCOME15",
      status: "active",
      discountType: "percentage",
      value: "15",
      appliesTo: "all_products",
      minimumRequirement: {
        type: "none",
        value: 0
      },
      customerEligibility: "all",
      usageLimit: 500,
      oncePerCustomer: true,
      usageCount: 234,
      startsAt: "2024-01-01T00:00:00Z",
      endsAt: "2024-12-31T23:59:59Z",
      createdAt: "2023-12-20T10:00:00Z",
      updatedAt: "2024-06-11T16:00:00Z",
      targetSelection: [],
      targetType: "line_item"
    },
    {
      id: "scp-example-005",
      shopifyId: "523456789",
      priceRuleId: "587654321",
      title: "Flash Sale - 30% OFF",
      code: "FLASH30",
      status: "expired",
      discountType: "percentage",
      value: "30",
      appliesTo: "specific_products",
      minimumRequirement: {
        type: "minimum_quantity",
        value: 2
      },
      customerEligibility: "all",
      usageLimit: 100,
      oncePerCustomer: false,
      usageCount: 100,
      startsAt: "2024-05-25T00:00:00Z",
      endsAt: "2024-05-31T23:59:59Z",
      createdAt: "2024-05-20T08:00:00Z",
      updatedAt: "2024-06-01T00:00:00Z",
      targetSelection: ["Tempur-Pedic ProAdapt", "Sealy Posturepedic"],
      targetType: "line_item"
    }
  ];

  console.log('Adding example Shopify coupons...');
  
  for (const coupon of exampleCoupons) {
    try {
      // Verificar si ya existe
      const existing = await axios.get(`${backendUrl}/shopifyCoupons?id=${coupon.id}`);
      
      if (existing.data.length === 0) {
        // Crear nuevo
        await axios.post(`${backendUrl}/shopifyCoupons`, coupon);
        console.log(`✅ Added coupon: ${coupon.code}`);
      } else {
        console.log(`⏭️ Coupon already exists: ${coupon.code}`);
      }
    } catch (error) {
      console.error(`❌ Error adding coupon ${coupon.code}:`, error);
    }
  }
  
  console.log('Example coupons added successfully!');
}

// También agregar esta función al archivo de datos de ejemplo existente
export async function addAllShopifyExampleData(): Promise<void> {
  // ... código existente para productos y clientes ...
  
  // Agregar cupones
  await addShopifyExampleCoupons();
}