# 🏆 Club Digital Pro — Plataforma SaaS Multi-Club

**Club Digital Pro** es una plataforma SaaS de marca blanca y arquitectura multi-tenant diseñada para la gestión integral e interactiva de instituciones deportivas, clubes sociales y asociaciones.

---

## 🚀 Características Principales

- **Multi-Tenant Nativo:** Soporte para múltiples clubes e instituciones bajo una misma infraestructura aislada mediante encabezados de inquilino (`x-club-slug`) o subdominios.
- **Portal del Socio & Carnet Digital QR:** Credenciales virtuales dinámicas con validación de accesos e ingreso en molinete.
- **Finanzas & Cobranzas Online:** Liquidación mensual de cuotas e integración con pasarela Mercado Pago.
- **Gestión Deportiva:** Nóminas de planteles, categorías, planillas de partidos y control de aptos médicos.
- **Multimedia & Newbery TV:** Transmisiones en directo, streaming y creación de placas gráficas automáticas (Liga Pro Studio).
- **IA Asistente:** Integración nativa con Google Gemini para asistencia directiva y generación de contenidos.

---

## 🛠️ Estructura del Monorepo

```
/
├── frontend/     # Aplicación Next.js (App Router, Tailwind CSS, PWA)
├── backend/      # Servidor API Node.js / Express (Prisma ORM, Dual JWT)
├── shared/       # Constantes y versionado unificado (version.js / version.ts)
└── docs/         # Documentación comercial, técnica y manuales de usuario
```

---

## ⚙️ Configuración de Desarrollo Local

### 1. Clonar e Instalar Dependencias
```bash
git clone <repository-url>
cd club-digital-pro
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configurar Variables de Entorno
Copiar `.env.example` en ambos directorios:
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 3. Iniciar Servidores
```bash
# Iniciar backend
cd backend && npm start

# En otra terminal, iniciar frontend
cd frontend && npm run dev
```

---

## 📜 Licencia & Derechos

Licencia MIT — **Club Digital Pro SaaS Team**.
