import { NextResponse } from 'next/server';

export function proxy(request) {
  // Solo aplicamos protección a la ruta /admin (excepto /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    // Verificamos si existe la cookie real "jn-auth-token" o "token"
    const tokenCookie = request.cookies.get('jn-auth-token') || request.cookies.get('token');

    if (!tokenCookie) {
      // Redirigir al login si no está autorizado
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const token = tokenCookie.value;
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Formato JWT inválido');
      }

      // Decodificar payload en Base64Url
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);

      // Validar expiración (exp está en segundos)
      const isExpired = payload.exp ? (payload.exp * 1000 < Date.now()) : true;
      if (isExpired) {
        throw new Error('Token expirado');
      }

      // Validar rol
      const isValidRole = payload.role === 'ADMIN' || payload.role === 'FUTSAL';
      if (!isValidRole) {
        throw new Error('Rol no autorizado');
      }

      // Permitir acceso si el rol y expiración son válidos
    } catch (err) {
      const loginUrl = new URL('/admin/login', request.url);
      // Limpiar cookies inválidas y redirigir
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('jn-auth-token');
      response.cookies.delete('token');
      response.cookies.delete('adminAuth');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
