# Arquitectura de Club Digital Pro - Fase 1 (Base SaaS & Branding Dinámico)

Esta documentación describe la arquitectura y los patrones de diseño aplicados para permitir que la plataforma opere en modalidad **Multi-Tenant (SaaS)** y con **Branding Dinámico** configurable para múltiples clubes deportivos desde un mismo despliegue de código.

---

## 1. Patrón Multi-Tenant (Resolución de Inquilino)

El sistema identifica a qué club pertenece una solicitud utilizando el dominio, subdominio de origen, o una cabecera personalizada.

### Flujo de Resolución de Inquilino (Tenant Resolution)
1. **Petición del Cliente:** El cliente (frontend) realiza una solicitud HTTP a la API.
2. **Tenant Middleware:** Un middleware en Express analiza el Host (`req.hostname`) o la cabecera `x-club-slug`.
3. **Consulta de Base de Datos:** Se busca en Firestore/PostgreSQL la entidad `Club` cuyo `slug` coincida con el inquilino extraído.
4. **Contexto de Petición:** La entidad `Club` es inyectada en el objeto `req` (`req.club`) para ser utilizada por todos los controladores posteriores (socios, finanzas, etc.).

---

## 2. Branding Dinámico (Theme Engine)

Toda la estética de la interfaz de usuario se ajusta dinámicamente según la configuración de colores y logos del club seleccionado.

### Mecánica del Motor de Temas
1. **Configuración de Variables CSS:** En `styles/globals.css` se definen variables para los colores base:
   - `--color-primary`
   - `--color-secondary`
   - `--color-bg`
   - `--color-card`
   - `--color-button`
   - `--color-menu`
   - `--color-text`
2. **Inyección en Tiempo de Ejecución (ThemeProvider):** Un `ThemeProvider` de React recibe la información del club y actualiza los valores de las variables en `document.documentElement.style`.
3. **Mapeo en Tailwind:** Tailwind CSS se configura para consumir las variables CSS en lugar de colores estáticos:
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           club: {
             primary: 'var(--color-primary)',
             secondary: 'var(--color-secondary)',
             bg: 'var(--color-bg)',
             card: 'var(--color-card)',
             button: 'var(--color-button)',
             menu: 'var(--color-menu)',
             text: 'var(--color-text)',
           }
         }
       }
     }
   }
   ```
4. **Componentes Inteligentes:** Todos los botones, barras de navegación y tarjetas consumen clases dinámicas como `bg-club-primary`, `text-club-text`, etc.
