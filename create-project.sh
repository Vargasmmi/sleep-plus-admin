#!/bin/bash

# Verificar si el proyecto existe
echo "🔍 Verificando proyecto en EasyPanel..."

# Listar proyectos
response=$(curl -s -X POST "http://168.231.92.67:3000/api/trpc/projects.listProjects" \
  -H "Authorization: Bearer c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58" \
  -H "Content-Type: application/json" \
  -d '{"json":{}}')

echo "$response" | python3 -m json.tool

# Si el proyecto no existe, crearlo
if ! echo "$response" | grep -q "sleep-plus-admin"; then
  echo ""
  echo "📦 Creando proyecto sleep-plus-admin..."
  
  curl -X POST "http://168.231.92.67:3000/api/trpc/projects.createProject" \
    -H "Authorization: Bearer c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58" \
    -H "Content-Type: application/json" \
    -d '{
      "json": {
        "name": "sleep-plus-admin"
      }
    }'
else
  echo ""
  echo "✅ Proyecto sleep-plus-admin ya existe"
fi
