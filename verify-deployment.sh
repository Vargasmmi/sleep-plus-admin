#!/bin/bash

# Script de verificación pre-despliegue para Sleep+ Admin

echo "🔍 Verificando requisitos para despliegue en EasyPanel..."
echo "=================================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2 encontrado${NC}"
    else
        echo -e "${RED}❌ $2 no encontrado: $1${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $2 encontrado${NC}"
    else
        echo -e "${RED}❌ $2 no encontrado: $1${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

echo -e "\n📁 Verificando estructura del proyecto:"
echo "--------------------------------------"
check_file "package.json" "package.json"
check_file "Dockerfile" "Dockerfile"
check_file "docker-compose.yml" "docker-compose.yml"
check_file ".env" ".env"
check_file "db.json" "Base de datos"
check_file "routes.json" "Rutas JSON Server"
check_dir "server" "Directorio server"
check_dir "src" "Directorio src"
check_file "server/server.js" "Servidor principal"
check_file "server/production-server.js" "Servidor de producción"

echo -e "\n🔧 Verificando configuración:"
echo "-----------------------------"

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
    
    # Verificar versión mínima
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ $NODE_MAJOR -lt 18 ]; then
        echo -e "${YELLOW}⚠️  Se requiere Node.js 18 o superior${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Node.js no instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ NPM instalado: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ NPM no instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar Git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✅ Git instalado${NC}"
    
    # Verificar si es un repositorio Git
    if [ -d ".git" ]; then
        echo -e "${GREEN}✅ Repositorio Git inicializado${NC}"
        
        # Verificar remote
        if git remote -v | grep -q origin; then
            REMOTE_URL=$(git remote get-url origin 2>/dev/null)
            echo -e "${GREEN}✅ Remote configurado: $REMOTE_URL${NC}"
        else
            echo -e "${YELLOW}⚠️  No hay remote configurado${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  No es un repositorio Git${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Git no instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n📦 Verificando dependencias:"
echo "---------------------------"

# Verificar si node_modules existe
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencias no instaladas (ejecuta: npm install)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Verificar Docker (opcional para EasyPanel)
echo -e "\n🐳 Verificando Docker (opcional):"
echo "--------------------------------"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker instalado: $DOCKER_VERSION${NC}"
    
    # Verificar si Docker está corriendo
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✅ Docker daemon está corriendo${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker daemon no está corriendo${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}ℹ️  Docker no instalado (no requerido para EasyPanel)${NC}"
fi

# Verificar variables de entorno
echo -e "\n🔐 Verificando variables de entorno:"
echo "-----------------------------------"
if [ -f ".env" ]; then
    # Verificar variables críticas
    if grep -q "VITE_API_URL" .env; then
        echo -e "${GREEN}✅ VITE_API_URL configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  VITE_API_URL no configurado${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Intentar hacer build
echo -e "\n🔨 Verificando build:"
echo "-------------------"
echo "Ejecutando build de prueba..."
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
    
    # Verificar que se creó el directorio dist
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Directorio dist creado${NC}"
    else
        echo -e "${RED}❌ Directorio dist no creado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Error en el build${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Resumen
echo -e "\n=================================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo listo para el despliegue!${NC}"
    echo -e "\nPróximos pasos:"
    echo "1. Sube tu código a GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Preparado para EasyPanel'"
    echo "   git push origin main"
    echo ""
    echo "2. Sigue las instrucciones en DEPLOY-EASYPANEL.md"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Verificación completada con $WARNINGS advertencias${NC}"
    echo -e "\nPuedes proceder con el despliegue, pero revisa las advertencias."
else
    echo -e "${RED}❌ Verificación fallida con $ERRORS errores y $WARNINGS advertencias${NC}"
    echo -e "\nCorrige los errores antes de continuar con el despliegue."
fi

echo ""
exit $ERRORS
