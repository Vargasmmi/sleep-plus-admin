const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

// Start the backend server
console.log('Starting backend server...');
const backend = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});

// Create a simple express server for the frontend
const app = express();
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5173;

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../dist');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'production-server',
    frontend_port: FRONTEND_PORT,
    backend_port: 3001,
    timestamp: new Date().toISOString()
  });
});

// Proxy API and backend routes
const axios = require('axios');

// Proxy function for backend routes
const proxyToBackend = async (req, res) => {
  try {
    const backendUrl = `http://localhost:3001${req.url}`;
    console.log(`Proxying to backend: ${req.method} ${backendUrl}`);
    
    const config = {
      method: req.method,
      url: backendUrl,
      headers: req.headers,
      data: req.body
    };
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Backend server not available' });
    }
  }
};

// Apply proxy to API and backend routes
app.use('/api/*', proxyToBackend);

const backendRoutes = [
  '/employees', '/customers', '/subscriptions', '/evaluations',
  '/stores', '/calls', '/sales', '/campaigns', '/achievements',
  '/scripts', '/commissions', '/shopifySettings', '/shopifyProducts',
  '/shopifyCustomers', '/shopifyCoupons', '/activityLogs',
  '/webhooks', '/webhookEvents', '/stripeConfig', '/paymentLinks',
  '/stripeSubscriptions', '/stripeWebhooks'
];

backendRoutes.forEach(route => {
  app.use(`${route}*`, proxyToBackend);
});

// Serve index.html for all other routes (React routing)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`Serving index.html for route: ${req.url}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send('Frontend build not found. Please ensure the application is built.');
    }
  });
});

// Start frontend server - IMPORTANT: Listen on all interfaces (0.0.0.0)
const server = app.listen(FRONTEND_PORT, '0.0.0.0', () => {
  console.log('====================================');
  console.log(`Frontend server running on port ${FRONTEND_PORT}`);
  console.log(`Backend server running on port 3001`);
  console.log(`Listening on all interfaces (0.0.0.0)`);
  console.log(`Static files path: ${distPath}`);
  console.log('====================================');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  backend.kill();
  server.close();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  backend.kill();
  process.exit(1);
});
