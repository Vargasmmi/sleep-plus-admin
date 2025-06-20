#!/usr/bin/env node

const stripe = require('stripe');
const fs = require('fs').promises;
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class StripeSubscriptionLister {
  constructor() {
    this.stripe = null;
    this.dbPath = path.join(__dirname, 'db.json');
  }

  // Leer configuración de Stripe desde la base de datos
  async loadStripeConfig() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const db = JSON.parse(data);
      
      const stripeConfig = db.stripeConfig?.[0];
      if (!stripeConfig || !stripeConfig.secretKey) {
        throw new Error('❌ Configuración de Stripe no encontrada en la base de datos');
      }

      this.stripe = stripe(stripeConfig.secretKey);
      
      console.log(`${colors.green}✅ Stripe configurado correctamente${colors.reset}`);
      console.log(`${colors.cyan}🔧 Modo: ${stripeConfig.testMode ? 'TEST' : 'LIVE'}${colors.reset}`);
      console.log('');
      
      return stripeConfig;
    } catch (error) {
      console.error(`${colors.red}❌ Error cargando configuración:${colors.reset}`, error.message);
      throw error;
    }
  }

  // Obtener todas las suscripciones con paginación
  async getAllSubscriptions(status = 'all') {
    try {
      let allSubscriptions = [];
      let hasMore = true;
      let startingAfter = null;
      
      console.log(`${colors.yellow}🔍 Obteniendo suscripciones desde Stripe...${colors.reset}`);
      
      while (hasMore) {
        const params = {
          limit: 100,
          status: status,
          expand: [
            'data.customer',
            'data.default_payment_method',
            'data.items.data.price'
          ]
        };
        
        if (startingAfter) {
          params.starting_after = startingAfter;
        }
        
        const batch = await this.stripe.subscriptions.list(params);
        allSubscriptions = allSubscriptions.concat(batch.data);
        
        hasMore = batch.has_more;
        if (hasMore && batch.data.length > 0) {
          startingAfter = batch.data[batch.data.length - 1].id;
        }
        
        // Mostrar progreso
        process.stdout.write(`\r${colors.cyan}📦 Obtenidas: ${allSubscriptions.length} suscripciones...${colors.reset}`);
      }
      
      console.log(''); // Nueva línea
      console.log(`${colors.green}✅ Total obtenidas: ${allSubscriptions.length} suscripciones${colors.reset}`);
      console.log('');
      
      return allSubscriptions;
    } catch (error) {
      console.error(`${colors.red}❌ Error obteniendo suscripciones:${colors.reset}`, error.message);
      throw error;
    }
  }

  // Formatear fecha desde timestamp Unix
  formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatear precio
  formatPrice(amount, currency) {
    if (!amount) return 'N/A';
    const formatted = (amount / 100).toFixed(2);
    return `${formatted} ${currency?.toUpperCase() || 'USD'}`;
  }

  // Obtener color para el estado
  getStatusColor(status) {
    switch (status) {
      case 'active': return colors.green;
      case 'canceled': return colors.red;
      case 'past_due': return colors.yellow;
      case 'incomplete': return colors.magenta;
      case 'trialing': return colors.cyan;
      default: return colors.white;
    }
  }

  // Listar suscripciones en formato tabla
  async listSubscriptions(subscriptions, detailed = false) {
    if (subscriptions.length === 0) {
      console.log(`${colors.yellow}⚠️ No se encontraron suscripciones${colors.reset}`);
      return;
    }

    console.log(`${colors.bright}📋 LISTA DE SUSCRIPCIONES${colors.reset}`);
    console.log('='.repeat(80));
    
    for (let index = 0; index < subscriptions.length; index++) {
      const sub = subscriptions[index];
      const statusColor = this.getStatusColor(sub.status);
      const customer = sub.customer;
      const price = sub.items.data[0]?.price;
      
      console.log(`${colors.bright}${index + 1}. ${sub.id}${colors.reset}`);
      console.log(`   ${statusColor}● Estado: ${sub.status.toUpperCase()}${colors.reset}`);
      
      if (customer) {
        console.log(`   👤 Cliente: ${customer.name || customer.email || customer.id}`);
        if (customer.email) console.log(`   📧 Email: ${customer.email}`);
      }
      
      // Obtener información del producto si tenemos el ID
      if (price && price.product && typeof price.product === 'string') {
        try {
          const product = await this.stripe.products.retrieve(price.product);
          console.log(`   📦 Producto: ${product.name || 'Sin nombre'}`);
        } catch (error) {
          console.log(`   📦 Producto ID: ${price.product}`);
        }
      } else if (price && typeof price.product === 'object') {
        console.log(`   📦 Producto: ${price.product.name || 'Sin nombre'}`);
      }
      
      if (price) {
        console.log(`   💰 Precio: ${this.formatPrice(price.unit_amount, price.currency)}`);
        console.log(`   🔄 Frecuencia: ${price.recurring?.interval || 'N/A'}`);
      }
      
      console.log(`   📅 Creado: ${this.formatDate(sub.created)}`);
      console.log(`   📅 Período actual: ${this.formatDate(sub.current_period_start)} - ${this.formatDate(sub.current_period_end)}`);
      
      if (detailed) {
        console.log(`   🔧 Colección: ${sub.collection_method || 'charge_automatically'}`);
        if (sub.canceled_at) {
          console.log(`   ❌ Cancelado: ${this.formatDate(sub.canceled_at)}`);
        }
        if (sub.trial_end) {
          console.log(`   🎯 Fin de prueba: ${this.formatDate(sub.trial_end)}`);
        }
        if (Object.keys(sub.metadata).length > 0) {
          console.log(`   🏷️ Metadata: ${JSON.stringify(sub.metadata, null, 4)}`);
        }
      }
      
      console.log('');
    }
  }

  // Mostrar estadísticas
  showStats(subscriptions) {
    const stats = {
      total: subscriptions.length,
      active: 0,
      canceled: 0,
      past_due: 0,
      incomplete: 0,
      trialing: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0
    };

    subscriptions.forEach(sub => {
      stats[sub.status] = (stats[sub.status] || 0) + 1;
      
      const price = sub.items.data[0]?.price;
      if (price && sub.status === 'active') {
        const amount = price.unit_amount / 100;
        stats.totalRevenue += amount;
        
        if (price.recurring?.interval === 'month') {
          stats.monthlyRevenue += amount;
          stats.annualRevenue += amount * 12;
        } else if (price.recurring?.interval === 'year') {
          stats.annualRevenue += amount;
          stats.monthlyRevenue += amount / 12;
        }
      }
    });

    console.log(`${colors.bright}📊 ESTADÍSTICAS${colors.reset}`);
    console.log('='.repeat(50));
    console.log(`${colors.cyan}📈 Total de suscripciones: ${colors.bright}${stats.total}${colors.reset}`);
    console.log(`${colors.green}✅ Activas: ${stats.active}${colors.reset}`);
    console.log(`${colors.red}❌ Canceladas: ${stats.canceled}${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Vencidas: ${stats.past_due}${colors.reset}`);
    console.log(`${colors.magenta}⏳ Incompletas: ${stats.incomplete}${colors.reset}`);
    console.log(`${colors.cyan}🎯 En prueba: ${stats.trialing}${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}💰 INGRESOS (solo suscripciones activas):${colors.reset}`);
    console.log(`   Mensual estimado: $${stats.monthlyRevenue.toFixed(2)}`);
    console.log(`   Anual estimado: $${stats.annualRevenue.toFixed(2)}`);
    console.log('');
  }

  // Filtrar suscripciones
  filterSubscriptions(subscriptions, filters) {
    return subscriptions.filter(sub => {
      if (filters.status && sub.status !== filters.status) return false;
      if (filters.customer && !sub.customer?.email?.includes(filters.customer)) return false;
      if (filters.product && !sub.items.data[0]?.price?.product?.name?.toLowerCase().includes(filters.product.toLowerCase())) return false;
      return true;
    });
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const lister = new StripeSubscriptionLister();
  
  // Parsear argumentos
  const options = {
    status: 'all',
    detailed: false,
    stats: false,
    customer: null,
    product: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--status':
      case '-s':
        options.status = args[++i];
        break;
      case '--detailed':
      case '-d':
        options.detailed = true;
        break;
      case '--stats':
        options.stats = true;
        break;
      case '--customer':
      case '-c':
        options.customer = args[++i];
        break;
      case '--product':
      case '-p':
        options.product = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  // Mostrar ayuda
  if (options.help) {
    console.log(`${colors.bright}🚀 SCRIPT DE LISTADO DE SUSCRIPCIONES DE STRIPE${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Uso: node list-stripe-subscriptions.js [opciones]${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Opciones:${colors.reset}`);
    console.log(`  -s, --status <estado>     Filtrar por estado (all, active, canceled, past_due, etc.)`);
    console.log(`  -c, --customer <email>    Filtrar por email del cliente`);
    console.log(`  -p, --product <nombre>    Filtrar por nombre del producto`);
    console.log(`  -d, --detailed           Mostrar información detallada`);
    console.log(`  --stats                  Mostrar solo estadísticas`);
    console.log(`  -h, --help               Mostrar esta ayuda`);
    console.log('');
    console.log(`${colors.bright}Ejemplos:${colors.reset}`);
    console.log(`  node list-stripe-subscriptions.js`);
    console.log(`  node list-stripe-subscriptions.js --status active`);
    console.log(`  node list-stripe-subscriptions.js --customer john@example.com`);
    console.log(`  node list-stripe-subscriptions.js --detailed --stats`);
    console.log('');
    return;
  }

  try {
    console.log(`${colors.bright}🚀 INICIANDO LISTADO DE SUSCRIPCIONES DE STRIPE${colors.reset}`);
    console.log('='.repeat(60));
    console.log('');

    // Cargar configuración
    await lister.loadStripeConfig();

    // Obtener suscripciones
    let subscriptions = await lister.getAllSubscriptions(options.status);

    // Aplicar filtros adicionales
    const filters = {
      customer: options.customer,
      product: options.product
    };

    if (filters.customer || filters.product) {
      const originalCount = subscriptions.length;
      subscriptions = lister.filterSubscriptions(subscriptions, filters);
      console.log(`${colors.yellow}🔍 Filtros aplicados. Mostrando ${subscriptions.length} de ${originalCount} suscripciones${colors.reset}`);
      console.log('');
    }

    // Mostrar estadísticas si se solicita
    if (options.stats) {
      lister.showStats(subscriptions);
    }

    // Listar suscripciones si no es solo estadísticas
    if (!options.stats || subscriptions.length <= 20) {
      await lister.listSubscriptions(subscriptions, options.detailed);
    }

    // Mostrar estadísticas al final si hay muchas suscripciones
    if (!options.stats && subscriptions.length > 5) {
      lister.showStats(subscriptions);
    }

    console.log(`${colors.green}✅ Proceso completado exitosamente${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Error ejecutando el script:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = StripeSubscriptionLister; 