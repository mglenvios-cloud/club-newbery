# Lista de Verificación para Producción (Production Checklist)

Esta lista detalla las acciones y configuraciones críticas necesarias para pasar el sistema de Club Jorge Newbery Digital desde el entorno local de emulación a producción real.

---

### 1. Variables de Entorno (Servidor Backend)
- [ ] **Desactivar Emuladores:** Asegurar que las variables `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST` y `STORAGE_EMULATOR_HOST` **no** estén declaradas en el entorno de producción (Render, Railway, etc.).
- [ ] **Configurar Base de Datos de Producción:** Configurar la variable `DATABASE_URL` con la cadena de conexión de Supabase PostgreSQL real.
- [ ] **Credenciales de Firebase Admin:** Definir la variable `GOOGLE_APPLICATION_CREDENTIALS` apuntando a la ruta del archivo JSON de la cuenta de servicio de producción (o setear la variable de entorno directa si la plataforma lo soporta).
- [ ] **Bucket de Almacenamiento:** Setear `FIREBASE_STORAGE_BUCKET` con el nombre correcto del bucket de producción (ej: `club-newbery-digital.appspot.com`).
- [ ] **Secreto JWT:** Cambiar `JWT_SECRET` por una clave robusta de al menos 32 caracteres (evitar usar la de desarrollo).
- [ ] **Frontend URL:** Asegurar que `FRONTEND_URL` corresponda al dominio HTTPS final de producción en Vercel.
- [ ] **Mercado Pago Token:** Cambiar `MP_ACCESS_TOKEN` por el token de acceso de producción real de Mercado Pago.

---

### 2. Configuración de Firebase (Consola de Cloud)
- [ ] **Habilitar Autenticación:** Activar los proveedores de acceso deseados en la consola de Firebase (Email/Password, Google, etc.).
- [ ] **Configurar Reglas de Firestore:** Desplegar `firestore.rules` usando `npx firebase deploy --only firestore:rules`. Verifcar que la regla fallback de desarrollo esté restringida en producción.
- [ ] **Configurar Reglas de Storage:** Desplegar `storage.rules` usando `npx firebase deploy --only storage:rules`.
- [ ] **Configurar CORS en Firebase Storage:** Ejecutar la configuración de CORS para el bucket de producción a fin de permitir las peticiones PUT directas desde el origen de Vercel.

---

### 3. Frontend (Despliegue)
- [ ] **Dominio de API:** Configurar la variable `API_URL` en el entorno de Vercel para que apunte al servidor backend de producción.
- [ ] **Firebase Client Config:** Verificar que las variables del SDK cliente en `.env.production` apunten al proyecto Firebase de producción correcto.
- [ ] **Optimización de Activos:** Ejecutar una compilación de prueba local (`npm run build` en el frontend) para verificar que no haya problemas de tipado o advertencias en Next.js.

---

### 4. Seguridad y Monitoreo
- [ ] **Auditoría Activa:** Verificar que la tabla/colección `AuditLog` esté recopilando correctamente las acciones de los usuarios administrativos en producción.
- [ ] **Logs del Servidor:** Configurar un sumidero de errores o notificaciones para el archivo de logs del backend.
- [ ] **Permisos de SUPER_ADMIN:** Asignar el rol de forma manual o controlada únicamente a las cuentas del consejo directivo y super-administradores del club.
