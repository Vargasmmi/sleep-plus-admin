# Sleep+ Admin - Sistema de Administración

Sistema de administración para Sleep+ Elite y Trade & Sleep con integración a Shopify y Stripe.

## 🚀 Características

- **Dashboard Completo**: Visualización de métricas y estadísticas en tiempo real
- **Gestión de Clientes**: Base de datos completa con historial y seguimiento
- **Suscripciones**: Administración de planes Basic, Premium y Elite
- **Trade-In Program**: Evaluación y gestión de intercambios de colchones
- **Integración Shopify**: Sincronización de productos, clientes y cupones
- **Integración Stripe**: Gestión de pagos y suscripciones
- **Sistema de Comisiones**: Cálculo automático para vendedores
- **Campañas y Scripts**: Herramientas para ventas telefónicas

## 📋 Requisitos

- Node.js 18+
- NPM o Yarn

## 🛠️ Instalación Local

```bash
# Clonar repositorio
git clone [tu-repositorio]
cd sleep-plus-admin-1-0-2

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t sleep-plus-admin .

# Ejecutar contenedor
docker-compose up -d
```

## 📦 Estructura del Proyecto

```
├── server/              # Backend Express
│   ├── server.js        # Servidor principal
│   └── production-server.js # Servidor de producción
├── src/                 # Frontend React
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas de la aplicación
│   └── providers/      # Context providers
├── public/             # Archivos estáticos
├── landing/            # Página de aterrizaje
└── db.json            # Base de datos JSON
```

## 🔧 Configuración

### Variables de Entorno

```env
# API
VITE_API_URL=http://localhost:3001

# App
VITE_APP_NAME=Sleep+ Admin
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_DEVTOOLS=true
```

### Configuración de Shopify

1. Accede a **Configuración > Shopify**
2. Ingresa tu dominio de Shopify (ej: `mi-tienda.myshopify.com`)
3. Genera un Access Token en tu admin de Shopify
4. Prueba la conexión

### Configuración de Stripe

1. Accede a **Configuración > Stripe**
2. Ingresa tu Public Key y Secret Key
3. Opcionalmente configura el Webhook Secret
4. Verifica la conexión

## 🚀 Despliegue

### EasyPanel

Consulta el archivo `DEPLOY-EASYPANEL.md` para instrucciones detalladas de despliegue en EasyPanel.

### Otros Proveedores

La aplicación está dockerizada y puede desplegarse en:
- Heroku
- DigitalOcean App Platform
- AWS ECS
- Google Cloud Run
- Vercel (solo frontend)

## 📱 Uso

### Acceso Inicial

- URL: `http://localhost:5173`
- Usuario: Configure las credenciales de administrador en las variables de entorno
- Contraseña: Configure las credenciales de administrador en las variables de entorno

**Nota de Seguridad**: Las credenciales de administrador deben configurarse mediante variables de entorno o un sistema de gestión de usuarios apropiado. No utilice credenciales hardcodeadas en producción.

### Módulos Principales

1. **Dashboard**: Vista general del negocio
2. **Clientes**: Gestión completa de clientes
3. **Suscripciones**: Administración de planes
4. **Trade-In**: Evaluación de colchones
5. **Ventas**: Registro y seguimiento
6. **Empleados**: Gestión del equipo

## 🔄 Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix
```

## 🐛 Solución de Problemas

### Error: Puerto en uso
```bash
# Cambiar puerto en .env
PORT=3002
FRONTEND_PORT=5174
```

### Base de datos corrupta
```bash
# Restaurar backup
cp db-backup.json db.json
```

### Error de build
```bash
# Limpiar cache
rm -rf node_modules dist
npm install
npm run build
```

## 📞 Soporte

Para soporte técnico:
- Email: soporte@sleepplus.com
- Documentación: `/docs`

## 📄 Licencia

Propiedad de Sleep+ Elite. Todos los derechos reservados.
