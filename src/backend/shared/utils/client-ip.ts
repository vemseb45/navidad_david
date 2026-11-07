import type { NextRequest } from 'next/server';

/**
 * Extrae y normaliza la dirección IP pública o remota del cliente a partir de los encabezados HTTP.
 * Soporta proxies inversos, balanceadores de carga, Cloudflare y conexiones directas.
 */
export function getClientIp(req: NextRequest | Request): string {
  let ip = '';

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',');
    if (parts.length > 0 && parts[0].trim()) {
      ip = parts[0].trim();
    }
  }

  if (!ip) {
    const realIp = req.headers.get('x-real-ip');
    if (realIp && realIp.trim()) {
      ip = realIp.trim();
    }
  }

  if (!ip) {
    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp && cfIp.trim()) {
      ip = cfIp.trim();
    }
  }

  if (!ip) {
    ip = '127.0.0.1';
  }

  // Normalizar direcciones IPv6 localhost y mapeos ::ffff:
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  return ip;
}
