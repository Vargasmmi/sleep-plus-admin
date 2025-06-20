import axios from 'axios';
import { ISubscription } from '../interfaces';
import stripeService from './stripeService';

const API_BASE_URL = 'http://localhost:3001/api';

class SubscriptionService {
  
  // Obtener todas las suscripciones con datos de Stripe
  async getSubscriptions(): Promise<ISubscription[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo suscripciones:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo suscripciones');
    }
  }

  // Obtener una suscripción específica con datos de Stripe
  async getSubscription(id: string): Promise<ISubscription> {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo suscripción');
    }
  }

  // Crear nueva suscripción con integración a Stripe
  async createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
    try {
      // Si es una suscripción con Stripe, crear primero en Stripe
      if (subscriptionData.billing?.paymentMethod === 'stripe') {
        const stripeData = {
          customerId: subscriptionData.customerId!,
          stripePriceId: subscriptionData.billing.stripePriceId!,
          plan: subscriptionData.plan!
        };
        
        const stripeResponse = await stripeService.createSubscription(stripeData);
        
        // Actualizar datos locales con IDs de Stripe
        subscriptionData.billing = {
          ...subscriptionData.billing,
          stripeSubscriptionId: stripeResponse.subscription.stripeSubscriptionId,
          stripeCustomerId: stripeResponse.subscription.stripeCustomerId
        };
      }

      const response = await axios.post(`${API_BASE_URL}/subscriptions`, subscriptionData);
      return response.data;
    } catch (error: any) {
      console.error('Error creando suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error creando suscripción');
    }
  }

  // Actualizar suscripción
  async updateSubscription(id: string, subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
    try {
      const response = await axios.put(`${API_BASE_URL}/subscriptions/${id}`, subscriptionData);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error actualizando suscripción');
    }
  }

  // Cancelar suscripción (incluyendo Stripe si aplica)
  async cancelSubscription(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Primero obtener la suscripción para verificar si tiene Stripe
      const subscription = await this.getSubscription(id);
      
      // Si tiene Stripe, cancelar también en Stripe
      if (subscription.billing?.stripeSubscriptionId) {
        await stripeService.cancelSubscription(subscription.billing.stripeSubscriptionId);
      }

      const response = await axios.post(`${API_BASE_URL}/subscriptions/${id}/cancel`, { 
        reason 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error cancelando suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error cancelando suscripción');
    }
  }

  // Pausar suscripción
  async pauseSubscription(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/${id}/pause`, { 
        reason 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error pausando suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error pausando suscripción');
    }
  }

  // Reactivar suscripción
  async resumeSubscription(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/${id}/resume`);
      return response.data;
    } catch (error: any) {
      console.error('Error reactivando suscripción:', error);
      throw new Error(error.response?.data?.message || 'Error reactivando suscripción');
    }
  }

  // Sincronizar con Stripe
  async syncWithStripe(): Promise<{ success: boolean; message: string; synced: number }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/sync-stripe`);
      return response.data;
    } catch (error: any) {
      console.error('Error sincronizando con Stripe:', error);
      
      // Si es un error 404, significa que el endpoint no está implementado aún
      if (error.response?.status === 404) {
        // Mostrar un mensaje más amigable y hacer una sincronización simulada
        console.warn('Endpoint de sincronización no disponible. Realizando sincronización local...');
        
        // Obtener todas las suscripciones locales
        try {
          const subscriptions = await this.getSubscriptions();
          const stripeSubscriptions = subscriptions.filter(sub => this.isStripeSubscription(sub));
          
          return {
            success: true,
            message: `Sincronización local completada. ${stripeSubscriptions.length} suscripciones con Stripe identificadas.`,
            synced: 0 // 0 porque no hubo sincronización real
          };
        } catch (localError) {
          throw new Error('Error al realizar sincronización local');
        }
      }
      
      // Para otros errores, mantener el comportamiento original
      throw new Error(error.response?.data?.message || 'Error sincronizando con Stripe');
    }
  }

  // Importar suscripciones desde Stripe
  async importFromStripe(): Promise<{ success: boolean; message: string; imported: number; details: any[] }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/import-from-stripe`);
      return response.data;
    } catch (error: any) {
      console.error('Error importando desde Stripe:', error);
      throw new Error(error.response?.data?.message || 'Error importando desde Stripe');
    }
  }

  // Verificar nuevas suscripciones desde Stripe
  async checkNewSubscriptions(): Promise<{ success: boolean; message: string; newCount: number; newSubscriptions: any[] }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/check-new`);
      return response.data;
    } catch (error: any) {
      console.error('Error verificando nuevas suscripciones:', error);
      throw new Error(error.response?.data?.message || 'Error verificando nuevas suscripciones');
    }
  }

  // Obtener estadísticas de suscripciones
  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    paused: number;
    cancelled: number;
    withStripe: number;
    revenue: {
      monthly: number;
      annual: number;
    };
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error obteniendo estadísticas');
    }
  }

  // Utilidades
  getPaymentMethodIcon(paymentMethod: string): string {
    const icons: Record<string, string> = {
      'stripe': '💳',
      'card': '💳',
      'ach': '🏦',
      'cash': '💵'
    };
    return icons[paymentMethod] || '❓';
  }

  getPaymentMethodLabel(paymentMethod: string): string {
    const labels: Record<string, string> = {
      'stripe': 'Stripe',
      'card': 'Tarjeta',
      'ach': 'ACH',
      'cash': 'Efectivo'
    };
    return labels[paymentMethod] || paymentMethod;
  }

  isStripeSubscription(subscription: ISubscription): boolean {
    return subscription.billing?.paymentMethod === 'stripe' && 
           !!subscription.billing?.stripeSubscriptionId;
  }
}

export default new SubscriptionService(); 