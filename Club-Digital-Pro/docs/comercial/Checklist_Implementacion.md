# Checklist de Implementación y Entrega — Club Digital Pro

Guía cronológica para que el equipo técnico dé de alta y configure un nuevo club cliente en producción de forma exitosa.

---

## 📋 Fase 1: Datos Básicos Solicitados al Club
- [ ] **Información de Registro:** Nombre legal completo, CUIT, teléfono de contacto y correo institucional principal.
- [ ] **DNS y Dominio:** Dominio registrado (ej: `www.clubjuventud.com`) con accesos al registrador (ej. NIC Argentina, GoDaddy) para apuntar los registros CNAME a los servidores de Club Digital Pro.
- [ ] **Identidad Visual:** Archivos vectoriales o PNG de alta resolución del logotipo, escudo oficial, favicon y banners de cabecera.
- [ ] **Paleta de Colores:** Definición de los códigos de color primario, secundario y de acento en formato HEX (ej: `#CC0000`).

---

## ⚙️ Fase 2: Configuración Inicial del Sistema
- [ ] **Creación del Tenant:** Alta del club y asignación de slug único mediante el panel `/super-admin`.
- [ ] **Configuración de Variables CSS:** Registro de la paleta de colores y selección de la tipografía corporativa en el motor de branding.
- [ ] **Vinculación de Mercado Pago:** Configuración de las credenciales de MP (`Access Token` y `Public Key`) en las variables de entorno del club para habilitar la pasarela de pagos.
- [ ] **Creación del Usuario Administrador:** Registro de la cuenta maestra (`ADMIN_CLUB`) del personal a cargo de la secretaría.

---

## 👥 Fase 3: Importación de Datos y Capacitación
- [ ] **Importación de Socios:** Carga del padrón inicial de socios activos (nombres, DNI, estados, saldos) mediante archivo CSV.
- [ ] **Carga de Disciplinas:** Registro de las actividades físicas que ofrece la sede y sus respectivos valores arancelarios.
- [ ] **Capacitación del Personal:** Reunión técnica presencial u online de 60 minutos con el personal administrativo sobre la carga de socios, cobro de cuotas en ventanilla y control de accesos con carnet QR.

---

## 🟢 Fase 4: Entrega Final y Puesta en Marcha
- [ ] **Prueba de Cobros:** Ejecución de una transacción de prueba de $10 vía Mercado Pago para validar la comunicación del webhook.
- [ ] **Verificación de Enrutamiento:** Control de carga de la landing page pública bajo el dominio oficial del club.
- [ ] **Firma de Entrega:** Envío de credenciales de acceso al cliente y firma del acta digital de conformidad del servicio.
