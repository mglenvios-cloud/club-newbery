# Registro de Cambios (CHANGELOG) — Club Digital Pro

Todas las modificaciones destacadas de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-07-20

### 🚀 Añadido
- Arquitectura SaaS Multi-Club independiente y desacoplada.
- Auto-provisionamiento "Out-of-the-Box" para nuevos clubes deportivos.
- Panel de monitoreo operativo en tiempo real `/system-status`.
- Endpoint de verificación de salud extendido `GET /api/health` (soporte estado `degraded`).
- Modulo de Backups y exportación en formatos JSON, CSV y SQL.
- Trazabilidad y logs de auditoría en la tabla `AuditLog`.
- PWA Manifest, SEO dinámico y metadata responsive.
- Manuales de usuario comercial en `docs/comercial/` (Administrador, Secretaría, Profesor, Socio).

### 🔒 Seguridad & Hardening
- Integración de `helmet` para cabeceras HTTP defensivas.
- Implementación de `express-rate-limit` para prevención de abuso y ataques de fuerza bruta en accesos.
- Guards `authorizeRoles` y `verifyClubMembership` para aislamiento estricto entre inquilinos.
