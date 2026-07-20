# Checklist de Despliegue Oficial (Club Digital Pro v1.0.0)

Este documento contiene la lista de verificación para auditar y garantizar la publicación en producción de **Club Digital Pro**.

---

## 📋 Lista de Comprobación de Producción

### 1. Variables de Entorno
- [ ] **Frontend (`.env.production` / Vercel):** `NEXT_PUBLIC_API_URL` declarada apuntando al servidor backend.
- [ ] **Frontend:** `NEXT_PUBLIC_APP_NAME` declarada (`Club Digital Pro`).
- [ ] **Frontend:** `NEXT_PUBLIC_APP_ENV=production`.
- [ ] **Backend (`.env` / Render):** `DATABASE_URL` declarada con la conexión PostgreSQL de producción.
- [ ] **Backend:** `JWT_SECRET` generada con clave segura aleatoria (mínimo 32 caracteres).
- [ ] **Backend:** `FRONTEND_URL` configurada con el dominio final del cliente en Vercel.
- [ ] **Backend:** `MERCADOPAGO_ACCESS_TOKEN` configurada con el token real de producción.
- [ ] **Backend:** `NODE_ENV=production`.

---

### 2. Base de Datos & Migraciones
- [ ] Instancia de PostgreSQL en producción aprovisionada y accesible (`DATABASE_URL`).
- [ ] Ejecución exitosa del script de migraciones: `npm run migrate` en el servidor backend.
- [ ] Ejecución de `npx prisma generate` para compilar el cliente Prisma.
- [ ] Verificación de integridad de tablas (`User`, `Member`, `Category`, `AuditLog`, `Club`, `Transaction`).
- [ ] Seeding inicial completado (Administrador principal e inquilino Demo).

---

### 3. Build & Compilación
- [ ] **Frontend:** Compilación sin errores ejecutando `npm run build` en `frontend/` (43 rutas estáticas y dinámicas optimizadas).
- [ ] **Backend:** Validación sintáctica de archivos ejecutando `node --check index.js` en `backend/`.

---

### 4. Infraestructura de Servidores
- [ ] **Render Web Service (`club-digital-pro-backend`):**
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`
  - [ ] Health Check Path: `/api/health`
- [ ] **Vercel Project (`club-digital-pro`):**
  - [ ] Root Directory: `frontend`
  - [ ] Framework Preset: `Next.js`

---

### 5. Dominio, Seguridad & HTTPS
- [ ] SSL / HTTPS habilitado activamente en Vercel y Render.
- [ ] Cabeceras de seguridad **Helmet** activadas en Express.
- [ ] **Rate Limiting** protegiendo los accesos globales y la ruta `/api/auth/login`.
- [ ] Política **CORS** restringida al dominio del frontend.
- [ ] Verificación del endpoint `/api/health` retornando `HTTP 200` (`status: ok`, `database: connected`).
- [ ] Sistema de respaldo de datos (exportación e importación JSON/CSV/SQL) probado.
