# Checklist de Implementación para Clubes Reales (Club Digital Pro v1.0.0)

Este documento guía la puesta en marcha de **Club Digital Pro** en una nueva institución deportiva.

---

## 1. Pre-Despliegue & Variables de Entorno
- [ ] Declarar `DATABASE_URL` con la cadena de conexión PostgreSQL de producción (ej. Supabase / Neon / Render Postgres).
- [ ] Definir `JWT_SECRET` con una clave secreta segura de al menos 32 caracteres.
- [ ] Configurar `FRONTEND_URL` apuntando al dominio HTTPS final del club en Vercel.
- [ ] Declarar `MP_ACCESS_TOKEN` con las credenciales de producción de Mercado Pago.
- [ ] Declarar `GEMINI_API_KEY` para activar las recomendaciones de IA.

---

## 2. Base de Datos & Auto-Provisionamiento
- [ ] Ejecutar el comando de migración: `npm run migrate` en el servidor backend.
- [ ] Ejecutar el endpoint `/api/admin-general/provision-club` o registrar el club inicial.
- [ ] Verificar la creación del usuario **ADMIN** principal y el hash de su contraseña.

---

## 3. Configuración de Branding & Colores
- [ ] Subir los activos institucionales (Escudo HD, Logo horizontal, Favicon).
- [ ] Configurar los colores corporativos (Primario, Secundario, Menú y Botones).
- [ ] Configurar los datos de contacto y redes sociales oficiales del club.

---

## 4. Estructura Deportiva y Temporada
- [ ] Habilitar la **Temporada Activa** (ej. "Temporada 2026").
- [ ] Dar de alta la grilla de disciplinas y categorías deportivas (Primera, Reserva, Juveniles, Infantiles).
- [ ] Cargar o asignar el cuerpo técnico y profesores a sus respectivas categorías.

---

## 5. Pruebas Operativas Previas
- [ ] Probar el ingreso al portal de socio y la generación de **Carnet QR**.
- [ ] Realizar un pago de prueba a través de la pasarela **Mercado Pago**.
- [ ] Probar la transmisión de prueba en **Newbery TV**.
- [ ] Verificar el panel `/system-status` asegurando que todos los indicadores marquen `OPERATIVO`.
