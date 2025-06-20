#!/bin/bash

echo "🚀 Preparando Sleep+ Admin para EasyPanel..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No se encontró package.json. Asegúrate de estar en el directorio correcto.${NC}"
    exit 1
fi

# 1. Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm ci

# 2. Hacer build de prueba
echo -e "${YELLOW}🔨 Construyendo la aplicación...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi

# 3. Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📝 Inicializando repositorio Git...${NC}"
    git init
    git add .
    git commit -m "Initial commit - Sleep+ Admin ready for deployment"
    echo -e "${GREEN}✅ Repositorio Git inicializado${NC}"
else
    echo -e "${GREEN}✅ Repositorio Git ya existe${NC}"
fi

# 4. Crear archivo de configuración para EasyPanel
echo -e "${YELLOW}📋 Creando archivo de configuración para EasyPanel...${NC}"
cat > easypanel.json << EOF
{
  "name": "sleep-plus-admin",
  "services": {
    "app": {
      "type": "app",
      "build": {
        "type": "dockerfile",
        "dockerfilePath": "./Dockerfile"
      },
      "env": {
        "NODE_ENV": "production",
        "PORT": "3001",
        "FRONTEND_PORT": "5173",
        "VITE_API_URL": "https://\$EASYPANEL_DOMAIN",
        "VITE_APP_NAME": "Sleep+ Admin",
        "VITE_APP_VERSION": "1.0.0",
        "VITE_ENABLE_DEVTOOLS": "false"
      },
      "ports": [
        {
          "published": 5173,
          "target": 5173,
          "protocol": "http"
        }
      ],
      "volumes": [
        {
          "type": "volume",
          "source": "db-data",
          "target": "/app/db.json"
        }
      ],
      "healthcheck": {
        "test": ["CMD", "curl", "-f", "http://localhost:3001/health"],
        "interval": "30s",
        "timeout": "3s",
        "retries": 3
      }
    }
  }
}
EOF

echo -e "${GREEN}✅ Archivo de configuración creado${NC}"

# 5. Mostrar siguiente paso
echo -e "\n${GREEN}🎉 ¡Preparación completada!${NC}"
echo -e "\n${YELLOW}Próximos pasos:${NC}"
echo "1. Sube tu código a GitHub:"
echo "   git remote add origin https://github.com/TU_USUARIO/sleep-plus-admin.git"
echo "   git push -u origin main"
echo ""
echo "2. En EasyPanel:"
echo "   - Crea un nuevo servicio tipo 'App'"
echo "   - Conecta tu repositorio de GitHub"
echo "   - Usa las configuraciones del archivo DEPLOY-EASYPANEL.md"
echo ""
echo "3. Variables de entorno importantes a configurar en EasyPanel:"
echo "   - VITE_API_URL (se actualizará con tu dominio de EasyPanel)"
echo "   - Cualquier clave de API de Stripe si las necesitas"
echo ""
echo -e "${GREEN}📚 Consulta DEPLOY-EASYPANEL.md para instrucciones detalladas${NC}"
