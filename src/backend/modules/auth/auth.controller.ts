import { NextRequest, NextResponse } from 'next/server';
import { apiResponse } from '@/backend/shared/utils/apiResponse';
import { getSessionUser } from '@/backend/shared/get-session-user';
import { getClientIp } from '@/backend/shared/utils/client-ip';
import { SecurityRateLimitService } from './security/security-rate-limit.service';
import { SessionUser } from './security/token.service';
import { setSessionCookie, clearSessionCookie } from './security/session.service';
import { AuthService } from './auth.service';
import {
  loginSchema,
  verify2faSchema,
  createUserSchema,
  toggle2faSchema,
  unblockIpSchema,
} from './validators/auth.validator';

async function parseBody(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  // POST /api/auth/login
  async login(req: NextRequest) {
    const clientIp = getClientIp(req);

    // Si la IP está bloqueada en la lista negra, no se le da respuesta ("sin alcance")
    if (await SecurityRateLimitService.isIpBlocked(clientIp)) {
      return new NextResponse(null, {
        status: 444,
        headers: { Connection: 'close' },
      });
    }

    try {
      const raw = await parseBody(req);
      const parsed = loginSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Datos de inicio de sesión inválidos', null, 400, parsed.error.flatten());
      }

      const result = await this.service.loginUser(parsed.data, clientIp);

      // Si no requiere 2FA, configuramos la cookie HttpOnly de inmediato
      if (!result.requiere2FA && result.token) {
        await setSessionCookie(result.token);
      }

      return apiResponse(true, 'Autenticación procesada', result, 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'IP_BLOQUEADA') {
        return new NextResponse(null, {
          status: 444,
          headers: { Connection: 'close' },
        });
      }
      const message = error instanceof Error ? error.message : 'Error al autenticar usuario';
      return apiResponse(false, message, null, 401);
    }
  }

  // POST /api/auth/verify-2fa
  async verify2fa(req: NextRequest) {
    const clientIp = getClientIp(req);

    if (await SecurityRateLimitService.isIpBlocked(clientIp)) {
      return new NextResponse(null, {
        status: 444,
        headers: { Connection: 'close' },
      });
    }

    try {
      const raw = await parseBody(req);
      const parsed = verify2faSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Parámetros de código 2FA inválidos', null, 400, parsed.error.flatten());
      }

      const result = await this.service.verify2fa(parsed.data, clientIp);
      await setSessionCookie(result.token);

      return apiResponse(true, 'Código 2FA verificado exitosamente', result, 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'IP_BLOQUEADA') {
        return new NextResponse(null, {
          status: 444,
          headers: { Connection: 'close' },
        });
      }
      const message = error instanceof Error ? error.message : 'Código 2FA incorrecto o expirado';
      return apiResponse(false, message, null, 400);
    }
  }

  // GET /api/auth/me
  async me(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return apiResponse(false, 'No hay sesión activa', null, 401);
      }

      return apiResponse(true, 'Sesión válida', { usuario: user }, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al consultar sesión';
      return apiResponse(false, message, null, 500);
    }
  }

  // POST /api/auth/logout
  async logout(_req: NextRequest) {
    try {
      await clearSessionCookie();
      return apiResponse(true, 'Sesión cerrada correctamente', null, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      return apiResponse(false, message, null, 500);
    }
  }

  /**
   * Validador robusto de sesión y permisos de Administrador para gestión de usuarios
   */
  private async checkAdminAccess(): Promise<{
    authorized: boolean;
    currentUser: SessionUser | null;
    errorResponse?: NextResponse;
  }> {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return {
        authorized: false,
        currentUser: null,
        errorResponse: apiResponse(false, 'No autorizado para consultar o gestionar usuarios', null, 401),
      };
    }

    const roleUpper = (currentUser.rol || '').toUpperCase();
    let isAdmin = roleUpper === 'ADMIN' || roleUpper === 'SUPERADMIN';

    // Verificación adicional de respaldo en la base de datos tb_users
    if (!isAdmin && currentUser.id) {
      try {
        const userInDb = await this.service.getUserById(currentUser.id);
        if (userInDb && userInDb.rol.toUpperCase() === 'ADMIN') {
          isAdmin = true;
        }
      } catch {
        // En caso de fallo de red/DB, se mantiene el estado previo
      }
    }

    if (!isAdmin) {
      return {
        authorized: false,
        currentUser,
        errorResponse: apiResponse(
          false,
          'Acceso denegado: se requiere rol de Administrador para gestionar usuarios',
          null,
          403
        ),
      };
    }

    return { authorized: true, currentUser };
  }

  // GET /api/auth/users
  async getUsers(_req: NextRequest) {
    try {
      const auth = await this.checkAdminAccess();
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      const users = await this.service.listUsers();
      return apiResponse(true, 'Usuarios obtenidos correctamente', users, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al listar usuarios';
      return apiResponse(false, message, null, 500);
    }
  }

  // POST /api/auth/users
  async createUser(req: NextRequest) {
    try {
      const auth = await this.checkAdminAccess();
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      const raw = await parseBody(req);
      const parsed = createUserSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Datos de usuario inválidos', null, 400, parsed.error.flatten());
      }

      const nuevoUsuario = await this.service.createUser(parsed.data);
      return apiResponse(true, 'Usuario creado exitosamente', nuevoUsuario, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear usuario';
      return apiResponse(false, message, null, 400);
    }
  }

  // PATCH /api/auth/users
  async updateUser(req: NextRequest) {
    try {
      const auth = await this.checkAdminAccess();
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      const raw = await parseBody(req);
      const parsed = toggle2faSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Parámetros inválidos', null, 400, parsed.error.flatten());
      }

      // Desbloqueo de usuario administrativo
      if (parsed.data.desbloquear) {
        await this.service.unblockUser(parsed.data.usuarioId);
        return apiResponse(true, 'Usuario desbloqueado exitosamente', { id: parsed.data.usuarioId }, 200);
      }

      if (parsed.data.activo !== undefined) {
        const usuarioActualizado = await this.service.toggle2FA({
          usuarioId: parsed.data.usuarioId,
          activo: parsed.data.activo,
        });
        return apiResponse(true, 'Estado de 2FA actualizado', usuarioActualizado, 200);
      }

      return apiResponse(true, 'Sin modificaciones requeridas', null, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
      return apiResponse(false, message, null, 400);
    }
  }

  // GET /api/auth/security (Listar IPs bloqueadas y logs de seguridad)
  async getSecurityOverview(_req: NextRequest) {
    try {
      const auth = await this.checkAdminAccess();
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      const [ipsBloqueadas, logsRecientes] = await Promise.all([
        this.service.listBlockedIps(),
        this.service.listSecurityLogs(50),
      ]);

      return apiResponse(
        true,
        'Información de seguridad obtenida',
        {
          ipsBloqueadas,
          logsRecientes,
        },
        200
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener datos de seguridad';
      return apiResponse(false, message, null, 500);
    }
  }

  // POST /api/auth/security/unblock-ip (Desbloquear IP)
  async unblockIp(req: NextRequest) {
    try {
      const auth = await this.checkAdminAccess();
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      const raw = await parseBody(req);
      const parsed = unblockIpSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Dirección IP inválida', null, 400, parsed.error.flatten());
      }

      const result = await this.service.unblockIp(parsed.data.ip);
      return apiResponse(true, 'Dirección IP desbloqueada exitosamente', result, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al desbloquear IP';
      return apiResponse(false, message, null, 400);
    }
  }

  // DELETE /api/auth/users?id=...
  async deleteUser(req: NextRequest) {
    try {
      const auth = await this.checkAdminAccess();
      if (!auth.authorized) {
        return auth.errorResponse!;
      }

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return apiResponse(false, 'ID de usuario requerido', null, 400);
      }

      await this.service.deleteUser(id, auth.currentUser?.id);
      return apiResponse(true, 'Usuario eliminado correctamente', null, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
      return apiResponse(false, message, null, 400);
    }
  }
}
