#!/bin/bash

echo "🚀 Actualizando y desplegando Sleep+ Admin con logs mejorados"
echo "=============================================="

cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2

# 1. Hacer backup del archivo actual
echo "📋 Haciendo backup del archivo actual..."
cp server/production-server.js server/production-server.backup.js

# 2. Copiar el archivo actualizado
echo "📝 Actualizando production-server.js con más logs..."
cp server/production-server-updated.js server/production-server.js

# 3. Git status
echo -e "\n📊 Estado de Git:"
git status

# 4. Commit y push
echo -e "\n💾 Haciendo commit..."
git add server/production-server.js
git commit -m "Add detailed logging to production server for debugging"

echo -e "\n📤 Haciendo push..."
git push origin main

echo -e "\n✅ Cambios enviados a GitHub"
echo "=============================================="
echo ""
echo "PRÓXIMOS PASOS:"
echo "1. Ve a EasyPanel y verifica que el despliegue se inicie automáticamente"
echo "2. Si no se inicia, fuerza un nuevo despliegue"
echo "3. Revisa los logs para ver los nuevos mensajes detallados"
echo "4. IMPORTANTE: Verifica que el dominio esté apuntando al puerto 5173"
echo ""
echo "Para verificar el dominio en EasyPanel:"
echo "- Ve a: http://168.231.92.67:3000/"
echo "- Proyecto: sleep-plus-admin"
echo "- Servicio: sleep-plus-admin-app"
echo "- Pestaña: Domains"
echo "- El puerto debe ser: 5173 (NO 3001)"
