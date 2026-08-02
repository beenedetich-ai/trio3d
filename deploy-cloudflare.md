# Guía de Publicación en Cloudflare Pages para Trío 3D

Este proyecto está 100% configurado y optimizado para ser desplegado en **Cloudflare Pages** mediante exportación estática (`output: 'export'`).

---

## Opción 1: Despliegue Automático desde GitHub (Recomendado)

1. **Subir el código a tu repositorio de GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Trío 3D Web"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/trio-3d.git
   git push -u origin main
   ```

2. **Conectar en Cloudflare Pages**:
   - Ingresa al Panel de [Cloudflare Dashboard](https://dash.cloudflare.com/).
   - En el menú lateral, dirígete a **Workers y Pages** > **Crear aplicación** > **Pages** > **Conectar a Git**.
   - Selecciona tu repositorio `trio-3d` y la rama `main`.

3. **Configurar Build**:
   - **Preset de Framework**: `Next.js (Static HTML Export)`
   - **Comando de construcción (Build command)**: `npm run build`
   - **Directorio de salida (Build output directory)**: `out`

4. **Variables de Entorno (Environment Variables)**:
   - En la sección *Environment variables (advanced)* agrega:
     - `NODE_VERSION`: `20`

5. Haz clic en **Save and Deploy**. ¡Listo! En menos de 1 minuto tu sitio web estará online con SSL gratis, CDN global de baja latencia y optimización completa.

---

## Opción 2: Despliegue Directo desde Consola con Wrangler CLI

Si deseas publicar directamente desde tu computadora sin conectar GitHub:

1. Ejecuta el build local para generar la carpeta `out`:
   ```bash
   npm run build
   ```

2. Publica la carpeta `out` con Wrangler:
   ```bash
   npx wrangler pages deploy out --project-name=trio-3d
   ```

---

## Estructura de Salida Generada

- `out/`: Contiene todo el sitio en HTML, CSS, JavaScript e imágenes optimizadas.
- `public/_headers`: Incluye cabeceras de seguridad HTTP y políticas de caché agresivas para archivos estáticos e imágenes.
