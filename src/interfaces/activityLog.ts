// Interface for Activity Logs
export interface IActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import';
  resource: string;
  resourceId: string | null;
  details: {
    [key: string]: any;
  };
  metadata?: {
    [key: string]: any;
  };
  timestamp: string;
}

// Interface for Webhooks
export interface IWebhook {
  id: string;
  source: 'shopify' | 'internal' | 'other';
  event: string;
  status: 'pending' | 'processed' | 'failed' | 'retrying';
  receivedAt: string;
  processedAt: string | null;
  attempts: number;
  headers: {
    [key: string]: string;
  };
  payload: any;
  response: {
    status: number;
    message: string;
    [key: string]: any;
  } | null;
  error: {
    code: string;
    message: string;
    timestamp: string;
  } | null;
}

// Interface for Webhook Events Configuration
export interface IWebhookEvent {
  id: string;
  source: 'shopify' | 'internal' | 'other';
  event: string;
  enabled: boolean;
  endpoint: string;
  description: string;
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Tipos de acciones para el activity log
export const ACTIVITY_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  SYNC: 'sync',
  APPROVE: 'approve',
  REJECT: 'reject',
  SEND_EMAIL: 'send_email',
  MAKE_CALL: 'make_call',
  CHANGE_STATUS: 'change_status'
} as const;

// Tipos de recursos para el activity log
export const ACTIVITY_RESOURCES = {
  AUTH: 'auth',
  CUSTOMERS: 'customers',
  SUBSCRIPTIONS: 'subscriptions',
  EVALUATIONS: 'evaluations',
  EMPLOYEES: 'employees',
  STORES: 'stores',
  CALLS: 'calls',
  SALES: 'sales',
  CAMPAIGNS: 'campaigns',
  COMMISSIONS: 'commissions',
  ACHIEVEMENTS: 'achievements',
  SCRIPTS: 'scripts',
  SHOPIFY_SETTINGS: 'shopifySettings',
  SHOPIFY_PRODUCTS: 'shopifyProducts',
  SHOPIFY_CUSTOMERS: 'shopifyCustomers',
  SHOPIFY_COUPONS: 'shopifyCoupons',
  WEBHOOKS: 'webhooks',
  REPORTS: 'reports'
} as const;
