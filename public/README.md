# Public Assets

Esta carpeta es para archivos estáticos que se servirán directamente sin procesamiento.

## Para agregar un favicon personalizado:

1. Agrega tu archivo `favicon.ico` en esta carpeta
2. Actualiza el `index.html` para referenciar el favicon:
   ```html
   <link rel="icon" href="/favicon.ico">
   ```

## Otros archivos estáticos:

- Imágenes
- Fuentes
- Archivos PDF
- Cualquier archivo que necesites servir directamente

Los archivos en esta carpeta estarán disponibles en la raíz de tu aplicación.
Por ejemplo: `/public/logo.png` estará disponible en `http://localhost:3000/logo.png`
