# 🚀 Despliegue Rápido en EasyPanel - Sleep+ Admin

## Pasos Esenciales (5 minutos)

### 1️⃣ Preparar el código
```bash
cd /Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2

# Verificar que todo esté listo
bash verify-deployment.sh

# Si no tienes Git iniciado
git init
git add .
git commit -m "Initial deployment to EasyPanel"
```

### 2️⃣ Subir a GitHub
```bash
# Crear repositorio en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/sleep-plus-admin.git
git push -u origin main
```

### 3️⃣ En EasyPanel

1. **Crear App**:
   - Ve a tu proyecto en EasyPanel
   - Click "Create Service" → "App"
   - Nombre: `sleep-plus-admin`

2. **Conectar GitHub**:
   - Source: Git
   - Repository: `https://github.com/TU_USUARIO/sleep-plus-admin.git`
   - Branch: `main`

3. **Configuración Rápida**:
   ```
   Build Command: npm ci && npm run build
   Start Command: node server/production-server.js
   Port: 5173
   Use Dockerfile: ✅ (Enable)
   ```

4. **Variables de Entorno** (copiar todo):
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_PORT=5173
   VITE_API_URL=https://sleep-plus-admin.tu-proyecto.easypanel.host
   VITE_APP_NAME=Sleep+ Admin
   VITE_APP_VERSION=1.0.0
   VITE_ENABLE_DEVTOOLS=false
   ```

5. **Deploy** → Click "Deploy"

## ✅ Verificación

Una vez desplegado:
1. Accede a: `https://sleep-plus-admin.tu-proyecto.easypanel.host`
2. Login: `admin@sleepplus.com` / `admin123`
3. Verifica el dashboard

## 🆘 Solución Rápida de Problemas

**No carga la página:**
- Verifica en Logs que ambos servidores estén corriendo
- Revisa que VITE_API_URL tenga tu dominio correcto

**Error de build:**
- Verifica que todas las dependencias estén en package.json
- Revisa los logs de build en EasyPanel

**Base de datos no persiste:**
- Configura un volumen en `/app/db.json`

---
📚 Para más detalles, consulta `DEPLOY-EASYPANEL.md`
