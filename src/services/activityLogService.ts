import axios from 'axios';
import { IActivityLog, ACTIVITY_ACTIONS, ACTIVITY_RESOURCES } from '../interfaces/activityLog';
import { authProvider } from '../providers/authProvider';

class ActivityLogService {
  private baseUrl = '';

  /**
   * Registra una actividad del usuario
   */
  async log(
    action: string,
    resource: string,
    resourceId: string | null = null,
    details: any = {},
    metadata: any = {}
  ): Promise<void> {
    try {
      // Obtener información del usuario actual
      const user = await authProvider.getIdentity?.();
      
      if (!user) {
        console.warn('No user found for activity logging');
        return;
      }

      const activityLog: Omit<IActivityLog, 'id'> = {
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        action,
        resource,
        resourceId,
        details,
        metadata,
        timestamp: new Date().toISOString()
      };

      // Generar ID único
      const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Guardar en la base de datos
      await axios.post(`${this.baseUrl}/activityLogs`, {
        ...activityLog,
        id
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // No lanzar error para no interrumpir la operación principal
    }
  }

  /**
   * Registra un login
   */
  async logLogin(details: any = {}): Promise<void> {
    const userAgent = navigator.userAgent;
    const detailsWithUA = {
      ...details,
      userAgent,
      timestamp: new Date().toISOString()
    };
    
    await this.log(ACTIVITY_ACTIONS.LOGIN, ACTIVITY_RESOURCES.AUTH, null, detailsWithUA);
  }

  /**
   * Registra un logout
   */
  async logLogout(): Promise<void> {
    await this.log(ACTIVITY_ACTIONS.LOGOUT, ACTIVITY_RESOURCES.AUTH);
  }

  /**
   * Registra una creación
   */
  async logCreate(resource: string, resourceId: string, details: any = {}): Promise<void> {
    await this.log(ACTIVITY_ACTIONS.CREATE, resource, resourceId, details);
  }

  /**
   * Registra una actualización
   */
  async logUpdate(
    resource: string, 
    resourceId: string, 
    changes: any, 
    previousData?: any
  ): Promise<void> {
    const details = {
      changes,
      fields: Object.keys(changes)
    };
    
    const metadata = previousData ? { previousData } : {};
    
    await this.log(ACTIVITY_ACTIONS.UPDATE, resource, resourceId, details, metadata);
  }

  /**
   * Registra una eliminación
   */
  async logDelete(resource: string, resourceId: string, details: any = {}): Promise<void> {
    await this.log(ACTIVITY_ACTIONS.DELETE, resource, resourceId, details);
  }

  /**
   * Registra una visualización
   */
  async logView(resource: string, resourceId: string, details: any = {}): Promise<void> {
    await this.log(ACTIVITY_ACTIONS.VIEW, resource, resourceId, details);
  }

  /**
   * Registra una exportación
   */
  async logExport(resource: string, details: any = {}): Promise<void> {
    await this.log(ACTIVITY_ACTIONS.EXPORT, resource, null, details);
  }

  /**
   * Registra una importación
   */
  async logImport(resource: string, details: any = {}): Promise<void> {
    await this.log(ACTIVITY_ACTIONS.IMPORT, resource, null, details);
  }

  /**
   * Registra una sincronización
   */
  async logSync(resource: string, details: any = {}): Promise<void> {
    await this.log('sync', resource, null, details);
  }

  /**
   * Registra una llamada telefónica
   */
  async logCall(callId: string, customerId: string, details: any = {}): Promise<void> {
    await this.log('make_call', ACTIVITY_RESOURCES.CALLS, callId, {
      customerId,
      ...details
    });
  }

  /**
   * Registra un cambio de estado
   */
  async logStatusChange(
    resource: string, 
    resourceId: string, 
    fromStatus: string, 
    toStatus: string,
    reason?: string
  ): Promise<void> {
    await this.log('change_status', resource, resourceId, {
      fromStatus,
      toStatus,
      reason
    });
  }

  /**
   * Obtiene el historial de actividades
   */
  async getActivityLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<IActivityLog[]> {
    try {
      let url = `${this.baseUrl}/activityLogs?_sort=timestamp&_order=desc`;
      
      if (filters?.userId) {
        url += `&userId=${filters.userId}`;
      }
      if (filters?.resource) {
        url += `&resource=${filters.resource}`;
      }
      if (filters?.action) {
        url += `&action=${filters.action}`;
      }
      if (filters?.limit) {
        url += `&_limit=${filters.limit}`;
      }
      
      const response = await axios.get(url);
      let logs = response.data;
      
      // Filtrar por fechas si es necesario
      if (filters?.startDate || filters?.endDate) {
        logs = logs.filter((log: IActivityLog) => {
          const logDate = new Date(log.timestamp);
          if (filters.startDate && logDate < new Date(filters.startDate)) return false;
          if (filters.endDate && logDate > new Date(filters.endDate)) return false;
          return true;
        });
      }
      
      return logs;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }

  /**
   * Obtiene el historial de actividades de un recurso específico
   */
  async getResourceHistory(resource: string, resourceId: string): Promise<IActivityLog[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/activityLogs?resource=${resource}&resourceId=${resourceId}&_sort=timestamp&_order=desc`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching resource history:', error);
      return [];
    }
  }
}

export const activityLogService = new ActivityLogService();
