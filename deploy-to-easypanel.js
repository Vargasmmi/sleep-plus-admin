const axios = require('axios');

// Configuración de EasyPanel
const EASYPANEL_URL = 'http://168.231.92.67:3000';
const API_TOKEN = 'c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58';
const PROJECT_NAME = 'sleep-plus-admin';
const SERVICE_NAME = 'sleep-plus-admin-app';

// Configuración del servicio
const serviceConfig = {
  json: {
    projectName: PROJECT_NAME,
    serviceName: SERVICE_NAME,
    source: {
      type: 'git',
      repo: 'https://github.com/Vargasmmi/sleep-plus-admin.git',
      ref: 'main',
      path: '/'
    },
    build: {
      type: 'dockerfile',
      file: './Dockerfile'
    },
    env: `NODE_ENV=production
PORT=3001
FRONTEND_PORT=5173
VITE_API_URL=https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host
VITE_APP_NAME=Sleep+ Admin
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=false`,
    deploy: {
      replicas: 1,
      command: 'node server/production-server.js',
      zeroDowntime: true
    },
    domains: [
      {
        host: `${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host`,
        https: true,
        port: 5173,
        path: '/'
      }
    ],
    mounts: [
      {
        type: 'volume',
        name: 'db-data',
        mountPath: '/app/db.json'
      }
    ],
    ports: [],
    resources: {
      memoryReservation: 256,
      memoryLimit: 512,
      cpuReservation: 0.25,
      cpuLimit: 1
    }
  }
};

async function deployToEasyPanel() {
  try {
    console.log('🚀 Iniciando despliegue en EasyPanel...');
    
    // Crear el servicio
    console.log('📦 Creando servicio...');
    const createResponse = await axios.post(
      `${EASYPANEL_URL}/api/trpc/services.app.createService`,
      serviceConfig,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Servicio creado exitosamente');
    
    // Desplegar el servicio
    console.log('🔨 Iniciando despliegue...');
    const deployResponse = await axios.post(
      `${EASYPANEL_URL}/api/trpc/services.app.deployService`,
      {
        json: {
          projectName: PROJECT_NAME,
          serviceName: SERVICE_NAME,
          forceRebuild: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Despliegue iniciado exitosamente');
    console.log('\n📌 Tu aplicación estará disponible en:');
    console.log(`   https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host`);
    console.log('\n⏱️  El despliegue puede tomar 5-10 minutos.');
    console.log('   Puedes ver el progreso en EasyPanel.');
    
  } catch (error) {
    console.error('❌ Error durante el despliegue:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Ejecutar el despliegue
deployToEasyPanel();
