# 📋 Script de Listado de Suscripciones de Stripe

Este script te permite obtener y listar todas las suscripciones de tu cuenta de Stripe directamente desde la consola.

## 🚀 Características

- ✅ Obtiene suscripciones directamente desde Stripe API
- 🎨 Salida con colores y formato profesional
- 📊 Estadísticas automáticas de ingresos
- 🔍 Filtros avanzados por estado, cliente y producto
- 📄 Modo detallado con información adicional
- 🔧 Usa automáticamente tu configuración existente de Stripe

## 📦 Instalación

No requiere instalación adicional. El script usa las dependencias ya instaladas en tu proyecto.

## 💻 Uso Básico

### Listar todas las suscripciones:
```bash
node list-stripe-subscriptions.js
```

### Ver ayuda completa:
```bash
node list-stripe-subscriptions.js --help
```

## 🎯 Opciones Disponibles

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `-s, --status` | Filtrar por estado | `--status active` |
| `-c, --customer` | Filtrar por email del cliente | `--customer john@example.com` |
| `-p, --product` | Filtrar por nombre del producto | `--product "Premium Plan"` |
| `-d, --detailed` | Mostrar información detallada | `--detailed` |
| `--stats` | Mostrar solo estadísticas | `--stats` |
| `-h, --help` | Mostrar ayuda | `--help` |

## 📝 Ejemplos de Uso

### 1. Suscripciones activas únicamente:
```bash
node list-stripe-subscriptions.js --status active
```

### 2. Suscripciones canceladas:
```bash
node list-stripe-subscriptions.js --status canceled
```

### 3. Suscripciones con pagos vencidos:
```bash
node list-stripe-subscriptions.js --status past_due
```

### 4. Buscar por cliente específico:
```bash
node list-stripe-subscriptions.js --customer "cliente@ejemplo.com"
```

### 5. Buscar por producto:
```bash
node list-stripe-subscriptions.js --product "Elite Plan"
```

### 6. Información detallada con estadísticas:
```bash
node list-stripe-subscriptions.js --detailed --stats
```

### 7. Solo estadísticas rápidas:
```bash
node list-stripe-subscriptions.js --stats
```

### 8. Combinando filtros:
```bash
node list-stripe-subscriptions.js --status active --detailed --customer "john"
```

## 📋 Estados de Suscripción

El script maneja todos los estados de Stripe:

- **active** - Suscripciones activas
- **canceled** - Suscripciones canceladas
- **past_due** - Suscripciones con pagos vencidos
- **incomplete** - Suscripciones incompletas
- **trialing** - Suscripciones en período de prueba
- **all** - Todas las suscripciones (por defecto)

## 🎨 Salida del Script

### Información Básica Mostrada:
- 🆔 ID de la suscripción
- 📊 Estado (con colores)
- 👤 Información del cliente
- 📦 Producto/Plan
- 💰 Precio y frecuencia
- 📅 Fechas de creación y período actual

### Información Detallada (con --detailed):
- 🔧 Método de cobro
- ❌ Fecha de cancelación (si aplica)
- 🎯 Fin del período de prueba
- 🏷️ Metadata personalizada

### Estadísticas Automáticas:
- 📈 Total de suscripciones por estado
- 💰 Ingresos mensuales estimados
- 💰 Ingresos anuales estimados

## ⚙️ Configuración

El script usa automáticamente la configuración de Stripe almacenada en tu archivo `db.json`. No requiere configuración adicional.

### Verificar Configuración:
El script verificará automáticamente:
- ✅ Existencia del archivo de configuración
- ✅ Presencia de la clave secreta de Stripe
- ✅ Modo de operación (TEST/LIVE)

## 🔧 Resolución de Problemas

### Error: "Configuración de Stripe no encontrada"
- Verifica que tu archivo `db.json` contenga la configuración de Stripe
- Asegúrate de haber configurado Stripe desde la aplicación web

### Error: "Error obteniendo suscripciones"
- Verifica tu conexión a internet
- Confirma que tu clave de API de Stripe sea válida
- Revisa que tengas permisos de lectura en Stripe

### Rendimiento con muchas suscripciones:
- El script maneja automáticamente la paginación de Stripe
- Para cuentas con miles de suscripciones, considera usar filtros

## 📊 Ejemplo de Salida

```
🚀 INICIANDO LISTADO DE SUSCRIPCIONES DE STRIPE
============================================================

✅ Stripe configurado correctamente
🔧 Modo: TEST

🔍 Obteniendo suscripciones desde Stripe...
📦 Obtenidas: 15 suscripciones...
✅ Total obtenidas: 15 suscripciones

📋 LISTA DE SUSCRIPCIONES
================================================================================

1. sub_1234567890
   ● Estado: ACTIVE
   👤 Cliente: Juan Pérez
   📧 Email: juan@ejemplo.com
   📦 Producto: Plan Elite
   💰 Precio: 9.99 USD
   🔄 Frecuencia: month
   📅 Creado: 15/01/2024, 10:30
   📅 Período actual: 15/01/2024, 10:30 - 15/02/2024, 10:30

📊 ESTADÍSTICAS
==================================================
📈 Total de suscripciones: 15
✅ Activas: 12
❌ Canceladas: 2
⚠️ Vencidas: 1
⏳ Incompletas: 0
🎯 En prueba: 0

💰 INGRESOS (solo suscripciones activas):
   Mensual estimado: $89.88
   Anual estimado: $1,078.56

✅ Proceso completado exitosamente
```

## 🔗 Uso en Scripts Automatizados

También puedes usar este script en procesos automatizados o tareas programadas:

```bash
# Verificar suscripciones activas diariamente
node list-stripe-subscriptions.js --status active --stats > daily-report.txt

# Exportar suscripciones vencidas para seguimiento
node list-stripe-subscriptions.js --status past_due --detailed > past-due-report.txt
```

¡Listo para usar! 🎉 