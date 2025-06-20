const stripe = require('stripe');
const fs = require('fs').promises;
const path = require('path');

class StripeService {
  constructor() {
    this.stripe = null;
    this.config = null;
    this.dbPath = path.join(__dirname, '..', 'db.json');
  }

  // Inicializar Stripe con configuración
  async initialize(config) {
    if (!config || !config.secretKey) {
      throw new Error('Configuración de Stripe requerida');
    }

    this.config = config;
    this.stripe = stripe(config.secretKey);
    
    console.log(`🔌 Stripe inicializado en modo: ${config.testMode ? 'TEST' : 'LIVE'}`);
    return true;
  }

  // Leer base de datos
  async readDatabase() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error leyendo database:', error);
      throw error;
    }
  }

  // Escribir base de datos
  async writeDatabase(data) {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error escribiendo database:', error);
      throw error;
    }
  }

  // Obtener configuración de Stripe
  async getConfig() {
    const db = await this.readDatabase();
    return db.stripeConfig?.[0] || null;
  }

  // Guardar configuración de Stripe
  async saveConfig(config) {
    const db = await this.readDatabase();
    
    if (!db.stripeConfig) {
      db.stripeConfig = [];
    }

    const existingConfig = db.stripeConfig.find(c => c.id === config.id);
    if (existingConfig) {
      Object.assign(existingConfig, { ...config, updatedAt: new Date().toISOString() });
    } else {
      db.stripeConfig.push({
        ...config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await this.writeDatabase(db);
    return config;
  }

  // Crear customer en Stripe
  async createCustomer(customerData) {
    if (!this.stripe) {
      throw new Error('Stripe no inicializado');
    }

    try {
      const stripeCustomer = await this.stripe.customers.create({
        email: customerData.email,
        name: `${customerData.firstName} ${customerData.lastName}`,
        phone: customerData.phone,
        metadata: {
          internalCustomerId: customerData.id,
          customerTier: customerData.tier || 'standard',
          source: 'sleep_plus_admin'
        }
      });

      // Guardar relación en base de datos
      const db = await this.readDatabase();
      if (!db.stripeCustomers) {
        db.stripeCustomers = [];
      }

      db.stripeCustomers.push({
        id: `str-cust-${Date.now()}`,
        customerId: customerData.id,
        stripeCustomerId: stripeCustomer.id,
        email: customerData.email,
        name: `${customerData.firstName} ${customerData.lastName}`,
        phone: customerData.phone,
        metadata: stripeCustomer.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString()
      });

      await this.writeDatabase(db);
      return stripeCustomer;
    } catch (error) {
      console.error('Error creando customer en Stripe:', error);
      throw error;
    }
  }

  // Crear Payment Link
  async createPaymentLink(paymentLinkData) {
    if (!this.stripe) {
      throw new Error('Stripe no inicializado');
    }

    try {
      // Crear product en Stripe
      const product = await this.stripe.products.create({
        name: paymentLinkData.productName,
        description: paymentLinkData.description,
        metadata: paymentLinkData.metadata || {}
      });

      // Crear price en Stripe
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(paymentLinkData.amount * 100), // Convertir a centavos
        currency: paymentLinkData.currency.toLowerCase(),
        metadata: paymentLinkData.metadata || {}
      });

      // Crear payment link en Stripe
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{
          price: price.id,
          quantity: 1
        }],
        allow_promotion_codes: paymentLinkData.settings?.allowPromotionCodes ?? true,
        billing_address_collection: paymentLinkData.settings?.collectBillingAddress ? 'required' : 'auto',
        customer_creation: 'if_required',
        metadata: {
          ...paymentLinkData.metadata,
          customerId: paymentLinkData.customerId,
          internalId: paymentLinkData.id
        }
      });

      // Actualizar en base de datos
      const db = await this.readDatabase();
      const existingLink = db.paymentLinks.find(pl => pl.id === paymentLinkData.id);
      
      if (existingLink) {
        existingLink.stripePaymentLinkId = paymentLink.id;
        existingLink.url = paymentLink.url;
        existingLink.status = 'active';
        existingLink.updatedAt = new Date().toISOString();
      }

      await this.writeDatabase(db);
      return paymentLink;
    } catch (error) {
      console.error('Error creando payment link en Stripe:', error);
      throw error;
    }
  }

  // Crear suscripción
  async createSubscription(subscriptionData) {
    if (!this.stripe) {
      throw new Error('Stripe no inicializado');
    }

    try {
      // Verificar si el customer existe en Stripe
      let stripeCustomerId = subscriptionData.stripeCustomerId;
      
      if (!stripeCustomerId) {
        // Buscar customer en nuestra base de datos
        const db = await this.readDatabase();
        const customer = db.customers.find(c => c.id === subscriptionData.customerId);
        const stripeCustomer = db.stripeCustomers.find(sc => sc.customerId === subscriptionData.customerId);
        
        if (stripeCustomer) {
          stripeCustomerId = stripeCustomer.stripeCustomerId;
        } else if (customer) {
          // Crear customer en Stripe
          const newStripeCustomer = await this.createCustomer(customer);
          stripeCustomerId = newStripeCustomer.id;
        } else {
          throw new Error('Customer not found');
        }
      }

      // Crear suscripción en Stripe
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price: subscriptionData.stripePriceId
        }],
        metadata: {
          ...subscriptionData.metadata,
          customerId: subscriptionData.customerId,
          internalId: subscriptionData.id
        }
      });

      // Actualizar en base de datos
      const db = await this.readDatabase();
      const existingSub = db.stripeSubscriptions.find(ss => ss.id === subscriptionData.id);
      
      if (existingSub) {
        existingSub.stripeSubscriptionId = subscription.id;
        existingSub.stripeCustomerId = stripeCustomerId;
        existingSub.status = subscription.status;
        existingSub.currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
        existingSub.currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        existingSub.updatedAt = new Date().toISOString();
      }

      await this.writeDatabase(db);
      return subscription;
    } catch (error) {
      console.error('Error creando suscripción en Stripe:', error);
      throw error;
    }
  }

  // Procesar webhook
  async processWebhook(payload, signature) {
    if (!this.stripe || !this.config?.webhookSecret) {
      throw new Error('Stripe webhook no configurado');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      console.log(`📡 Webhook recibido: ${event.type}`);

      // Guardar webhook en base de datos
      const db = await this.readDatabase();
      if (!db.stripeWebhooks) {
        db.stripeWebhooks = [];
      }

      const webhookRecord = {
        id: `wh-${Date.now()}`,
        eventType: event.type,
        stripeEventId: event.id,
        processed: false,
        processedAt: null,
        attempts: 0,
        lastAttemptAt: null,
        error: null,
        data: event.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.stripeWebhooks.push(webhookRecord);
      await this.writeDatabase(db);

      // Procesar evento
      await this.handleWebhookEvent(event, webhookRecord.id);

      return { received: true, eventId: event.id };
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }

  // Manejar eventos de webhook
  async handleWebhookEvent(event, webhookId) {
    const db = await this.readDatabase();
    const webhookRecord = db.stripeWebhooks.find(w => w.id === webhookId);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        
        default:
          console.log(`Evento no manejado: ${event.type}`);
      }

      // Marcar webhook como procesado
      if (webhookRecord) {
        webhookRecord.processed = true;
        webhookRecord.processedAt = new Date().toISOString();
        await this.writeDatabase(db);
      }

    } catch (error) {
      console.error(`Error procesando evento ${event.type}:`, error);
      
      if (webhookRecord) {
        webhookRecord.error = error.message;
        webhookRecord.attempts += 1;
        webhookRecord.lastAttemptAt = new Date().toISOString();
        await this.writeDatabase(db);
      }
      
      throw error;
    }
  }

  // Manejar pago exitoso
  async handlePaymentSuccess(paymentIntent) {
    const db = await this.readDatabase();
    
    // Buscar payment link relacionado
    const paymentLink = db.paymentLinks.find(pl => 
      pl.metadata?.stripePaymentIntentId === paymentIntent.id
    );

    if (paymentLink) {
      paymentLink.status = 'completed';
      paymentLink.completedAt = new Date().toISOString();
      await this.writeDatabase(db);
    }

    console.log(`✅ Pago exitoso procesado: ${paymentIntent.id}`);
  }

  // Manejar actualización de suscripción
  async handleSubscriptionUpdate(subscription) {
    const db = await this.readDatabase();
    
    const stripeSubscription = db.stripeSubscriptions.find(ss => 
      ss.stripeSubscriptionId === subscription.id
    );

    if (stripeSubscription) {
      stripeSubscription.status = subscription.status;
      stripeSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
      stripeSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      stripeSubscription.updatedAt = new Date().toISOString();
      
      // También actualizar la suscripción principal
      const mainSubscription = db.subscriptions.find(s => 
        s.billing?.stripeSubscriptionId === subscription.id
      );
      
      if (mainSubscription) {
        mainSubscription.status = subscription.status === 'active' ? 'active' : 
                                subscription.status === 'canceled' ? 'cancelled' : 
                                subscription.status;
        mainSubscription.billing.nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();
        mainSubscription.updatedAt = new Date().toISOString();
      }

      await this.writeDatabase(db);
    }

    console.log(`🔄 Suscripción actualizada: ${subscription.id}`);
  }

  // Manejar cancelación de suscripción
  async handleSubscriptionCancellation(subscription) {
    const db = await this.readDatabase();
    
    const stripeSubscription = db.stripeSubscriptions.find(ss => 
      ss.stripeSubscriptionId === subscription.id
    );

    if (stripeSubscription) {
      stripeSubscription.status = 'canceled';
      stripeSubscription.canceledAt = new Date().toISOString();
      stripeSubscription.updatedAt = new Date().toISOString();
      
      // También actualizar la suscripción principal
      const mainSubscription = db.subscriptions.find(s => 
        s.billing?.stripeSubscriptionId === subscription.id
      );
      
      if (mainSubscription) {
        mainSubscription.status = 'cancelled';
        mainSubscription.cancelledAt = new Date().toISOString();
        mainSubscription.updatedAt = new Date().toISOString();
      }

      await this.writeDatabase(db);
    }

    console.log(`❌ Suscripción cancelada: ${subscription.id}`);
  }

  // Manejar fallo de pago
  async handlePaymentFailure(invoice) {
    const db = await this.readDatabase();
    
    const subscription = db.subscriptions.find(s => 
      s.billing?.stripeSubscriptionId === invoice.subscription
    );

    if (subscription) {
      subscription.status = 'past_due';
      subscription.updatedAt = new Date().toISOString();
      await this.writeDatabase(db);
    }

    console.log(`⚠️ Fallo de pago procesado: ${invoice.id}`);
  }

  // Obtener estadísticas
  async getStats() {
    const db = await this.readDatabase();
    
    const paymentLinks = db.paymentLinks || [];
    const subscriptions = db.stripeSubscriptions || [];
    const webhooks = db.stripeWebhooks || [];

    return {
      paymentLinks: {
        total: paymentLinks.length,
        active: paymentLinks.filter(pl => pl.status === 'active').length,
        completed: paymentLinks.filter(pl => pl.status === 'completed').length
      },
      subscriptions: {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        canceled: subscriptions.filter(s => s.status === 'canceled').length
      },
      webhooks: {
        total: webhooks.length,
        processed: webhooks.filter(w => w.processed).length,
        pending: webhooks.filter(w => !w.processed).length
      }
    };
  }
}

module.exports = StripeService; 