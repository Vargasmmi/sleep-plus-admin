const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jsonServer = require('json-server');
const path = require('path');
const stripe = require('stripe');
const fs = require('fs').promises;
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://finanzas-app-f3nu2rkz.devinapps.com',
    /\.devinapps\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Access-Token', 'X-Requested-With']
}));
// Aumentar límite para manejar imágenes en base64 (aunque ya no las enviamos)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware mejorado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path.startsWith('/api/shopify')) {
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'express-shopify-proxy',
    timestamp: new Date().toISOString()
  });
});

// ======================
// SHOPIFY PROXY ENDPOINTS
// ======================

// Test connection
app.post('/api/shopify/test-connection', async (req, res) => {
  console.log('🔌 Testing Shopify connection...');
  
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    if (!shopifyDomain || !accessToken) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Dominio y Access Token son requeridos' 
      });
    }

    console.log(`📡 Connecting to: ${shopifyDomain}`);
    console.log(`🔑 Token: ${accessToken.substring(0, 10)}...`);
    
    // Construir URL completa
    const shopUrl = `https://${shopifyDomain}/admin/api/2024-01/shop.json`;
    console.log(`📍 URL: ${shopUrl}`);
    
    // Hacer petición a Shopify
    const response = await axios.get(shopUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos timeout
    });

    console.log('✅ Connection successful!');
    console.log('Shop data:', JSON.stringify(response.data.shop, null, 2));
    
    res.json({
      success: true,
      message: `Conectado exitosamente a ${response.data.shop.name}`,
      shop: response.data.shop,
    });
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.status === 401) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas. Verifique su Access Token',
          error: error.response.data
        });
      } else if (error.response.status === 404) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada. Verifique el dominio',
          error: error.response.data
        });
      } else {
        res.status(error.response.status).json({
          success: false,
          message: error.response.data?.errors || error.message || 'Error al conectar con Shopify',
          error: error.response.data
        });
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      res.status(500).json({
        success: false,
        message: 'No se pudo conectar con Shopify. Verifique su conexión a Internet.',
        error: error.message
      });
    } else {
      console.error('Error setting up request:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error al configurar la petición',
        error: error.message
      });
    }
  }
});

// Get products
app.post('/api/shopify/products', async (req, res) => {
  console.log('📦 Fetching Shopify products...');
  
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    if (!shopifyDomain || !accessToken) {
      return res.status(400).json({ 
        error: 'Dominio y Access Token son requeridos' 
      });
    }
    
    const url = `https://${shopifyDomain}/admin/api/2024-01/products.json?limit=250`;
    console.log(`📍 URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ Fetched ${response.data.products.length} products`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener productos',
    });
  }
});

// Get customers
app.post('/api/shopify/customers', async (req, res) => {
  console.log('👥 Fetching Shopify customers...');
  
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    if (!shopifyDomain || !accessToken) {
      return res.status(400).json({ 
        error: 'Dominio y Access Token son requeridos' 
      });
    }
    
    const url = `https://${shopifyDomain}/admin/api/2024-01/customers.json?limit=250`;
    console.log(`📍 URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ Fetched ${response.data.customers.length} customers`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching customers:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener clientes',
    });
  }
});

// Get price rules
app.post('/api/shopify/price-rules', async (req, res) => {
  console.log('💰 Fetching Shopify price rules...');
  
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    if (!shopifyDomain || !accessToken) {
      return res.status(400).json({ 
        error: 'Dominio y Access Token son requeridos' 
      });
    }
    
    const url = `https://${shopifyDomain}/admin/api/2024-01/price_rules.json?limit=250`;
    console.log(`📍 URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ Fetched ${response.data.price_rules.length} price rules`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching price rules:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener reglas de precio',
    });
  }
});

// Get discount codes for a price rule
app.post('/api/shopify/discount-codes/:priceRuleId', async (req, res) => {
  console.log('🎟️ Fetching discount codes...');
  
  try {
    const { shopifyDomain, accessToken } = req.body;
    const { priceRuleId } = req.params;
    
    if (!shopifyDomain || !accessToken) {
      return res.status(400).json({ 
        error: 'Dominio y Access Token son requeridos' 
      });
    }
    
    const url = `https://${shopifyDomain}/admin/api/2024-01/price_rules/${priceRuleId}/discount_codes.json`;
    console.log(`📍 URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ Fetched discount codes for rule ${priceRuleId}`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching discount codes:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener códigos de descuento',
    });
  }
});

// Create a new price rule
app.post('/api/shopify/price-rules/create', async (req, res) => {
  console.log('💰 Creating new price rule...');
  
  try {
    const { shopifyDomain, accessToken, priceRule } = req.body;
    
    if (!shopifyDomain || !accessToken || !priceRule) {
      return res.status(400).json({ 
        error: 'Dominio, Access Token y datos de la regla son requeridos' 
      });
    }
    
    const url = `https://${shopifyDomain}/admin/api/2024-01/price_rules.json`;
    console.log(`📍 URL: ${url}`);
    console.log('📝 Price Rule Data:', JSON.stringify(priceRule, null, 2));
    
    const response = await axios.post(url, 
      { price_rule: priceRule },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Created price rule: ${response.data.price_rule.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error creating price rule:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al crear regla de precio',
      details: error.response?.data
    });
  }
});

