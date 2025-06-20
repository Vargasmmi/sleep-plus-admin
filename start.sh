#!/bin/bash

echo "===================================="
echo "  Sleep+ Admin - Sistema de Gestion"
echo "===================================="
echo ""
echo "Instalando dependencias..."
npm install
echo ""
echo "Iniciando servidor de desarrollo..."
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
echo "Credenciales de prueba:"
echo "- Admin: admin@lamattressstore.com / admin123"
echo "- Manager: john.smith@lamattressstore.com / demo123"
echo "- Agente: maria.garcia@lamattressstore.com / demo123"
echo ""
npm run dev
