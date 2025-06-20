#!/usr/bin/env node

/**
 * Script simple para probar la conexión con Stripe
 * y mostrar un resumen rápido de las suscripciones
 */

const stripe = require('stripe');
const fs = require('fs').promises;
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

async function testStripeConnection() {
  try {
    console.log(`${colors.bright}🔍 PROBANDO CONEXIÓN CON STRIPE${colors.reset}`);
    console.log('='.repeat(40));
    
    // Leer configuración
    const dbPath = path.join(__dirname, 'db.json');
    const data = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(data);
    
    const stripeConfig = db.stripeConfig?.[0];
    if (!stripeConfig || !stripeConfig.secretKey) {
      throw new Error('❌ Configuración de Stripe no encontrada');
    }
    
    console.log(`${colors.green}✅ Configuración encontrada${colors.reset}`);
    console.log(`${colors.cyan}🔧 Modo: ${stripeConfig.testMode ? 'TEST' : 'LIVE'}${colors.reset}`);
    
    // Inicializar Stripe
    const stripeClient = stripe(stripeConfig.secretKey);
    
    // Probar conexión obteniendo cuenta
    console.log(`${colors.yellow}🔗 Probando conexión...${colors.reset}`);
    const account = await stripeClient.accounts.retrieve();
    
    console.log(`${colors.green}✅ Conexión exitosa${colors.reset}`);
    console.log(`📧 Cuenta: ${account.email || 'N/A'}`);
    console.log(`🏢 País: ${account.country || 'N/A'}`);
    console.log('');
    
    // Obtener resumen de suscripciones
    console.log(`${colors.yellow}📊 Obteniendo resumen de suscripciones...${colors.reset}`);
    
    const [active, canceled, pastDue, all] = await Promise.all([
      stripeClient.subscriptions.list({ status: 'active', limit: 1 }),
      stripeClient.subscriptions.list({ status: 'canceled', limit: 1 }),
      stripeClient.subscriptions.list({ status: 'past_due', limit: 1 }),
      stripeClient.subscriptions.list({ status: 'all', limit: 1 })
    ]);
    
    console.log(`${colors.bright}📈 RESUMEN DE SUSCRIPCIONES:${colors.reset}`);
    console.log(`${colors.green}   ✅ Activas: ~${active.total_count || 0}${colors.reset}`);
    console.log(`${colors.red}   ❌ Canceladas: ~${canceled.total_count || 0}${colors.reset}`);
    console.log(`${colors.yellow}   ⚠️ Vencidas: ~${pastDue.total_count || 0}${colors.reset}`);
    console.log(`${colors.cyan}   📊 Total aproximado: ~${all.total_count || 0}${colors.reset}`);
    console.log('');
    
    console.log(`${colors.green}✅ Prueba completada exitosamente${colors.reset}`);
    console.log(`${colors.cyan}💡 Para ver el listado completo ejecuta:${colors.reset}`);
    console.log(`   node list-stripe-subscriptions.js`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('');
      console.log(`${colors.yellow}💡 Sugerencias:${colors.reset}`);
      console.log('   - Verifica que tu clave de API sea correcta');
      console.log('   - Asegúrate de usar la clave secreta (sk_...)');
      console.log('   - Confirma que tengas permisos de lectura');
    }
    
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testStripeConnection();
} 