#!/bin/bash

echo "🔍 DIAGNÓSTICO FINAL - SLEEP+ ADMIN"
echo "===================================="
echo ""
echo "✅ TU APLICACIÓN ESTÁ FUNCIONANDO CORRECTAMENTE"
echo ""
echo "Los logs muestran que:"
echo "- Frontend: ✅ Corriendo en puerto 5173"
echo "- Backend: ✅ Corriendo en puerto 3001"
echo "- Archivos: ✅ index.html encontrado en /app/dist"
echo ""
echo "❌ PERO NO PUEDES ACCEDER PORQUE:"
echo "El dominio en EasyPanel NO está apuntando al puerto correcto"
echo ""
echo "🔧 SOLUCIÓN INMEDIATA:"
echo "===================================="
echo ""
echo "1. Ve a EasyPanel: http://168.231.92.67:3000/"
echo ""
echo "2. Navega a: sleep-plus-admin > sleep-plus-admin-app > Domains"
echo ""
echo "3. VERIFICA/CORRIGE la configuración del dominio:"
echo "   Host: sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo "   Port: 5173  ⚠️  DEBE SER 5173, NO 3001"
echo "   HTTPS: Enabled ✓"
echo "   Path: / ✓"
echo ""
echo "4. Si el puerto NO es 5173:"
echo "   - Haz clic en el ícono de editar (lápiz)"
echo "   - CAMBIA el puerto a 5173"
echo "   - Guarda los cambios"
echo "   - Espera 30 segundos"
echo ""
echo "5. Accede a: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo ""
echo "===================================="
echo "🎯 VERIFICACIÓN RÁPIDA:"
echo ""
echo "Si el puerto está en 3001 → Verás el mensaje del backend 'Server is running!'"
echo "Si el puerto está en 5173 → Verás la aplicación React (login)"
echo ""
echo "Tu aplicación NECESITA que accedas por el puerto 5173"
echo "===================================="

# Intentar hacer un curl para verificar
echo -e "\n🔍 Verificando acceso actual..."
URL="https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"

# Verificar qué responde actualmente
RESPONSE=$(curl -s -L "$URL" | head -20)

if [[ "$RESPONSE" == *"Server is running"* ]]; then
    echo "❌ CONFIRMADO: El dominio está apuntando al puerto 3001 (backend)"
    echo "   DEBES cambiarlo a 5173 en EasyPanel"
elif [[ "$RESPONSE" == *"<!doctype html>"* ]] && [[ "$RESPONSE" == *"Sleep+"* ]]; then
    echo "✅ El dominio parece estar configurado correctamente"
    echo "   La aplicación debería estar accesible"
else
    echo "⚠️  No se pudo determinar el estado actual"
fi

echo ""
echo "🔑 Credenciales para cuando funcione:"
echo "Email: admin@sleepplus.com"
echo "Password: admin123"
