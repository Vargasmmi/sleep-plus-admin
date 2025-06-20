import { checkBackendConnection } from './src/config/api.config.js';

/**
 * Script de verificación post-despliegue
 * Ejecutar después de separar frontend y backend
 */

console.log('🔍 Verificando la separación Frontend/Backend...\n');

// URLs de producción
const FRONTEND_URL = 'https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host';
const BACKEND_URL = 'https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host';

// Función para verificar una URL
async function checkUrl(name, url) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    console.log(`✅ ${name}:`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${contentType}`);
    
    if (response.ok) {
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log(`   Response:`, JSON.stringify(data, null, 2));
      }
    }
    
    return response.ok;
  } catch (error) {
    console.log(`❌ ${name}:`);
    console.log(`   URL: ${url}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Función principal de verificación
async function runVerification() {
  console.log('1️⃣ Verificando Backend API...');
  const backendHealthy = await checkUrl('Backend Health', `${BACKEND_URL}/health`);
  console.log('');
  
  console.log('2️⃣ Verificando Backend Root...');
  await checkUrl('Backend Root', BACKEND_URL);
  console.log('');
  
  console.log('3️⃣ Verificando Frontend...');
  const frontendHealthy = await checkUrl('Frontend', FRONTEND_URL);
  console.log('');
  
  console.log('4️⃣ Verificando Endpoints del API...');
  const endpoints = [
    '/api/products',
    '/api/categories',
    '/api/bundles',
    '/api/orders',
    '/api/settings'
  ];
  
  for (const endpoint of endpoints) {
    await checkUrl(`API ${endpoint}`, `${BACKEND_URL}${endpoint}`);
  }
  console.log('');
  
  console.log('5️⃣ Verificando Conectividad Frontend → Backend...');
  if (typeof window !== 'undefined') {
    // Este código solo funciona en el navegador
    const backendConnection = await checkBackendConnection();
    console.log('   Conexión:', backendConnection);
  } else {
    console.log('   ⚠️  Ejecutar en el navegador para verificar la conexión completa');
  }
  console.log('');
  
  console.log('📊 RESUMEN:');
  console.log('===========');
  console.log(`Backend API: ${backendHealthy ? '✅ Funcionando' : '❌ Con problemas'}`);
  console.log(`Frontend: ${frontendHealthy ? '✅ Funcionando' : '❌ Con problemas'}`);
  console.log('');
  
  if (backendHealthy && frontendHealthy) {
    console.log('🎉 ¡La separación fue exitosa! Ambos servicios están funcionando.');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Prueba el login en:', FRONTEND_URL);
    console.log('2. Credenciales: admin@sleepplus.com / admin123');
    console.log('3. Verifica que puedas ver los productos y realizar operaciones');
  } else {
    console.log('⚠️  Hay problemas con el despliegue. Revisa:');
    console.log('1. Los logs en EasyPanel');
    console.log('2. Las variables de entorno');
    console.log('3. Que ambos servicios estén desplegados');
  }
}

// Ejecutar verificación
runVerification().catch(console.error);

/**
 * Para ejecutar este script:
 * 
 * 1. En la terminal:
 *    node verify-separation.js
 * 
 * 2. En el navegador (para verificación completa):
 *    - Abrir la consola del navegador
 *    - Copiar y pegar el contenido de este archivo
 *    - Ejecutar
 */
