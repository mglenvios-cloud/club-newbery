# Notas de Lanzamiento (Release Notes) - ERP v1.0
## Club Jorge Newbery Digital — ¡Listo para Producción!

Nos complace anunciar el lanzamiento oficial de la versión **v1.0 (Production Ready)** del ecosistema digital del Club Atlético Jorge Newbery. Este ERP y Portal de Socios conecta la gestión institucional con una experiencia web moderna para toda la comunidad del club.

---

## 🌟 Características Destacadas

### 📺 1. Portal Newbery TV & Liga Pro Studio
* **Streaming y Multiángulo:** Soporte para transmisiones en vivo con conmutación de cámaras y marcador (score) interactivo en tiempo real.
* **Biblioteca Multimedia:** Reproducción unificada de videos, audios, fotos y documentos informativos.
* **Línea de Tiempo del Partido:** Registro de incidencias (goles, tarjetas) con navegación rápida a instantes del video.

### 👥 2. Centro de Socios & Carnet QR
* **Padrón Inteligente:** Búsqueda rápida, filtros avanzados y control de morosidad.
* **Credencial Digital:** Generación automática de carnet en formato móvil con código QR de verificación de accesos y descarga en PDF.
* **Tutores Legales:** Vínculo de responsabilidad parental para socios menores y cadetes.

### 💰 3. Finanzas, Facturación y Mercado Pago
* **Registro de Pagos:** Flujo automatizado de pagos online integrando Mercado Pago (Sandbox/Producción) y registro de cobros manuales en secretaría.
* **Facturación PDF:** Generación en vivo y envío de comprobantes de pago de cuotas oficiales mediante un diseño profesional optimizado.
* **Dashboard Financiero:** Análisis visual de transacciones, ingresos del mes y métricas de morosidad mediante gráficos de Recharts.

### 📣 4. Marketing, Sponsors y Social Media
* **Rotación y Ubicación de Banners:** Administración avanzada de pautas publicitarias con validez de fechas y clics/impresiones.
* **Planificador de Redes Sociales:** Programador de publicaciones con selector de plataforma y adjuntos multimedia.
* **Estadísticas de Sponsors:** Análisis de CTR para patrocinadores oficiales.

---

## ⚙️ Notas de Despliegue (Production Setup)

### Backend (Render)
* **Variables Críticas:** Asegurar que `DATABASE_URL` apunte a PostgreSQL de producción y desactivar los emuladores locales de Firebase.
* **Comando de Inicio:** `npm start` en el directorio `/backend`.

### Frontend (Vercel)
* **Variable del Servidor:** Configurar `NEXT_PUBLIC_API_URL` apuntando al dominio seguro HTTPS de Render.
* **Optimización:** Páginas estáticas optimizadas mediante Next.js 16.2 y empaquetadas con Turbopack.
