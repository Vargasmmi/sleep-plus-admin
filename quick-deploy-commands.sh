#!/bin/bash

# 🚀 COMANDOS RÁPIDOS PARA SEPARAR FRONTEND Y BACKEND
# Ejecutar estos comandos en orden

echo "🚀 SEPARACIÓN RÁPIDA FRONTEND/BACKEND"
echo "===================================="
echo ""

# 1. Commit y push
echo "📦 1. Guardando cambios en GitHub:"
echo "cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2"
echo "git add ."
echo 'git commit -m "Add Docker configurations for frontend/backend separation"'
echo "git push origin main"
echo ""

# 2. URLs de acceso
echo "🌐 2. Acceder a EasyPanel:"
echo "http://168.231.92.67:3000/"
echo ""

# 3. Actualizar Backend
echo "🔧 3. Actualizar Backend (sleep-plus-admin-app):"
echo "   Build > Dockerfile Path: docker/Dockerfile.backend"
echo "   Environment:"
echo "     NODE_ENV=production"
echo "     PORT=3001"
echo "     DB_PATH=/app/data/db.json"
echo "     FRONTEND_URL=https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host"
echo "   Domains > Cambiar a: sleep-plus-admin-backend (puerto 3001)"
echo "   > Deploy"
echo ""

# 4. Crear Frontend
echo "🎨 4. Crear nuevo Frontend (Add Service > App):"
echo "   Name: sleep-plus-admin-frontend"
echo "   Git:"
echo "     Repository: https://github.com/Vargasmmi/sleep-plus-admin.git"
echo "     Branch: main"
echo "     Username: Vargasmmi"
echo "     Token: [TU_GITHUB_TOKEN]"
echo "   Build > Dockerfile Path: docker/Dockerfile.frontend"
echo "   Environment:"
echo "     NODE_ENV=production"
echo "     VITE_API_URL=https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host/api"
echo "     VITE_APP_NAME=Sleep+ Admin"
echo "     VITE_APP_VERSION=1.0.0"
echo "     VITE_ENABLE_DEVTOOLS=false"
echo "   Domains > Add: sleep-plus-admin-frontend (puerto 5173)"
echo "   > Deploy"
echo ""

# 5. Verificación
echo "✅ 5. Verificar funcionamiento:"
echo "   Backend: curl https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host/health"
echo "   Frontend: https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host"
echo "   Login: admin@sleepplus.com / admin123"
echo ""

echo "📋 Archivos creados:"
echo "   - docker/Dockerfile.backend"
echo "   - docker/Dockerfile.frontend"
echo "   - server/backend-only.js"
echo "   - src/config/api.config.js"
echo "   - FRONTEND_BACKEND_SEPARATION.md (documentación completa)"
echo ""
