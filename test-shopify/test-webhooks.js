const axios = require('axios');

// Configuración
const SERVER_URL = 'http://localhost:3001';

// Webhook de ejemplo para orden creada
const orderWebhook = {
  id: 820982911946154500,
  email: "jon@doe.ca",
  closed_at: null,
  created_at: "2024-06-12T10:30:00-04:00",
  updated_at: "2024-06-12T10:30:00-04:00",
  number: 234,
  note: null,
  token: "123456abcd",
  gateway: "manual",
  test: true,
  total_price: "403.00",
  subtotal_price: "393.00",
  total_weight: 0,
  total_tax: "10.00",
  taxes_included: false,
  currency: "USD",
  financial_status: "pending",
  confirmed: true,
  total_discounts: "5.00",
  total_line_items_price: "398.00",
  cart_token: "68778783ad298f1c80c3bafcddeea02f",
  buyer_accepts_marketing: false,
  name: "#9999",
  referring_site: "http://www.example.com",
  landing_site: "http://www.example.com?source=abc",
  cancelled_at: null,
  cancel_reason: "customer",
  total_price_usd: null,
  checkout_token: "6dfd9a25c0f34a8c3a0f82a23c4b7d8e",
  reference: "fhwdgads",
  user_id: null,
  location_id: null,
  source_identifier: "fhwdgads",
  source_url: null,
  processed_at: null,
  device_id: null,
  phone: null,
  customer: {
    id: 8391737409789,
    email: "jon@doe.ca",
    first_name: "Jon",
    last_name: "Doe",
    state: "disabled",
    note: null,
    verified_email: true,
    multipass_identifier: null,
    tax_exempt: false,
    phone: "+16136120707",
    email_marketing_consent: {
      state: "not_subscribed",
      opt_in_level: null,
      consent_updated_at: null
    },
    sms_marketing_consent: {
      state: "not_subscribed",
      opt_in_level: "single_opt_in",
      consent_updated_at: null,
      consent_collected_from: "OTHER"
    },
    tags: "",
    currency: "USD",
    created_at: "2024-06-12T10:30:00-04:00",
    updated_at: "2024-06-12T10:30:00-04:00",
  },
  line_items: [
    {
      id: 866550311766439020,
      variant_id: 46158532018429,
      title: "Premium Mattress - Queen",
      quantity: 1,
      sku: "IPOD2008PINK",
      variant_title: "Queen",
      vendor: null,
      fulfillment_service: "manual",
      product_id: 8852408271101,
      requires_shipping: true,
      taxable: true,
      gift_card: false,
      name: "Premium Mattress - Queen",
      variant_inventory_management: "shopify",
      properties: [],
      product_exists: true,
      fulfillable_quantity: 1,
      grams: 5670,
      price: "398.00",
      total_discount: "5.00",
      fulfillment_status: null,
      price_set: {
        shop_money: {
          amount: "398.00",
          currency_code: "USD"
        },
        presentment_money: {
          amount: "398.00",
          currency_code: "USD"
        }
      },
      total_discount_set: {
        shop_money: {
          amount: "5.00",
          currency_code: "USD"
        },
        presentment_money: {
          amount: "5.00",
          currency_code: "USD"
        }
      },
      discount_allocations: [
        {
          amount: "5.00",
          discount_application_index: 0,
          amount_set: {
            shop_money: {
              amount: "5.00",
              currency_code: "USD"
            },
            presentment_money: {
              amount: "5.00",
              currency_code: "USD"
            }
          }
        }
      ],
      tax_lines: []
    }
  ],
  shipping_lines: [
    {
      id: 271878346596884000,
      title: "Generic Shipping",
      price: "10.00",
      code: "STANDARD",
      source: "shopify",
      phone: null,
      requested_fulfillment_service_id: null,
      delivery_category: null,
      carrier_identifier: null,
      discounted_price: "10.00",
      price_set: {
        shop_money: {
          amount: "10.00",
          currency_code: "USD"
        },
        presentment_money: {
          amount: "10.00",
          currency_code: "USD"
        }
      },
      discounted_price_set: {
        shop_money: {
          amount: "10.00",
          currency_code: "USD"
        },
        presentment_money: {
          amount: "10.00",
          currency_code: "USD"
        }
      },
      discount_allocations: [],
      tax_lines: []
    }
  ],
  billing_address: {
    first_name: "Bob",
    address1: "123 Billing Street",
    phone: "555-555-BILL",
    city: "Billtown",
    zip: "K2P0B0",
    province: "Kentucky",
    country: "United States",
    last_name: "Biller",
    address2: null,
    company: "My Company",
    latitude: null,
    longitude: null,
    name: "Bob Biller",
    country_code: "US",
    province_code: "KY"
  },
  shipping_address: {
    first_name: "Steve",
    address1: "123 Shipping Street",
    phone: "555-555-SHIP",
    city: "Shippington",
    zip: "K2P0S0",
    province: "Kentucky",
    country: "United States",
    last_name: "Shipper",
    address2: null,
    company: "Shipping Company",
    latitude: null,
    longitude: null,
    name: "Steve Shipper",
    country_code: "US",
    province_code: "KY"
  }
};

