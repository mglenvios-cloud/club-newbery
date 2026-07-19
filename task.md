# Plan de Tareas: Newbery TV & Marketing y Sponsors

## 📺 MÓDULO 1: NEWBERY TV
- `[x]` Auditoría y Rediseño de Grilla ERP
  - `[x]` Optimizar el diseño general del panel administrativo con contenedores uniformes, espaciados limpios y responsive.
- `[x]` Dashboard de 8 KPIs
  - `[x]` Implementar una fila horizontal de 8 indicadores: Videos Publicados, Transmisiones Activas, Noticias Destacadas, Galería de Fotos, Reproducciones, Me Gusta, Comentarios y Alcance Promedio.
  - `[x]` Estilizar las tarjetas con iconos de Lucide, fuentes grandes y micro-animaciones hover.
- `[x]` Biblioteca Multimedia Profesional (Fase 3)
  - `[x]` Agregar soporte de listado y carga ficticia para 5 tipos de archivo: Videos, Fotos, PDF, Audios y Documentos.
  - `[x]` Diseñar renderizado de miniaturas/iconos automáticos para cada tipo.
  - `[x]` Crear alternador interactivo para 3 vistas: Lista, Grid y Galería.
- `[x]` Streaming y Canales (Fase 4)
  - `[x]` Mostrar indicadores de estado para transmisiones: En Vivo (🟢), Programado (🔵), Finalizado (⚪).
  - `[x]` Configurar soporte visual de emisión para YouTube, Facebook, Instagram, OBS y RTMP.
- `[x]` Editor Rápido Multimedia (Fase 5)
  - `[x]` Desarrollar pestaña/panel de editor inline rápido.
  - `[x]` Crear simulador visual de recorte/trimming mediante un rango/slider de inicio y fin.
  - `[x]` Habilitar inputs para miniatura, título, descripción, etiquetas (tags) y categorías.
- `[x]` Portada Web Pública (Fase 6)
  - `[x]` Agregar pestaña para parametrizar el diseño del home público (banner, último partido, noticias destacadas, videos destacados, entrevistas).
  - `[x]` Auditar el visualizador y reproductor de la portada pública (`newbery-tv/page.js`) corrigiendo deformaciones de imagen y desalineaciones de tarjetas.

## 🤝 MÓDULO 2: MARKETING Y SPONSORS
- `[x]` Auditoría General y Rediseño Grilla
  - `[x]` Ajustar cards, responsive, espaciados y consistencia de botones en `admin/marketing/page.js`.
- `[x]` Dashboard Comercial de 8 KPIs (Fase 2)
  - `[x]` Implementar fila horizontal con: Sponsors Activos, Campañas, Ingresos Publicitarios, Banners Activos, Publicaciones, Alcance, Clics (Interacciones) y Convenios.
  - `[x]` Añadir micro-animaciones hover y estilizado premium.
- `[x]` CRUD de Sponsors Completo (Fase 3)
  - `[x]` Expandir el formulario y listado agregando los campos: Contacto (ejecutivo), Monto de Contrato, Observaciones.
- `[x]` Publicidad y Banners (Fase 4)
  - `[x]` Desarrollar formulario de alta/edición de banners con programación de fechas de validez y selector de ubicaciones (Página Principal, Newbery TV, Noticias, Portal del Socio, Resultados, Eventos).
  - `[x]` Simular sistema de rotación automática.
- `[x]` Redes Sociales (Fase 5)
  - `[x]` Desarrollar interfaz del planificador con selector de plataforma (Instagram, Facebook, TikTok, YouTube, X), fecha/hora, contenido y media adjunta.
  - `[x]` Mostrar historial y listado de publicaciones programadas/enviadas.
- `[x]` Estadísticas y Exportador (Fase 6)
  - `[x]` Agregar Recharts Charts para CTR, clics y visualizaciones de campañas/sponsors.
  - `[x]` Programar botón para exportar reportes a formato CSV (Excel legible).

## 🛠 CORRECCIONES DE INTEGRACIÓN Y COMPILACIÓN (CRÍTICO)
- `[x]` Corregir referencias `fetch` erróneas del frontend de `/api/sponsors` a `/api/publicidad/sponsors`.
- `[x]` Corregir referencias de banners, campañas, media-files y statistics en `marketing/page.js` hacia `/api/publicidad/`.
- `[x]` Ejecutar auditoría de compilación mediante `npm run build` y validaciones ESLint.
