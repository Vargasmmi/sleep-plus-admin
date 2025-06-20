import axios from 'axios';
import { IWebhook, IWebhookEvent } from '../interfaces/activityLog';

class WebhookService {
  private baseUrl = '';

  /**
   * Registra un webhook recibido
   */
  async registerWebhook(
    source: string,
    event: string,
    headers: any,
    payload: any
  ): Promise<IWebhook> {
    const webhook: Omit<IWebhook, 'id'> = {
      source: source as 'shopify' | 'internal' | 'other',
      event,
      status: 'pending',
      receivedAt: new Date().toISOString(),
      processedAt: null,
      attempts: 0,
      headers,
      payload,
      response: null,
      error: null
    };

    const id = `wh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response = await axios.post(`${this.baseUrl}/webhooks`, {
      ...webhook,
      id
    });

    return response.data;
  }

  /**
   * Actualiza el estado de un webhook
   */
  async updateWebhookStatus(
    webhookId: string,
    status: 'processed' | 'failed' | 'retrying',
    response?: any,
    error?: any
  ): Promise<void> {
    const webhook = await this.getWebhook(webhookId);
    
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    const updates: Partial<IWebhook> = {
      status,
      processedAt: new Date().toISOString(),
      attempts: webhook.attempts + 1
    };

    if (response) {
      updates.response = response;
    }

    if (error) {
      updates.error = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }

    await axios.patch(`${this.baseUrl}/webhooks/${webhookId}`, updates);
  }

  /**
   * Obtiene un webhook por ID
   */
  async getWebhook(id: string): Promise<IWebhook | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/webhooks/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene la lista de webhooks
   */
  async getWebhooks(filters?: {
    source?: string;
    event?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<IWebhook[]> {
    try {
      let url = `${this.baseUrl}/webhooks?_sort=receivedAt&_order=desc`;
      
      if (filters?.source) {
        url += `&source=${filters.source}`;
      }
      if (filters?.event) {
        url += `&event=${filters.event}`;
      }
      if (filters?.status) {
        url += `&status=${filters.status}`;
      }
      if (filters?.limit) {
        url += `&_limit=${filters.limit}`;
      }
      
      const response = await axios.get(url);
      let webhooks = response.data;
      
      // Filtrar por fechas si es necesario
      if (filters?.startDate || filters?.endDate) {
        webhooks = webhooks.filter((webhook: IWebhook) => {
          const webhookDate = new Date(webhook.receivedAt);
          if (filters.startDate && webhookDate < new Date(filters.startDate)) return false;
          if (filters.endDate && webhookDate > new Date(filters.endDate)) return false;
          return true;
        });
      }
      
      return webhooks;
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      return [];
    }
  }

  /**
   * Obtiene los webhooks pendientes para procesar
   */
  async getPendingWebhooks(): Promise<IWebhook[]> {
    return this.getWebhooks({ status: 'pending' });
  }

  /**
   * Obtiene los webhooks fallidos
   */
  async getFailedWebhooks(): Promise<IWebhook[]> {
    return this.getWebhooks({ status: 'failed' });
  }

  /**
   * Reintenta procesar un webhook fallido
   */
  async retryWebhook(webhookId: string): Promise<void> {
    await this.updateWebhookStatus(webhookId, 'retrying');
    // La lógica de reprocesamiento se implementaría según el tipo de webhook
  }

  /**
   * Obtiene la configuración de eventos de webhook
   */
  async getWebhookEvents(enabled?: boolean): Promise<IWebhookEvent[]> {
    try {
      let url = `${this.baseUrl}/webhookEvents`;
      if (enabled !== undefined) {
        url += `?enabled=${enabled}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      return [];
    }
  }

  /**
   * Actualiza la configuración de un evento de webhook
   */
  async updateWebhookEvent(eventId: string, updates: Partial<IWebhookEvent>): Promise<void> {
    await axios.patch(`${this.baseUrl}/webhookEvents/${eventId}`, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Habilita o deshabilita un evento de webhook
   */
  async toggleWebhookEvent(eventId: string, enabled: boolean): Promise<void> {
    await this.updateWebhookEvent(eventId, { enabled });
  }

  /**
   * Obtiene estadísticas de webhooks
   */
  async getWebhookStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    total: number;
    processed: number;
    failed: number;
    pending: number;
    byEvent: { [event: string]: number };
    bySource: { [source: string]: number };
  }> {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    const webhooks = await this.getWebhooks({
      startDate: startDate.toISOString()
    });
    
    const stats = {
      total: webhooks.length,
      processed: 0,
      failed: 0,
      pending: 0,
      byEvent: {} as { [event: string]: number },
      bySource: {} as { [source: string]: number }
    };
    
    webhooks.forEach(webhook => {
      // Contar por estado
      switch (webhook.status) {
        case 'processed':
          stats.processed++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'pending':
          stats.pending++;
          break;
      }
      
      // Contar por evento
      stats.byEvent[webhook.event] = (stats.byEvent[webhook.event] || 0) + 1;
      
      // Contar por fuente
      stats.bySource[webhook.source] = (stats.bySource[webhook.source] || 0) + 1;
    });
    
    return stats;
  }
}

export const webhookService = new WebhookService();
