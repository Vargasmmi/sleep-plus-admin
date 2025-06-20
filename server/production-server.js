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

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Proxy API requests to backend
app.use('/api', (req, res) => {
  res.redirect(`http://localhost:3001${req.url}`);
});

// Proxy all other backend routes
const backendRoutes = [
  '/employees', '/customers', '/subscriptions', '/evaluations',
  '/stores', '/calls', '/sales', '/campaigns', '/achievements',
  '/scripts', '/commissions', '/shopifySettings', '/shopifyProducts',
  '/shopifyCustomers', '/shopifyCoupons', '/activityLogs',
  '/webhooks', '/webhookEvents'
];

backendRoutes.forEach(route => {
  app.use(route, (req, res) => {
    res.redirect(`http://localhost:3001${req.url}`);
  });
});

// Serve index.html for all other routes (React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Start frontend server
app.listen(FRONTEND_PORT, () => {
  console.log(`Frontend server running on port ${FRONTEND_PORT}`);
  console.log(`Access the application at http://localhost:${FRONTEND_PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backend.kill();
  process.exit(0);
});
