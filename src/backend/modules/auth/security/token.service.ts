import jwt from 'jsonwebtoken';

export interface SessionUser {
  id: string;
  nombres_apellidos: string;
  correo_electronico: string;
  rol: string;
}

const AUTH_TOKEN_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET_KEY || 'navidad_david_jwt_super_secret_2026';
const AUTH_SESSION_HOURS = 24;

export function createToken(payload: SessionUser): string {
  return jwt.sign(payload, AUTH_TOKEN_SECRET, {
    expiresIn: `${AUTH_SESSION_HOURS}h`,
  });
}

export function readToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, AUTH_TOKEN_SECRET) as SessionUser & { iat?: number; exp?: number };
    const { iat, exp, ...user } = decoded;
    return user as SessionUser;
  } catch {
    return null;
  }
}

export function createPreAuthToken(userId: string): string {
  return jwt.sign({ userId }, AUTH_TOKEN_SECRET, { expiresIn: '5m' });
}

export function readPreAuthToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, AUTH_TOKEN_SECRET) as { userId: string };
  } catch {
    return null;
  }
}
