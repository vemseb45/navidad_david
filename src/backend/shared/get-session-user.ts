import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/backend/modules/auth/auth.constants';
import { readToken, SessionUser } from '@/backend/modules/auth/security/token.service';

/**
 * Obtiene el usuario de la sesión leyendo la cookie HttpOnly en el servidor
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return readToken(token);
  } catch {
    return null;
  }
}
