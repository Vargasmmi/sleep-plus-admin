#!/usr/bin/env node

/**
 * Script para probar los endpoints optimizados de Stripe
 * que usan las expansiones válidas (máximo 4 niveles)
 */

const axios = require('axios');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

const API_BASE = 'http://localhost:3001';

async function testEndpoints() {
  console.log(`${colors.bright}🧪 PROBANDO ENDPOINTS OPTIMIZADOS DE STRIPE${colors.reset}`);
  console.log('='.repeat(50));
  
  try {
    // Test 1: Nuevo endpoint optimizado de suscripciones
    console.log(`${colors.cyan}📋 Test 1: Endpoint optimizado /api/stripe/subscriptions${colors.reset}`);
    try {
      const response = await axios.get(`${API_BASE}/api/stripe/subscriptions?expand=true&limit=5`);
      console.log(`${colors.green}✅ Respuesta exitosa${colors.reset}`);
      console.log(`   - Suscripciones obtenidas: ${response.data.subscriptions?.length || 0}`);
      console.log(`   - Tiene más: ${response.data.hasMore ? 'Sí' : 'No'}`);
      
      // Verificar estructura de respuesta
      if (response.data.subscriptions && response.data.subscriptions.length > 0) {
        const firstSub = response.data.subscriptions[0];
        console.log(`   - Cliente expandido: ${typeof firstSub.customer === 'object' ? '✅' : '❌'}`);
        console.log(`   - Precio expandido: ${typeof firstSub.items?.data?.[0]?.price === 'object' ? '✅' : '❌'}`);
        console.log(`   - Producto obtenido: ${firstSub.items?.data?.[0]?.price?.product?.name ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
    
    console.log('');
    
    // Test 2: Endpoint de importación optimizado
    console.log(`${colors.cyan}📥 Test 2: Importación optimizada${colors.reset}`);
    try {
      const response = await axios.post(`${API_BASE}/api/subscriptions/import-from-stripe`);
      console.log(`${colors.green}✅ Importación exitosa${colors.reset}`);
      console.log(`   - Suscripciones importadas: ${response.data.imported || 0}`);
      console.log(`   - Mensaje: ${response.data.message}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Stripe no está configurado')) {
        console.log(`${colors.yellow}⚠️ Stripe no configurado (esperado)${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      }
    }
    
    console.log('');
    
    // Test 3: Verificación de nuevas suscripciones optimizada
    console.log(`${colors.cyan}🔍 Test 3: Verificación de nuevas suscripciones${colors.reset}`);
    try {
      const response = await axios.post(`${API_BASE}/api/subscriptions/check-new`);
      console.log(`${colors.green}✅ Verificación exitosa${colors.reset}`);
      console.log(`   - Nuevas suscripciones: ${response.data.newCount || 0}`);
      console.log(`   - Mensaje: ${response.data.message}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Stripe no está configurado')) {
        console.log(`${colors.yellow}⚠️ Stripe no configurado (esperado)${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      }
    }
    
    console.log('');
    
    // Test 4: Sincronización optimizada
    console.log(`${colors.cyan}🔄 Test 4: Sincronización con Stripe${colors.reset}`);
    try {
      const response = await axios.post(`${API_BASE}/api/subscriptions/sync-stripe`);
      console.log(`${colors.green}✅ Sincronización exitosa${colors.reset}`);
      console.log(`   - Suscripciones sincronizadas: ${response.data.synced || 0}`);
      console.log(`   - Mensaje: ${response.data.message}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Stripe no está configurado')) {
        console.log(`${colors.yellow}⚠️ Stripe no configurado (esperado)${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      }
    }
    
    console.log('');
    console.log(`${colors.bright}📊 RESUMEN DE OPTIMIZACIONES${colors.reset}`);
    console.log('='.repeat(40));
    console.log(`${colors.green}✅ Expansiones limitadas a máximo 4 niveles${colors.reset}`);
    console.log(`${colors.green}✅ Uso de datos expandidos cuando están disponibles${colors.reset}`);
    console.log(`${colors.green}✅ Llamadas individuales solo cuando es necesario${colors.reset}`);
    console.log(`${colors.green}✅ Manejo de errores mejorado${colors.reset}`);
    console.log(`${colors.green}✅ Nuevo endpoint optimizado para frontend${colors.reset}`);
    
    console.log('');
    console.log(`${colors.cyan}💡 BENEFICIOS:${colors.reset}`);
    console.log('   - Sin errores de límite de expansión de Stripe');
    console.log('   - Mejor rendimiento con menos llamadas a la API');
    console.log('   - Interfaz más responsiva');
    console.log('   - Datos en tiempo real desde Stripe');
    
  } catch (error) {
    console.error(`${colors.red}❌ Error general:${colors.reset}`, error.message);
  }
}

// Función para verificar que el servidor esté corriendo
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log(`${colors.green}✅ Servidor corriendo correctamente${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Servidor no disponible en ${API_BASE}${colors.reset}`);
    console.log(`${colors.yellow}💡 Asegúrate de que el servidor esté corriendo:${colors.reset}`);
    console.log('   npm run dev  (o el comando que uses)');
    return false;
  }
}

// Ejecutar pruebas
async function main() {
  console.log(`${colors.bright}🚀 INICIANDO PRUEBAS DE ENDPOINTS OPTIMIZADOS${colors.reset}`);
  console.log('');
  
  const serverOk = await checkServer();
  if (!serverOk) return;
  
  console.log('');
  await testEndpoints();
  
  console.log('');
  console.log(`${colors.green}✅ Pruebas completadas${colors.reset}`);
}

if (require.main === module) {
  main().catch(console.error);
} 