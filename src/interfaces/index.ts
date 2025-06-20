// Customer Interfaces
export interface ICustomer {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  tier: "gold" | "silver" | "bronze";
  source: "store" | "online" | "phone" | "referral";
  tags: string[];
  lifetimeValue: number;
  firstPurchaseDate?: string;
  lastPurchaseDate?: string;
  lastContactDate?: string;
  purchasedItems: string[];
  isEliteMember: boolean;
  membershipStatus: "active" | "inactive";
  totalTrades: number;
  totalCreditEarned: number;
  currentCredit: number;
  doNotCall: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Export all system interfaces
export * from './system';

// Subscription Interfaces
export interface ISubscription {
  id: string;
  customerId: string;
  plan: "basic" | "premium" | "elite";
  status: "active" | "paused" | "cancelled" | "pending";
  pricing: {
    monthly: number;
    annual?: number;
    currency: string;
  };
  billing: {
    frequency: "monthly" | "annual";
    nextBillingDate: string;
    paymentMethod: "card" | "ach" | "cash" | "stripe";
    lastFour?: string;
    // Stripe Integration Fields
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
  };
  services: {
    cleaningsTotal: number;
    cleaningsUsed: number;
    protectionActive: boolean;
    inspectionsTotal: number;
    inspectionsUsed: number;
  };
  credits: {
    accumulated: number;
    used: number;
    expiration?: string;
  };
  startDate: string;
  pausedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  soldBy: string;
  createdAt: string;
  updatedAt: string;
}

// Evaluation Interfaces
export interface IEvaluation {
  id: string;
  customerId: string;
  mattress: {
    brand: string;
    model?: string;
    size: string;
    age: number;
    condition: "excellent" | "good" | "fair" | "poor";
  };
  photos: Array<{
    filename: string;
    url: string;
    uploadDate: string;
  }>;
  aiEvaluation: {
    conditionScore: number;
    brandScore: number;
    ageScore: number;
    sizeScore: number;
    finalScore: number;
    confidence: number;
  };
  creditApproved: number;
  status: "pending" | "approved" | "redeemed" | "expired";
  employeeId?: string;
  storeId?: string;
  createdAt: string;
  expiresAt: string;
  redeemedAt?: string;
  updatedAt: string;
}

// Employee Interfaces
export interface IEmployee {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "agent";
  storeId: string;
  phoneExtension?: string;
  avatar?: string;
  status: "active" | "inactive" | "break" | "calling";
  shift: "morning" | "afternoon" | "full";
  hiredAt: string;
  commissions?: {
    totalEvaluations: number;
    totalCommissionEarned: number;
    currentMonthEvaluations: number;
    currentMonthCommission: number;
  };
  performance?: {
    callsToday: number;
    callsTarget: number;
    conversionsToday: number;
    conversionRate: number;
    averageCallDuration: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Store Interfaces
export interface IStore {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  managerId: string;
  hours: {
    [key: string]: { open: string; close: string };
  };
  serviceArea: {
    zipCodes: string[];
    radius: number;
  };
  performance: {
    monthlyTarget: number;
    currentSales: number;
  };
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

// Call Interfaces
export interface ICall {
  id: string;
  customerId: string;
  userId: string;
  type: "outbound" | "inbound";
  status: "completed" | "no_answer" | "busy" | "failed" | "voicemail";
  disposition: "interested" | "not_interested" | "callback" | "wrong_number" | "sale" | "other";
  duration: number;
  recordingUrl?: string;
  startTime: string;
  endTime: string;
  notes?: string;
  script: {
    id: string;
    name: string;
    version: string;
  };
  objections: string[];
  nextAction?: {
    type: "callback" | "email" | "none";
    scheduledFor?: string;
    notes?: string;
  };
  metadata: {
    waitTime?: number;
    transferredTo?: string;
    campaignId?: string;
  };
  createdAt: string;
}

// Sale Interfaces
export interface ISale {
  id: string;
  subscriptionId?: string;
  customerId: string;
  userId: string;
  storeId: string;
  type: "new" | "renewal" | "upgrade" | "winback";
  channel: "phone" | "store" | "online";
  amount: {
    gross: number;
    discount: number;
    net: number;
    tax: number;
    total: number;
  };
  commission: {
    base: number;
    bonus: number;
    total: number;
    status: "pending" | "approved" | "paid";
  };
  contract: {
    signed: boolean;
    signedAt?: string;
    documentUrl?: string;
  };
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  callId?: string;
  createdAt: string;
  updatedAt: string;
}

// Campaign Interfaces
export interface ICampaign {
  id: string;
  name: string;
  type: "retention" | "winback" | "upgrade" | "seasonal";
  status: "draft" | "active" | "paused" | "completed";
  targeting: {
    customerTiers: ("gold" | "silver" | "bronze")[];
    lastPurchaseRange: {
      min: number;
      max: number;
    };
    productTypes?: string[];
    hasSubscription?: boolean;
  };
  script: {
    opening: string;
    valueProps: string[];
    objectionHandlers?: Record<string, string>;
    closing: string;
  };
  offer: {
    type: "percentage" | "fixed" | "freeMonth" | "upgrade";
    value: number;
    validUntil: string;
  };
  metrics: {
    totalCalls: number;
    contacted: number;
    converted: number;
    revenue: number;
  };
  assignedTo: string[];
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Achievement Interfaces
export interface IAchievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: "sales" | "calls" | "quality" | "team";
  criteria: {
    type: "count" | "percentage" | "streak" | "total";
    metric: string;
    target: number;
    timeframe?: "day" | "week" | "month" | "all_time";
  };
  rewards: {
    points: number;
    bonus?: number;
    badge: boolean;
  };
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlockedBy: Array<{
    userId: string;
    unlockedAt: string;
  }>;
  createdAt: string;
}

// Script Interfaces
export interface IScript {
  id: string;
  name: string;
  type: "cold" | "warm" | "winback" | "renewal";
  version: string;
  status: "draft" | "active" | "archived";
  segments: Array<{
    id: string;
    type: "opening" | "discovery" | "pitch" | "close" | "objection";
    content: string;
    conditions?: {
      customerTier?: string[];
      productAge?: { min: number; max: number };
      hasSubscription?: boolean;
    };
    branches?: Array<{
      condition: string;
      nextSegmentId: string;
    }>;
  }>;
  variables: string[];
  successRate?: number;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Commission Interfaces
export interface ICommission {
  id: string;
  userId: string;
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  earnings: {
    baseSales: number;
    bonuses: {
      conversion: number;
      volume: number;
      retention: number;
      other: number;
    };
    deductions: number;
    total: number;
  };
  sales: {
    count: number;
    revenue: number;
    saleIds: string[];
  };
  status: "calculating" | "pending_approval" | "approved" | "paid";
  paidAt?: string;
  paymentMethod?: "payroll" | "direct_deposit" | "check";
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}
