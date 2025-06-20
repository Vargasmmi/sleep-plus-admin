#!/bin/bash

echo "🔧 SOLUCIÓN DIRECTA PARA SLEEP+ ADMIN EN EASYPANEL"
echo "=================================================="

API_TOKEN="c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58"
EASYPANEL_URL="http://168.231.92.67:3000"

echo -e "\n1️⃣ Verificando conexión con EasyPanel..."

# Intentar obtener información del proyecto
PROJECTS=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/projects" 2>/dev/null)

if [[ "$PROJECTS" == *"html"* ]]; then
    echo "❌ La API está devolviendo HTML. Intentando endpoints alternativos..."
    
    # Intentar endpoint v1
    PROJECTS=$(curl -s -H "Authorization: Bearer ${API_TOKEN}" \
      "${EASYPANEL_URL}/api/v1/projects" 2>/dev/null)
fi

echo -e "\n2️⃣ Forzando redeploy del servicio..."

# Intentar varios endpoints de deploy
echo "Intentando endpoint v1..."
DEPLOY_RESPONSE=$(curl -X POST -H "Authorization: Bearer ${API_TOKEN}" \
  "${EASYPANEL_URL}/api/v1/projects/sleep-plus-admin/services/sleep-plus-admin-app/redeploy" 2>/dev/null)

if [[ -z "$DEPLOY_RESPONSE" || "$DEPLOY_RESPONSE" == *"html"* ]]; then
    echo "Intentando endpoint alternativo..."
    DEPLOY_RESPONSE=$(curl -X POST -H "Authorization: Bearer ${API_TOKEN}" \
      "${EASYPANEL_URL}/api/projects/sleep-plus-admin/services/sleep-plus-admin-app/deploy" 2>/dev/null)
fi

if [[ -z "$DEPLOY_RESPONSE" || "$DEPLOY_RESPONSE" == *"html"* ]]; then
    echo "Intentando endpoint de rebuild..."
    DEPLOY_RESPONSE=$(curl -X POST -H "Authorization: Bearer ${API_TOKEN}" \
      "${EASYPANEL_URL}/api/v1/projects/sleep-plus-admin/services/sleep-plus-admin-app/rebuild" 2>/dev/null)
fi

echo -e "\n3️⃣ INSTRUCCIONES MANUALES:"
echo "=================================================="
echo ""
echo "Como la API parece tener problemas, sigue estos pasos manualmente:"
echo ""
echo "1. Abre tu navegador y ve a: http://168.231.92.67:3000/"
echo ""
echo "2. Inicia sesión si es necesario"
echo ""
echo "3. Ve al proyecto 'sleep-plus-admin'"
echo ""
echo "4. Haz clic en el servicio 'sleep-plus-admin-app'"
echo ""
echo "5. Ve a la pestaña 'Domains' y verifica que:"
echo "   - Host: sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo "   - Port: 5173 (⚠️ CRÍTICO: debe ser 5173, NO 3001)"
echo "   - HTTPS: Enabled"
echo "   - Path: /"
echo ""
echo "6. Si el puerto no es 5173:"
echo "   - Haz clic en el botón de editar (lápiz)"
echo "   - Cambia el puerto a 5173"
echo "   - Guarda los cambios"
echo ""
echo "7. Ve a la pestaña 'Deployments' y:"
echo "   - Haz clic en 'Deploy' o 'Redeploy'"
echo "   - Espera a que el despliegue termine (status: Running)"
echo ""
echo "8. Ve a la pestaña 'Logs' para verificar que:"
echo "   - El frontend esté corriendo en puerto 5173"
echo "   - El backend esté corriendo en puerto 3001"
echo "   - No haya errores de build"
echo ""
echo "9. Una vez completado, accede a:"
echo "   https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo ""
echo "🔑 Credenciales:"
echo "   Email: admin@sleepplus.com"
echo "   Password: admin123"
echo ""
echo "=================================================="
echo ""
echo "💡 TIPS ADICIONALES:"
echo ""
echo "- Si ves 'Bad Gateway', el puerto está mal configurado (debe ser 5173)"
echo "- Si ves 'Connection refused', espera 2-3 minutos más"
echo "- Si el build falla, revisa los logs para ver el error específico"
echo "- Los nuevos logs mejorados mostrarán más detalles del proceso"
echo ""
echo "📝 CAMBIOS REALIZADOS:"
echo "✅ Se actualizó production-server.js con logs detallados"
echo "✅ El código ya está en GitHub"
echo "✅ El servidor ahora muestra claramente en qué puerto corre cada servicio"
echo ""
echo "⏳ El despliegue tomará aproximadamente 3-5 minutos"
