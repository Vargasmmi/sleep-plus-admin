#!/bin/bash

echo "🚀 GUÍA DE SEPARACIÓN FRONTEND/BACKEND EN EASYPANEL"
echo "=================================================="
echo ""
echo "Este script te guiará para separar tu aplicación en dos servicios:"
echo "1. Backend API (sleep-plus-admin-backend)"
echo "2. Frontend React (sleep-plus-admin-frontend)"
echo ""
echo "=================================================="
echo ""

# Colores para mejor legibilidad
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 PASO 1: Preparar el código${NC}"
echo "=================================================="
echo "1. Commit todos los cambios actuales:"
echo "   git add ."
echo "   git commit -m 'Prepare for frontend/backend separation'"
echo "   git push origin main"
echo ""

echo -e "${BLUE}📋 PASO 2: Actualizar la App Backend Existente${NC}"
echo "=================================================="
echo "1. Ir a EasyPanel: http://168.231.92.67:3000/"
echo "2. Navegar a: sleep-plus-admin → sleep-plus-admin-app"
echo "3. En la pestaña 'Build', actualizar:"
echo ""
echo -e "${YELLOW}Build Type:${NC} Dockerfile"
echo -e "${YELLOW}Dockerfile Path:${NC} docker/Dockerfile.backend"
echo ""
echo "4. En la pestaña 'Environment', actualizar variables:"
echo ""
echo "NODE_ENV=production"
echo "PORT=3001"
echo "DB_PATH=/app/data/db.json"
echo "FRONTEND_URL=https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host"
echo ""
echo "5. En la pestaña 'Domains':"
echo "   - Cambiar el nombre del dominio a: sleep-plus-admin-backend"
echo "   - Puerto: 3001"
echo ""
echo "6. Deploy la aplicación"
echo ""

echo -e "${BLUE}📋 PASO 3: Crear Nueva App para Frontend${NC}"
echo "=================================================="
echo "1. En EasyPanel, dentro del proyecto sleep-plus-admin"
echo "2. Click en 'Add Service' → 'App'"
echo "3. Nombre: sleep-plus-admin-frontend"
echo ""
echo "4. En la pestaña 'Build':"
echo -e "${YELLOW}Build Type:${NC} Dockerfile"
echo -e "${YELLOW}Dockerfile Path:${NC} docker/Dockerfile.frontend"
echo ""
echo "5. En la pestaña 'Git':"
echo -e "${YELLOW}Repository:${NC} https://github.com/Vargasmmi/sleep-plus-admin.git"
echo -e "${YELLOW}Branch:${NC} main"
echo -e "${YELLOW}Username:${NC} Vargasmmi"
echo -e "${YELLOW}Token:${NC} [TU_GITHUB_TOKEN]"
echo ""
echo "6. En la pestaña 'Environment':"
echo ""
echo "NODE_ENV=production"
echo "VITE_API_URL=https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host/api"
echo "VITE_APP_NAME=Sleep+ Admin"
echo "VITE_APP_VERSION=1.0.0"
echo "VITE_ENABLE_DEVTOOLS=false"
echo ""
echo "7. En la pestaña 'Domains':"
echo "   - Host: sleep-plus-admin-frontend"
echo "   - Puerto: 5173"
echo "   - HTTPS: Enabled"
echo ""
echo "8. Deploy la aplicación"
echo ""

echo -e "${BLUE}📋 PASO 4: Verificar el Funcionamiento${NC}"
echo "=================================================="
echo "1. Backend API:"
echo "   curl https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host/health"
echo ""
echo "2. Frontend:"
echo "   Abrir https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host"
echo ""
echo "3. Credenciales de prueba:"
echo "   Email: admin@sleepplus.com"
echo "   Password: admin123"
echo ""

echo -e "${GREEN}✅ URLs FINALES:${NC}"
echo "=================================================="
echo "Frontend: https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host"
echo "Backend API: https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "=================================================="
echo "1. El frontend ahora se conectará al backend usando VITE_API_URL"
echo "2. Asegúrate de que CORS esté configurado correctamente en el backend"
echo "3. El volumen de datos permanece en el backend"
echo "4. Ambas aplicaciones deben estar desplegadas para funcionar"
echo ""
