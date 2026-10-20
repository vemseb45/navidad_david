import { cookies } from 'next/headers';
import { readToken, SessionUser } from './token.service';

export const AUTH_COOKIE_NAME = 'nd_admin_session';
export const AUTH_SESSION_MAX_AGE = 24 * 60 * 60; // 24 horas

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH_SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return readToken(token);
}
