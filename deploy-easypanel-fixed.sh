#!/bin/bash

# Configuración de EasyPanel
EASYPANEL_URL="http://168.231.92.67:3000"
API_TOKEN="c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58"
PROJECT_NAME="sleep-plus-admin"
SERVICE_NAME="sleep-plus-admin-app"

echo "🚀 Iniciando despliegue de Sleep+ Admin en EasyPanel..."
echo ""

# Función para hacer llamadas a la API
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer ${API_TOKEN}" \
            -H "Content-Type: application/json" \
            "${EASYPANEL_URL}${endpoint}"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer ${API_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${EASYPANEL_URL}${endpoint}"
    fi
}

# Intentar crear proyecto primero
echo "📁 Verificando/Creando proyecto..."
PROJECT_DATA='{
  "name": "'"${PROJECT_NAME}"'",
  "description": "Sleep+ Admin Application"
}'

# Intentar diferentes endpoints posibles
echo "Intentando crear proyecto..."
api_call POST "/api/projects" "$PROJECT_DATA" > /tmp/project_response.json 2>&1

# Si falla, intentar con estructura diferente
if [ $? -ne 0 ]; then
    echo "Intentando endpoint alternativo..."
    api_call POST "/api/v1/projects" "$PROJECT_DATA" > /tmp/project_response.json 2>&1
fi

echo ""
echo "⚠️  Si el despliegue automático falla, sigue estos pasos manualmente:"
echo ""
echo "==================================================================="
echo "INSTRUCCIONES PARA DESPLIEGUE MANUAL EN EASYPANEL"
echo "==================================================================="
echo ""
echo "1. Accede a EasyPanel: ${EASYPANEL_URL}"
echo ""
echo "2. Crea un nuevo proyecto:"
echo "   - Nombre: ${PROJECT_NAME}"
echo ""
echo "3. Dentro del proyecto, crea un nuevo servicio:"
echo "   - Nombre: ${SERVICE_NAME}"
echo "   - Tipo: App"
echo ""
echo "4. Configura la fuente (Source):"
echo "   - Source Type: Git"
echo "   - Repository: https://github.com/Vargasmmi/sleep-plus-admin.git"
echo "   - Branch: main"
echo "   - Build Type: Dockerfile"
echo "   - Dockerfile Path: ./Dockerfile"
echo ""
echo "5. Configura las variables de entorno:"
echo "   NODE_ENV=production"
echo "   PORT=3001"
echo "   FRONTEND_PORT=5173"
echo "   VITE_API_URL=https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host"
echo "   VITE_APP_NAME=Sleep+ Admin"
echo "   VITE_APP_VERSION=1.0.0"
echo "   VITE_ENABLE_DEVTOOLS=false"
echo ""
echo "6. Configura el dominio:"
echo "   - Domain: ${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host"
echo "   - Port: 5173"
echo "   - HTTPS: Enabled"
echo ""
echo "7. Configura los recursos:"
echo "   - Memory: 512MB"
echo "   - CPU: 1"
echo ""
echo "8. Configura el volumen para la base de datos:"
echo "   - Mount Path: /app/db.json"
echo "   - Type: Volume"
echo ""
echo "9. Deploy Command (opcional):"
echo "   node server/production-server.js"
echo ""
echo "10. Haz clic en 'Deploy' para iniciar el despliegue"
echo ""
echo "==================================================================="
echo ""
echo "📌 Una vez desplegado, tu aplicación estará disponible en:"
echo "   https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host"
echo ""
echo "🔑 Credenciales de acceso:"
echo "   Usuario: admin@sleepplus.com"
echo "   Contraseña: admin123"
echo ""
echo "⏱️  El despliegue puede tomar 5-10 minutos."
echo "==================================================================="

# Hacer el script ejecutable
chmod +x "$0"
