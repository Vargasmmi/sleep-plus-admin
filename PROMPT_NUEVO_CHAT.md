# PROMPT PARA NUEVO CHAT - Sleep+ Admin

## CONTEXTO RÁPIDO
Tengo desplegada una aplicación Sleep+ Admin en EasyPanel que está funcionando correctamente, pero no puedo acceder a ella porque el dominio está mal configurado.

## EL PROBLEMA
- La app tiene 2 servidores: Frontend (puerto 5173) y Backend (puerto 3001)
- El dominio en EasyPanel está apuntando al puerto 3001 (backend) en lugar del 5173 (frontend)
- Por eso veo "Server is running!" en lugar de la aplicación React

## INFORMACIÓN CLAVE
**EasyPanel:**
- URL: http://168.231.92.67:3000/
- Proyecto: sleep-plus-admin
- Servicio: sleep-plus-admin-app
- URL App: https://sleep-plus-admin-app.sleep-plus-admin.easypanel.host

**Ubicación Local:**
/Users/josemichaelhernandezvargas/Desktop/sleep-plus-admin-1-0-2

**GitHub:**
https://github.com/Vargasmmi/sleep-plus-admin.git

**Credenciales App:**
- Email: admin@sleepplus.com
- Password: admin123

## SOLUCIÓN PENDIENTE
Necesito cambiar en EasyPanel > Domains el puerto de 3001 a 5173. Los logs muestran que la app está funcionando:

```
✅ Frontend server is running!
🎨 Frontend URL: http://0.0.0.0:5173
🔧 Backend URL: http://localhost:3001
```

## ARCHIVOS DE AYUDA DISPONIBLES
En el directorio del proyecto hay varios scripts:
- verify-app-status.sh
- diagnose-easypanel.sh
- critical-fix-instructions.sh

La aplicación ya está funcionando, solo falta configurar correctamente el puerto del dominio en EasyPanel.
