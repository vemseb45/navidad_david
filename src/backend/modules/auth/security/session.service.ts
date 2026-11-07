import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_SECURE,
  AUTH_COOKIE_SAME_SITE,
  AUTH_COOKIE_PATH,
  AUTH_SESSION_MAX_AGE,
} from '../auth.constants';

/**
 * Establece la cookie de sesión HttpOnly segura con expiración estricta de 1 hora
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: AUTH_COOKIE_SECURE,
    sameSite: AUTH_COOKIE_SAME_SITE,
    maxAge: AUTH_SESSION_MAX_AGE,
    expires: new Date(Date.now() + AUTH_SESSION_MAX_AGE * 1000),
    path: AUTH_COOKIE_PATH,
  });
}

/**
 * Elimina la cookie de sesión al cerrar sesión o por expiración
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete('barber_tech_session');
  cookieStore.delete('arbolitos_navidad_david');

  // Sobreescribe con tiempo cero para forzar la purga inmediata en el cliente HTTP
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: AUTH_COOKIE_SECURE,
    sameSite: AUTH_COOKIE_SAME_SITE,
    maxAge: 0,
    expires: new Date(0),
    path: AUTH_COOKIE_PATH,
  });
}
