/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegurar que NEXT_PUBLIC_API_URL esté disponible en el cliente
  // (las variables NEXT_PUBLIC_* ya se exponen automáticamente, esto es documentativo)
  
  // Reescrituras para evitar problemas CORS en producción
  // El frontend hace llamadas a /api/* que Next.js reenvía al backend real
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!backendUrl) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  // Cabeceras de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
