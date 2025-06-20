// Configuración de API para el frontend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Remover trailing slash si existe
const baseURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

// Configuración de axios o fetch
export const apiConfig = {
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies si es necesario
};

// Helper para construir URLs
export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseURL}${cleanEndpoint}`;
};

// Endpoints disponibles
export const endpoints = {
  // Productos
  products: '/products',
  productById: (id) => `/products/${id}`,
  
  // Categorías
  categories: '/categories',
  categoryById: (id) => `/categories/${id}`,
  
  // Bundles
  bundles: '/bundles',
  bundleById: (id) => `/bundles/${id}`,
  
  // Órdenes
  orders: '/orders',
  orderById: (id) => `/orders/${id}`,
  
  // Webhooks
  webhooks: '/webhooks',
  webhookById: (id) => `/webhooks/${id}`,
  
  // Configuraciones
  settings: '/settings',
  settingById: (id) => `/settings/${id}`,
  
  // Auth (si tienes endpoints de autenticación)
  login: '/auth/login',
  logout: '/auth/logout',
  profile: '/auth/profile',
};

// Función para verificar la conexión con el backend
export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${baseURL.replace('/api', '')}/health`);
    const data = await response.json();
    return {
      connected: response.ok,
      status: data.status,
      message: data.message || 'Backend is available'
    };
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      message: error.message || 'Cannot connect to backend'
    };
  }
};

export default apiConfig;
