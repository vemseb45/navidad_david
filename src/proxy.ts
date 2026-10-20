import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'barber_tech_session';
const AUTH_TOKEN_SECRET =
  process.env.NEXTAUTH_SECRET || 'c4@fwiuso=a)2xkw5+)4+j0&$bs2=)0$%%8r+@4dfpx$p_rv$q';

/**
 * Rutas de la API que requieren autenticación administrativa obligatoria por JWT en Cookie HttpOnly
 */
const PROTECTED_API_PATTERNS = [
  /^\/api\/admin(\/.*)?$/,
  /^\/api\/auth\/users(\/.*)?$/,
];

/**
 * Rutas exentas de validación CSRF (p. ej. webhooks externos de pasarelas de pago con firma HMAC)
 */
const CSRF_EXEMPT_PATHS = ['/api/webhooks/bold'];

/**
 * Cabeceras de Seguridad Avanzada (OWASP Defense in Depth)
 */
function applySecurityHeaders(response: NextResponse): void {
  // Evita ataques de Clickjacking impidiendo el renderizado en iframes no autorizados
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Previene ataques de confusión de tipo MIME (MIME sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Control estricto del encabezado Referrer para no filtrar URLs internas
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Filtro XSS para navegadores antiguos
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Deshabilita accesos a sensores, cámaras, micrófonos y APIs de rastreo invasivas
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );

  // Forzar HTTPS en producción (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // Content Security Policy (CSP) adaptada para Turbopack, Bold Gateway y Google Fonts
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.bold.co https://*.bold.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https://*.bold.co https://images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://checkout.bold.co https://*.bold.co https://api.bold.co",
    "frame-src 'self' https://checkout.bold.co https://*.bold.co",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
}

/**
 * Proxy de Seguridad en Next.js 16 (anteriormente middleware.ts)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // 1. Manejo de peticiones preflight CORS en rutas de API
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    const preflight = new NextResponse(null, { status: 204 });
    applySecurityHeaders(preflight);
    preflight.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    preflight.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-CSRF-Token'
    );
    preflight.headers.set('Access-Control-Max-Age', '86400');
    return preflight;
  }

  // 2. Protección CSRF para métodos de mutación (POST, PUT, DELETE, PATCH) en la API
  if (
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) &&
    pathname.startsWith('/api') &&
    !CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path))
  ) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          const forbidden = NextResponse.json(
            {
              success: false,
              error: 'Petición bloqueada por validación de origen CSRF.',
            },
            { status: 403 }
          );
          applySecurityHeaders(forbidden);
          return forbidden;
        }
      } catch {
        const forbidden = NextResponse.json(
          {
            success: false,
            error: 'Cabecera Origin inválida o sospechosa.',
          },
          { status: 403 }
        );
        applySecurityHeaders(forbidden);
        return forbidden;
      }
    }
  }

  // 3. Verificación de Autenticación en Rutas Administrativas de la API
  const isProtectedApi = PROTECTED_API_PATTERNS.some((pattern) => pattern.test(pathname));

  if (isProtectedApi) {
    const sessionCookie =
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      request.cookies.get('barber_tech_session')?.value ||
      request.cookies.get('arbolitos_navidad_david')?.value;

    if (!sessionCookie) {
      const unauthorized = NextResponse.json(
        {
          success: false,
          error: 'Acceso no autorizado: Se requiere una sesión activa con Cookie HttpOnly.',
        },
        { status: 401 }
      );
      applySecurityHeaders(unauthorized);
      return unauthorized;
    }

    try {
      const decoded = jwt.verify(sessionCookie, AUTH_TOKEN_SECRET) as {
        id?: string;
        correo_electronico?: string;
        rol?: string;
        nombres_apellidos?: string;
      };

      if (!decoded?.id || !decoded?.correo_electronico) {
        throw new Error('Payload del token inválido');
      }

      // Propagar identidad verificada en las cabeceras de la petición hacia el backend
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.id);
      requestHeaders.set('x-user-email', decoded.correo_electronico);
      requestHeaders.set('x-user-role', decoded.rol || 'OPERADOR');
      requestHeaders.set('x-request-id', requestId);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      applySecurityHeaders(response);
      response.headers.set('x-request-id', requestId);
      return response;
    } catch {
      // Token expirado o firma corrupta
      const invalidTokenResponse = NextResponse.json(
        {
          success: false,
          error: 'Sesión expirada o token inválido. Por favor inicie sesión nuevamente.',
        },
        { status: 401 }
      );

      // Limpiar cookie corrupta para restaurar estado seguro
      invalidTokenResponse.cookies.delete(AUTH_COOKIE_NAME);
      applySecurityHeaders(invalidTokenResponse);
      return invalidTokenResponse;
    }
  }

  // 4. Limpieza preventiva de cookie corrupta en visita directa a /admin
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (sessionCookie) {
      try {
        jwt.verify(sessionCookie, AUTH_TOKEN_SECRET);
      } catch {
        // La cookie está corrupta o expiró, la limpiamos proactivamente
        response.cookies.delete(AUTH_COOKIE_NAME);
      }
    }
  }

  // 5. Aplicar cabeceras de seguridad a todas las respuestas
  applySecurityHeaders(response);
  response.headers.set('x-request-id', requestId);

  return response;
}

/**
 * Configuración del Matcher en Next.js 16
 * Aplica a todas las rutas excepto binarios estáticos, optimización de imágenes y favicon
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|Logo_david\\..*|.*\\.(?:svg|png|jpg|jpeg|webp|ico|css|js)$).*)',
  ],
};
