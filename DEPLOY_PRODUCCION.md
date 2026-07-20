# DEPLOY_PRODUCCION.md — Guía Oficial de Despliegue (Club Digital Pro v1.0.0)

**Arquitectura:** Frontend (Vercel) + Backend Node.js/Express (Render) + Base de Datos (PostgreSQL) + Prisma 7 + PWA

---

## REQUISITOS PREVIOS
- Cuenta activa en [Vercel](https://vercel.com)
- Cuenta activa en [Render](https://render.com)
- Base de Datos PostgreSQL (Supabase, Render Postgres, o Neon)
- Token de producción de Mercado Pago

---

## 1. BASE DE DATOS POSTGRESQL & MIGRACIONES

1. Crear la instancia de **PostgreSQL** en Supabase / Render / Neon.
2. Copiar la URI de conexión `DATABASE_URL` (formato: `postgresql://user:password@host:5432/dbname?sslmode=require`).
3. Ejecutar las migraciones en la base de datos de producción desde la terminal o pipeline CI/CD:
   ```bash
   cd backend
   npm run migrate
   ```
4. Verificar que se cree el superadministrador inicial y las tablas núcleo (`User`, `Member`, `Category`, `AuditLog`, `Club`).

---

## 2. BACKEND EN RENDER

### 2.1 Configuración del Web Service
- **Name:** `club-digital-pro-backend`
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`

### 2.2 Variables de Entorno en Render
En Dashboard ➔ Environment Variables:

| Variable | Valor Recomendado | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Cadena de conexión PostgreSQL de producción |
| `JWT_SECRET` | Secret de 64+ caracteres | Clave firma de JWT |
| `FRONTEND_URL` | `https://frontend-indol-rho-38.vercel.app` | Dominio del Frontend Vercel sin barra final |
| `MP_ACCESS_TOKEN` | `APP_USR-...` | Token producción Mercado Pago |
| `NODE_ENV` | `production` | Entorno de ejecución |
| `PORT` | `5000` | Puerto interno |

### 2.3 Verificación de Salud
```bash
curl https://club-digital-pro-backend.onrender.com/api/health
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

---

## 3. FRONTEND EN VERCEL

### 3.1 Importar y Desplegar
1. Ir a Vercel ➔ Import Git Repository ➔ Seleccionar este proyecto.
2. Definir **Root Directory:** `frontend`.
3. Framework Preset: **Next.js**.

### 3.2 Variables de Entorno en Vercel
En Settings ➔ Environment Variables:

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://club-digital-pro-backend.onrender.com` | Production |
| `NEXT_PUBLIC_APP_ENV` | `production` | Production |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Production |

### 3.3 Verificación de Despliegue
Navegar a:
- Portal público: `https://frontend-indol-rho-38.vercel.app/portal`
- System Status: `https://frontend-indol-rho-38.vercel.app/system-status`
- Robots: `https://frontend-indol-rho-38.vercel.app/robots.txt`
- Sitemap: `https://frontend-indol-rho-38.vercel.app/sitemap.xml`

---

## 4. CHECKLIST FINAL DE DESPLIEGUE OFICIAL 🟢

- [x] Next.js `npm run build` pasa exitosamente sin advertencias críticas.
- [x] Backend `node --check index.js` pasa sin errores.
- [x] CORS configurado en backend aceptando origen Vercel.
- [x] Rate Limiting y Helmet activados.
- [x] PWA Manifest, SEO Metadata, `robots.txt` y `sitemap.xml` vigentes.
- [x] Monitoreo en `/system-status` y `/api/health` operativos.
