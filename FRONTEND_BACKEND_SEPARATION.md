# 🚀 Separación Frontend/Backend en EasyPanel

Este documento detalla cómo separar tu aplicación Sleep+ Admin en dos servicios independientes en EasyPanel.

## 📋 Resumen de Cambios

### Antes (Una sola app):
- `sleep-plus-admin-app` → Frontend (5173) + Backend (3001)

### Después (Dos apps separadas):
- `sleep-plus-admin-backend` → Solo Backend API (3001)
- `sleep-plus-admin-frontend` → Solo Frontend React (5173)

## 🛠️ Archivos Creados

1. **`docker/Dockerfile.backend`** - Docker para el backend
2. **`docker/Dockerfile.frontend`** - Docker para el frontend
3. **`server/backend-only.js`** - Servidor backend simplificado
4. **`src/config/api.config.js`** - Configuración de API para el frontend

## 📝 Instrucciones Paso a Paso

### Paso 1: Commit y Push de Cambios

```bash
cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2
git add .
git commit -m "Add Docker configurations for frontend/backend separation"
git push origin main
```

### Paso 2: Actualizar App Backend Existente

1. **Acceder a EasyPanel**: http://168.231.92.67:3000/
2. **Navegar a**: `sleep-plus-admin` → `sleep-plus-admin-app`
3. **En la pestaña "Build"**:
   - Build Type: `Dockerfile`
   - Dockerfile Path: `docker/Dockerfile.backend`

4. **En la pestaña "Environment"**:
   ```
   NODE_ENV=production
   PORT=3001
   DB_PATH=/app/data/db.json
   FRONTEND_URL=https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host
   ```

5. **En la pestaña "Domains"**:
   - Editar el dominio existente
   - Cambiar host a: `sleep-plus-admin-backend`
   - Puerto: `3001`
   - HTTPS: `Enabled`

6. **Deploy** la aplicación

### Paso 3: Crear Nueva App Frontend

1. **En el proyecto** `sleep-plus-admin`, click en **"Add Service"** → **"App"**
2. **Nombre**: `sleep-plus-admin-frontend`

3. **En la pestaña "Git"**:
   - Repository: `https://github.com/Vargasmmi/sleep-plus-admin.git`
   - Branch: `main`
   - Username: `Vargasmmi`
   - Token: `[TU_GITHUB_TOKEN]`

4. **En la pestaña "Build"**:
   - Build Type: `Dockerfile`
   - Dockerfile Path: `docker/Dockerfile.frontend`

5. **En la pestaña "Environment"**:
   ```
   NODE_ENV=production
   VITE_API_URL=https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host/api
   VITE_APP_NAME=Sleep+ Admin
   VITE_APP_VERSION=1.0.0
   VITE_ENABLE_DEVTOOLS=false
   ```

6. **En la pestaña "Domains"**:
   - Click en **"Add Domain"**
   - Host: `sleep-plus-admin-frontend`
   - Port: `5173`
   - HTTPS: `Enabled`
   - Path: `/`

7. **Deploy** la aplicación

### Paso 4: Verificación

#### Backend API:
```bash
curl https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "service": "backend",
  "timestamp": "2025-06-20T20:30:00.000Z",
  "database": "connected"
}
```

#### Frontend:
Abrir en el navegador: https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host

**Credenciales de prueba**:
- Email: `admin@sleepplus.com`
- Password: `admin123`

## 🔗 URLs Finales

- **Frontend**: https://sleep-plus-admin-frontend.sleep-plus-admin.easypanel.host
- **Backend API**: https://sleep-plus-admin-backend.sleep-plus-admin.easypanel.host

## ⚠️ Notas Importantes

1. **CORS**: El backend está configurado para aceptar peticiones del frontend
2. **Base de datos**: El volumen de datos permanece en el backend (`/app/data`)
3. **API URL**: El frontend usa `VITE_API_URL` para conectarse al backend
4. **Dependencias**: Ambas apps deben estar corriendo para que funcione correctamente

## 🔧 Troubleshooting

### Si el frontend no se conecta al backend:
1. Verificar que `VITE_API_URL` esté correctamente configurada
2. Verificar que el backend esté respondiendo en `/health`
3. Revisar los logs de ambas aplicaciones en EasyPanel

### Si hay errores de CORS:
1. Verificar que `FRONTEND_URL` en el backend incluya la URL del frontend
2. Revisar la configuración de CORS en `server/backend-only.js`

## 🎯 Beneficios de esta Separación

1. **Escalabilidad independiente**: Puedes escalar frontend y backend por separado
2. **Mejor organización**: Cada servicio tiene su propia responsabilidad
3. **Despliegues independientes**: Puedes actualizar uno sin afectar el otro
4. **Mejor debugging**: Los logs están separados por servicio
5. **Flexibilidad**: Puedes usar diferentes tecnologías en el futuro

## 📊 Arquitectura Final

```
┌─────────────────────────────────────┐
│         EasyPanel Project           │
│         sleep-plus-admin            │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   sleep-plus-admin-backend   │  │
│  │         (Port 3001)          │  │
│  │    - Express Server          │  │
│  │    - JSON-Server API         │  │
│  │    - Database (db.json)      │  │
│  │    - Volume: /app/data       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  sleep-plus-admin-frontend   │  │
│  │         (Port 5173)          │  │
│  │    - React/Vite App          │  │
│  │    - Static Build            │  │
│  │    - Connects to Backend     │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## ✅ Checklist de Verificación

- [ ] Código committeado y pusheado a GitHub
- [ ] Backend actualizado y desplegado
- [ ] Frontend creado y desplegado
- [ ] URLs de dominio funcionando
- [ ] API respondiendo correctamente
- [ ] Frontend conectándose al backend
- [ ] Login funcionando
- [ ] Datos persistentes en el backend

¡Con esto tienes tu aplicación separada en dos servicios independientes! 🎉
