#!/bin/bash

echo "🔄 Verificando que el código esté en GitHub..."
git remote get-url origin
git log --oneline -1

echo ""
echo "🚀 Ejecutando despliegue en EasyPanel..."
./deploy-easypanel.sh

echo ""
echo "📋 Verificando estado del servicio..."
curl -X POST "http://168.231.92.67:3000/api/trpc/services.app.getService" \
  -H "Authorization: Bearer c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "projectName": "sleep-plus-admin",
      "serviceName": "sleep-plus-admin-app"
    }
  }' | python3 -m json.tool
