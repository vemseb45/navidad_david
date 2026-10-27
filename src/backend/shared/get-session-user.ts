import { cookies, headers } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/backend/modules/auth/auth.constants';
import { readToken, SessionUser } from '@/backend/modules/auth/security/token.service';

/**
 * Obtiene el usuario de la sesión leyendo la cookie HttpOnly o el encabezado Authorization
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    // 1. Verificar si proxy.ts ya validó e inyectó la identidad en cabeceras internas
    const headerStore = await headers();
    const xUserId = headerStore.get('x-user-id');
    const xUserEmail = headerStore.get('x-user-email');
    const xUserRole = headerStore.get('x-user-role');

    if (xUserId && xUserEmail) {
      return {
        id: xUserId,
        correo_electronico: xUserEmail,
        rol: (xUserRole || 'OPERADOR').toUpperCase(),
        nombres_apellidos: '',
      };
    }

    // 2. Verificar encabezado Authorization: Bearer <token>
    const authHeader = headerStore.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      const userFromBearer = readToken(bearerToken);
      if (userFromBearer) {
        return {
          ...userFromBearer,
          rol: (userFromBearer.rol || 'OPERADOR').toUpperCase(),
        };
      }
    }

    // 3. Verificar Cookies HttpOnly (con fallbacks resilientes)
    const cookieStore = await cookies();
    const token =
      cookieStore.get(AUTH_COOKIE_NAME)?.value ||
      cookieStore.get('barber_tech_session')?.value ||
      cookieStore.get('arbolitos_navidad_david')?.value;

    if (!token) {
      return null;
    }

    const userFromCookie = readToken(token);
    if (!userFromCookie) return null;

    return {
      ...userFromCookie,
      rol: (userFromCookie.rol || 'OPERADOR').toUpperCase(),
    };
  } catch {
    return null;
  }
}
