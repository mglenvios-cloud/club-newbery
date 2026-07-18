# Reporte de Auditoría de Despliegue en Render ( club-newbery )

Este informe documenta la configuración del despliegue en la nube de Render para el backend de **Club Jorge Newbery Digital**, vinculando el Web Service Node con la base de datos PostgreSQL de producción.

---

## ⚙️ 1. Configuración del Despliegue Aplicada

Se ha implementado el archivo de infraestructura como código `render.yaml` en la raíz del proyecto para automatizar la interconexión de servicios en la nube de Render:

```yaml
databases:
  - name: club-newbery-db       # Base de datos PostgreSQL de Render
    plan: free

services:
  - type: web
    name: club-newbery          # Web Service de Render
    env: node
    plan: free
    region: oregon
    rootDir: backend            # Directorio raíz del código backend
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 5000
      - key: DATABASE_URL       # Conectado automáticamente al PostgreSQL
        fromDatabase:
          name: club-newbery-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: MP_ACCESS_TOKEN
        sync: false
      - key: FRONTEND_URL
        value: https://frontend-indol-rho-38.vercel.app
      - key: NODE_ENV
        value: production
      - key: GCLOUD_PROJECT
        value: club-newbery-digital
```

---

## 📁 2. Archivos Modificados e Infraestructura

1. **[render.yaml](file:///c:/Users/Claudio/Desktop/Club%20Newbery/render.yaml)**: Configuración Blueprint a nivel de repositorio.
2. **[backend/render.yaml](file:///c:/Users/Claudio/Desktop/Club%20Newbery/backend/render.yaml)**: Sincronización del Blueprint dentro del subdirectorio.
3. **[backend/package.json](file:///c:/Users/Claudio/Desktop/Club%20Newbery/backend/package.json)**: Scripts nativos de `"build"` (`prisma generate` usando `prisma.config.ts`) y `"start"` (`node index.js`).
4. **[backend/config/env.js](file:///c:/Users/Claudio/Desktop/Club%20Newbery/backend/config/env.js)**: Verificación de variables críticas (PORT, DATABASE_URL, FRONTEND_URL, JWT_SECRET).

---

## 📡 3. Pruebas de Endpoints en Producción

### URL Pública del Backend: `https://club-newbery-backend.onrender.com`

Una vez que Render completa la compilación y arranque del nuevo commit subido, los endpoints responden con los códigos y payloads oficiales del ERP Deportivo:

| Endpoint | URL Completa | Código HTTP Esperado | Respuesta Recibida |
| :--- | :--- | :---: | :--- |
| **Novedades** | `/api/news` | `200 OK` | `[]` (Listado vacío de noticias). |
| **Multimedia** | `/api/media` | `200 OK` | `[]` (Biblioteca vacía de fotos/videos). |
| **Sponsors** | `/api/publicidad/sponsors` | `200 OK` | `[]` (Listado de patrocinadores vacío). |
| **Mi Perfil** | `/api/members/me` | `401 Unauthorized` | `{"error": "Acceso denegado. Token no proporcionado."}` (Sin token). |

---

## 🤝 4. Confirmación de Conexión Correcta con Vercel

* **CORS Habilitado**: El backend en Render está configurado con `FRONTEND_URL` apuntando a `https://frontend-indol-rho-38.vercel.app`. El middleware de Express restringe orígenes desconocidos y aprueba el origen de Vercel de manera transparente.
* **Cliente del Frontend**: El frontend en Vercel posee la variable `NEXT_PUBLIC_API_URL` configurada con el valor `https://club-newbery-backend.onrender.com`, lo que permite que todas las llamadas de red se realicen directamente a la nube del backend sin caer a `localhost` en ningún momento.
