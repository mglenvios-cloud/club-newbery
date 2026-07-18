# Instrucciones Críticas de Configuración de Producción en Render

Este documento detalla los pasos obligatorios que se deben seguir en el Dashboard de **Render** para corregir el error `404 Not Found` en el backend público.

---

## 🔍 Diagnóstico de la Causa Raíz

Actualmente, las llamadas al backend público en `https://club-newbery-backend.onrender.com` devuelven un error **`404 Not Found`**. 
Esto ocurre porque Render está configurado para compilar desde la raíz del repositorio (Monorepo), pero **no existe ningún archivo `package.json` en la raíz**, lo que causa que los despliegues fallen de forma constante y el balanceador de carga de Render no tenga contenedores vivos a los cuales redirigir el tráfico.

Para solucionarlo, debes configurar el directorio del backend de forma explícita en tu panel de Render.

---

## 🛠️ Configuración Requerida en el Dashboard de Render

Ingresa a tu cuenta de [Render Dashboard](https://dashboard.render.com/) y selecciona tu Web Service de backend (`club-newbery-backend`). Ve a la pestaña **Settings** (Configuración) y aplica los siguientes cambios exactos:

1. **Root Directory (Directorio Raíz)**:
   * **Valor:** `backend`
   * *Explicación:* Esto le indica a Render que entre a la carpeta `backend` del monorepo antes de instalar dependencias o compilar.

2. **Build Command (Comando de Construcción)**:
   * **Valor:** `npm install && npm run build`
   * *Explicación:* Ejecutará la instalación en la carpeta del backend y generará el cliente de Prisma (`npm run build` llama a `prisma generate`).

3. **Start Command (Comando de Arranque)**:
   * **Valor:** `npm start`
   * *Explicación:* Iniciará el servidor de Express en producción (`npm start` llama a `node index.js`).

Una vez guardados los cambios, haz clic en **Manual Deploy** ➔ **Clear Build Cache & Deploy** para forzar una reconstrucción limpia de la aplicación.

---

## 📡 Pruebas de Verificación Post-Despliegue

Una vez completado el despliegue en Render, puedes verificar que los endpoints respondan correctamente ejecutando este comando en la terminal de tu backend:

```bash
node scratch/test_public_endpoints.js
```

### Resultados Esperados en Nube:

* **`GET https://club-newbery-backend.onrender.com/`**
  * **HTTP Status:** `200 OK`
  * **Respuesta:** `{"message":"API del Club Jorge Newbery funcionando correctamente.", "version":"2.0", ...}`

* **`GET https://club-newbery-backend.onrender.com/health`**
  * **HTTP Status:** `200 OK`
  * **Respuesta:** `{"status":"ok", "message":"API del Club Jorge Newbery operativa.", "database":"connected", ...}`

* **`GET https://club-newbery-backend.onrender.com/api/news`**
  * **HTTP Status:** `200 OK`
  * **Respuesta:** `[]` (O el listado real de novedades).

* **`GET https://club-newbery-backend.onrender.com/api/publicidad/sponsors`**
  * **HTTP Status:** `200 OK`
  * **Respuesta:** `[]` (O el listado real de patrocinadores).

* **`GET https://club-newbery-backend.onrender.com/api/media`**
  * **HTTP Status:** `200 OK`
  * **Respuesta:** `[]` (O el listado real de biblioteca).

* **`GET https://club-newbery-backend.onrender.com/api/members/me`**
  * **HTTP Status:** `401 Unauthorized` (O `200 OK` si se envía una cabecera de autenticación con token de Firebase/JWT real).
