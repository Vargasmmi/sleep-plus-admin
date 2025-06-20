const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware mejorado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path.startsWith('/api/shopify')) {
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

// Helper function para construir URL de Shopify
function buildShopifyUrl(domain) {
  // Si el dominio ya incluye protocolo, usarlo tal cual
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain;
  }
  
  // Para dominios .myshopify.com siempre usar HTTPS
  if (domain.includes('.myshopify.com')) {
    return `https://${domain}`;
  }
  
  // Por defecto usar HTTPS
  return `https://${domain}`;
}

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

    const baseUrl = buildShopifyUrl(shopifyDomain);
    console.log(`📡 Connecting to: ${baseUrl}`);
    
    const response = await axios.get(
      `${baseUrl}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos de timeout
      }
    );

    console.log('✅ Connection successful!');
    res.json({
      success: true,
      message: `Conectado exitosamente a ${response.data.shop.name}`,
      shop: response.data.shop,
    });
  } catch (error) {
    console.error('❌ Connection failed:', error.response?.data || error.message);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        headers: error.config?.headers
      }
    });
    
    if (error.response?.status === 401) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Verifique su Access Token',
        details: error.response?.data
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({
        success: false,
        message: 'Tienda no encontrada. Verifique el dominio',
        details: error.response?.data
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        success: false,
        message: 'Timeout al conectar con Shopify. Verifique la URL y conexión',
      });
    } else if (error.code === 'ENOTFOUND') {
      res.status(400).json({
        success: false,
        message: 'No se pudo resolver el dominio. Verifique que el dominio sea correcto',
      });
    } else {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.errors || error.message || 'Error al conectar con Shopify',
        details: error.response?.data
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
    
    const baseUrl = buil