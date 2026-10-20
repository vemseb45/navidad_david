/**
 * Constantes y configuración de autenticación y seguridad de cookies/JWT
 * Alineado con Barber_Tech_BF
 */
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'barber_tech_session';

const sessionHours = Number(process.env.AUTH_SESSION_HOURS);
export const AUTH_SESSION_HOURS = Number.isNaN(sessionHours) || sessionHours <= 0 ? 4 : sessionHours;

// Expiración de la cookie en segundos (AUTH_SESSION_HOURS * 3600)
export const AUTH_SESSION_MAX_AGE = AUTH_SESSION_HOURS * 60 * 60;

// Llave criptográfica para firma y verificación de JWT
export const AUTH_TOKEN_SECRET =
  process.env.NEXTAUTH_SECRET || 'c4@fwiuso=a)2xkw5+)4+j0&$bs2=)0$%%8r+@4dfpx$p_rv$q';

export const AUTH_COOKIE_SECURE = process.env.NODE_ENV === 'production';
export const AUTH_COOKIE_SAME_SITE: 'lax' | 'strict' | 'none' = 'lax';
export const AUTH_COOKIE_PATH = '/';
