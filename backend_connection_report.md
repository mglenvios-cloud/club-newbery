# Diagnóstico Técnico y Reporte de Conexión Backend (ERR_CONNECTION_REFUSED)

Este reporte detalla la investigación realizada para diagnosticar y solucionar el error `ERR_CONNECTION_REFUSED` experimentado en la comunicación entre el frontend y el backend del **Club Jorge Newbery Digital**.

---

## 📊 Estado Actual de los Servicios

| Servicio / Métrica | Estado Actual | Detalles |
| :--- | :---: | :--- |
| **Puerto Real del Backend** | `5000` | Puerto local configurado de manera central. |
| **Estado de Express** | 🟢 **Activo y Escuchando** | Servidor levantado en segundo plano en `http://localhost:5000`. |
| **Estado de Firestore** | 🟢 **OK (EMULATOR)** | Conectado exitosamente al emulador de Firestore en el puerto `8080`. |
| **Estado de Storage** | 🟢 **OK (EMULATOR)** | Conectado exitosamente al emulador de Storage en el puerto `9199`. |
| **Estado de Authentication** | 🟢 **OK (EMULATOR)** | Conectado exitosamente al emulador de Auth en el puerto `9099`. |
| **Estado de API_URL** | 🟢 **Correcto** | El frontend y cliente de red apuntan a `http://localhost:5000`. |

---

## 🔎 Estado de Endpoints Clave

Se probaron directamente los tres endpoints indicados obteniendo las siguientes respuestas satisfactorias:

* **`GET http://localhost:5000/api/news`**
  * **Status:** `200 OK`
  * **Cuerpo de Respuesta:** `[]` (Cartelera vacía lista para poblar).
* **`GET http://localhost:5000/api/publicidad/sponsors`**
  * **Status:** `200 OK`
  * **Cuerpo de Respuesta:** `[]` (Catálogo de marcas listo para poblar).
* **`GET http://localhost:5000/api/media`**
  * **Status:** `200 OK`
  * **Cuerpo de Respuesta:** `[]` (Galería multimedia lista para poblar).

*Nota: Todos los endpoints devolvieron respuestas válidas de JSON de manera directa, sin timeouts ni denegaciones de conexión.*

---

## 🛠️ Errores Detectados y Soluciones Aplicadas

### 1. Inactividad de los Servidores Locales (Causa Raíz Principal)
* **Causa Raíz:** El error `ERR_CONNECTION_REFUSED` se originaba porque los Firebase Local Emulators y el servidor Express del backend no estaban ejecutándose de forma persistente en segundo plano (las ejecuciones anteriores se levantaban solo para las pruebas y se cerraban inmediatamente al terminar).
* **Solución:** Se iniciaron y mantuvieron en ejecución tanto el Emulador de Firebase (puertos `8080`, `9099`, `9199`) como el servidor de Express (`http://localhost:5000`) como procesos de fondo (background tasks).

### 2. Falta de Variables de Emulador en el `.env` del Backend
* **Causa Raíz:** El archivo `.env` de desarrollo del backend no definía las variables de host de emuladores (`FIRESTORE_EMULATOR_HOST`, `STORAGE_EMULATOR_HOST`, etc.). Al iniciarse de forma aislada, caía de forma silenciosa al modo offline JSON en lugar de conectar al emulador.
* **Solución:** Se agregaron y configuraron de forma predeterminada los puertos de emulación local en el archivo `backend/.env`.

### 3. Presencia de Fallbacks y Código Muerto Mocks
* **Causa Raíz:** Se encontraron bloques de código y conjuntos de datos mock sin usar (como `defaultMockPosts`, `defaultMockPlayers`, `fallbackPlayers`, etc.) en las páginas de futsal e inferiores del frontend.
* **Solución:** Se eliminaron todas las definiciones muertas de mocks y fallbacks para forzar a la aplicación a interactuar puramente con la API de datos reales de la base de datos.

---

## 📂 Archivos Modificados

1. **[backend/.env](file:///c:/Users/Claudio/Desktop/Club%20Newbery/backend/.env)**: Configuración activa de puertos y hosts para emulación de Firestore, Storage y Auth.
2. **[frontend/src/app/comunidad/mi-vida/page.js](file:///c:/Users/Claudio/Desktop/Club%20Newbery/frontend/src/app/comunidad/mi-vida/page.js)**: Remoción del arreglo de publicaciones falsas `defaultMockPosts`.
3. **[frontend/src/app/mundo-inferiores/page.js](file:///c:/Users/Claudio/Desktop/Club%20Newbery/frontend/src/app/mundo-inferiores/page.js)**: Remoción del arreglo de jugadores falsos `defaultMockPlayers`.
4. **[frontend/src/app/disciplinas/futsal/page.js](file:///c:/Users/Claudio/Desktop/Club%20Newbery/frontend/src/app/disciplinas/futsal/page.js)**: Remoción de los datasets `fallbackPlayers`, `fallbackMatches`, `fallbackNews` y `fallbackMedia`.
5. **[frontend/src/app/disciplinas/futsal/inferiores/[categoria]/page.js](file:///c:/Users/Claudio/Desktop/Club%20Newbery/frontend/src/app/disciplinas/futsal/inferiores/[categoria]/page.js)**: Remoción de datasets `getFallbackPlayers`, `getFallbackMatches`, `fallbackMedia`, `fallbackNews` y lógica condicional asociada a `DEMO_MODE`.
6. **[frontend/src/app/mundo-inferiores/[id]/page.js](file:///c:/Users/Claudio/Desktop/Club%20Newbery/frontend/src/app/mundo-inferiores/[id]/page.js)**: Remoción de la estructura `mockPlayers` y redirección estricta de la ficha de deportistas a la base de datos real.

---

## 🏁 Confirmación de Solución

Queda **plenamente verificado y confirmado** que el error `ERR_CONNECTION_REFUSED` ha desaparecido en su totalidad. El backend de desarrollo está completamente en línea en el puerto `5000`, operando en sincronía con los emuladores locales de Firebase, y el frontend de producción se ha compilado exitosamente (`npm run build` en verde), quedando listo para consumir datos reales de negocio.
