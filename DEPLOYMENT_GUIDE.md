# 🚀 Guía Completa de Despliegue - Sleep+ Admin en EasyPanel

## 📋 Resumen del Problema

Los scripts automáticos de despliegue están fallando debido a problemas con la API de EasyPanel (errores 500). He creado varias alternativas para resolver esto.

## 🛠️ Soluciones Disponibles

### Opción 1: Script Automático Mejorado (Recomendado)

Ejecuta el nuevo script que maneja mejor los errores:

```bash
cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2

# Hacer el script ejecutable
chmod +x deploy-easypanel-fixed.sh

# Ejecutar el script
./deploy-easypanel-fixed.sh
```

O usa la versión Node.js:

```bash
node deploy-to-easypanel-fixed.js
```

### Opción 2: Despliegue Manual en EasyPanel (Más Confiable)

1. **Accede a EasyPanel**
   - URL: http://168.231.92.67:3000/
   - Usa tus credenciales de administrador

2. **Crea un Proyecto**
   - Click en "New Project" o "Create Project"
   - Nombre: `sleep-plus-admin`
   - Descripción: "Sleep+ Admin Application"

3. **Crea un Servicio**
   - Dentro del proyecto, click en "New Service" o "Add Service"
   - Tipo: "App" o "Application"
   - Nombre: `sleep-plus-admin-app`

4. **Configura la Fuente (Source)**
   - Source Type: `Git`
   - Repository URL: `https://github.com/Vargasmmi/sleep-plus-admin.git`
   - Branch: `main`
   - Build Type: `Dockerfile`
   - Dockerfile Path: `./Dockerfile`

5. **Configura las Variables de Entorno**
   
   Copia y pega estas variables:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_PORT=5173
   VITE_API_URL=https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host
   VITE_APP_NAME=Sleep+ Admin
   VITE_APP_VERSION=1.0.0
   VITE_ENABLE_DEVTOOLS=false
   ```

6. **Configura el Dominio**
   - Domain: `sleep-plus-admin-app.sleep-plus-admin.easypanel.host`
   - Port: `5173`
   - HTTPS: `Enabled` ✓
   - Path: `/`

7. **Configura Recursos (Resources)**
   - Memory Limit: `512 MB`
   - Memory Reservation: `256 MB`
   - CPU Limit: `1`
   - CPU Reservation: `0.25`

8. **Configura Volumen (Storage)**
   - Click en "Add Volume" o "Add Mount"
   - Mount Path: `/app/db.json`
   - Type: `Volume`
   - Name: `db-data`

9. **Deploy Command (Opcional)**
   - Command: `node server/production-server.js`

10. **Iniciar Despliegue**
    - Click en "Deploy" o "Save and Deploy"
    - Espera 5-10 minutos para que complete

### Opción 3: Despliegue Local con Docker (Alternativa)

Si EasyPanel sigue dando problemas, puedes usar Docker localmente:

```bash
cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2

# Construir y ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 🔍 Verificación del Despliegue

Ejecuta el script de verificación:

```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

O verifica manualmente:

1. **En EasyPanel**: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host
2. **Localmente**: http://localhost:5173

## 🔑 Credenciales de Acceso

- **Usuario**: admin@sleepplus.com
- **Contraseña**: admin123

## 🚨 Solución de Problemas Comunes

### Error 500 en la API
- Usa el despliegue manual (Opción 2)
- Verifica que EasyPanel esté funcionando correctamente

### La aplicación no se construye
- Verifica los logs en EasyPanel
- Asegúrate de que el Dockerfile esté correcto
- Verifica que todas las dependencias estén en package.json

### Error de dominio no encontrado
- Espera 5-10 minutos después del despliegue
- Verifica la configuración del dominio en EasyPanel
- Intenta acceder por IP:Puerto si el dominio no funciona

### Base de datos no persiste
- Verifica que el volumen esté configurado correctamente
- Mount path debe ser exactamente: `/app/db.json`

## 📞 Siguientes Pasos

1. **Intenta primero** el script automático mejorado
2. **Si falla**, usa el despliegue manual (más confiable)
3. **Como última opción**, usa Docker localmente
4. **Verifica** el despliegue con el script de verificación

## 💡 Tips Adicionales

- El despliegue inicial puede tardar 5-10 minutos
- Si cambias el código, haz push a GitHub y redespliega
- Monitorea los logs en EasyPanel para ver el progreso
- La aplicación tiene health checks configurados

## 🔗 URLs Importantes

- **GitHub**: https://github.com/Vargasmmi/sleep-plus-admin.git
- **EasyPanel**: http://168.231.92.67:3000/
- **Aplicación**: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host

---

¿Necesitas ayuda adicional? Los logs de EasyPanel te darán más información sobre cualquier error específico.
