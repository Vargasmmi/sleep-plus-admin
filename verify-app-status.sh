#!/bin/bash

echo "🔍 VERIFICACIÓN RÁPIDA DE SLEEP+ ADMIN"
echo "======================================"

URL="https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"

echo -e "\n1️⃣ Verificando disponibilidad de la aplicación..."
echo "URL: $URL"

# Hacer una petición HTTP
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "$URL" 2>/dev/null)

echo -e "\n2️⃣ Resultado:"
case $HTTP_STATUS in
    200)
        echo "✅ ¡La aplicación está funcionando correctamente!"
        echo "   Código HTTP: $HTTP_STATUS"
        echo ""
        echo "🎉 Puedes acceder a la aplicación en:"
        echo "   $URL"
        echo ""
        echo "🔑 Credenciales:"
        echo "   Email: admin@sleepplus.com"
        echo "   Password: admin123"
        ;;
    502)
        echo "❌ Error 502 Bad Gateway"
        echo "   Esto significa que el puerto está MAL configurado"
        echo "   SOLUCIÓN: Cambia el puerto del dominio a 5173 en EasyPanel"
        ;;
    503)
        echo "⏳ Error 503 Service Unavailable"
        echo "   El servicio se está iniciando o desplegando"
        echo "   Espera 2-3 minutos más"
        ;;
    000)
        echo "❌ No se pudo conectar"
        echo "   - Verifica tu conexión a internet"
        echo "   - El servicio puede estar detenido"
        ;;
    *)
        echo "⚠️  Código HTTP inesperado: $HTTP_STATUS"
        echo "   Revisa los logs en EasyPanel para más detalles"
        ;;
esac

echo -e "\n3️⃣ Verificando los puertos con netcat..."
echo "Puerto 5173 (Frontend):"
nc -zv sleep-plus-admin-app.sleep-plus-admin.easypanel.host 443 2>&1 | grep -E "succeeded|open" || echo "❌ No accesible"

echo -e "\n======================================"
echo "📋 RESUMEN DE CONFIGURACIÓN CORRECTA:"
echo "- Dominio: sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo "- Puerto en EasyPanel: 5173 (⚠️ NO 3001)"
echo "- HTTPS: Habilitado"
echo "- Frontend corre en: 5173"
echo "- Backend corre en: 3001 (interno)"
echo ""
echo "Si no funciona, verifica en EasyPanel:"
echo "1. Domains → Puerto = 5173"
echo "2. Logs → Busca 'Frontend server is running!'"
echo "3. Deployments → Estado = Running"
