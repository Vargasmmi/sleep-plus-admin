const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log para debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Shopify proxy endpoints - DEBEN IR ANTES que json-server
app.post('/api/shopify/test-connection', async (req, res) => {
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    if (!shopifyDomain || !accessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dominio y Access Token son requeridos' 
      });
    }

    const response = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      message: `Conectado exitosamente a ${response.data.shop.name}`,
      shop: response.data.shop,
    });
  } catch (error) {
    console.error('Error testing Shopify connection:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.errors || error.message || 'Error al conectar con Shopify',
    });
  }
});

app.post('/api/shopify/products', async (req, res) => {
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    const response = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-01/products.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener productos',
    });
  }
});

app.post('/api/shopify/customers', async (req, res) => {
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    const response = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-01/customers.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching customers:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener clientes',
    });
  }
});

app.post('/api/shopify/price-rules', async (req, res) => {
  try {
    const { shopifyDomain, accessToken } = req.body;
    
    const response = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-01/price_rules.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching price rules:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener reglas de precio',
    });
  }
});

app.post('/api/shopify/discount-codes/:priceRuleId', async (req, res) => {
  try {
    const { shopifyDomain, accessToken } = req.body;
    const { priceRuleId } = req.params;
    
    const response = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-01/price_rules/${priceRuleId}/discount_codes.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching discount codes:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.errors || error.message || 'Error al obtener códigos de descuento',
    });
  }
});

// JSON Server setup - AL FINAL para que no interfiera con las rutas de Shopify
const router = jsonServer.router(path.join(__dirname, '..', 'db.json'));
const middlewares = jsonServer.defaults();

// Aplicar middlewares de json-server
app.use(middlewares);

// Use JSON Server router for all other routes
app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Shopify proxy endpoints available at http://localhost:${PORT}/api/shopify/*`);
  console.log(`JSON Server routes available at http://localhost:${PORT}/*`);
});