// Create discount code for a price rule
app.post('/api/shopify/price-rules/:priceRuleId/discount-codes', async (req, res) => {
  console.log('🎟️ Creating discount code...');
  
  try {
    const { shopifyDomain, accessToken, discountCode } = req.body;
    const { priceRuleId } = req.params;
    
    if (!shopifyDomain || !accessToken || !discountCode) {
      return res.status(400).json({ 
        error: 'Dominio, Access Token y código de descuento son requeridos' 
      });
    }
    
    const url = `https://${shopifyDomain}/admin/api/2024-01/price_rules/${priceRuleId}/discount_codes.json`;
    console.log(`📍 URL: ${url}`);
    console.log('📝 Discount Code:', discountCode);
    
    const response = await axios.post(url,
      { discount_code: { code: discountCode } },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Created discount code: ${discountCode}`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error creating discount code:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al crear código de descuento',
      details: error.response?.data
    });
  }
});

// ======================
// WEBHOOK ENDPOINTS
// ======================

// Trade-in evaluation webhook
app.post('/api/webhooks/trade-evaluation', async (req, res) => {
  console.log('🛏️ Processing trade-in evaluation...');
  
  try {
    const {
      customer,
      mattress,
      credit,
      photos
    } = req.body;
    
    // Validar datos requeridos
    if (!customer || !customer.email || !credit) {
      return res.status(400).json({
        success: false,
        error: 'Datos del cliente y crédito son requeridos'
      });
    }
    
    console.log('👤 Cliente:', customer.email);
    console.log('💰 Crédito aprobado: $' + credit);
    
    // Generar código único para el cupón
    const couponCode = `TRADE${Date.now().toString().slice(-8)}`;
    const couponTitle = `Trade-In Credit - ${customer.firstName} ${customer.lastName}`;
    
    // Obtener configuración de Shopify
    const shopifySettings = await axios.get(`${req.protocol}://${req.get('host')}/shopifySettings/shop-001`);
    const { shopifyDomain, accessToken } = shopifySettings.data;
    
    if (!shopifyDomain || !accessToken) {
      throw new Error('Configuración de Shopify no disponible');
    }
    
    // Crear regla de precio en Shopify
    const priceRule = {
      title: couponTitle,
      target_type: 'line_item',
      target_selection: 'all',
      allocation_method: 'across',
      value_type: 'fixed_amount',
      value: `-${credit}`,
      customer_selection: 'all',
      once_per_customer: true,
      usage_limit: 1,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 días
    };
    
    // 1. Crear la regla de precio
    console.log('📝 Creando regla de precio en Shopify...');
    const priceRuleResponse = await axios.post(
      `https://${shopifyDomain}/admin/api/2024-01/price_rules.json`,
      { price_rule: priceRule },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    const createdPriceRule = priceRuleResponse.data.price_rule;
    console.log('✅ Regla creada:', createdPriceRule.id);
    
    // 2. Crear el código de descuento
    console.log('🎟️ Creando código de descuento...');
    const discountCodeResponse = await axios.post(
      `https://${shopifyDomain}/admin/api/2024-01/price_rules/${createdPriceRule.id}/discount_codes.json`,
      { discount_code: { code: couponCode } },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    const createdDiscountCode = discountCodeResponse.data.discount_code;
    console.log('✅ Código creado:', createdDiscountCode.code);
    
    // 3. Guardar en la base de datos local
    const evaluationData = {
      id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerId: customer.email,
      mattress: mattress,
      photos: photos || [],
      creditApproved: credit,
      status: 'approved',
      couponCode: couponCode,
      shopifyPriceRuleId: createdPriceRule.id.toString(),
      shopifyDiscountCodeId: createdDiscountCode.id.toString(),
      customer: customer,
      createdAt: new Date().toISOString(),
      expiresAt: priceRule.ends_at
    };
    
    // Guardar evaluación
    await axios.post(
      `${req.protocol}://${req.get('host')}/evaluations`,
      evaluationData
    );
    
    // 4. Registrar actividad
    await axios.post(
      `${req.protocol}://${req.get('host')}/activityLogs`,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: 'system',
        customerId: customer.email,
        resourceType: 'evaluation',
        resourceId: evaluationData.id,
        action: 'trade_in_approved',
        description: `Trade-in aprobado por $${credit}. Cupón: ${couponCode}`,
        metadata: {
          credit: credit,
          couponCode: couponCode,
          mattress: mattress
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      }
    );
    
    // 5. Enviar email al cliente (simulado)
    console.log('📧 Email enviado a:', customer.email);
    
    // Responder con éxito
    res.json({
      success: true,
      data: {
        evaluationId: evaluationData.id,
        couponCode: couponCode,
        credit: credit,
        expiresAt: priceRule.ends_at,
        message: 'Tu cupón ha sido creado exitosamente'
      }
    });
    
  } catch (error) {
    console.error('❌ Error procesando trade-in:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la evaluación'
    });
  }
});

// Generic webhook receiver
app.post('/api/webhooks/shopify/:event', async (req, res) => {
  const { event } = req.params;
  const webhookId = `wh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`📨 Webhook received: ${event}`);
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Store webhook in database
    const webhook = {
      id: webhookId,
      source: 'shopify',
      event: event,
      status: 'pending',
      receivedAt: new Date().toISOString(),
      processedAt: null,
      attempts: 0,
      headers: {
        'x-shopify-topic': req.headers['x-shopify-topic'] || event,
        'x-shopify-shop-domain': req.headers['x-shopify-shop-domain'] || '',
        'x-shopify-webhook-id': req.headers['x-shopify-webhook-id'] || '',
        'x-shopify-hmac-sha256': req.headers['x-shopify-hmac-sha256'] || ''
      },
      payload: req.body,
      response: null,
      error: null
    };
    
    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Store it in the database
    // 3. Process it asynchronously
    // 4. Update the webhook status
    
    // For now, we'll just acknowledge receipt
    res.status(200).json({
      success: true,
      message: `Webhook ${event} received`,
      webhookId: webhookId
    });
    
    console.log(`✅ Webhook ${webhookId} acknowledged`);
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing webhook'
    });
  }
});

// List webhook events configuration
app.get('/api/webhook-events', async (req, res) => {
  const events = [
    {
      id: 'whe-001',
      source: 'shopify',
      event: 'orders/create',
      enabled: true,
      endpoint: '/api/webhooks/shopify/orders/create',
      description: 'Se activa cuando se crea una nueva orden en Shopify'
    },
    {
      id: 'whe-002',
      source: 'shopify',
      event: 'orders/updated',
      enabled: true,
      endpoint: '/api/webhooks/shopify/orders/updated',
      description: 'Se activa cuando se actualiza una orden existente'
    },
    {
      id: 'whe-003',
      source: 'shopify',
      event: 'customers/create',
      enabled: true,
      endpoint: '/api/webhooks/shopify/customers/create',
      description: 'Se activa cuando se crea un nuevo cliente'
    },
    {
      id: 'whe-004',
      source: 'shopify',
      event: 'customers/updated',
      enabled: true,
      endpoint: '/api/webhooks/shopify/customers/updated',
      description: 'Se activa cuando se actualiza un cliente'
    },
    {
      id: 'whe-005',
      source: 'shopify',
      event: 'discounts/create',
      enabled: true,
      endpoint: '/api/webhooks/shopify/discounts/create',
      description: 'Se activa cuando se crea un nuevo descuento'
    }
  ];
  
  res.json(events);
});

// ======================
// STRIPE ENDPOINTS
// ======================

let stripeClient = null;

// Helper para leer la base de datos
async function readDatabase() {
  try {
    const dbPath = path.join(__dirname, '..', 'db.json');
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo database:', error);
    throw error;
  }
}

// Helper para escribir la base de datos
async function writeDatabase(data) {
  try {
    const dbPath = path.join(__dirname, '..', 'db.json');
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error escribiendo database:', error);
    throw error;
  }
}

// Configurar Stripe
app.post('/api/stripe/config', async (req, res) => {
  console.log('🔧 Configurando Stripe...');
  
  try {
    const { publicKey, secretKey, webhookSecret, testMode } = req.body;
    
    if (!publicKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Public Key y Secret Key son requeridos'
      });
    }

    // Inicializar cliente de Stripe
    stripeClient = stripe(secretKey);
    
    // Probar conexión
    await stripeClient.customers.list({ limit: 1 });
    
    // Guardar configuración en base de datos
    const db = await readDatabase();
    if (!db.stripeConfig) {
      db.stripeConfig = [];
    }
    
    const config = {
      id: 'stripe-config-001',
      publicKey,
      secretKey,
      webhookSecret: webhookSecret || '',
      currency: 'USD',
      testMode: testMode || true,
      enabledFeatures: {
        paymentLinks: true,
        subscriptions: true,
        oneTimePayments: true,
        webhooks: true
      },
      updatedAt: new Date().toISOString()
    };
    
    // Actualizar o crear configuración
    const existingIndex = db.stripeConfig.findIndex(c => c.id === config.id);
    if (existingIndex >= 0) {
      db.stripeConfig[existingIndex] = { ...db.stripeConfig[existingIndex], ...config };
    } else {
      config.createdAt = new Date().toISOString();
      db.stripeConfig.push(config);
    }
    
    await writeDatabase(db);
    
    console.log('✅ Stripe configurado exitosamente');
    res.json({
      success: true,
      message: 'Stripe configurado exitosamente',
      testMode: config.testMode
    });
    
  } catch (error) {
    console.error('❌ Error configurando Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error configurando Stripe',
      error: error.message
    });
  }
});

// Obtener configuración de Stripe
app.get('/api/stripe/config', async (req, res) => {
  try {
    const db = await readDatabase();
    const config = db.stripeConfig?.[0];
    
    if (!config) {
      return res.json({
        success: false,
        message: 'Stripe no configurado',
        configured: false
      });
    }
    
    // No enviar el secretKey al frontend
    const safeConfig = {
      ...config,
      secretKey: config.secretKey ? '***' : '',
      webhookSecret: config.webhookSecret ? '***' : ''
    };
    
    res.json({
      success: true,
      configured: true,
      config: safeConfig
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuración'
    });
  }
});

// Crear Payment Link
app.post('/api/stripe/payment-links', async (req, res) => {
  console.log('💳 Creando Payment Link...');
  
  try {
    if (!stripeClient) {
      return res.status(400).json({
        success: false,
        message: 'Stripe no configurado'
      });
    }
    
    const { customerId, productName, description, amount, currency = 'USD', metadata = {} } = req.body;
    
    // Crear producto en Stripe
    const product = await stripeClient.products.create({
      name: productName,
      description: description,
      metadata: metadata
    });
    
    // Crear precio en Stripe
    const price = await stripeClient.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      metadata: metadata
    });
    
    // Crear payment link en Stripe
    const paymentLink = await stripeClient.paymentLinks.create({
      line_items: [{
        price: price.id,
        quantity: 1
      }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: 'if_required',
      metadata: {
        ...metadata,
        customerId: customerId
      }
    });
    
    // Guardar en base de datos
    const db = await readDatabase();
    if (!db.paymentLinks) {
      db.paymentLinks = [];
    }
    
    const paymentLinkRecord = {
      id: `pl-${Date.now()}`,
      stripePaymentLinkId: paymentLink.id,
      customerId: customerId,
      productName: productName,
      description: description,
      amount: amount,
      currency: currency,
      status: 'active',
      type: 'one_time',
      url: paymentLink.url,
      metadata: metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.paymentLinks.push(paymentLinkRecord);
    await writeDatabase(db);
    
    console.log('✅ Payment Link creado:', paymentLink.url);
    res.json({
      success: true,
      message: 'Payment Link creado exitosamente',
      paymentLink: paymentLinkRecord,
      url: paymentLink.url
    });
    
  } catch (error) {
    console.error('❌ Error creando Payment Link:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando Payment Link',
      error: error.message
    });
  }
});

// Listar Payment Links
app.get('/api/stripe/payment-links', async (req, res) => {
  try {
    const db = await readDatabase();
    const paymentLinks = db.paymentLinks || [];
    
    res.json({
      success: true,
      paymentLinks: paymentLinks
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo Payment Links:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo Payment Links'
    });
  }
});

// Webhook de Stripe
app.post('/api/stripe/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('📡 Webhook de Stripe recibido...');
  
  try {
    const payload = req.body;
    const signature = req.headers['stripe-signature'];
    
    let event;
    
    // Verificar la firma del webhook si tenemos el secret
    const db = await readDatabase();
    const stripeConfig = db.stripeConfig?.[0];
    
    if (stripeConfig?.webhookSecret && signature) {
      try {
        if (!stripeClient) {
          stripeClient = stripe(stripeConfig.secretKey);
        }
        event = stripeClient.webhooks.constructEvent(payload, signature, stripeConfig.webhookSecret);
        console.log('✅ Webhook verificado correctamente');
      } catch (err) {
        console.error('❌ Error verificando webhook:', err.message);
        return res.status(400).json({ error: 'Webhook signature verification failed' });
      }
    } else {
      // Si no hay webhook secret, procesar sin verificación (solo para desarrollo)
      event = JSON.parse(payload.toString());
      console.log('⚠️ Webhook procesado sin verificación (modo desarrollo)');
    }
    
    console.log(`📋 Evento: ${event.type}`);
    
    // Guardar webhook en base de datos
    if (!db.stripeWebhooks) {
      db.stripeWebhooks = [];
    }
    
    const webhookRecord = {
      id: `wh-${Date.now()}`,
      eventType: event.type,
      stripeEventId: event.id || `evt-${Date.now()}`,
      processed: false,
      processedAt: null,
      attempts: 0,
      lastAttemptAt: new Date().toISOString(),
      error: null,
      data: event.data || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.stripeWebhooks.push(webhookRecord);
    
    // Procesar evento según tipo
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('✅ Pago exitoso');
          await processPaymentSuccess(event.data.object, db);
          break;
          
        case 'customer.subscription.created':
          console.log('🔄 Suscripción creada en Stripe');
          await processSubscriptionCreated(event.data.object, db);
          break;
          
        case 'customer.subscription.updated':
          console.log('🔄 Suscripción actualizada en Stripe');
          await processSubscriptionUpdated(event.data.object, db);
          break;
          
        case 'customer.subscription.deleted':
          console.log('❌ Suscripción cancelada en Stripe');
          await processSubscriptionDeleted(event.data.object, db);
          break;
          
        case 'invoice.payment_failed':
          console.log('💳 Fallo en el pago');
          await processPaymentFailed(event.data.object, db);
          break;
          
        default:
          console.log(`ℹ️ Evento no manejado: ${event.type}`);
      }
      
      // Marcar como procesado exitosamente
      webhookRecord.processed = true;
      webhookRecord.processedAt = new Date().toISOString();
      
    } catch (processingError) {
      console.error(`❌ Error procesando evento ${event.type}:`, processingError);
      webhookRecord.error = processingError.message;
      webhookRecord.attempts += 1;
    }
    
    await writeDatabase(db);
    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(400).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

// Funciones auxiliares para procesar webhooks
async function processSubscriptionCreated(subscription, db) {
  try {
    // Verificar si ya existe
    const existingSubscription = db.subscriptions.find(s => 
      s.billing?.stripeSubscriptionId === subscription.id
    );
    
    if (existingSubscription) {
      console.log(`⏭️ Suscripción ${subscription.id} ya existe`);
      return;
    }
    
    // Obtener información del cliente
    if (!stripeClient) {
      const stripeConfig = db.stripeConfig?.[0];
      stripeClient = stripe(stripeConfig.secretKey);
    }
    
    const stripeCustomer = await stripeClient.customers.retrieve(subscription.customer);
    
    // Buscar o crear cliente local
    let localCustomer = db.customers.find(c => c.email === stripeCustomer.email);
    
    if (!localCustomer) {
      const newCustomerId = `stripe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localCustomer = {
        id: newCustomerId,
        email: stripeCustomer.email || '',
        firstName: stripeCustomer.name?.split(' ')[0] || 'Cliente',
        lastName: stripeCustomer.name?.split(' ').slice(1).join(' ') || 'Stripe',
        phone: stripeCustomer.phone || '',
        address: {
          street: stripeCustomer.address?.line1 || '',
          city: stripeCustomer.address?.city || '',
          state: stripeCustomer.address?.state || '',
          zipCode: stripeCustomer.address?.postal_code || ''
        },
        tier: 'bronze',
        source: 'stripe',
        tags: ['webhook-created'],
        lifetimeValue: 0,
        firstPurchaseDate: new Date(subscription.created * 1000).toISOString(),
        lastPurchaseDate: new Date(subscription.created * 1000).toISOString(),
        lastContactDate: new Date().toISOString(),
        purchasedItems: [],
        isEliteMember: false,
        membershipStatus: 'standard',
        totalTrades: 0,
        totalCreditEarned: 0,
        currentCredit: 0,
        doNotCall: false,
        notes: `Cliente creado automáticamente desde webhook de Stripe. ID: ${stripeCustomer.id}`,
        createdAt: new Date(subscription.created * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      db.customers.push(localCustomer);
      console.log(`👤 Cliente creado desde webhook: ${localCustomer.email}`);
    }
    
    // Obtener información del precio/producto
    const stripePriceId = subscription.items.data[0]?.price?.id;
    const stripePrice = stripePriceId ? await stripeClient.prices.retrieve(stripePriceId) : null;
    const stripeProduct = stripePrice?.product ? await stripeClient.products.retrieve(stripePrice.product) : null;
    
    // Determinar el plan
    let plan = 'basic';
    let pricing = { monthly: 4.99, annual: 49.99, currency: 'USD' };
    
    if (stripeProduct?.name) {
      const productName = stripeProduct.name.toLowerCase();
      if (productName.includes('elite')) {
        plan = 'elite';
        pricing = { monthly: 9.99, annual: 99.99, currency: 'USD' };
      } else if (productName.includes('premium')) {
        plan = 'premium';
        pricing = { monthly: 14.99, annual: 149.99, currency: 'USD' };
      }
    }
    
    // Crear nueva suscripción
    const newSubscriptionId = `webhook-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSubscription = {
      id: newSubscriptionId,
      customerId: localCustomer.id,
      plan: plan,
      status: subscription.status === 'active' ? 'active' : 
              subscription.status === 'canceled' ? 'cancelled' : 
              subscription.status === 'past_due' ? 'paused' : 
              subscription.status,
      pricing: pricing,
      billing: {
        frequency: stripePrice?.recurring?.interval === 'year' ? 'annual' : 'monthly',
        nextBillingDate: subscription.current_period_end ? 
          new Date(subscription.current_period_end * 1000).toISOString() : null,
        paymentMethod: 'stripe',
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        stripePriceId: stripePriceId || '',
        lastFour: '****'
      },
      services: {
        cleaningsTotal: plan === 'elite' ? 12 : plan === 'premium' ? 6 : 3,
        cleaningsUsed: 0,
        protectionActive: plan !== 'basic',
        inspectionsTotal: plan === 'elite' ? 2 : plan === 'premium' ? 1 : 0,
        inspectionsUsed: 0
      },
      credits: {
        accumulated: 0,
        used: 0,
        expiration: null
      },
      startDate: new Date(subscription.created * 1000).toISOString(),
      soldBy: 'stripe-webhook',
      createdAt: new Date(subscription.created * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.subscriptions.push(newSubscription);
    console.log(`✅ Nueva suscripción creada desde webhook: ${subscription.id} → ${newSubscription.id}`);
    
  } catch (error) {
    console.error('Error procesando suscripción creada:', error);
    throw error;
  }
}

async function processSubscriptionUpdated(subscription, db) {
  try {
    const existingSubscription = db.subscriptions.find(s => 
      s.billing?.stripeSubscriptionId === subscription.id
    );
    
    if (existingSubscription) {
      existingSubscription.status = subscription.status === 'active' ? 'active' : 
                                  subscription.status === 'canceled' ? 'cancelled' : 
                                  subscription.status === 'past_due' ? 'paused' : 
                                  subscription.status;
      
      if (subscription.current_period_end) {
        existingSubscription.billing.nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();
      }
      
      existingSubscription.updatedAt = new Date().toISOString();
      console.log(`🔄 Suscripción actualizada: ${subscription.id}`);
    } else {
      console.log(`⚠️ Suscripción ${subscription.id} no encontrada para actualizar`);
    }
  } catch (error) {
    console.error('Error procesando suscripción actualizada:', error);
    throw error;
  }
}

async function processSubscriptionDeleted(subscription, db) {
  try {
    const existingSubscription = db.subscriptions.find(s => 
      s.billing?.stripeSubscriptionId === subscription.id
    );
    
    if (existingSubscription) {
      existingSubscription.status = 'cancelled';
      existingSubscription.cancelledAt = new Date().toISOString();
      existingSubscription.updatedAt = new Date().toISOString();
      console.log(`❌ Suscripción cancelada: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error procesando suscripción cancelada:', error);
    throw error;
  }
}

async function processPaymentSuccess(paymentIntent, db) {
  console.log(`💰 Pago exitoso: ${paymentIntent.id} - $${paymentIntent.amount / 100}`);
}

async function processPaymentFailed(invoice, db) {
  console.log(`💳 Fallo en pago: ${invoice.id}`);
  
  // Buscar suscripción relacionada
  if (invoice.subscription) {
    const existingSubscription = db.subscriptions.find(s => 
      s.billing?.stripeSubscriptionId === invoice.subscription
    );
    
    if (existingSubscription && existingSubscription.status === 'active') {
      existingSubscription.status = 'paused';
      existingSubscription.pausedAt = new Date().toISOString();
      existingSubscription.pauseReason = 'payment_failed';
      existingSubscription.updatedAt = new Date().toISOString();
      console.log(`⏸️ Suscripción pausada por fallo de pago: ${invoice.subscription}`);
    }
  }
}

// Estadísticas de Stripe
app.get('/api/stripe/stats', async (req, res) => {
  try {
    const db = await readDatabase();
    
    const paymentLinks = db.paymentLinks || [];
    const subscriptions = db.stripeSubscriptions || [];
    const webhooks = db.stripeWebhooks || [];
    
    const stats = {
      paymentLinks: {
        total: paymentLinks.length,
        active: paymentLinks.filter(pl => pl.status === 'active').length,
        completed: paymentLinks.filter(pl => pl.status === 'completed').length
      },
      subscriptions: {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        canceled: subscriptions.filter(s => s.status === 'canceled').length
      },
      webhooks: {
        total: webhooks.length,
        processed: webhooks.filter(w => w.processed).length,
        today: webhooks.filter(w => 
          new Date(w.createdAt).toDateString() === new Date().toDateString()
        ).length
      }
    };
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
});

// ======================
// SUBSCRIPTIONS ENDPOINTS
// ======================

// Pausar suscripción
app.post('/api/subscriptions/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = await readDatabase();
    
    // Encontrar la suscripción
    const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id);
    if (subscriptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }
    
    const subscription = db.subscriptions[subscriptionIndex];
    
    // Pausar en Stripe si es necesario
    if (subscription.billing?.stripeSubscriptionId) {
      const stripeSubscription = db.stripeSubscriptions.find(ss => 
        ss.stripeSubscriptionId === subscription.billing.stripeSubscriptionId
      );
      if (stripeSubscription) {
        stripeSubscription.status = 'paused';
        stripeSubscription.pausedAt = new Date().toISOString();
        stripeSubscription.updatedAt = new Date().toISOString();
      }
    }
    
    // Actualizar suscripción local
    subscription.status = 'paused';
    subscription.pausedAt = new Date().toISOString();
    if (reason) subscription.pauseReason = reason;
    subscription.updatedAt = new Date().toISOString();
    
    await writeDatabase(db);
    
    res.json({
      success: true,
      message: 'Suscripción pausada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error pausando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error pausando suscripción'
    });
  }
});

// Reanudar suscripción
app.post('/api/subscriptions/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDatabase();
    
    // Encontrar la suscripción
    const subscriptionIndex = db.subscriptions.findIndex(s => s.id === id);
    if (subscriptionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }
    
    const subscription = db.subscriptions[subscriptionIndex];
    
    // Reanudar en Stripe si es necesario
    if (subscription.billing?.stripeSubscriptionId) {
      const stripeSubscription = db.stripeSubscriptions.find(ss => 
        ss.stripeSubscriptionId === subscription.billing.stripeSubscriptionId
      );
      if (stripeSubscription) {
        stripeSubscription.status = 'active';
        stripeSubscription.pausedAt = null;
        stripeSubscription.updatedAt = new Date().toISOString();
      }
    }
    
    // Actualizar suscripción local
    subscription.status = 'active';
    subscription.pausedAt = null;
    subscription.pauseReason = null;
    subscription.updatedAt = new Date().toISOString();
    
    await writeDatabase(db);
    
    res.json({
      success: true,
      message: 'Suscripción reactivada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error reactivando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivando suscripción'
    });
  }
});

