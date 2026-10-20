import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_SECURE,
  AUTH_COOKIE_SAME_SITE,
  AUTH_COOKIE_PATH,
  AUTH_SESSION_MAX_AGE,
} from '../auth.constants';

/**
 * Establece la cookie de sesión HttpOnly segura
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
    path: AUTH_COOKIE_PATH,
  });
}

/**
 * Elimina la cookie de sesión al cerrar sesión
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
