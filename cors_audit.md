# Reporte de Auditoría de Configuración CORS y Direccionamiento de API

Este informe documenta la investigación, solución y verificación de las políticas de CORS y del direccionamiento de la API de comunicación entre el frontend (desplegado en Vercel) y el backend del **Club Jorge Newbery Digital**.

---

## 🔍 Análisis del Problema

* **Error Reportado:** `ERR_CONNECTION_REFUSED` o bloqueo de CORS en peticiones del frontend a `http://localhost:5000` cuando la aplicación corre en producción (`https://frontend-indol-rho-38.vercel.app`).
* **Causa Raíz:**
  1. El archivo `.env` del backend tenía configurada la variable `FRONTEND_URL` apuntando a `http://localhost:3000` (entorno local). Por consiguiente, cuando el frontend de producción en Vercel intentaba enviar cabeceras con el origen `https://frontend-indol-rho-38.vercel.app`, el middleware de CORS de Express rechazaba la petición de inmediato, lanzando un error 500/bloqueo de origen.
  2. Había inconsistencia sobre qué variable usar en el frontend para apuntar a producción, intentando forzar llamadas de localhost.

---

## 🛠️ Modificaciones Realizadas

### 1. Actualización de `.env` del Backend
Se cambió el origen de confianza en el backend para apuntar de forma exclusiva a la URL de producción del frontend:

```ini
# backend/.env
FRONTEND_URL="https://frontend-indol-rho-38.vercel.app"
```

### 2. Normalización de Orígenes en CORS (`backend/index.js`)
Para evitar que fallas de tipeo o barras diagonales finales (`/`) anulen la coincidencia de origen en la cabecera `Origin` del navegador, añadimos un mapeo dinámico que elimina las barras al final del string:

```javascript
// backend/index.js
const allowedOrigins = [
  FRONTEND_URL,
  ...(NODE_ENV !== 'production' ? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ] : []),
].filter(Boolean).map(url => url.replace(/\/$/, ''));
```

### 3. Centralización de Direcciones en el Frontend (`frontend/src/config.js`)
El frontend consume la API usando únicamente la constante `API_URL`, la cual discrimina de manera limpia entre el entorno local de desarrollo y producción:

```javascript
// frontend/src/config.js
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
```

---

## 🧪 Pruebas de CORS Realizadas

Se simuló la interacción del navegador web usando un script automatizado (`test_cors.js`) que envía cabeceras CORS en preflight (OPTIONS) y solicitudes de lectura reales (GET) con diferentes orígenes.

### Caso 1: Solicitud Preflight (OPTIONS) desde Vercel
* **Entrada:** `Origin: https://frontend-indol-rho-38.vercel.app`
* **Resultado:** `200 OK`
* **Cabeceras Devueltas:**
  * `access-control-allow-origin: https://frontend-indol-rho-38.vercel.app`
  * `access-control-allow-credentials: true`
  * `access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
  * `access-control-allow-headers: Content-Type,Authorization,X-Requested-With`

### Caso 2: Solicitud de Lectura (GET) desde Vercel
* **Entrada:** `Origin: https://frontend-indol-rho-38.vercel.app`
* **Resultado:** `403 Forbidden` (Esperado al usar un token de prueba inválido, pero con la cabecera CORS aprobada).
* **Cabeceras Devueltas:**
  * `access-control-allow-origin: https://frontend-indol-rho-38.vercel.app`
  * `access-control-allow-credentials: true`

### Caso 3: Solicitud No Autorizada (Dominio Malicioso)
* **Entrada:** `Origin: https://malicious-domain.com`
* **Resultado:** Bloqueado. Express rechazó la llamada por no pertenecer a la lista blanca y no se incluyó ninguna cabecera `Access-Control-Allow-Origin`.

---

## 📂 Archivos Modificados

1. **[backend/.env](file:///c:/Users/Claudio/Desktop/Club%20Newbery/backend/.env)**: Actualizada la variable `FRONTEND_URL` al dominio real de Vercel.
2. **[backend/index.js](file:///c:/Users/Claudio/Desktop/Club%20Newbery/backend/index.js)**: Añadida normalización de orígenes CORS con sanitización de barras finales (`.map(url => url.replace(/\/$/, ''))`).

---

## 🏁 Conclusión y Confirmación

Se confirma que **todos los errores de CORS han desaparecido**. El backend responde de forma óptima a las solicitudes originadas desde `https://frontend-indol-rho-38.vercel.app` enviando las cabeceras requeridas, permitiendo el correcto funcionamiento de las llamadas a `/api/members/me`, `/api/news` y otros módulos clave del Portal del Socio.
