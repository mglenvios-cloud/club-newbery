# Guía Oficial de Despliegue en Producción (Club Digital Pro v1.0.0)

Esta guía paso a paso describe el procedimiento estándar para desplegar la plataforma **Club Digital Pro** utilizando **Vercel** (Frontend), **Render** (Backend) y **PostgreSQL** (Base de Datos).

---

## 1. Aprovisionar la Base de Datos PostgreSQL

1. Crear un proyecto o base de datos PostgreSQL en un proveedor Cloud (Render PostgreSQL, Supabase, Neon o AWS RDS).
2. Obtener la URI de conexión SSL:
   ```env
   DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:5432/DBNAME?sslmode=require"
   ```
3. Guardar este valor para configurar en Render.

---

## 2. Desplegar el Backend en Render

1. Acceder al Dashboard de [Render](https://dashboard.render.com) y crear un nuevo **Web Service**.
2. Conectar el repositorio GitHub oficial.
3. Configurar los parámetros del servicio:
   - **Name:** `club-digital-pro-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Configurar las **Environment Variables**:
   - `DATABASE_URL`: URI obtenida en el paso 1.
   - `JWT_SECRET`: Clave secreta robusta de 64+ caracteres (`openssl rand -hex 64`).
   - `FRONTEND_URL`: URL del dominio del frontend en Vercel (ej: `https://tu-club.vercel.app`).
   - `MP_ACCESS_TOKEN`: Token de producción de Mercado Pago.
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
5. Guardar los cambios y desplegar.

---

## 3. Ejecutar Migraciones de Base de Datos

En el Shell del Web Service de Render o localmente conectado a la DB remota:
```bash
cd backend
npm run migrate
```
Este comando sincroniza el esquema Prisma, genera los tipos del cliente y crea los registros e inquilino Demo iniciales.

---

## 4. Desplegar el Frontend en Vercel

1. Acceder al Dashboard de [Vercel](https://vercel.com/new) e importar el repositorio GitHub.
2. Definir **Root Directory:** `frontend`.
3. Framework Preset: **Next.js** (detectado automáticamente).
4. Configurar las **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: URL del backend en Render (ej: `https://club-digital-pro-backend.onrender.com`).
   - `NEXT_PUBLIC_APP_NAME`: `Club Digital Pro`
   - `NEXT_PUBLIC_APP_ENV`: `production`
5. Hacer clic en **Deploy**.

---

## 5. Verificación & Post-Despliegue

### 5.1 Verificar Health Check
Ejecutar desde terminal o navegador:
```bash
curl https://tu-backend.onrender.com/api/health
```
Respuesta esperada:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "environment": "production",
  "database": "connected",
  "api": "operational"
}
```

### 5.2 Verificar Dashboard de Monitoreo
Ingresar desde el navegador a:
`https://tu-frontend.vercel.app/system-status`
Asegurarse de que todos los indicadores marquen `OPERATIVO`.
