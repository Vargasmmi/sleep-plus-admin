#!/bin/bash

# Script de diagnóstico para Sleep+ Admin en EasyPanel

echo "🔍 DIAGNÓSTICO DE SLEEP+ ADMIN EN EASYPANEL"
echo "==========================================="

# Configuración
API_TOKEN="c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58"
PROJECT_NAME="sleep-plus-admin"
SERVICE_NAME="sleep-plus-admin-app"
EASYPANEL_URL="http://168.231.92.67:3000"

# 1. Estado del servicio
echo -e "\n1️⃣ ESTADO DEL SERVICIO:"
curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}" | jq '{
    name: .name,
    status: .status,
    deploymentStatus: .deploymentStatus,
    image: .image,
    env: .env
  }'

# 2. Configuración de dominios
echo -e "\n2️⃣ CONFIGURACIÓN DE DOMINIOS:"
DOMAINS=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/domains")

echo "$DOMAINS" | jq '.[] | {
    host: .host,
    port: .port,
    https: .https,
    path: .path
}'

# Verificar puerto
CURRENT_PORT=$(echo "$DOMAINS" | jq -r '.[0].port // "no configurado"')
if [ "$CURRENT_PORT" != "5173" ]; then
    echo "❌ ERROR CRÍTICO: El dominio está apuntando al puerto $CURRENT_PORT"
    echo "   Debe apuntar al puerto 5173 (frontend), no al 3001 (backend)"
else
    echo "✅ Puerto configurado correctamente: 5173"
fi

# 3. Variables de entorno
echo -e "\n3️⃣ VARIABLES DE ENTORNO:"
curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}" | \
  jq '.env | to_entries | .[] | "\(.key)=\(.value)"'

# 4. Logs completos
echo -e "\n4️⃣ LOGS DEL CONTENEDOR (últimas 100 líneas):"
echo "==========================================="
curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/logs?lines=100" | \
  tail -50

echo -e "\n5️⃣ ANÁLISIS DE LOGS:"
echo "==========================================="

# Analizar logs
LOGS_TEMP=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/logs?lines=100")

# Buscar indicadores del frontend
echo -e "\n🎨 FRONTEND (Puerto 5173):"
if echo "$LOGS_TEMP" | grep -q "Frontend server running on port 5173"; then
    echo "✅ Frontend está corriendo en puerto 5173"
else
    echo "❌ No se encontraron logs del frontend en puerto 5173"
fi

# Buscar indicadores del backend
echo -e "\n🔧 BACKEND (Puerto 3001):"
if echo "$LOGS_TEMP" | grep -q "Server is running!"; then
    echo "✅ Backend está corriendo en puerto 3001"
else
    echo "❌ No se encontraron logs del backend"
fi

# Buscar errores
echo -e "\n⚠️  ERRORES ENCONTRADOS:"
echo "$LOGS_TEMP" | grep -i "error\|failed\|exception" | tail -5 || echo "No se encontraron errores recientes"

echo -e "\n6️⃣ SOLUCIÓN RECOMENDADA:"
echo "==========================================="
echo "El problema es que el dominio en EasyPanel está apuntando al puerto $CURRENT_PORT"
echo ""
echo "PASOS PARA SOLUCIONARLO:"
echo "1. Ve a EasyPanel: http://168.231.92.67:3000/"
echo "2. Navega a: Proyecto 'sleep-plus-admin' > Servicio 'sleep-plus-admin-app'"
echo "3. Ve a la pestaña 'Domains'"
echo "4. Edita el dominio y cambia el puerto de $CURRENT_PORT a 5173"
echo "5. Guarda los cambios"
echo "6. Espera 1-2 minutos para que se apliquen"
echo ""
echo "URL para acceder: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo "Credenciales: admin@sleepplus.com / admin123"
