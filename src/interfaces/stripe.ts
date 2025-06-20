export interface StripeConfig {
  id: string;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  testMode: boolean;
  enabledFeatures: {
    paymentLinks: boolean;
    subscriptions: boolean;
    oneTimePayments: boolean;
    webhooks: boolean;
  };
  settings?: {
    automaticTax: boolean;
    collectBillingAddress: boolean;
    allowPromotionCodes: boolean;
    submitType: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PaymentLink {
  id: string;
  stripePaymentLinkId: string;
  customerId: string;
  customerEmail: string;
  productName: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'active' | 'inactive' | 'completed' | 'expired';
  type: 'one_time' | 'subscription';
  url: string;
  metadata: Record<string, any>;
  settings: {
    allowPromotionCodes: boolean;
    collectBillingAddress: boolean;
    collectCustomerName: boolean;
    submitType: 'auto' | 'pay' | 'book';
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  expiresAt?: string;
  completedAt?: string;
}

export interface StripeSubscription {
  id: string;
  stripeSubscriptionId: string;
  customerId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeProductId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  plan: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  amount: number;
  currency: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface StripeWebhook {
  id: string;
  eventType: string;
  stripeEventId: string;
  processed: boolean;
  processedAt: string | null;
  attempts: number;
  lastAttemptAt: string | null;
  error: string | null;
  data: Record<string, any>;
  relatedResource?: {
    type: 'payment_link' | 'subscription' | 'customer';
    id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StripeCustomer {
  id: string;
  customerId: string;
  stripeCustomerId: string;
  email: string;
  name: string;
  phone: string;
  defaultPaymentMethodId: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
}

export interface StripeStats {
  paymentLinks: {
    total: number;
    active: number;
    completed: number;
  };
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
  };
  webhooks: {
    total: number;
    processed: number;
    pending: number;
    today: number;
  };
}

export interface CreatePaymentLinkRequest {
  customerId: string;
  productName: string;
  description: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentLinkResponse {
  success: boolean;
  message: string;
  paymentLink: PaymentLink;
  url: string;
}

export interface StripeConfigResponse {
  success: boolean;
  configured: boolean;
  config?: StripeConfig;
  message?: string;
}

export interface StripeApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
} 