// Sincronizar suscripciones con Stripe
app.post('/api/subscriptions/sync-stripe', async (req, res) => {
  try {
    const db = await readDatabase();
    let syncedCount = 0;
    let updatedSubscriptions = [];
    
    console.log('🔄 Iniciando sincronización con Stripe...');
    
    // Verificar si Stripe está configurado
    if (!stripeClient) {
      const stripeConfig = db.stripeConfig?.[0];
      if (stripeConfig?.secretKey) {
        stripeClient = stripe(stripeConfig.secretKey);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Stripe no está configurado',
          synced: 0
        });
      }
    }
    
    // Sincronizar cada suscripción que tenga Stripe ID
    for (const subscription of db.subscriptions) {
      if (subscription.billing?.stripeSubscriptionId) {
        try {
          // Obtener datos actualizados de Stripe
          const stripeSubscription = await stripeClient.subscriptions.retrieve(
            subscription.billing.stripeSubscriptionId
          );
          
          // Mapear estado de Stripe a estado local
          let localStatus = subscription.status;
          switch (stripeSubscription.status) {
            case 'active':
              localStatus = 'active';
              break;
            case 'paused':
              localStatus = 'paused';
              break;
            case 'canceled':
              localStatus = 'cancelled';
              break;
            case 'past_due':
              localStatus = 'paused';
              break;
            default:
              localStatus = subscription.status;
          }
          
          // Actualizar si hay cambios
          if (subscription.status !== localStatus) {
            subscription.status = localStatus;
            subscription.updatedAt = new Date().toISOString();
            syncedCount++;
            updatedSubscriptions.push({
              id: subscription.id,
              customerId: subscription.customerId,
              oldStatus: subscription.status,
              newStatus: localStatus
            });
            console.log(`✅ Actualizada suscripción ${subscription.id}: ${subscription.status} → ${localStatus}`);
          }
          
          // Actualizar fecha de próximo cobro si está disponible
          if (stripeSubscription.current_period_end) {
            const nextBillingDate = new Date(stripeSubscription.current_period_end * 1000).toISOString();
            if (subscription.billing.nextBillingDate !== nextBillingDate) {
              subscription.billing.nextBillingDate = nextBillingDate;
              subscription.updatedAt = new Date().toISOString();
              if (!updatedSubscriptions.find(s => s.id === subscription.id)) {
                syncedCount++;
              }
            }
          }
          
        } catch (stripeError) {
          console.error(`❌ Error sincronizando suscripción ${subscription.id}:`, stripeError.message);
          // Continuar con las demás suscripciones
        }
      }
    }
    
    // Guardar cambios en la base de datos
    await writeDatabase(db);
    
    console.log(`✅ Sincronización completada: ${syncedCount} suscripciones actualizadas`);
    
    res.json({
      success: true,
      message: `Sincronización completada: ${syncedCount} suscripciones actualizadas`,
      synced: syncedCount,
      details: updatedSubscriptions
    });
    
  } catch (error) {
    console.error('❌ Error sincronizando con Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error sincronizando con Stripe: ' + error.message,
      synced: 0
    });
  }
});

