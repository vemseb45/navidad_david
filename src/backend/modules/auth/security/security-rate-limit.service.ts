import { prisma } from '@/backend/config/prisma';

export const MAX_CONSECUTIVE_FAILED_ATTEMPTS = 5;
export const MAX_IP_FAILED_ATTEMPTS = 5;

// Cache en memoria ultra-rápido para validación sub-milisegundo en proxy.ts y controladores
const blockedIpsCache = new Set<string>();
let lastCacheSync = 0;
const CACHE_TTL_MS = 15000; // 15 segundos

export class SecurityRateLimitService {
  /**
   * Sincroniza la caché en memoria con la base de datos (tb_ips_bloqueadas)
   */
  public static async syncBlockedIpsCache(force = false): Promise<void> {
    const now = Date.now();
    if (!force && now - lastCacheSync < CACHE_TTL_MS) {
      return;
    }

    try {
      const blockedRecords = await prisma.ipBloqueada.findMany({
        where: { esta_bloqueada: true },
        select: { direccion_ip: true },
      });

      blockedIpsCache.clear();
      for (const record of blockedRecords) {
        blockedIpsCache.add(record.direccion_ip.trim());
      }
      lastCacheSync = now;
    } catch (err) {
      console.error('⚠️ [RateLimit] Error sincronizando caché de IPs bloqueadas:', err);
    }
  }

  /**
   * Verifica de manera instantánea si una IP se encuentra bloqueada en el sistema
   */
  public static async isIpBlocked(ip: string): Promise<boolean> {
    if (!ip) return false;
    const cleanIp = ip.trim();

    await this.syncBlockedIpsCache();

    if (blockedIpsCache.has(cleanIp)) {
      return true;
    }

    // Doble verificación directa en DB si la caché falló o es nueva
    try {
      const record = await prisma.ipBloqueada.findUnique({
        where: { direccion_ip: cleanIp },
        select: { esta_bloqueada: true },
      });

      if (record?.esta_bloqueada) {
        blockedIpsCache.add(cleanIp);
        return true;
      }
    } catch {
      // En caso de fallo transitorio en DB, permitir paso
    }

    return false;
  }

  /**
   * Registra un evento en la tabla de auditoría forense (tb_logs_seguridad)
   */
  public static async logSecurityEvent(
    tipo_evento: string,
    correo_intentado: string,
    direccion_ip: string,
    detalles?: string
  ): Promise<void> {
    try {
      await prisma.logSeguridad.create({
        data: {
          tipo_evento,
          correo_intentado: correo_intentado.trim().toLowerCase(),
          direccion_ip: direccion_ip.trim(),
          detalles: detalles || null,
        },
      });
    } catch (err) {
      console.error('⚠️ [RateLimit] Error al registrar log de seguridad:', err);
    }
  }

  /**
   * Bloquea inmediatamente una dirección IP en tb_ips_bloqueadas y actualiza la caché
   */
  public static async blockIp(ip: string, motivo: string, intentosRegistrados = 5): Promise<void> {
    const cleanIp = ip.trim();
    try {
      await prisma.ipBloqueada.upsert({
        where: { direccion_ip: cleanIp },
        update: {
          esta_bloqueada: true,
          motivo,
          intentos_registrados: intentosRegistrados,
          fecha_hora_bloqueo: new Date(),
        },
        create: {
          direccion_ip: cleanIp,
          motivo,
          esta_bloqueada: true,
          intentos_registrados: intentosRegistrados,
          fecha_hora_bloqueo: new Date(),
        },
      });

      blockedIpsCache.add(cleanIp);

      await this.logSecurityEvent(
        'BLOQUEO_IP',
        'SISTEMA',
        cleanIp,
        `IP bloqueada por: ${motivo}. Intentos: ${intentosRegistrados}`
      );

      console.warn(`🛑 [Seguridad] IP ${cleanIp} ha sido bloqueada automáticamente.`);
    } catch (err) {
      console.error('⚠️ [RateLimit] Error bloqueando IP:', err);
    }
  }

  /**
   * Desbloquea una dirección IP
   */
  public static async unblockIp(ip: string): Promise<void> {
    const cleanIp = ip.trim();
    try {
      await prisma.ipBloqueada.updateMany({
        where: { direccion_ip: cleanIp },
        data: {
          esta_bloqueada: false,
        },
      });
      blockedIpsCache.delete(cleanIp);
      await this.syncBlockedIpsCache(true);
      console.log(`✅ [Seguridad] IP ${cleanIp} ha sido desbloqueada.`);
    } catch (err) {
      console.error('⚠️ [RateLimit] Error desbloqueando IP:', err);
    }
  }

