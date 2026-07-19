# Changelog - Club Jorge Newbery Digital

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.0.0] - 2026-07-19

### Añadido
- **Módulo 1 (Panel Administrativo):** Implementado dashboard con 8 KPIs y navegación unificada.
- **Módulo 2 (Centro de Socios):** Soporte CRUD para socios, vinculación de tutores y diseño premium del carnet digital con código QR.
- **Módulo 3 (Finanzas):** Soporte de registro de cuotas, simulador de webhooks para Mercado Pago y facturación.
- **Módulo 4 (Gestión Deportiva):** Listado y categorización de disciplinas (Futsal, Patín, Vóley) y fichas de jugadores.
- **Módulo 5 (Newbery TV):** Canales, transmisiones en vivo con scoreboards interactivos, eventos de línea de tiempo y biblioteca de videos.
- **Módulo 6 (Marketing y Sponsors):** Soporte de contratos de sponsors, impresiones/clics y planificador de publicaciones para redes sociales.
- **Módulo 7 (Portal Público):** Home dinámico, sección asociate, noticias destacadas e integración con el portal del socio.
- **Módulo 9 (Seguridad):** Middleware robusto de tokens JWT, autenticación Firebase y control estricto de roles administrativos (`ADMIN`, `SUPER_ADMIN`).

### Corregido
- **Fallas de Compilación JSX:** Corregido error de anidamiento y etiquetas sin cerrar en [socios/page.js](file:///c:/Users/Claudio/Desktop/Club Newbery/frontend/src/app/admin/socios/page.js) que impedía la construcción del bundle de producción.
- **Entidades de React sin Escapar:** Solucionados warnings del linter por apóstrofes sin escapar en [HeroLive.jsx](file:///c:/Users/Claudio/Desktop/Club Newbery/frontend/src/components/newbery-tv/HeroLive.jsx), [LiveScoreboard.jsx](file:///c:/Users/Claudio/Desktop/Club Newbery/frontend/src/components/newbery-tv/LiveScoreboard.jsx), y [Timeline.jsx](file:///c:/Users/Claudio/Desktop/Club Newbery/frontend/src/components/newbery-tv/Timeline.jsx).
- **Control de Rutas en Backend:** Securizados los endpoints de `/users` y `/roles` en [verify_admin_general.js](file:///c:/Users/Claudio/Desktop/Club Newbery/backend/verify_admin_general.js) para exigir tokens de autenticación válidos.
- **Firma de URL de Storage:** Resuelta falla en emulador local de Storage al omitir firmas de URL y redireccionar peticiones de descarga directas al puerto `9199`.

### Optimizado
- **Módulo 8 (Rendimiento):** Generación de PDFs on-the-fly usando streams para evitar bloqueos del hilo principal del servidor backend, Next.js empaquetado optimizado (compilación exitosa en 27s).
