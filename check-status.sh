#!/bin/bash

# Script para verificar el estado de GitHub y EasyPanel

echo "🔍 Verificando estado actual..."
echo ""

# Verificar rama actual
echo "📍 Rama actual de Git:"
cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2
git branch --show-current
echo ""

# Verificar commits pendientes
echo "📝 Commits pendientes:"
git log --oneline -5
echo ""

# Verificar si el proyecto existe en EasyPanel
echo "🔍 Verificando proyecto en EasyPanel..."
curl -s -X POST "http://168.231.92.67:3000/api/trpc/projects.listProjects" \
  -H "Authorization: Bearer c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58" \
  -H "Content-Type: application/json" \
  -d '{"json":{}}' | python3 -m json.tool 2>/dev/null | grep -A 2 "sleep-plus-admin" || echo "Proyecto no encontrado"

echo ""
echo "✅ Verificación completada"
echo ""
echo "📋 Próximos pasos:"
echo "1. Permitir los secretos en GitHub (si no lo has hecho)"
echo "2. Ejecutar: git push origin main"
echo "3. Ejecutar: ./deploy-easypanel.sh"
