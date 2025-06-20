const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 INICIANDO SLEEP+ ADMIN PRODUCTION SERVER');
console.log('==========================================');
console.log(`📅 Timestamp: ${new Date().toISOString()}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🎨 FRONTEND_PORT: ${process.env.FRONTEND_PORT || 5173}`);
console.log(`🔌 BACKEND_PORT: 3001`);
console.log('==========================================');

// Start the backend server
console.log('\n🔧 Starting backend server on port 3001...');
const backend = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

backend.on('error', (err) => {
  console.error('❌ Failed to start backend:', err);
  process.exit(1);
});

// Create a simple express server for the frontend
const app = express();
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5173;

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[FRONTEND ${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../dist');
console.log(`\n📁 Frontend dist path: ${distPath}`);

// Check if dist directory exists
const fs = require('fs');
if (fs.existsSync(distPath)) {
  console.log('✅ Dist directory exists');
  const files = fs.readdirSync(distPath);
  console.log(`📋 Files in dist: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
} else {
  console.error('❌ ERROR: Dist directory does not exist! Build may have failed.');
}

app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'production-server',
    frontend_port: FRONTEND_PORT,
    backend_port: 3001,
    timestamp: new Date().toISOString(),
    dist_exists: fs.existsSync(distPath)
  });
});

// Proxy API and backend routes
const axios = require('axios');

// Proxy function for backend routes
const proxyToBackend = async (req, res) => {
  try {
    const backendUrl = `http://localhost:3001${req.url}`;
    console.log(`[PROXY] ${req.method} ${backendUrl}`);
    
    const config = {
      method: req.method,
      url: backendUrl,
      headers: req.headers,
      data: req.body
    };
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[PROXY ERROR]:', error.message);
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
  console.log(`[FRONTEND] Serving index.html for route: ${req.url}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(404).send('Frontend build not found. Please ensure the application is built.');
    }
  });
});

// Start frontend server - IMPORTANT: Listen on all interfaces (0.0.0.0)
const server = app.listen(FRONTEND_PORT, '0.0.0.0', () => {
  console.log('\n✨ ====================================');
  console.log(`✅ Frontend server is running!`);
  console.log(`🎨 Frontend URL: http://0.0.0.0:${FRONTEND_PORT}`);
  console.log(`🔧 Backend URL: http://localhost:3001`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🌐 Listening on all interfaces (0.0.0.0)`);
  console.log('✨ ====================================\n');
  console.log('👉 IMPORTANTE: En EasyPanel, el dominio DEBE apuntar al puerto 5173');
  console.log('✨ ====================================\n');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  server.close();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  backend.kill();
  process.exit(1);
});

// Log every 30 seconds to show the server is still running
setInterval(() => {
  console.log(`[HEARTBEAT ${new Date().toISOString()}] Frontend on :${FRONTEND_PORT} | Backend on :3001`);
}, 30000);
