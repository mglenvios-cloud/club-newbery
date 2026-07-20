# Guía de Instalación y Despliegue para Clientes

Instrucciones técnicas paso a paso para el alta y despliegue del sistema SaaS Club Digital Pro.

---

## 🛠️ Requisitos Previos
1. Node.js v18+ instalado.
2. Servidor Postgres o SQLite activo.
3. Cuenta en Mercado Pago Developer (para pasarela de cobros).

## 🚀 Despliegue en 4 Pasos

### 1. Clonar el Core Base
```bash
git clone https://github.com/clubdigitalpro/saas-core.git
cd saas-core
```

### 2. Configurar Entorno (`.env`)
Crear un archivo `.env` en la raíz del backend:
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/clubdb?schema=public"
MERCADOPAGO_ACCESS_TOKEN="TEST-123456789-ACCESS-TOKEN"
GEMINI_API_KEY="AIzaSyYourGeminiApiKey"
```

### 3. Migrar Base de Datos (Prisma)
Ejecutar la creación de tablas correspondientes en Postgres:
```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Lanzar Frontend y Backend
```bash
# Servidor Express
cd backend
npm run dev

# Cliente Next.js
cd ../frontend
npm run dev
```

El asistente de configuración inicial estará disponible en `/crear-club` para dar de alta tu primera cuenta administradora de club.