// Webhook de ejemplo para cliente creado
const customerWebhook = {
  id: 8391737409790,
  email: "new.customer@example.com",
  accepts_marketing: false,
  created_at: "2024-06-12T14:45:00-04:00",
  updated_at: "2024-06-12T14:45:00-04:00",
  first_name: "New",
  last_name: "Customer",
  orders_count: 0,
  state: "enabled",
  total_spent: "0.00",
  last_order_id: null,
  note: "New customer from web form",
  verified_email: true,
  multipass_identifier: null,
  tax_exempt: false,
  tags: "newsletter, prospect",
  last_order_name: null,
  currency: "USD",
  phone: "+15142546011",
  addresses: [
    {
      id: 9911106732286,
      customer_id: 8391737409790,
      first_name: "New",
      last_name: "Customer",
      company: null,
      address1: "456 Example St",
      address2: null,
      city: "Los Angeles",
      province: "California",
      country: "United States",
      zip: "90001",
      phone: "+15142546011",
      name: "New Customer",
      province_code: "CA",
      country_code: "US",
      country_name: "United States",
      default: true
    }
  ],
  tax_exemptions: [],
  email_marketing_consent: {
    state: "not_subscribed",
    opt_in_level: null,
    consent_updated_at: null
  },
  sms_marketing_consent: {
    state: "not_subscribed",
    opt_in_level: "single_opt_in",
    consent_updated_at: null,
    consent_collected_from: "OTHER"
  },
  admin_graphql_api_id: "gid://shopify/Customer/8391737409790"
};

// Webhook de ejemplo para cupón creado
const discountWebhook = {
  id: 1234567890,
  price_rule_id: 987654321,
  code: "SUMMER2024TEST",
  usage_count: 0,
  created_at: "2024-06-12T15:00:00-04:00",
  updated_at: "2024-06-12T15:00:00-04:00"
};

async function sendWebhook(event, payload) {
  const url = `${SERVER_URL}/api/webhooks/shopify/${event}`;
  
  console.log(`\n📤 Sending webhook: ${event}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': event,
        'X-Shopify-Shop-Domain': 'la-mattress.myshopify.com',
        'X-Shopify-Webhook-Id': `webhook-test-${Date.now()}`,
        'X-Shopify-Hmac-SHA256': 'test-signature-12345'
      }
    });
    
    console.log('✅ Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('====================================');
  console.log('Webhook Test Script');
  console.log('====================================');
  console.log(`Server: ${SERVER_URL}`);
  console.log('====================================');
  
  // Test 1: Order Created
  await sendWebhook('orders/create', orderWebhook);
  
  // Wait a bit between webhooks
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Customer Created
  await sendWebhook('customers/create', customerWebhook);
  
  // Wait a bit between webhooks
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Discount Created
  await sendWebhook('discounts/create', discountWebhook);
  
  console.log('\n🎉 All webhooks sent!');
  console.log('Check your webhook list in the admin panel to see them.');
}

runTests();
