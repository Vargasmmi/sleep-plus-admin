# Configuración de Dominio y Puerto en EasyPanel

## ⚠️ IMPORTANTE: Configuración del Puerto

En EasyPanel, asegúrate de que el dominio esté configurado con el puerto **5173**:

### 1. Ve a la sección "Domains"
### 2. Configura el dominio con estos valores:
   - **Host**: sleep-plus-admin-app.sleep-plus-admin.easypanel.host
   - **Port**: 5173 (¡NO 3001!)
   - **HTTPS**: Enabled ✓
   - **Path**: /

### 3. Si ya tienes un dominio configurado:
   - Haz clic en el dominio existente
   - Cambia el puerto de 3001 a **5173**
   - Guarda los cambios

## 📝 Explicación:
- El puerto **5173** sirve el frontend (la interfaz de usuario)
- El puerto **3001** es solo para la API del backend (interno)
- Los usuarios deben acceder por el puerto 5173

## 🔍 Para Verificar:
1. Accede a: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host/health
2. Deberías ver un JSON con el estado del servidor

## 🚨 Si No Funciona:
1. Verifica que el puerto en Domains sea 5173
2. Espera 2-3 minutos después de cambiar la configuración
3. Intenta acceder en modo incógnito o limpia caché
