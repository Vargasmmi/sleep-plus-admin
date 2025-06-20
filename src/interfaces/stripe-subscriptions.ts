// Extensión de las interfaces existentes para incluir campos de Stripe

import { ISubscription as BaseSubscription } from './index';

// Extender la interfaz ISubscription con campos de Stripe
export interface ISubscriptionWithStripe extends BaseSubscription {
  // IDs de Stripe
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripePaymentMethodId?: string;
  stripeSubscriptionItemId?: string;
  
  // Estado y fechas de Stripe
  stripeStatus?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
  stripeCurrentPeriodStart?: string;
  stripeCurrentPeriodEnd?: string;
  stripeCancelAtPeriodEnd?: boolean;
  stripeTrialEnd?: string;
  
  // Información de pago
  stripeLatestInvoiceId?: string;
  stripeLatestInvoiceStatus?: string;
  stripeDefaultPaymentMethod?: {
    id: string;
    type: string;
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  };
  
  // Metadatos
  stripeSyncedAt?: string;
  stripeCreatedAt?: string;
}

// Extender la interfaz ICustomer con campos de Stripe
export interface ICustomerWithStripe {
  stripeCustomerId?: string;
  stripeDefaultPaymentMethodId?: string;
  stripePaymentMethods?: Array<{
    id: string;
    type: string;
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
    isDefault: boolean;
  }>;
  stripeSyncedAt?: string;
}

// Tipos para los webhooks de Stripe
export interface StripeWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: any;
    previous_attributes?: any;
  };
}

// Mapeo de estados entre sistemas
export const SUBSCRIPTION_STATUS_MAP = {
  // Stripe -> Sistema Local
  fromStripe: {
    'active': 'active' as const,
    'past_due': 'active' as const, // Pero marcar para seguimiento
    'unpaid': 'paused' as const,
    'canceled': 'cancelled' as const,
    'incomplete': 'pending' as const,
    'incomplete_expired': 'cancelled' as const,
    'trialing': 'active' as const,
    'paused': 'paused' as const
  },
  // Sistema Local -> Stripe
  toStripe: {
    'active': 'active' as const,
    'paused': 'paused' as const,
    'cancelled': 'canceled' as const,
    'pending': 'incomplete' as const
  }
};

// Configuración de productos y precios
export const STRIPE_PRODUCTS = {
  basic: {
    id: '', // Se llenará con el ID real de Stripe
    name: 'Sleep+ Basic',
    description: 'Plan básico de protección de colchón',
    metadata: {
      plan: 'basic',
      cleanings: '4',
      inspections: '1',
      protection: 'false'
    }
  },
  premium: {
    id: '', // Se llenará con el ID real de Stripe
    name: 'Sleep+ Premium',
    description: 'Plan premium con protección completa',
    metadata: {
      plan: 'premium',
      cleanings: '8',
      inspections: '2',
      protection: 'true'
    }
  },
  elite: {
    id: '', // Se llenará con el ID real de Stripe
    name: 'Sleep+ Elite',
    description: 'Plan elite con máxima protección y Trade & Sleep',
    metadata: {
      plan: 'elite',
      cleanings: '12',
      inspections: '4',
      protection: 'true',
      tradeAndSleep: 'true'
    }
  }
};

// IDs de precios en Stripe (se llenarán con los IDs reales)
export const STRIPE_PRICE_IDS = {
  basic_monthly: '',
  basic_annual: '',
  premium_monthly: '',
  premium_annual: '',
  elite_monthly: '',
  elite_annual: ''
};

// Helper para obtener el price ID correcto
export const getStripePriceId = (
  plan: 'basic' | 'premium' | 'elite',
  frequency: 'monthly' | 'annual'
): string => {
  const key = `${plan}_${frequency}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[key];
};

// Tipos para pagos y facturas
export interface StripePayment {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  stripePaymentIntentId: string;
  stripeInvoiceId: string;
  stripeChargeId?: string;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
}

// Tipo para el historial de cambios de suscripción
export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  action: 'created' | 'upgraded' | 'downgraded' | 'paused' | 'resumed' | 'cancelled' | 'payment_failed' | 'payment_succeeded';
  previousPlan?: string;
  newPlan?: string;
  previousStatus?: string;
  newStatus?: string;
  metadata?: Record<string, any>;
  performedBy: string; // employeeId o 'system' para acciones automáticas
  createdAt: string;
}