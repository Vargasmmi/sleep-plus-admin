#!/bin/bash

echo "🚨 INSTRUCCIONES CRÍTICAS PARA SOLUCIONAR EL PROBLEMA"
echo "===================================================="
echo ""
echo "TU APLICACIÓN ESTÁ FUNCIONANDO ✅"
echo "PERO NO PUEDES VERLA PORQUE EL DOMINIO ESTÁ MAL CONFIGURADO ❌"
echo ""
echo "SIGUE ESTOS PASOS EXACTOS:"
echo ""
echo "1️⃣ ABRE EASYPANEL"
echo "   URL: http://168.231.92.67:3000/"
echo "   (Abre en tu navegador)"
echo ""
echo "2️⃣ NAVEGA AL SERVICIO"
echo "   - Haz clic en el proyecto: 'sleep-plus-admin'"
echo "   - Haz clic en el servicio: 'sleep-plus-admin-app'"
echo ""
echo "3️⃣ VE A LA PESTAÑA 'DOMAINS'"
echo "   (Es una de las pestañas en la parte superior)"
echo ""
echo "4️⃣ BUSCA EL DOMINIO Y VERIFICA EL PUERTO"
echo "   Deberías ver algo como:"
echo "   ┌─────────────────────────────────────────────────────┐"
echo "   │ Host: sleep-plus-admin-app.sleep-plus-admin...     │"
echo "   │ Port: [????]  ← ESTE DEBE SER 5173, NO 3001       │"
echo "   │ HTTPS: ✓                                            │"
echo "   │ Path: /                                             │"
echo "   └─────────────────────────────────────────────────────┘"
echo ""
echo "5️⃣ SI EL PUERTO NO ES 5173:"
echo "   a) Haz clic en el botón de EDITAR (ícono de lápiz)"
echo "   b) CAMBIA el puerto de 3001 a 5173"
echo "   c) Haz clic en SAVE/GUARDAR"
echo "   d) Espera 30 segundos"
echo ""
echo "6️⃣ ACCEDE A TU APLICACIÓN"
echo "   URL: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host"
echo ""
echo "===================================================="
echo "❓ ¿CÓMO SABER SI ESTÁ BIEN CONFIGURADO?"
echo ""
echo "MAL ❌: Si ves un mensaje de texto 'Server is running!'"
echo "        → Significa que estás viendo el backend (puerto 3001)"
echo ""
echo "BIEN ✅: Si ves una página de login de Sleep+ Admin"
echo "        → Significa que estás viendo el frontend (puerto 5173)"
echo ""
echo "===================================================="
echo "📸 CAPTURA DE PANTALLA"
echo ""
echo "Si necesitas ayuda, toma una captura de pantalla de:"
echo "- La pestaña 'Domains' en EasyPanel"
echo "- Lo que ves cuando intentas acceder a la URL"
echo ""
echo "===================================================="

# Crear un archivo HTML de prueba para verificar
cat > test-port.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Test de Puertos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test { margin: 20px 0; padding: 20px; border: 2px solid #ccc; }
        .success { background: #d4edda; border-color: #28a745; }
        .error { background: #f8d7da; border-color: #dc3545; }
    </style>
</head>
<body>
    <h1>Test de Configuración de Puertos</h1>
    
    <div class="test">
        <h2>Frontend (Puerto 5173)</h2>
        <iframe src="http://localhost:5173" width="100%" height="200"></iframe>
    </div>
    
    <div class="test">
        <h2>Backend (Puerto 3001)</h2>
        <iframe src="http://localhost:3001" width="100%" height="200"></iframe>
    </div>
    
    <div class="test">
        <h2>Instrucciones</h2>
        <p>En EasyPanel, el dominio DEBE apuntar al puerto 5173 para ver la aplicación React.</p>
        <p>Si apunta al 3001, solo verás el mensaje del backend.</p>
    </div>
</body>
</html>
EOF

echo "📄 Archivo de prueba creado: test-port.html"
echo ""
echo "🔑 Una vez que funcione, usa estas credenciales:"
echo "   Email: admin@sleepplus.com"
echo "   Password: admin123"
