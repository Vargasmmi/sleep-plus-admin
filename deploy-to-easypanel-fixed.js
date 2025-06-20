const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración de EasyPanel
const EASYPANEL_URL = 'http://168.231.92.67:3000';
const API_TOKEN = 'c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58';
const PROJECT_NAME = 'sleep-plus-admin';
const SERVICE_NAME = 'sleep-plus-admin-app';

// Configuración de axios con timeout y reintentos
const axiosInstance = axios.create({
  baseURL: EASYPANEL_URL,
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Función para reintentar peticiones
async function retryRequest(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Intento ${i + 1} falló. ${retries - i - 1} intentos restantes...`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Intentar diferentes endpoints de la API
async function tryEndpoints(method, endpoints, data = null) {
  for (const endpoint of endpoints) {
    try {
      console.log(`Probando endpoint: ${endpoint}`);
      const response = await axiosInstance({
        method,
        url: endpoint,
        data
      });
      console.log(`✅ Éxito con endpoint: ${endpoint}`);
      return response;
    } catch (error) {
      console.log(`❌ Fallo con endpoint: ${endpoint}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Mensaje: ${error.response.data?.message || 'Sin mensaje'}`);
      }
    }
  }
  throw new Error('Todos los endpoints fallaron');
}

// Crear configuración de docker-compose como alternativa
function createDockerCompose() {
  const dockerComposeContent = `version: '3.8'

services:
  sleep-plus-admin:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - FRONTEND_PORT=5173
      - VITE_API_URL=https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host
      - VITE_APP_NAME=Sleep+ Admin
      - VITE_APP_VERSION=1.0.0
      - VITE_ENABLE_DEVTOOLS=false
    volumes:
      - db-data:/app/db.json
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 30s

volumes:
  db-data:
`;

  fs.writeFileSync(path.join(__dirname, 'docker-compose.yml'), dockerComposeContent);
  console.log('✅ Archivo docker-compose.yml creado como alternativa');
}

async function deployToEasyPanel() {
  try {
    console.log('🚀 Iniciando despliegue en EasyPanel...');
    console.log('📡 Conectando a:', EASYPANEL_URL);
    
    // Verificar conexión
    console.log('\n1️⃣ Verificando conexión con EasyPanel...');
    try {
      await axiosInstance.get('/');
      console.log('✅ Conexión establecida');
    } catch (error) {
      console.error('❌ No se puede conectar a EasyPanel');
      throw error;
    }

    // Intentar crear proyecto
    console.log('\n2️⃣ Intentando crear proyecto...');
    const projectData = {
      name: PROJECT_NAME,
      description: 'Sleep+ Admin Application'
    };

    try {
      await tryEndpoints('POST', [
        '/api/projects',
        '/api/v1/projects',
        '/api/project/create',
        '/api/trpc/projects.create'
      ], projectData);
    } catch (error) {
      console.log('⚠️  No se pudo crear el proyecto (puede que ya exista)');
    }

    // Configuración del servicio
    console.log('\n3️⃣ Intentando crear servicio...');
    const serviceConfig = {
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
      ]
    };

    try {
      await tryEndpoints('POST', [
        '/api/services',
        '/api/v1/services',
        '/api/service/create',
        '/api/apps/create',
        '/api/trpc/services.app.createService'
      ], { json: serviceConfig });
      
      console.log('✅ Servicio creado exitosamente');
    } catch (error) {
      console.error('❌ No se pudo crear el servicio automáticamente');
      
      // Crear docker-compose como alternativa
      createDockerCompose();
      
      console.log('\n' + '='.repeat(70));
      console.log('INSTRUCCIONES PARA DESPLIEGUE MANUAL');
      console.log('='.repeat(70));
      console.log('\nOpción 1: Despliegue manual en EasyPanel');
      console.log('-'.repeat(40));
      console.log(`1. Accede a: ${EASYPANEL_URL}`);
      console.log(`2. Crea proyecto: "${PROJECT_NAME}"`);
      console.log(`3. Crea servicio: "${SERVICE_NAME}"`);
      console.log('4. Configura:');
      console.log('   - Source: Git');
      console.log('   - Repo: https://github.com/Vargasmmi/sleep-plus-admin.git');
      console.log('   - Branch: main');
      console.log('   - Dockerfile: ./Dockerfile');
      console.log('   - Port: 5173');
      console.log(`   - Domain: ${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host`);
      console.log('\n5. Variables de entorno:');
      console.log('   NODE_ENV=production');
      console.log('   PORT=3001');
      console.log('   FRONTEND_PORT=5173');
      console.log(`   VITE_API_URL=https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host`);
      console.log('   VITE_APP_NAME=Sleep+ Admin');
      console.log('   VITE_APP_VERSION=1.0.0');
      console.log('   VITE_ENABLE_DEVTOOLS=false');
      console.log('\n6. Volumen:');
      console.log('   - Mount Path: /app/db.json');
      console.log('   - Type: Volume');
      console.log('\n7. Haz clic en "Deploy"');
      
      console.log('\n\nOpción 2: Usar Docker Compose (alternativa)');
      console.log('-'.repeat(40));
      console.log('Se ha creado un archivo docker-compose.yml');
      console.log('Ejecuta: docker-compose up -d');
      
      console.log('\n' + '='.repeat(70));
      console.log('\n📌 URL de la aplicación:');
      console.log(`   https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host`);
      console.log('\n🔑 Credenciales:');
      console.log('   Usuario: admin@sleepplus.com');
      console.log('   Contraseña: admin123');
      console.log('='.repeat(70));
      
      return;
    }

    // Intentar iniciar despliegue
    console.log('\n4️⃣ Iniciando despliegue...');
    try {
      await tryEndpoints('POST', [
        '/api/deploy',
        '/api/v1/deploy',
        '/api/service/deploy',
        '/api/apps/deploy',
        '/api/trpc/services.app.deployService'
      ], {
        json: {
          projectName: PROJECT_NAME,
          serviceName: SERVICE_NAME,
          forceRebuild: false
        }
      });
      
      console.log('✅ Despliegue iniciado exitosamente');
    } catch (error) {
      console.log('⚠️  No se pudo iniciar el despliegue automáticamente');
      console.log('   Inicia el despliegue manualmente desde el panel de EasyPanel');
    }

    console.log('\n✅ Proceso completado');
    console.log('\n📌 Tu aplicación estará disponible en:');
    console.log(`   https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host`);
    console.log('\n⏱️  El despliegue puede tomar 5-10 minutos.');
    
  } catch (error) {
    console.error('\n❌ Error durante el despliegue:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  No se puede conectar a EasyPanel');
      console.error('   Verifica que EasyPanel esté ejecutándose en:', EASYPANEL_URL);
    }
  }
}

// Ejecutar el despliegue
deployToEasyPanel().catch(console.error);