  /**
   * Procesa un intento fallido de autenticación (contraseña incorrecta o usuario inexistente):
   * 1. Incrementa intentos del usuario si existe.
   * 2. Si llega a 5 intentos consecutivos, bloquea la cuenta (tb_users.esta_bloqueado = true).
   * 3. Registra el evento en tb_logs_seguridad.
   * 4. Cuenta los intentos fallidos de la IP. Si llega a 5, bloquea la IP en tb_ips_bloqueadas.
   */
  public static async handleFailedAttempt(
    correo: string,
    ip: string,
    usuarioId?: string | null,
    intentosPrevios = 0
  ): Promise<{ userBlocked: boolean; ipBlocked: boolean }> {
    const cleanCorreo = correo.trim().toLowerCase();
    const cleanIp = ip.trim();
    let userBlocked = false;
    let ipBlocked = false;

    // 1. Manejo del bloqueo de usuario si existe
    if (usuarioId) {
      const nuevoConteo = intentosPrevios + 1;
      if (nuevoConteo >= MAX_CONSECUTIVE_FAILED_ATTEMPTS) {
        userBlocked = true;
        await prisma.usuario.update({
          where: { id: usuarioId },
          data: {
            intentos_fallidos: nuevoConteo,
            esta_bloqueado: true,
            fecha_bloqueo: new Date(),
          },
        });

        await this.logSecurityEvent(
          'BLOQUEO_USUARIO',
          cleanCorreo,
          cleanIp,
          `Usuario bloqueado tras alcanzar ${nuevoConteo} intentos fallidos consecutivos.`
        );
        console.warn(`🔒 [Seguridad] Usuario ${cleanCorreo} bloqueado por superar 5 intentos.`);
      } else {
        await prisma.usuario.update({
          where: { id: usuarioId },
          data: {
            intentos_fallidos: nuevoConteo,
          },
        });

        await this.logSecurityEvent(
          'CONTRASENA_INCORRECTA',
          cleanCorreo,
          cleanIp,
          `Intento fallido ${nuevoConteo} de ${MAX_CONSECUTIVE_FAILED_ATTEMPTS}.`
        );
      }
    } else {
      // Intento contra usuario inexistente
      await this.logSecurityEvent(
        'CONTRASENA_INCORRECTA',
        cleanCorreo,
        cleanIp,
        'Intento de autenticación con correo no registrado en el sistema.'
      );
    }

    // 2. Control de Fuerza Bruta por Dirección IP
    // Consultar cuántos intentos fallidos acumula esta IP en las últimas horas
    try {
      const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000);
      const fallosIp = await prisma.logSeguridad.count({
        where: {
          direccion_ip: cleanIp,
          tipo_evento: {
            in: ['CONTRASENA_INCORRECTA', 'BLOQUEO_USUARIO', 'INTENTO_USUARIO_BLOQUEADO'],
          },
          fecha_hora: {
            gte: haceUnaHora,
          },
        },
      });

      if (fallosIp >= MAX_IP_FAILED_ATTEMPTS) {
        ipBlocked = true;
        await this.blockIp(
          cleanIp,
          `Acumulación de ${fallosIp} intentos fallidos de autenticación en la última hora (fuerza bruta).`,
          fallosIp
        );
      }
    } catch (err) {
      console.error('⚠️ [RateLimit] Error evaluando intentos de IP:', err);
    }

    return { userBlocked, ipBlocked };
  }

  /**
   * Restablece los intentos fallidos al tener éxito en la autenticación
   */
  public static async handleSuccessfulLogin(usuarioId: string, correo: string, ip: string): Promise<void> {
    try {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          intentos_fallidos: 0,
        },
      });

      await this.logSecurityEvent(
        'LOGIN_EXITOSO',
        correo.trim().toLowerCase(),
        ip.trim(),
        'Inicio de sesión exitoso.'
      );
    } catch (err) {
      console.error('⚠️ [RateLimit] Error al procesar login exitoso:', err);
    }
  }

  /**
   * Desbloquea un usuario administrativo
   */
  public static async unblockUser(usuarioId: string): Promise<void> {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        esta_bloqueado: false,
        intentos_fallidos: 0,
        fecha_bloqueo: null,
      },
    });

    await this.logSecurityEvent(
      'DESBLOQUEO_USUARIO',
      usuarioId,
      'ADMIN_PANEL',
      'Usuario desbloqueado manualmente por un administrador.'
    );
  }

  /**
   * Obtiene la lista de IPs bloqueadas
   */
  public static async listBlockedIps() {
    return prisma.ipBloqueada.findMany({
      orderBy: { fecha_hora_bloqueo: 'desc' },
    });
  }

  /**
   * Obtiene los logs de seguridad recientes
   */
  public static async listSecurityLogs(limit = 100) {
    return prisma.logSeguridad.findMany({
      take: limit,
      orderBy: { fecha_hora: 'desc' },
    });
  }
}
