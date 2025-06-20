#!/bin/bash

# Configuración de EasyPanel
EASYPANEL_URL="http://168.231.92.67:3000"
API_TOKEN="c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58"
PROJECT_NAME="sleep-plus-admin"
SERVICE_NAME="sleep-plus-admin-app"

echo "🚀 Desplegando Sleep+ Admin en EasyPanel..."

# Crear el servicio
echo "📦 Creando servicio..."
curl -X POST "${EASYPANEL_URL}/api/trpc/services.app.createService" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "projectName": "'"${PROJECT_NAME}"'",
      "serviceName": "'"${SERVICE_NAME}"'",
      "source": {
        "type": "git",
        "repo": "https://github.com/Vargasmmi/sleep-plus-admin.git",
        "ref": "main",
        "path": "/"
      },
      "build": {
        "type": "dockerfile",
        "file": "./Dockerfile"
      },
      "env": "NODE_ENV=production\nPORT=3001\nFRONTEND_PORT=5173\nVITE_API_URL=https://'"${SERVICE_NAME}"'.'"${PROJECT_NAME}"'.easypanel.host\nVITE_APP_NAME=Sleep+ Admin\nVITE_APP_VERSION=1.0.0\nVITE_ENABLE_DEVTOOLS=false",
      "deploy": {
        "replicas": 1,
        "command": "node server/production-server.js",
        "zeroDowntime": true
      },
      "domains": [{
        "host": "'"${SERVICE_NAME}"'.'"${PROJECT_NAME}"'.easypanel.host",
        "https": true,
        "port": 5173,
        "path": "/"
      }],
      "mounts": [{
        "type": "volume",
        "name": "db-data",
        "mountPath": "/app/db.json"
      }],
      "ports": [],
      "resources": {
        "memoryReservation": 256,
        "memoryLimit": 512,
        "cpuReservation": 0.25,
        "cpuLimit": 1
      }
    }
  }'

echo ""
echo "✅ Servicio creado"

# Esperar un momento
sleep 2

# Iniciar el despliegue
echo "🔨 Iniciando despliegue..."
curl -X POST "${EASYPANEL_URL}/api/trpc/services.app.deployService" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "projectName": "'"${PROJECT_NAME}"'",
      "serviceName": "'"${SERVICE_NAME}"'",
      "forceRebuild": false
    }
  }'

echo ""
echo "✅ Despliegue iniciado exitosamente"
echo ""
echo "📌 Tu aplicación estará disponible en:"
echo "   https://${SERVICE_NAME}.${PROJECT_NAME}.easypanel.host"
echo ""
echo "⏱️  El despliegue puede tomar 5-10 minutos."
echo "   Puedes ver el progreso en: ${EASYPANEL_URL}"
echo ""
echo "🔑 Credenciales de acceso:"
echo "   Usuario: admin@sleepplus.com"
echo "   Contraseña: admin123"
