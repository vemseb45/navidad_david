import jwt from 'jsonwebtoken';
import { AUTH_TOKEN_SECRET, AUTH_SESSION_HOURS } from '../auth.constants';

export interface SessionUser {
  id: string;
  nombres_apellidos: string;
  correo_electronico: string;
  rol: string;
}

/**
 * Genera un token JWT de sesión firmado con NEXTAUTH_SECRET con tiempo de expiración dinámico
 */
export function createToken(payload: SessionUser): string {
  return jwt.sign(payload, AUTH_TOKEN_SECRET, {
    expiresIn: `${AUTH_SESSION_HOURS}h`,
  });
}

/**
 * Verifica y decodifica un token JWT de sesión usando la llave criptográfica
 */
export function readToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, AUTH_TOKEN_SECRET) as SessionUser & { iat?: number; exp?: number };
    const { iat, exp, ...user } = decoded;
    return user as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Genera token temporal de 5 minutos para el desafío 2FA
 */
export function createPreAuthToken(usuarioId: string): string {
  return jwt.sign({ usuarioId }, AUTH_TOKEN_SECRET, { expiresIn: '5m' });
}

/**
 * Valida el token temporal de 2FA
 */
export function readPreAuthToken(token: string): { usuarioId: string } | null {
  try {
    return jwt.verify(token, AUTH_TOKEN_SECRET) as { usuarioId: string };
  } catch {
    return null;
  }
}
