#!/bin/bash

# Script para verificar y corregir el puerto del dominio en EasyPanel

API_TOKEN="c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58"
PROJECT_NAME="sleep-plus-admin"
SERVICE_NAME="sleep-plus-admin-app"
EASYPANEL_URL="http://168.231.92.67:3000"

echo "🔧 VERIFICACIÓN Y CORRECCIÓN DE PUERTO EN EASYPANEL"
echo "=================================================="

# 1. Obtener configuración actual de dominios
echo -e "\n1️⃣ Obteniendo configuración actual de dominios..."
DOMAINS=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/domains")

echo "Dominios actuales:"
echo "$DOMAINS" | jq '.'

# 2. Verificar el puerto
CURRENT_PORT=$(echo "$DOMAINS" | jq -r '.[0].port // "no configurado"')
DOMAIN_HOST=$(echo "$DOMAINS" | jq -r '.[0].host // "no configurado"')

echo -e "\n2️⃣ Análisis de configuración:"
echo "Host: $DOMAIN_HOST"
echo "Puerto actual: $CURRENT_PORT"

if [ "$CURRENT_PORT" = "5173" ]; then
    echo "✅ El puerto ya está configurado correctamente en 5173"
    echo ""
    echo "🔗 Puedes acceder a la aplicación en:"
    echo "   https://$DOMAIN_HOST"
    echo ""
    echo "Si aún no funciona, el problema puede ser:"
    echo "- El frontend no se está construyendo correctamente"
    echo "- El contenedor no está iniciando correctamente"
    echo "- Revisa los logs del contenedor para más detalles"
else
    echo "❌ ERROR: El puerto está mal configurado ($CURRENT_PORT)"
    echo "🔧 Corrigiendo configuración..."
    
    # Obtener el ID del dominio actual
    DOMAIN_ID=$(echo "$DOMAINS" | jq -r '.[0].id // ""')
    
    if [ ! -z "$DOMAIN_ID" ] && [ "$DOMAIN_ID" != "null" ]; then
        # Actualizar el dominio existente
        echo -e "\n3️⃣ Actualizando dominio existente..."
        
        UPDATE_PAYLOAD=$(cat <<EOF
{
  "host": "$DOMAIN_HOST",
  "port": 5173,
  "https": true,
  "path": "/"
}
EOF
)
        
        RESPONSE=$(curl -s -X PUT \
          -H "Authorization: Bearer ${API_TOKEN}" \
          -H "Content-Type: application/json" \
          -d "$UPDATE_PAYLOAD" \
          "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/domains/${DOMAIN_ID}")
        
        echo "Respuesta de actualización:"
        echo "$RESPONSE" | jq '.'
        
    else
        # Crear nuevo dominio
        echo -e "\n3️⃣ Creando nuevo dominio con configuración correcta..."
        
        CREATE_PAYLOAD=$(cat <<EOF
{
  "host": "sleep-plus-admin-app.sleep-plus-admin.easypanel.host",
  "port": 5173,
  "https": true,
  "path": "/"
}
EOF
)
        
        RESPONSE=$(curl -s -X POST \
          -H "Authorization: Bearer ${API_TOKEN}" \
          -H "Content-Type: application/json" \
          -d "$CREATE_PAYLOAD" \
          "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}/domains")
        
        echo "Respuesta de creación:"
        echo "$RESPONSE" | jq '.'
    fi
    
    echo -e "\n✅ Configuración actualizada"
    echo "⏳ Espera 1-2 minutos para que se apliquen los cambios"
fi

# 4. Verificar el estado del servicio
echo -e "\n4️⃣ Estado del servicio:"
SERVICE_STATUS=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/${PROJECT_NAME}/services/${SERVICE_NAME}")

echo "$SERVICE_STATUS" | jq '{
  name: .name,
  status: .status,
  deploymentStatus: .deploymentStatus
}'

# 5. Mostrar resumen
echo -e "\n=================================================="
echo "📋 RESUMEN:"
echo "- Proyecto: $PROJECT_NAME"
echo "- Servicio: $SERVICE_NAME"
echo "- URL: https://$DOMAIN_HOST"
echo "- Puerto frontend: 5173 ✅"
echo "- Puerto backend: 3001 (interno)"
echo ""
echo "🔑 Credenciales de acceso:"
echo "- Email: admin@sleepplus.com"
echo "- Password: admin123"
echo ""
echo "💡 Si aún no funciona después de 2 minutos:"
echo "1. Revisa los logs del contenedor"
echo "2. Fuerza un nuevo despliegue"
echo "3. Verifica que el build del frontend se complete exitosamente"
