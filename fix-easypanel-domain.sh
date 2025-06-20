#!/bin/bash

# Configuración
API_TOKEN="c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58"
PROJECT_NAME="sleep-plus-admin"
SERVICE_NAME="sleep-plus-admin-app"
EASYPANEL_URL="http://168.231.92.67:3000"

echo "🔧 Verificando y corrigiendo configuración de dominio en EasyPanel..."
echo "=============================================="

# 1. Verificar el estado actual del servicio
echo "📊 Verificando estado del servicio..."
SERVICE_INFO=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}")

echo "Estado actual del servicio:"
echo "$SERVICE_INFO" | jq '.'

# 2. Obtener los dominios actuales
echo -e "\n📋 Dominios actuales:"
DOMAINS=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/domains")

echo "$DOMAINS" | jq '.'

# 3. Verificar si el dominio está apuntando al puerto correcto
CURRENT_PORT=$(echo "$DOMAINS" | jq -r '.[0].port // "no configurado"')
echo -e "\n⚠️  Puerto actual del dominio: $CURRENT_PORT"

if [ "$CURRENT_PORT" != "5173" ]; then
    echo "❌ El puerto está mal configurado. Debe ser 5173, no $CURRENT_PORT"
    echo "🔧 Actualizando configuración del dominio..."
    
    # Actualizar el dominio para usar el puerto 5173
    DOMAIN_UPDATE='{
      "host": "sleep-plus-admin-app.sleep-plus-admin.easypanel.host",
      "port": 5173,
      "https": true,
      "path": "/"
    }'
    
    # Primero eliminar el dominio existente si existe
    DOMAIN_ID=$(echo "$DOMAINS" | jq -r '.[0].id // ""')
    if [ ! -z "$DOMAIN_ID" ]; then
        echo "🗑️  Eliminando dominio existente..."
        curl -X DELETE -H "Authorization: Bearer ${API_TOKEN}" \
          "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/domains/${DOMAIN_ID}"
    fi
    
    # Crear nuevo dominio con puerto correcto
    echo "✨ Creando dominio con puerto 5173..."
    curl -X POST -H "Authorization: Bearer ${API_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$DOMAIN_UPDATE" \
      "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/domains"
else
    echo "✅ El puerto ya está configurado correctamente en 5173"
fi

# 4. Verificar logs del contenedor
echo -e "\n📜 Últimos logs del contenedor:"
LOGS=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/logs?lines=50")

# Buscar logs del frontend
echo -e "\n🔍 Buscando logs del frontend (puerto 5173):"
echo "$LOGS" | grep -i "frontend\|5173\|dist" || echo "No se encontraron logs del frontend"

echo -e "\n🔍 Buscando logs del backend (puerto 3001):"
echo "$LOGS" | grep -i "backend\|3001\|server is running" || echo "No se encontraron logs del backend"

# 5. Forzar redeploy si es necesario
echo -e "\n🚀 ¿Deseas forzar un nuevo despliegue? (s/n)"
read -r REDEPLOY

if [ "$REDEPLOY" = "s" ]; then
    echo "🔄 Forzando nuevo despliegue..."
    curl -X POST -H "Authorization: Bearer ${API_TOKEN}" \
      "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/deploy"
    
    echo "✅ Despliegue iniciado. Espera unos minutos..."
fi

echo -e "\n=============================================="
echo "📌 Resumen:"
echo "- Frontend debe correr en: http://localhost:5173 (dentro del contenedor)"
echo "- Backend debe correr en: http://localhost:3001 (dentro del contenedor)"
echo "- URL pública: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo "- El dominio DEBE apuntar al puerto 5173 (frontend)"
echo ""
echo "🔗 Intenta acceder a: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo "🔑 Credenciales: admin@sleepplus.com / admin123"
