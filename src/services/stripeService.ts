import axios from 'axios';
import { 
  StripeConfig, 
  PaymentLink, 
  StripeSubscription, 
  StripeWebhook, 
  StripeStats,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  StripeConfigResponse,
  StripeApiResponse
} from '../interfaces/stripe';

const API_BASE_URL = 'http://localhost:3001/api/stripe';

class StripeService {
  
  // Configuración
  async saveConfig(config: Partial<StripeConfig>): Promise<{ success: boolean; message: string; testMode?: boolean }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/config`, config);
      return response.data;
    } catch (error: any) {
      console.error('Error guardando configuración de Stripe:', error);
      throw new Error(error.response?.data?.message || 'Error guardando configuración');
    }
  }

  async getConfig(): Promise<StripeConfigResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/config`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo configuración de Stripe:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo configuración');
    }
  }

  // Payment Links
  async createPaymentLink(data: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payment-links`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creando Payment Link:', error);
      throw new Error(error.response?.data?.message || 'Error creando Payment Link');
    }
  }

  async getPaymentLinks(): Promise<{ success: boolean; paymentLinks: PaymentLink[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment-links`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo Payment Links:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo Payment Links');
    }
  }

  async updatePaymentLink(id: string, data: Partial<PaymentLink>): Promise<{ success: boolean; paymentLink: PaymentLink }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/payment-links/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando Payment Link:', error);
      throw new Error(error.response?.data?.message || 'Error actualizando Payment Link');
    }
  }

  async deletePaymentLink(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/payment-links/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error eliminando Payment Link:', error);
      throw new Error(error.response?.data?.message || 'Error eliminando Payment Link');
    }
  }

  // Suscripciones
  async createSubscription(data: Partial<StripeSubscription>): Promise<{ success: boolean; subscription: StripeSubscription }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creando suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error creando suscripción');
    }
  }

  async getSubscriptions(): Promise<{ success: boolean; subscriptions: StripeSubscription[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo suscripciones:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo suscripciones');
    }
  }

  // Método optimizado para obtener suscripciones directamente desde Stripe
  async getStripeSubscriptions(filters: {
    status?: string;
    customer?: string;
    limit?: number;
    startingAfter?: string;
    expand?: boolean;
  } = {}): Promise<{ 
    success: boolean; 
    subscriptions: any[]; 
    hasMore: boolean; 
    totalCount: number; 
  }> {
    try {
      const params = new URLSearchParams({
        status: filters.status || 'all',
        limit: (filters.limit || 100).toString(),
        expand: (filters.expand !== false).toString()
      });
      
      if (filters.customer) params.append('customer', filters.customer);
      if (filters.startingAfter) params.append('startingAfter', filters.startingAfter);
      
      const response = await axios.get(`http://localhost:3001/api/stripe/subscriptions?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo suscripciones de Stripe:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo suscripciones de Stripe');
    }
  }

  async cancelSubscription(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelando suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error cancelando suscripción');
    }
  }

  // Webhooks
  async getWebhooks(): Promise<{ success: boolean; webhooks: StripeWebhook[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/webhooks`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo webhooks:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo webhooks');
    }
  }

  async retryWebhook(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/webhooks/${id}/retry`);
      return response.data;
    } catch (error: any) {
      console.error('Error reintentando webhook:', error);
      throw new Error(error.response?.data?.message || 'Error reintentando webhook');
    }
  }

  // Estadísticas
  async getStats(): Promise<{ success: boolean; stats: StripeStats }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas');
    }
  }

  // Utilidades
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'green',
      completed: 'blue',
      canceled: 'red',
      draft: 'orange',
      expired: 'red',
      inactive: 'gray',
      past_due: 'red',
      trialing: 'blue',
      unpaid: 'red'
    };
    return colors[status] || 'gray';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      active: 'Activo',
      completed: 'Completado',
      canceled: 'Cancelado',
      draft: 'Borrador',
      expired: 'Expirado',
      inactive: 'Inactivo',
      past_due: 'Vencido',
      trialing: 'En prueba',
      unpaid: 'Sin pagar'
    };
    return texts[status] || status;
  }
}

export default new StripeService(); 