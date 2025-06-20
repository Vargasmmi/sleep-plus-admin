const express = require('express');
const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Configuración
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || '/app/data/db.json';

console.log('🔌 BACKEND SERVER - Sleep+ Admin API');
console.log('=====================================');
console.log(`📅 Timestamp: ${new Date().toISOString()}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔌 PORT: ${PORT}`);
console.log(`📁 DB_PATH: ${DB_PATH}`);
console.log('=====================================');

// Crear la aplicación Express
const app = express();

// Configurar CORS para permitir el frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Asegurar que el directorio de datos existe
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory:', dataDir);
}

// Copiar db.json si no existe
if (!fs.existsSync(DB_PATH)) {
  const sourceDb = path.join(__dirname, 'db.json');
  if (fs.existsSync(sourceDb)) {
    fs.copyFileSync(sourceDb, DB_PATH);
    console.log('✅ Database copied to:', DB_PATH);
  }
}

// Configurar JSON Server
const router = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults({
  logger: true,
  readOnly: false,
  noCors: false
});

// Usar los middlewares de JSON Server
app.use(middlewares);

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend',
    timestamp: new Date().toISOString(),
    database: fs.existsSync(DB_PATH) ? 'connected' : 'missing'
  });
});

// Información del API
app.get('/', (req, res) => {
  res.json({
    message: 'Sleep+ Admin API Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/*',
      database: {
        products: '/api/products',
        categories: '/api/categories',
        bundles: '/api/bundles',
        orders: '/api/orders',
        webhooks: '/api/webhooks',
        settings: '/api/settings'
      }
    }
  });
});

// Montar JSON Server en /api
app.use('/api', router);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Backend server is running!');
  console.log(`🔌 API URL: http://0.0.0.0:${PORT}`);
  console.log(`📊 Database: ${DB_PATH}`);
  console.log('✨ Ready to handle requests');
  console.log('=====================================');
});

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
