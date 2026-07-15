# DEPLOY_PRODUCCION.md
# Guía de Despliegue — Club Jorge Newbery Digital

**Stack:** Next.js 16 (Vercel) + Node.js/Express (Render) + PostgreSQL + Prisma 7 + JWT + MercadoPago

---

## REQUISITOS PREVIOS

- Cuenta en [Render](https://render.com)
- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub con el código de este proyecto
- Cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)

---

## PARTE 1: BACKEND EN RENDER

### 1.1 Crear la Base de Datos PostgreSQL

1. Ir a [dashboard.render.com](https://dashboard.render.com)
2. Clic en **New +** → **PostgreSQL**
3. Configurar:
   - **Name:** `club-newbery-db`
   - **Database:** `clubnewbery`
   - **User:** `newbery`
   - **Region:** Oregon (US West)
   - **Plan:** Free
4. Clic en **Create Database**
5. Esperar que el estado pase a `Available`
6. Copiar la **Internal Database URL** (formato: `postgresql://newbery:PASS@HOST/clubnewbery`)
   - ⚠️ Usar la URL **Internal** (no External) para que backend y DB estén en la misma red

### 1.2 Crear el Servicio Web (Backend)

1. Clic en **New +** → **Web Service**
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Name:** `club-newbery-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `node index.js`
   - **Plan:** Free
4. No hacer Deploy todavía — primero configurar variables de entorno

### 1.3 Variables de Entorno del Backend

En el servicio web → **Environment** → agregar una por una:

| Variable | Valor | Cómo obtenerlo |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Copiar Internal URL del paso 1.1 |
| `JWT_SECRET` | Clave aleatoria (64+ chars) | Ejecutar: `openssl rand -hex 64` |
| `MP_ACCESS_TOKEN` | Token real de MP | MercadoPago Developers → Credenciales |
| `FRONTEND_URL` | `https://frontend-indol-rho-38.vercel.app` | URL del frontend en Vercel |
| `NODE_ENV` | `production` | Valor fijo |
| `PORT` | `5000` | Valor fijo |

**Generar JWT_SECRET localmente:**
```bash
# En PowerShell:
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# En Linux/Mac/WSL:
openssl rand -hex 64
```

### 1.4 Deploy del Backend

1. Una vez configuradas todas las variables → clic en **Deploy**
2. Verificar en los logs que aparezcan:
   ```
   [ENV] Variables de entorno criticas: OK
   Loaded Prisma config from prisma.config.ts.
   Running migrations...
   🚀 Servidor backend corriendo en http://localhost:5000
   ```
3. Esperar que el Health Check pase a verde (`/health` → HTTP 200)

### 1.5 Verificar el Backend

Una vez deployado, probar en el navegador o Postman:

```
GET https://club-newbery-backend.onrender.com/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "API del Club Jorge Newbery operativa.",
  "version": "2.0",
  "database": "connected",
  "timestamp": "2026-..."
}
```

---

## PARTE 2: FRONTEND EN VERCEL

### 2.1 Importar Proyecto

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar el repositorio de GitHub
3. Configurar:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (detectado automáticamente)

### 2.2 Variables de Entorno del Frontend

En el proyecto Vercel → **Settings** → **Environment Variables**:

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://club-newbery-backend.onrender.com` | Production |
| `NEXT_PUBLIC_APP_ENV` | `production` | Production |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Production |

### 2.3 Deploy del Frontend

1. Una vez configuradas las variables → clic en **Deploy**
2. Verificar que el build termine sin errores (42 páginas generadas)
3. Verificar la URL del deployment

### 2.4 Actualizar FRONTEND_URL en Render

Si la URL de Vercel difiere de `https://frontend-indol-rho-38.vercel.app`:
1. Render → backend service → Environment
2. Actualizar `FRONTEND_URL` con la URL real de Vercel
3. Re-deploy del backend

---

## PARTE 3: BASE DE DATOS — MIGRACIONES

Las migraciones se ejecutan **automáticamente** durante el deploy en Render gracias al `buildCommand`:

```bash
npx prisma migrate deploy
```

Este comando aplica la migración `prisma/migrations/20260715_init/migration.sql` que crea todas las tablas.

### 3.1 Verificar Migraciones (opcional)

Si querés verificar manualmente, en Render → Shell del servicio:

```bash
npx prisma migrate status
```

Respuesta esperada:
```
Database schema is up to date!
```

### 3.2 Seed de Datos (opcional)

Si necesitás datos iniciales (admin, categorías, etc.):

```bash
# Desde el shell del servicio en Render:
node seed_users.js
```

---

## PARTE 4: VERIFICACIÓN FINAL

### 4.1 Backend

Probar cada endpoint crítico:

```bash
BASE=https://club-newbery-backend.onrender.com

# Health check
curl $BASE/health

# Endpoints públicos
curl $BASE/api/news
curl $BASE/api/players
curl $BASE/api/matches
curl $BASE/api/publicidad/sponsors
curl $BASE/api/newberytv/livestreams
curl $BASE/api/media
```

Todos deben retornar JSON válido con HTTP 200.

### 4.2 Autenticación JWT

```bash
# Login
curl -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clubnewbery.com","password":"TU_PASSWORD"}'

# Copiar el token y probar endpoint protegido
curl $BASE/api/members \
  -H "Authorization: Bearer TU_TOKEN"
```

### 4.3 CORS

Verificar desde el frontend que no aparecen errores CORS en la consola del navegador:
1. Abrir devtools (F12) → Network
2. Navegar por el frontend
3. Las requests a `/api/*` deben responder 200 sin errores

### 4.4 MercadoPago

1. Verificar en Render logs que NO aparece:
   `[MercadoPago] CRITICAL: MP_ACCESS_TOKEN no está definida`
2. Probar el flujo de pago de reservas en sandbox

### 4.5 Variables de Entorno

Verificar en Render logs al inicio:
```
[ENV] Variables de entorno criticas: OK
```

Si el servidor NO arranca, buscar en logs:
```
[ENV] VARIABLES DE ENTORNO CRITICAS NO DEFINIDAS:
```

---

## PARTE 5: TROUBLESHOOTING

### El backend no arranca

**Error:** `[ENV] VARIABLES DE ENTORNO CRITICAS NO DEFINIDAS`
- Verificar que `DATABASE_URL`, `JWT_SECRET` y `FRONTEND_URL` están configuradas en Render Dashboard

**Error:** `P1001: Can't reach database server`
- Verificar que `DATABASE_URL` usa la URL **Internal** (no External) de PostgreSQL en Render
- Verificar que el servicio PostgreSQL está en `Available`

**Error:** `Migration failed`
- Verificar que `DATABASE_URL` apunta a la base de datos correcta
- En caso de emergencia, usar `npx prisma migrate reset` (⚠️ borra todos los datos)

### CORS errors en el frontend

**Error:** `Access-Control-Allow-Origin` en consola
- Verificar que `FRONTEND_URL` en Render coincide exactamente con la URL de Vercel (sin slash final)
- Verificar que `NEXT_PUBLIC_API_URL` en Vercel apunta al backend correcto

### El health check falla

**HTTP 503 en `/health`**
- La DB no está conectada
- Verificar `DATABASE_URL` y que el servicio PostgreSQL está activo

---

## CHECKLIST FINAL DE PRODUCCIÓN

### Backend (Render)
- [ ] Servicio PostgreSQL creado y en estado `Available`
- [ ] Servicio Web creado con `Root Directory: backend`
- [ ] `DATABASE_URL` configurada (Internal URL de PostgreSQL)
- [ ] `JWT_SECRET` configurada (64+ caracteres)
- [ ] `MP_ACCESS_TOKEN` configurada (token real de MercadoPago)
- [ ] `FRONTEND_URL` configurada con URL correcta de Vercel
- [ ] `NODE_ENV=production`
- [ ] Deploy exitoso (sin errores en logs)
- [ ] `GET /health` retorna `{"status":"ok","database":"connected"}`
- [ ] Migraciones aplicadas (`npx prisma migrate status` = up to date)

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` configurada con URL del backend en Render
- [ ] `NEXT_PUBLIC_APP_ENV=production`
- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Build exitoso (42 páginas)
- [ ] Sin errores CORS en consola del navegador
- [ ] Sin llamadas a localhost en Network tab

### Seguridad
- [ ] `JWT_SECRET` no es la clave por defecto
- [ ] No hay tokens mock en producción
- [ ] No hay credenciales hardcodeadas en el código
- [ ] CORS solo acepta la URL de Vercel en producción

### Funcionalidad
- [ ] Login de administrador funciona
- [ ] Portal de socios funciona
- [ ] Módulo de reservas funciona
- [ ] Módulo de finanzas funciona
- [ ] Newbery TV funciona
- [ ] Módulo de noticias funciona
- [ ] Módulo de socios funciona
