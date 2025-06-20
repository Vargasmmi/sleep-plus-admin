# Guía de Despliegue en EasyPanel

## Prerrequisitos
- Cuenta activa en EasyPanel
- Proyecto creado en EasyPanel
- Acceso a Git/GitHub para el repositorio

## Pasos para el Despliegue

### 1. Preparar el Repositorio

Primero, asegúrate de que tu código esté en un repositorio Git:

```bash
cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2
git init
git add .
git commit -m "Initial commit for Sleep+ Admin"
```

### 2. Subir a GitHub (si aún no lo has hecho)

```bash
# Crea un nuevo repositorio en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/sleep-plus-admin.git
git branch -M main
git push -u origin main
```

### 3. Configurar en EasyPanel

1. **Accede a tu proyecto en EasyPanel**

2. **Crear nueva aplicación:**
   - Click en "Create Service" → "App"
   - Nombre: `sleep-plus-admin`
   - Selecciona "Git" como fuente

3. **Configurar el repositorio:**
   - URL del repositorio: `https://github.com/TU_USUARIO/sleep-plus-admin.git`
   - Branch: `main`
   - Build Path: `/` (raíz)

4. **Configurar Build & Deploy:**
   - Build Command: `npm ci && npm run build`
   - Start Command: `node server/production-server.js`
   - Port: `5173`

5. **Variables de Entorno:**
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_PORT=5173
   VITE_API_URL=https://tu-app.easypanel.host
   VITE_APP_NAME=Sleep+ Admin
   VITE_APP_VERSION=1.0.0
   VITE_ENABLE_DEVTOOLS=false
   ```

6. **Configurar Dockerfile:**
   - Enable: "Use Dockerfile"
   - Dockerfile Path: `./Dockerfile`

7. **Configurar Volúmenes (para persistir datos):**
   - Mount Path: `/app/db.json`
   - Size: 1GB

8. **Configurar Health Check:**
   - Path: `/health`
   - Port: `3001`
   - Interval: 30s

### 4. Desplegar

1. Click en "Deploy"
2. Espera a que el build termine
3. Tu aplicación estará disponible en: `https://sleep-plus-admin-TU_PROYECTO.easypanel.host`

## Verificación Post-Despliegue

1. **Verifica que la aplicación esté funcionando:**
   - Accede a la URL proporcionada por EasyPanel
   - Verifica que puedas ver la página de login
   - Prueba las funcionalidades básicas

2. **Monitorea los logs:**
   - En EasyPanel, ve a la sección "Logs" de tu aplicación
   - Verifica que no haya errores

3. **Verifica la persistencia de datos:**
   - Crea algunos registros
   - Reinicia la aplicación
   - Verifica que los datos persistan

## Troubleshooting

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de usar `npm ci` en lugar de `npm install`

### Error: "Port already in use"
- Verifica las variables de entorno PORT y FRONTEND_PORT
- Asegúrate de que los puertos configurados coincidan con el Dockerfile

### La aplicación no carga
- Verifica que VITE_API_URL apunte a la URL correcta de tu aplicación
- Revisa los logs del backend en el puerto 3001

### Datos no persisten
- Verifica que el volumen esté correctamente montado en `/app/db.json`
- Asegúrate de que el archivo db.json tenga los permisos correctos

## Comandos Útiles para Desarrollo Local

```bash
# Desarrollo local
npm run dev

# Build local
npm run build

# Preview del build
npm run preview

# Solo el servidor
npm run server

# Solo el cliente
npm run client
```
