# Reporte de Auditoría de Despliegue y Configuración de Producción

Este informe presenta la auditoría técnica del entorno de producción y del despliegue efectivo de la aplicación **Club Jorge Newbery Digital** en Vercel.

---

## 🌐 1. Variables de Entorno en Vercel

* **Variable Auditada:** `NEXT_PUBLIC_API_URL`
* **Confirmación de Existencia:** **Sí**, la variable de entorno está correctamente definida en el Panel de Administración de Vercel.
* **Valor Configurado en Producción:** `https://club-newbery-backend.onrender.com`
* **Confirmación de No-Localhost:** **Confirmado**. La variable apunta de forma estricta y segura a la nube y **no** contiene ninguna referencia a `localhost` o `127.0.0.1`.

---

## ⚙️ 2. Valor Utilizado Durante el Build de Producción

Durante el proceso de compilación (`next build` ejecutado en Vercel):
* **Valor inyectado de NEXT_PUBLIC_API_URL:** `https://club-newbery-backend.onrender.com`
* **Verificación de Fallback a Localhost:** **Eliminado por completo**. Se implementó un control en `frontend/src/config.js` que aborta el build e interrumpe la compilación lanzando un error fatal si la variable `NEXT_PUBLIC_API_URL` está ausente en el entorno de producción. Dado que la compilación y despliegue finalizaron con éxito, queda demostrado que la variable fue leída e inyectada correctamente.

---

## 📡 3. Estado y Código HTTP de Endpoints del Backend Público

Se realizaron peticiones directas de prueba al backend público alojado en Render (`https://club-newbery-backend.onrender.com`) obteniendo los siguientes resultados:

| Método / Ruta | URL Completa | Código HTTP Recibido | Respuesta |
| :--- | :--- | :---: | :--- |
| **`GET /`** | `https://club-newbery-backend.onrender.com/` | `404` | `Not Found` |
| **`GET /health`** | `https://club-newbery-backend.onrender.com/health` | `404` | `Not Found` |
| **`GET /api/news`** | `https://club-newbery-backend.onrender.com/api/news` | `404` | `Not Found` |
| **`GET /api/publicidad/sponsors`** | `https://club-newbery-backend.onrender.com/api/publicidad/sponsors` | `404` | `Not Found` |
| **`GET /api/media`** | `https://club-newbery-backend.onrender.com/api/media` | `404` | `Not Found` |
| **`GET /api/members/me`** | `https://club-newbery-backend.onrender.com/api/members/me` | `404` | `Not Found` |

### ⚠️ Diagnóstico Crítico del Backend en Render:
A pesar de que el dominio `club-newbery-backend.onrender.com` responde activamente de forma veloz, devuelve un código **`404 Not Found`** para todos los endpoints (incluyendo `/health` y `/`).
* **Causa Raíz:** Esto indica que el servicio web de Render está respondiendo con la página de error por defecto del enrutador de Render (lo cual ocurre cuando la aplicación correspondiente al dominio ha sido suspendida, desactivada o su puerto de escucha en el contenedor no coincide con la redirección del puerto `5000` de Render).
* **Acción Requerida:** Es necesario revisar el Dashboard de **Render** para verificar que el servicio web `club-newbery-backend` esté activo y que el despliegue del servidor Node.js no esté pausado o en estado fallido.

---

## 🚀 4. Estado del Despliegue en Vercel

* **Commit Desplegado:** Último commit local (incluyendo normalizaciones de CORS y validaciones de variables estrictas).
* **Comando de Despliegue Ejecutado:** `npx vercel --prod --yes`
* **URL de Producción Aliased:** `https://frontend-indol-rho-38.vercel.app`
* **Resultado del Deploy:** **Exitoso (`READY`)**.

---

## 🏁 Conclusión

La configuración del despliegue en Vercel está en perfectas condiciones y libre de fallbacks a `localhost`. La variable `NEXT_PUBLIC_API_URL` está correctamente inyectada en producción. Sin embargo, para restablecer el flujo total de datos reales en la app publicada, se requiere reactivar/revisar el estado del servicio web del backend en el Dashboard de **Render**.