// Estadísticas de suscripciones
app.get('/api/subscriptions/stats', async (req, res) => {
  try {
    const db = await readDatabase();
    const subscriptions = db.subscriptions || [];
    
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      withStripe: subscriptions.filter(s => 
        s.billing?.paymentMethod === 'stripe' &&
        s.billing?.stripeSubscriptionId
      ).length,
      revenue: {
        monthly: subscriptions
          .filter(s => s.status === 'active' && s.billing?.frequency === 'monthly')
          .reduce((sum, s) => sum + (s.pricing?.monthly || 0), 0),
        annual: subscriptions
          .filter(s => s.status === 'active' && s.billing?.frequency === 'annual')
          .reduce((sum, s) => sum + (s.pricing?.annual || 0), 0)
      }
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
});

// Importar suscripciones desde Stripe
app.post('/api/subscriptions/import-from-stripe', async (req, res) => {
  try {
    const db = await readDatabase();
    let importedCount = 0;
    let importedSubscriptions = [];
    
    console.log('📥 Importando suscripciones desde Stripe...');
    
    // Verificar si Stripe está configurado
    if (!stripeClient) {
      const stripeConfig = db.stripeConfig?.[0];
      if (stripeConfig?.secretKey) {
        stripeClient = stripe(stripeConfig.secretKey);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Stripe no está configurado',
          imported: 0
        });
      }
    }
    
    // Obtener todas las suscripciones de Stripe con expansiones válidas
    const stripeSubscriptions = await stripeClient.subscriptions.list({
      limit: 100,
      status: 'all',
      expand: [
        'data.customer',
        'data.items.data.price'
      ]
    });
    
    console.log(`📋 Encontradas ${stripeSubscriptions.data.length} suscripciones en Stripe`);
    
    for (const stripeSub of stripeSubscriptions.data) {
      try {
        // Verificar si ya existe en nuestra base de datos
        const existingSubscription = db.subscriptions.find(s => 
          s.billing?.stripeSubscriptionId === stripeSub.id
        );
        
        if (existingSubscription) {
          console.log(`⏭️ Suscripción ${stripeSub.id} ya existe, actualizando...`);
          
          // Actualizar datos existentes
          existingSubscription.status = stripeSub.status === 'active' ? 'active' : 
                                      stripeSub.status === 'canceled' ? 'cancelled' : 
                                      stripeSub.status === 'past_due' ? 'paused' : 
                                      stripeSub.status;
          
          if (stripeSub.current_period_end) {
            existingSubscription.billing.nextBillingDate = new Date(stripeSub.current_period_end * 1000).toISOString();
          }
          
          existingSubscription.updatedAt = new Date().toISOString();
          continue;
        }
        
        // Usar información del cliente expandida o hacer llamada individual
        const stripeCustomer = stripeSub.customer && typeof stripeSub.customer === 'object' 
          ? stripeSub.customer 
          : await stripeClient.customers.retrieve(stripeSub.customer);
        
        // Buscar o crear cliente local
        let localCustomer = db.customers.find(c => c.email === stripeCustomer.email);
        
        if (!localCustomer) {
          // Crear cliente local si no existe
          const newCustomerId = `stripe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localCustomer = {
            id: newCustomerId,
            email: stripeCustomer.email || '',
            firstName: stripeCustomer.name?.split(' ')[0] || 'Cliente',
            lastName: stripeCustomer.name?.split(' ').slice(1).join(' ') || 'Stripe',
            phone: stripeCustomer.phone || '',
            address: {
              street: stripeCustomer.address?.line1 || '',
              city: stripeCustomer.address?.city || '',
              state: stripeCustomer.address?.state || '',
              zipCode: stripeCustomer.address?.postal_code || ''
            },
            tier: 'bronze',
            source: 'stripe',
            tags: ['imported-from-stripe'],
            lifetimeValue: 0,
            firstPurchaseDate: new Date(stripeSub.created * 1000).toISOString(),
            lastPurchaseDate: new Date(stripeSub.created * 1000).toISOString(),
            lastContactDate: new Date().toISOString(),
            purchasedItems: [],
            isEliteMember: false,
            membershipStatus: 'standard',
            totalTrades: 0,
            totalCreditEarned: 0,
            currentCredit: 0,
            doNotCall: false,
            notes: `Cliente importado desde Stripe. ID de Stripe: ${stripeCustomer.id}`,
            createdAt: new Date(stripeSub.created * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          db.customers.push(localCustomer);
          console.log(`👤 Cliente creado: ${localCustomer.email}`);
        }
        
        // Obtener información del precio/producto usando datos expandidos
        const stripePriceId = stripeSub.items.data[0]?.price?.id;
        const stripePrice = stripeSub.items.data[0]?.price || null;
        
        // Obtener producto si tenemos el ID y no está expandido
        let stripeProduct = null;
        if (stripePrice?.product) {
          if (typeof stripePrice.product === 'object') {
            stripeProduct = stripePrice.product;
          } else {
            try {
              stripeProduct = await stripeClient.products.retrieve(stripePrice.product);
            } catch (error) {
              console.log(`⚠️ No se pudo obtener producto ${stripePrice.product}: ${error.message}`);
            }
          }
        }
        
        // Determinar el plan basado en el producto o precio
        let plan = 'basic';
        let pricing = { monthly: 4.99, annual: 49.99, currency: 'USD' };
        
        if (stripeProduct?.name) {
          const productName = stripeProduct.name.toLowerCase();
          if (productName.includes('elite')) {
            plan = 'elite';
            pricing = { monthly: 9.99, annual: 99.99, currency: 'USD' };
          } else if (productName.includes('premium')) {
            plan = 'premium';
            pricing = { monthly: 14.99, annual: 149.99, currency: 'USD' };
          }
        }
        
        // Crear nueva suscripción local
        const newSubscriptionId = `stripe-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newSubscription = {
          id: newSubscriptionId,
          customerId: localCustomer.id,
          plan: plan,
          status: stripeSub.status === 'active' ? 'active' : 
                  stripeSub.status === 'canceled' ? 'cancelled' : 
                  stripeSub.status === 'past_due' ? 'paused' : 
                  stripeSub.status,
          pricing: pricing,
          billing: {
            frequency: stripePrice?.recurring?.interval === 'year' ? 'annual' : 'monthly',
            nextBillingDate: stripeSub.current_period_end ? 
              new Date(stripeSub.current_period_end * 1000).toISOString() : null,
            paymentMethod: 'stripe',
            stripeCustomerId: stripeSub.customer,
            stripeSubscriptionId: stripeSub.id,
            stripePriceId: stripePriceId || '',
            lastFour: '****' // No podemos obtener esto sin el payment method
          },
          services: {
            cleaningsTotal: plan === 'elite' ? 12 : plan === 'premium' ? 6 : 3,
            cleaningsUsed: 0,
            protectionActive: plan !== 'basic',
            inspectionsTotal: plan === 'elite' ? 2 : plan === 'premium' ? 1 : 0,
            inspectionsUsed: 0
          },
          credits: {
            accumulated: 0,
            used: 0,
            expiration: null
          },
          startDate: new Date(stripeSub.created * 1000).toISOString(),
          soldBy: 'stripe-import',
          createdAt: new Date(stripeSub.created * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        db.subscriptions.push(newSubscription);
        importedCount++;
        importedSubscriptions.push({
          id: newSubscription.id,
          stripeId: stripeSub.id,
          customerEmail: localCustomer.email,
          plan: plan,
          status: newSubscription.status
        });
        
        console.log(`✅ Suscripción importada: ${stripeSub.id} → ${newSubscription.id}`);
        
      } catch (error) {
        console.error(`❌ Error importando suscripción ${stripeSub.id}:`, error.message);
        continue;
      }
    }
    
    // Guardar cambios en la base de datos
    await writeDatabase(db);
    
    console.log(`✅ Importación completada: ${importedCount} suscripciones importadas`);
    
    res.json({
      success: true,
      message: `Importación completada: ${importedCount} suscripciones importadas`,
      imported: importedCount,
      details: importedSubscriptions
    });
    
  } catch (error) {
    console.error('❌ Error importando desde Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error importando desde Stripe: ' + error.message,
      imported: 0
    });
  }
});

// Verificar nuevas suscripciones desde Stripe (polling)
app.post('/api/subscriptions/check-new', async (req, res) => {
  try {
    const db = await readDatabase();
    let newCount = 0;
    let newSubscriptions = [];
    
    console.log('🔍 Verificando nuevas suscripciones en Stripe...');
    
    // Verificar si Stripe está configurado
    if (!stripeClient) {
      const stripeConfig = db.stripeConfig?.[0];
      if (stripeConfig?.secretKey) {
        stripeClient = stripe(stripeConfig.secretKey);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Stripe no está configurado',
          newCount: 0
        });
      }
    }
    
    // Obtener suscripciones de Stripe creadas en las últimas 24 horas con expansiones válidas
    const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    const stripeSubscriptions = await stripeClient.subscriptions.list({
      limit: 100,
      created: { gte: oneDayAgo },
      status: 'all',
      expand: [
        'data.customer',
        'data.items.data.price'
      ]
    });
    
    console.log(`🔍 Encontradas ${stripeSubscriptions.data.length} suscripciones recientes en Stripe`);
    
    for (const stripeSub of stripeSubscriptions.data) {
      try {
        // Verificar si ya existe en nuestra base de datos
        const existingSubscription = db.subscriptions.find(s => 
          s.billing?.stripeSubscriptionId === stripeSub.id
        );
        
        if (existingSubscription) {
          console.log(`⏭️ Suscripción ${stripeSub.id} ya existe`);
          continue;
        }
        
        // Es una nueva suscripción, procesarla
        console.log(`🆕 Nueva suscripción encontrada: ${stripeSub.id}`);
        
        // Usar información del cliente expandida o hacer llamada individual
        const stripeCustomer = stripeSub.customer && typeof stripeSub.customer === 'object' 
          ? stripeSub.customer 
          : await stripeClient.customers.retrieve(stripeSub.customer);
        
        // Buscar o crear cliente local
        let localCustomer = db.customers.find(c => c.email === stripeCustomer.email);
        
        if (!localCustomer) {
          const newCustomerId = `stripe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localCustomer = {
            id: newCustomerId,
            email: stripeCustomer.email || '',
            firstName: stripeCustomer.name?.split(' ')[0] || 'Cliente',
            lastName: stripeCustomer.name?.split(' ').slice(1).join(' ') || 'Stripe',
            phone: stripeCustomer.phone || '',
            address: {
              street: stripeCustomer.address?.line1 || '',
              city: stripeCustomer.address?.city || '',
              state: stripeCustomer.address?.state || '',
              zipCode: stripeCustomer.address?.postal_code || ''
            },
            tier: 'bronze',
            source: 'stripe',
            tags: ['auto-created'],
            lifetimeValue: 0,
            firstPurchaseDate: new Date(stripeSub.created * 1000).toISOString(),
            lastPurchaseDate: new Date(stripeSub.created * 1000).toISOString(),
            lastContactDate: new Date().toISOString(),
            purchasedItems: [],
            isEliteMember: false,
            membershipStatus: 'standard',
            totalTrades: 0,
            totalCreditEarned: 0,
            currentCredit: 0,
            doNotCall: false,
            notes: `Cliente creado automáticamente desde nueva suscripción de Stripe. ID: ${stripeCustomer.id}`,
            createdAt: new Date(stripeSub.created * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          db.customers.push(localCustomer);
          console.log(`👤 Cliente creado automáticamente: ${localCustomer.email}`);
        }
        
        // Obtener información del precio/producto usando datos expandidos
        const stripePriceId = stripeSub.items.data[0]?.price?.id;
        const stripePrice = stripeSub.items.data[0]?.price || null;
        
        // Obtener producto si tenemos el ID y no está expandido
        let stripeProduct = null;
        if (stripePrice?.product) {
          if (typeof stripePrice.product === 'object') {
            stripeProduct = stripePrice.product;
          } else {
            try {
              stripeProduct = await stripeClient.products.retrieve(stripePrice.product);
            } catch (error) {
              console.log(`⚠️ No se pudo obtener producto ${stripePrice.product}: ${error.message}`);
            }
          }
        }
        
        // Determinar el plan
        let plan = 'basic';
        let pricing = { monthly: 4.99, annual: 49.99, currency: 'USD' };
        
        if (stripeProduct?.name) {
          const productName = stripeProduct.name.toLowerCase();
          if (productName.includes('elite')) {
            plan = 'elite';
            pricing = { monthly: 9.99, annual: 99.99, currency: 'USD' };
          } else if (productName.includes('premium')) {
            plan = 'premium';
            pricing = { monthly: 14.99, annual: 149.99, currency: 'USD' };
          }
        }
        
        // Crear nueva suscripción
        const newSubscriptionId = `auto-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newSubscription = {
          id: newSubscriptionId,
          customerId: localCustomer.id,
          plan: plan,
          status: stripeSub.status === 'active' ? 'active' : 
                  stripeSub.status === 'canceled' ? 'cancelled' : 
                  stripeSub.status === 'past_due' ? 'paused' : 
                  stripeSub.status,
          pricing: pricing,
          billing: {
            frequency: stripePrice?.recurring?.interval === 'year' ? 'annual' : 'monthly',
            nextBillingDate: stripeSub.current_period_end ? 
              new Date(stripeSub.current_period_end * 1000).toISOString() : null,
            paymentMethod: 'stripe',
            stripeCustomerId: stripeSub.customer,
            stripeSubscriptionId: stripeSub.id,
            stripePriceId: stripePriceId || '',
            lastFour: '****'
          },
          services: {
            cleaningsTotal: plan === 'elite' ? 12 : plan === 'premium' ? 6 : 3,
            cleaningsUsed: 0,
            protectionActive: plan !== 'basic',
            inspectionsTotal: plan === 'elite' ? 2 : plan === 'premium' ? 1 : 0,
            inspectionsUsed: 0
          },
          credits: {
            accumulated: 0,
            used: 0,
            expiration: null
          },
          startDate: new Date(stripeSub.created * 1000).toISOString(),
          soldBy: 'stripe-auto',
          createdAt: new Date(stripeSub.created * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        db.subscriptions.push(newSubscription);
        newCount++;
        newSubscriptions.push({
          id: newSubscription.id,
          stripeId: stripeSub.id,
          customerEmail: localCustomer.email,
          plan: plan,
          status: newSubscription.status,
          createdAt: newSubscription.createdAt
        });
        
        console.log(`✅ Nueva suscripción agregada automáticamente: ${stripeSub.id} → ${newSubscription.id}`);
        
      } catch (error) {
        console.error(`❌ Error procesando nueva suscripción ${stripeSub.id}:`, error.message);
        continue;
      }
    }
    
    // Guardar cambios si hay nuevas suscripciones
    if (newCount > 0) {
      await writeDatabase(db);
      console.log(`✅ ${newCount} nuevas suscripciones agregadas automáticamente`);
    } else {
      console.log(`ℹ️ No se encontraron nuevas suscripciones`);
    }
    
    res.json({
      success: true,
      message: `Verificación completada: ${newCount} nuevas suscripciones encontradas`,
      newCount: newCount,
      newSubscriptions: newSubscriptions
    });
    
  } catch (error) {
    console.error('❌ Error verificando nuevas suscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando nuevas suscripciones: ' + error.message,
      newCount: 0
    });
  }
});

// Nuevo endpoint optimizado para obtener suscripciones de Stripe
app.get('/api/stripe/subscriptions', async (req, res) => {
  try {
    console.log('📋 Obteniendo suscripciones desde Stripe API...');
    
    const { 
      status = 'all', 
      customer, 
      limit = 100, 
      startingAfter,
      expand = false 
    } = req.query;
    
    // Verificar si Stripe está configurado
    if (!stripeClient) {
      const db = await readDatabase();
      const stripeConfig = db.stripeConfig?.[0];
      if (!stripeConfig?.secretKey) {
        return res.status(400).json({
          success: false,
          error: 'Stripe no está configurado'
        });
      }
      stripeClient = stripe(stripeConfig.secretKey);
    }
    
    // Parámetros para la consulta
    const params = {
      limit: parseInt(limit),
      status: status
    };
    
    if (customer) params.customer = customer;
    if (startingAfter) params.starting_after = startingAfter;
    
    // Usar expansiones válidas (máximo 4 niveles)
    if (expand === 'true') {
      params.expand = [
        'data.customer',
        'data.default_payment_method',
        'data.items.data.price'
      ];
    }
    
    const subscriptions = await stripeClient.subscriptions.list(params);
    
    // Procesar suscripciones para obtener información del producto de forma segura
    const processedSubscriptions = await Promise.all(
      subscriptions.data.map(async (sub) => {
        const processedSub = { ...sub };
        
        // Obtener información del producto si es necesario
        const price = sub.items.data[0]?.price;
        if (price && price.product && typeof price.product === 'string') {
          try {
            const product = await stripeClient.products.retrieve(price.product);
            processedSub.items.data[0].price.product = product;
          } catch (error) {
            console.log(`⚠️ No se pudo obtener producto ${price.product}: ${error.message}`);
          }
        }
        
        return processedSub;
      })
    );
    
    console.log(`✅ Obtenidas ${processedSubscriptions.length} suscripciones desde Stripe`);
    
    res.json({
      success: true,
      subscriptions: processedSubscriptions,
      hasMore: subscriptions.has_more,
      totalCount: processedSubscriptions.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo suscripciones desde Stripe:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo suscripciones desde Stripe',
      message: error.message
    });
  }
});

// ======================
// FINANCE API ENDPOINTS
// ======================

app.get('/api/finance/transactions', async (req, res) => {
  try {
    const db = await readDatabase();
    const userId = req.query.userId || 'demo-user';
    const transactions = db.transactions.filter(t => t.userId === userId);
    res.json({ data: transactions, total: transactions.length });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

app.post('/api/finance/transactions', async (req, res) => {
  try {
    const db = await readDatabase();
    const userId = req.body.userId || 'demo-user';
    const newTransaction = {
      id: `txn-${Date.now()}`,
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!db.transactions) db.transactions = [];
    db.transactions.push(newTransaction);
    await writeDatabase(db);
    
    res.json({ data: newTransaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.put('/api/finance/transactions/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const transactionIndex = db.transactions.findIndex(t => t.id === req.params.id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    db.transactions[transactionIndex] = {
      ...db.transactions[transactionIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await writeDatabase(db);
    res.json({ data: db.transactions[transactionIndex] });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

app.delete('/api/finance/transactions/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const transactionIndex = db.transactions.findIndex(t => t.id === req.params.id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const deletedTransaction = db.transactions.splice(transactionIndex, 1)[0];
    await writeDatabase(db);
    res.json({ data: deletedTransaction });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

app.get('/api/finance/cards', async (req, res) => {
  try {
    const db = await readDatabase();
    const userId = req.query.userId || 'demo-user';
    const cards = db.cards.filter(c => c.userId === userId);
    res.json({ data: cards, total: cards.length });
  } catch (error) {
    console.error('Error getting cards:', error);
    res.status(500).json({ error: 'Failed to get cards' });
  }
});

app.post('/api/finance/cards', async (req, res) => {
  try {
    const db = await readDatabase();
    const userId = req.body.userId || 'demo-user';
    const newCard = {
      id: `card-${Date.now()}`,
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!db.cards) db.cards = [];
    db.cards.push(newCard);
    await writeDatabase(db);
    
    res.json({ data: newCard });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

app.put('/api/finance/cards/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const cardIndex = db.cards.findIndex(c => c.id === req.params.id);
    
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    db.cards[cardIndex] = {
      ...db.cards[cardIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await writeDatabase(db);
    res.json({ data: db.cards[cardIndex] });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

app.delete('/api/finance/cards/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const cardIndex = db.cards.findIndex(c => c.id === req.params.id);
    
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const deletedCard = db.cards.splice(cardIndex, 1)[0];
    await writeDatabase(db);
    res.json({ data: deletedCard });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

app.get('/api/finance/tasks', async (req, res) => {
  try {
    const db = await readDatabase();
    const userId = req.query.userId || 'demo-user';
    const tasks = db.financeTasks.filter(t => t.userId === userId);
    res.json({ data: tasks, total: tasks.length });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

app.post('/api/finance/tasks', async (req, res) => {
  try {
    const db = await readDatabase();
    const userId = req.body.userId || 'demo-user';
    const newTask = {
      id: `task-${Date.now()}`,
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!db.financeTasks) db.financeTasks = [];
    db.financeTasks.push(newTask);
    await writeDatabase(db);
    
    res.json({ data: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/finance/tasks/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const taskIndex = db.financeTasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    db.financeTasks[taskIndex] = {
      ...db.financeTasks[taskIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await writeDatabase(db);
    res.json({ data: db.financeTasks[taskIndex] });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/finance/tasks/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const taskIndex = db.financeTasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = db.financeTasks.splice(taskIndex, 1)[0];
    await writeDatabase(db);
    res.json({ data: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/api/finance/dashboard', async (req, res) => {
  try {
    const db = await readDatabase();
    const userId = req.query.userId || 'demo-user';
    const metrics = db.dashboardMetrics.find(m => m.userId === userId);
    
    if (!metrics) {
      return res.status(404).json({ error: 'Dashboard metrics not found' });
    }
    
    res.json({ data: metrics });
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to get dashboard metrics' });
  }
});

// ======================
// JSON SERVER SETUP
// ======================

console.log('📂 Setting up JSON Server...');

// JSON Server - debe ir AL FINAL
const dbPath = path.join(__dirname, '..', 'db.json');
console.log('📄 Database path:', dbPath);

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults({
  logger: true,
  readOnly: false,
  noCors: false
});

// Aplicar middlewares de json-server
app.use(middlewares);

// Usar el router de json-server para todas las demás rutas
app.use(router);

// ======================
// ERROR HANDLING
// ======================

// 404 handler
app.use((req, res) => {
  console.log(`⚠️ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      shopify: [
        'POST /api/shopify/test-connection',
        'POST /api/shopify/products',
        'POST /api/shopify/customers',
        'POST /api/shopify/price-rules',
        'POST /api/shopify/price-rules/create',
        'POST /api/shopify/discount-codes/:id',
        'POST /api/shopify/price-rules/:id/discount-codes'
      ],
      webhooks: [
        'POST /api/webhooks/trade-evaluation',
        'POST /api/webhooks/shopify/:event',
        'GET /api/webhook-events'
      ],
      health: 'GET /health'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ======================
// AUTOMATIZACIÓN - CRON JOBS
// ======================

// Verificar nuevas suscripciones cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('🔄 [CRON] Verificando nuevas suscripciones automáticamente...');
    
    const db = await readDatabase();
    
    // Verificar si Stripe está configurado
    if (!stripeClient) {
      const stripeConfig = db.stripeConfig?.[0];
      if (!stripeConfig?.secretKey) {
        console.log('⚠️ [CRON] Stripe no configurado, saltando verificación');
        return;
      }
      stripeClient = stripe(stripeConfig.secretKey);
    }
    
    let newCount = 0;
    
    // Obtener suscripciones de Stripe creadas en las últimas 10 minutos
    const tenMinutesAgo = Math.floor((Date.now() - 10 * 60 * 1000) / 1000);
    const stripeSubscriptions = await stripeClient.subscriptions.list({
      limit: 100,
      created: { gte: tenMinutesAgo },
      status: 'all'
    });
    
    for (const stripeSub of stripeSubscriptions.data) {
      try {
        // Verificar si ya existe en nuestra base de datos
        const existingSubscription = db.subscriptions.find(s => 
          s.billing?.stripeSubscriptionId === stripeSub.id
        );
        
        if (existingSubscription) {
          continue;
        }
        
        // Procesar nueva suscripción (reutilizar lógica del webhook)
        await processSubscriptionCreated(stripeSub, db);
        newCount++;
        
        console.log(`✅ [CRON] Nueva suscripción procesada automáticamente: ${stripeSub.id}`);
        
      } catch (error) {
        console.error(`❌ [CRON] Error procesando suscripción ${stripeSub.id}:`, error.message);
        continue;
      }
    }
    
    if (newCount > 0) {
      await writeDatabase(db);
      console.log(`✅ [CRON] ${newCount} nuevas suscripciones agregadas automáticamente`);
    } else {
      console.log(`ℹ️ [CRON] No se encontraron nuevas suscripciones`);
    }
    
  } catch (error) {
    console.error('❌ [CRON] Error en verificación automática:', error.message);
  }
});

// Sincronizar suscripciones existentes cada hora
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 [CRON] Sincronizando suscripciones existentes...');
    
    const db = await readDatabase();
    
    // Verificar si Stripe está configurado
    if (!stripeClient) {
      const stripeConfig = db.stripeConfig?.[0];
      if (!stripeConfig?.secretKey) {
        console.log('⚠️ [CRON] Stripe no configurado, saltando sincronización');
        return;
      }
      stripeClient = stripe(stripeConfig.secretKey);
    }
    
    let syncedCount = 0;
    
    // Sincronizar solo suscripciones que tienen stripeSubscriptionId
    const subscriptionsToSync = db.subscriptions.filter(sub => 
      sub.billing?.stripeSubscriptionId && 
      sub.billing.stripeSubscriptionId.startsWith('sub_')
    );
    
    for (const localSub of subscriptionsToSync) {
      try {
        const stripeSubscription = await stripeClient.subscriptions.retrieve(
          localSub.billing.stripeSubscriptionId
        );
        
        // Actualizar estado si es diferente
        const newStatus = stripeSubscription.status === 'active' ? 'active' : 
                         stripeSubscription.status === 'canceled' ? 'cancelled' : 
                         stripeSubscription.status === 'past_due' ? 'paused' : 
                         stripeSubscription.status;
        
        if (localSub.status !== newStatus) {
          localSub.status = newStatus;
          localSub.updatedAt = new Date().toISOString();
          syncedCount++;
          
          console.log(`🔄 [CRON] Suscripción ${localSub.id} actualizada: ${localSub.status} → ${newStatus}`);
        }
        
        // Actualizar fecha de próximo pago
        if (stripeSubscription.current_period_end) {
          const nextBillingDate = new Date(stripeSubscription.current_period_end * 1000).toISOString();
          if (localSub.billing.nextBillingDate !== nextBillingDate) {
            localSub.billing.nextBillingDate = nextBillingDate;
            localSub.updatedAt = new Date().toISOString();
            syncedCount++;
          }
        }
        
      } catch (error) {
        if (error.code === 'resource_missing') {
          console.log(`⚠️ [CRON] Suscripción ${localSub.billing.stripeSubscriptionId} no encontrada en Stripe`);
        } else {
          console.error(`❌ [CRON] Error sincronizando ${localSub.id}:`, error.message);
        }
        continue;
      }
    }
    
    if (syncedCount > 0) {
      await writeDatabase(db);
      console.log(`✅ [CRON] ${syncedCount} suscripciones sincronizadas`);
    } else {
      console.log(`ℹ️ [CRON] Todas las suscripciones están sincronizadas`);
    }
    
  } catch (error) {
    console.error('❌ [CRON] Error en sincronización automática:', error.message);
  }
});

// Limpiar logs antiguos cada día a medianoche
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🧹 [CRON] Limpiando logs antiguos...');
    
    const db = await readDatabase();
    let cleaned = 0;
    
    // Limpiar webhooks logs más antiguos de 7 días
    if (db.webhookLogs) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const originalCount = db.webhookLogs.length;
      
      db.webhookLogs = db.webhookLogs.filter(log => {
        const logDate = new Date(log.receivedAt).getTime();
        return logDate > sevenDaysAgo;
      });
      
      cleaned = originalCount - db.webhookLogs.length;
    }
    
    // Limpiar stripe webhooks más antiguos de 30 días
    if (db.stripeWebhooks) {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const originalCount = db.stripeWebhooks.length;
      
      db.stripeWebhooks = db.stripeWebhooks.filter(webhook => {
        const webhookDate = new Date(webhook.createdAt).getTime();
        return webhookDate > thirtyDaysAgo;
      });
      
      cleaned += originalCount - db.stripeWebhooks.length;
    }
    
    if (cleaned > 0) {
      await writeDatabase(db);
      console.log(`✅ [CRON] ${cleaned} logs antiguos eliminados`);
    } else {
      console.log(`ℹ️ [CRON] No hay logs antiguos para limpiar`);
    }
    
  } catch (error) {
    console.error('❌ [CRON] Error limpiando logs:', error.message);
  }
});

console.log('⏰ Cron jobs configurados:');
console.log('  - Verificar nuevas suscripciones: cada 5 minutos');
console.log('  - Sincronizar suscripciones: cada hora');
console.log('  - Limpiar logs antiguos: diariamente a medianoche');

// ======================
// START SERVER
// ======================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Server is running!');
  console.log('====================');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('  Health Check:');
  console.log(`    GET  http://localhost:${PORT}/health`);
  console.log('');
  console.log('  Shopify Proxy:');
  console.log(`    POST http://localhost:${PORT}/api/shopify/test-connection`);
  console.log(`    POST http://localhost:${PORT}/api/shopify/products`);
  console.log(`    POST http://localhost:${PORT}/api/shopify/customers`);
  console.log(`    POST http://localhost:${PORT}/api/shopify/price-rules`);
  console.log(`    POST http://localhost:${PORT}/api/shopify/price-rules/create`);
  console.log(`    POST http://localhost:${PORT}/api/shopify/discount-codes/:id`);
  console.log(`    POST http://localhost:${PORT}/api/shopify/price-rules/:id/discount-codes`);
  console.log('');
  console.log('  Webhooks:');
  console.log(`    POST http://localhost:${PORT}/api/webhooks/trade-evaluation`);
  console.log(`    POST http://localhost:${PORT}/api/webhooks/shopify/:event`);
  console.log(`    GET  http://localhost:${PORT}/api/webhook-events`);
  console.log('');
  console.log('  JSON Server:');
  console.log(`    GET  http://localhost:${PORT}/[resource]`);
  console.log(`    POST http://localhost:${PORT}/[resource]`);
  console.log(`    PUT  http://localhost:${PORT}/[resource]/:id`);
  console.log(`    DELETE http://localhost:${PORT}/[resource]/:id`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('====================');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

// Debug para axios
axios.interceptors.request.use(request => {
  console.log('🔵 Starting Request:', request.method?.toUpperCase(), request.url);
  console.log('Headers:', request.headers);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('🟢 Response:', response.status);
    return response;
  },
  error => {
    console.log('🔴 Error Response:', error.response?.status);
    return Promise.reject(error);
  }
);
