// Interfaces for new system entities

export interface ISystemSettings {
  id: string;
  dailyCallGoal: number;
  workingHours: {
    start: string;
    end: string;
  };
  overdueNotificationTime: string;
  autoAssignCustomers: boolean;
  competitionMode: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface IRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  permissions: string[]; // Array of permission IDs
  createdAt: string;
  updatedAt: string;
}

export interface IPermission {
  id: string;
  resource: string;
  action: 'list' | 'create' | 'edit' | 'delete' | 'view' | 'show';
  roleId: string;
  allowed: boolean;
}

export interface IUserPermissionOverride {
  id: string;
  userId: string;
  permissions: {
    resource: string;
    action: string;
    allowed: boolean;
  }[];
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface IDailyGoal {
  id: string;
  employeeId: string;
  date: string;
  targetCalls: number;
  completedCalls: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedCustomers: string[];
  completedCustomers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICallTask {
  id: string;
  employeeId: string;
  customerId: string;
  assignedAt: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'skipped';
  notes?: string;
  callId?: string;
}

// Extended interfaces for existing entities
export interface IEmployeeWithGoals extends IEmployee {
  todayGoal?: IDailyGoal;
  pendingTasks?: ICallTask[];
}

export interface IEmployeeStats {
  employeeId: string;
  date: string;
  callsCompleted: number;
  callsTarget: number;
  conversions: number;
  conversionRate: number;
  averageCallDuration: number;
  commission: number;
  rank: number;
  achievement: 'below' | 'meeting' | 'exceeding';
}

export interface ILeaderboard {
  daily: IEmployeeStats[];
  weekly: IEmployeeStats[];
  monthly: IEmployeeStats[];
  allTime: IEmployeeStats[];
}
