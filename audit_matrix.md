# Matriz de Errores Encontrados y Corregidos (Audit Matrix)

Esta matriz detalla los errores identificados y resueltos durante el proceso de auditoría y configuración de los emuladores locales de Firebase, la base de datos y la autorización.

---

### ID: ERR-001
- **Módulo:** Firebase Admin
- **Archivo:** `backend/config/firebase-admin.js`
- **Línea aproximada:** 15-22
- **Descripción:** El SDK de Firebase Admin fallaba al inicializar en modo emulador porque no encontraba un `projectId` válido (por defecto tenía `"REEMPLAZAR_CON_TU_PROJECT_ID"` en `.firebaserc`).
- **Cómo reproducirlo:** Iniciar los emuladores de Firebase y arrancar el backend sin haber definido `GCLOUD_PROJECT` ni haber configurado un Project ID válido.
- **Impacto:** Crítico (el backend no iniciaba o arrojaba errores inmediatos al cargar Firestore).
- **Prioridad:** Alta
- **Solución aplicada:** Se agregó detección automática de emuladores y asignación dinámica de `config.projectId = process.env.GCLOUD_PROJECT || 'club-newbery-digital'`.
- **Estado:** SOLUCIONADO

---

### ID: ERR-002
- **Módulo:** Firebase Storage
- **Archivo:** `backend/config/storage.js`
- **Línea aproximada:** 70-105
- **Descripción:** La función `getSignedUrl` de `@google-cloud/storage` fallaba con el mensaje "credentials required" al usarse en el emulador, dado que el SDK intenta firmar la URL con llaves privadas de producción que no existen localmente.
- **Cómo reproducirlo:** Invocar `getUploadSignedUrl` o `getDownloadSignedUrl` en desarrollo local contra el emulador de Storage.
- **Impacto:** Crítico (bloqueaba las subidas de archivos en modo emulador).
- **Prioridad:** Alta
- **Solución aplicada:** Se interceptan las llamadas en modo `EMULATOR` para devolver una URL directa hacia el endpoint de desarrollo del emulador (`http://127.0.0.1:9199/v0/b/...`) sin requerir firma criptográfica.
- **Estado:** SOLUCIONADO

---

### ID: ERR-003
- **Módulo:** Firestore Prisma Adapter
- **Archivo:** `backend/firestorePrismaAdapter.js`
- **Línea aproximada:** 9-20
- **Descripción:** El adaptador Prisma de Firestore forzaba el modo offline (`useLocalJson = true`) si no existían credenciales de Google Cloud (`GOOGLE_APPLICATION_CREDENTIALS`), ignorando si el emulador local estaba activo.
- **Cómo reproducirlo:** Arrancar el backend con `FIRESTORE_EMULATOR_HOST` definido pero sin archivos de credenciales JSON reales de Google Cloud.
- **Impacto:** Alto (los datos se leían y escribían en `firestore_db.json` en lugar del emulador local).
- **Prioridad:** Alta
- **Solución aplicada:** Se implementó una lógica de tres estados que verifica `FIRESTORE_EMULATOR_HOST` primero. Si existe, deshabilita `useLocalJson` y conecta a Firestore local.
- **Estado:** SOLUCIONADO

---

### ID: ERR-004
- **Módulo:** Autorización (Auth Middleware)
- **Archivo:** `backend/middleware/firebaseAuth.js` y archivos de rutas en `backend/routes/*.js`
- **Línea aproximada:** 124-138 (y rutas individuales)
- **Descripción:** Los middlewares `requireAdmin` en los diferentes módulos y archivos de rutas no contemplaban el rol `SUPER_ADMIN`, restringiendo el acceso únicamente al rol `ADMIN`.
- **Cómo reproducirlo:** Autenticarse como un usuario con rol `SUPER_ADMIN` e intentar acceder al módulo de Finanzas, Socios, o Newbery TV.
- **Impacto:** Alto (el rol `SUPER_ADMIN` quedaba bloqueado de múltiples endpoints de administración).
- **Prioridad:** Alta
- **Solución aplicada:** Se actualizaron todas las definiciones de `requireAdmin` a lo largo de las rutas para permitir explícitamente el acceso a cualquier usuario con `req.user.role === 'SUPER_ADMIN'`.
- **Estado:** SOLUCIONADO

---

### ID: ERR-005
- **Módulo:** Firestore Prisma Adapter (Fechas y Timestamps)
- **Archivo:** `backend/firestorePrismaAdapter.js`
- **Línea aproximada:** 251-275
- **Descripción:** Al recuperar datos de Firestore, los campos de fecha se devolvían como objetos `Timestamp` de Firestore en lugar de objetos `Date` de Javascript. Esto rompía comparaciones como `getTime()` en las rutas y servicios de negocio (ej. `verify_marketing_fase4.js` y `verify_newberytv.js`).
- **Cómo reproducirlo:** Ejecutar una consulta de actualización o listado donde se compararan fechas recuperadas con fechas nuevas.
- **Impacto:** Alto (causaba errores 500 silenciosos al intentar llamar métodos como `.getTime()` o `.toISOString()` en variables de fecha).
- **Prioridad:** Alta
- **Solución aplicada:** Se implementó un método recursivo `convertTimestamps` en el adaptador que busca cualquier objeto con la función `.toDate()` y lo mapea automáticamente a un objeto `Date` estándar de Javascript.
- **Estado:** SOLUCIONADO

---

### ID: ERR-006
- **Módulo:** Firebase CLI (Startup)
- **Archivo:** `firebase.json` y consola
- **Línea aproximada:** N/A
- **Descripción:** El emulador de Firebase se negaba a iniciar debido a que detectaba una configuración Next.js en la sección de Hosting (`frameworksBackend`) sin tener habilitado el experimento de frameworks web.
- **Cómo reproducirlo:** Ejecutar `firebase emulators:start` en la raíz del proyecto.
- **Impacto:** Crítico (impedía arrancar cualquier emulador local).
- **Prioridad:** Alta
- **Solución aplicada:** Se habilitó el experimento mediante la ejecución exitosa de `npx firebase-tools experiments:enable webframeworks`.
- **Estado:** SOLUCIONADO
