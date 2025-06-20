#!/bin/bash

# Script para verificar el estado del despliegue
SERVICE_URL="https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
LOCAL_URL="http://localhost:5173"

echo "🔍 Verificando el despliegue de Sleep+ Admin..."
echo ""

# Función para verificar URL
check_url() {
    local url=$1
    local name=$2
    
    echo -n "Verificando $name ($url)... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo "✅ Disponible"
        return 0
    else
        echo "❌ No disponible"
        return 1
    fi
}

# Verificar EasyPanel
echo "1. Verificando despliegue en EasyPanel:"
if check_url "$SERVICE_URL" "EasyPanel"; then
    echo "   La aplicación está desplegada correctamente en EasyPanel"
    echo "   URL: $SERVICE_URL"
    echo "   Credenciales:"
    echo "   - Usuario: admin@sleepplus.com"
    echo "   - Contraseña: admin123"
else
    echo "   La aplicación NO está disponible en EasyPanel aún"
    echo "   Posibles razones:"
    echo "   - El despliegue está en progreso (espera 5-10 minutos)"
    echo "   - Hubo un error en el despliegue"
    echo "   - El servicio no está configurado correctamente"
fi

echo ""

# Verificar local
echo "2. Verificando despliegue local:"
if check_url "$LOCAL_URL" "Local"; then
    echo "   La aplicación está ejecutándose localmente"
    echo "   URL: $LOCAL_URL"
else
    echo "   La aplicación NO está ejecutándose localmente"
fi

echo ""

# Verificar Docker
echo "3. Verificando Docker:"
if command -v docker &> /dev/null; then
    echo "   Docker está instalado ✅"
    
    if docker ps | grep -q "sleep-plus-admin"; then
        echo "   El contenedor está ejecutándose ✅"
        echo ""
        echo "   Logs del contenedor:"
        docker logs sleep-plus-admin --tail 10
    else
        echo "   El contenedor NO está ejecutándose"
        echo "   Puedes iniciarlo con: docker-compose up -d"
    fi
else
    echo "   Docker NO está instalado"
fi

echo ""
echo "📋 Resumen de comandos útiles:"
echo "   - Ver logs de EasyPanel: Accede al panel web"
echo "   - Ver logs locales: docker logs sleep-plus-admin -f"
echo "   - Reiniciar servicio: docker-compose restart"
echo "   - Detener servicio: docker-compose down"
echo "   - Iniciar servicio: docker-compose up -d"
