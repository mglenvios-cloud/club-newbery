# Reporte de Auditoría de Referencias a Localhost y Env Variables

Este informe resume la investigación exhaustiva realizada sobre el direccionamiento de red y la presencia de referencias a `localhost` o `127.0.0.1` en la comunicación entre el frontend (Vercel) y el backend (Render).

---

## 🔍 Resultados de la Búsqueda

Se auditó de forma completa el código fuente buscando de forma case-insensitive todos los patrones correspondientes a `localhost`, `127.0.0.1`, `http://localhost:5000` y `http://127.0.0.1:5000` en el directorio del frontend.

### Referencias Encontradas en el Frontend:

1. **`frontend/README.md`** (Línea 17)
   * *Código anterior:* `Open [http://localhost:3000](http://localhost:3000)...`
   * *Diagnóstico:* Es una referencia documentativa instructiva para que el desarrollador acceda a la UI local en su navegador. No interfiere en la comunicación de la app en producción.
2. **`frontend/src/config.js`** (Línea 8)
   * *Código anterior:* `* - Desarrollo (.env.local): NEXT_PUBLIC_API_URL=http://localhost:5000`
   * *Diagnóstico:* Línea de comentario instructivo documentando los entornos. No ejecutable.
3. **`frontend/src/lib/apiClient.js`** (Línea 9)
   * *Código anterior:* `* - En desarrollo, las rutas /api/* van a localhost:5000 según NEXT_PUBLIC_API_URL.`
   * *Diagnóstico:* Línea de comentario explicativo. No ejecutable.

*Conclusión de la búsqueda:* **No existe ninguna URL o cadena ejecutable de localhost hardcodeada en los componentes, hooks, servicios o llamadas de fetch del frontend.** Todo el tráfico pasa de forma unificada por el resolvedor central de red.

---

## 🛠️ Archivos Corregidos y Mejoras Aplicadas

Para garantizar de forma absoluta que la aplicación en producción nunca caiga a localhost de forma silenciosa ni falle por falta de variables, se implementaron las siguientes mejoras de control:

### 1. Control de Entorno Estricto en Producción (`frontend/src/config.js`)
* **Línea Modificada:** Líneas 15-26.
* **Cambio Aplicado:** Se forzó a lanzar una excepción fatal (`throw new Error`) si la variable de entorno `NEXT_PUBLIC_API_URL` está ausente al correr la aplicación en producción en Vercel, deteniendo la renderización y mostrando un mensaje explícito en lugar de fallar silenciosamente. En desarrollo local sin variables configuradas, cae de forma segura a `http://localhost:5000`.

```javascript
// Código Inyectado:
if (!process.env.NEXT_PUBLIC_API_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '🚨 CONFIGURATION ERROR: The environment variable NEXT_PUBLIC_API_URL is NOT defined! ' +
      'Please configure it in Vercel → Settings → Environment Variables pointing to your production backend ' +
      '(e.g., https://club-newbery-backend.onrender.com).'
    );
  } else {
    console.warn(
      '⚠️ WARNING: NEXT_PUBLIC_API_URL is not defined. Defaulting to http://localhost:5000 for local development.'
    );
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

### 2. Normalización de Reescritura Local en el Proxy (`frontend/next.config.mjs`)
* **Línea Modificada:** Línea 9.
* **Cambio Aplicado:** Se parametrizó la reescritura del proxy local para que Next.js asigne de manera predeterminada el puerto `5000` si la variable no está definida, asegurando consistencia absoluta con el comportamiento del cliente de red.

```javascript
// Código Inyectado:
async rewrites() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```

---

## 🏁 Verificación y Compilación

1. **Prueba de Compilación (`npm run build`)**: Se ejecutó de forma limpia en el workspace del frontend, finalizando el empaquetado de producción de todas las páginas de manera exitosa y sin errores (`✓ Compiled successfully`).
2. **Llamadas a Backend Correctas**: Con estas dos modificaciones, la aplicación se comunicará de manera estricta y segura con el dominio del backend provisto en la variable de entorno en Vercel, eliminando cualquier posibilidad de hacer requests a `localhost` en producción.
