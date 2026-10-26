import crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { createToken, createPreAuthToken, readPreAuthToken, SessionUser } from './security/token.service';
import { send2FAEmail } from './security/email-otp.service';
import { LoginInput, Verify2faInput, CreateUserInput, Toggle2faInput } from './validators/auth.validator';

export class AuthService {
  private repo: AuthRepository;

  constructor() {
    this.repo = new AuthRepository();
  }

  // Hasheo seguro de contraseña con PBKDF2
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Verificación constante contra timing attacks con soporte para texto plano y migración automática
  public static verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash || !password) return false;

    // 1. Si la contraseña en base de datos es texto plano (por cambio manual en DB)
    if (storedHash === password) {
      return true;
    }

    // 2. Si tiene formato con delimitador salt:hash
    if (storedHash.includes(':')) {
      const parts = storedHash.split(':');

      // Formato PBKDF2 estándar (salt:hash)
      if (parts.length === 2) {
        const [salt, key] = parts;
        if (!salt || !key) return false;
        try {
          const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
          if (hash.length === key.length) {
            return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
          }
        } catch {
          return false;
        }
      }

      // Formato scrypt (scrypt:salt:key) como en Barber_Tech_BF
      if (parts.length === 3 && parts[0] === 'scrypt') {
        const [, salt, key] = parts;
        try {
          const derivedKey = crypto.scryptSync(password, salt, 64) as Buffer;
          const storedKey = Buffer.from(key, 'hex');
          if (storedKey.length === derivedKey.length) {
            return crypto.timingSafeEqual(storedKey, derivedKey);
          }
        } catch {
          return false;
        }
      }
    }

    // 3. Fallback final
    return storedHash === password;
  }

  // Generación de código numérico de 6 dígitos para 2FA
  public static generate2FACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Paso 1 de Login: Validar credenciales y enviar OTP por SMTP si requiere 2FA
  public async loginUser(input: LoginInput) {
    const usuario = await this.repo.findByEmail(input.correo);

    if (!usuario || !usuario.esta_activo) {
      throw new Error('Credenciales inválidas o usuario inactivo');
    }

    const esValida = AuthService.verifyPassword(input.contrasena, usuario.contrasena_hash);
    if (!esValida) {
      throw new Error('Credenciales inválidas');
    }

    // Si la contraseña en la base de datos era texto plano (por cambio manual del admin/DBA), la migramos automáticamente a hash seguro
    if (usuario.contrasena_hash === input.contrasena) {
      const nuevoHash = AuthService.hashPassword(input.contrasena);
      await this.repo.updatePasswordHash(usuario.id, nuevoHash);
      console.log(`🔒 [Auto-Hash] Contraseña plana de ${usuario.correo_electronico} actualizada a hash PBKDF2 automáticamente.`);
    }

    const sessionUser: SessionUser = {
      id: usuario.id,
      nombres_apellidos: usuario.nombres_apellidos,
      correo_electronico: usuario.correo_electronico,
      rol: usuario.rol,
    };

    // Si tiene 2FA activado
    if (usuario.activacion_2fa) {
      const codigo2FA = AuthService.generate2FACode();
      const expiracion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
      const preAuthToken = createPreAuthToken(usuario.id);

      await this.repo.set2FACode(usuario.id, codigo2FA, expiracion);
      console.log(`🔐 [2FA NAVIDAD DAVID] Código para ${usuario.correo_electronico}: ${codigo2FA}`);

      // Despacho real mediante SMTP
      await send2FAEmail(usuario.correo_electronico, usuario.nombres_apellidos, codigo2FA);

      return {
        requiere2FA: true,
        usuarioId: usuario.id,
        preAuthToken,
        correo: usuario.correo_electronico,
      };
    }

    // Si no tiene 2FA activado
    await this.repo.updateLastLogin(usuario.id);
    const token = createToken(sessionUser);

    return {
      requiere2FA: false,
      token,
      usuario: sessionUser,
    };
  }

  // Paso 2 de Login: Validar código 2FA
  public async verify2fa(input: Verify2faInput) {
    if (input.preAuthToken) {
      const decoded = readPreAuthToken(input.preAuthToken);
      if (!decoded || decoded.usuarioId !== input.usuarioId) {
        throw new Error('Token previo de 2FA inválido o expirado');
      }
    }

    const usuario = await this.repo.findById(input.usuarioId);
    if (!usuario || !usuario.esta_activo) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    if (!usuario.codigo_2fa_temporal || !usuario.expiracion_codigo_2fa) {
      throw new Error('No hay solicitud de 2FA activa para este usuario');
    }

    if (new Date() > new Date(usuario.expiracion_codigo_2fa)) {
      throw new Error('El código 2FA ha expirado. Por favor inicia sesión nuevamente');
    }

    if (usuario.codigo_2fa_temporal !== input.codigo) {
      throw new Error('Código 2FA incorrecto');
    }

    // Limpiar código temporal y registrar login
    await this.repo.clear2FACode(usuario.id);

    const sessionUser: SessionUser = {
      id: usuario.id,
      nombres_apellidos: usuario.nombres_apellidos,
      correo_electronico: usuario.correo_electronico,
      rol: usuario.rol,
    };

    const token = createToken(sessionUser);

    return {
      token,
      usuario: sessionUser,
    };
  }

  // Listar usuarios para el panel admin
  public async listUsers() {
    return this.repo.listUsers();
  }

  // Crear nuevo usuario en tb_users
  public async createUser(input: CreateUserInput) {
    const existente = await this.repo.findByEmail(input.correo_electronico);
    if (existente) {
      throw new Error('Ya existe un usuario registrado con este correo electrónico');
    }

    const hash = AuthService.hashPassword(input.contrasena);
    return this.repo.createUser({
      nombres_apellidos: input.nombres_apellidos,
      correo_electronico: input.correo_electronico,
      contrasena_hash: hash,
      rol: input.rol,
      activacion_2fa: input.activacion_2fa,
    });
  }

  // Conmutar 2FA individual por usuario
  public async toggle2FA(input: Toggle2faInput) {
    const usuario = await this.repo.findById(input.usuarioId);
    if (!usuario) {
      throw new Error('El usuario especificado no existe en tb_users');
    }
    return this.repo.update2FAStatus(input.usuarioId, input.activo);
  }

  // Eliminar usuario
  public async deleteUser(id: string, currentUserId?: string) {
    if (currentUserId && id === currentUserId) {
      throw new Error('No puedes eliminar tu propio usuario en sesión activa');
    }
    const total = await this.repo.countUsers();
    if (total <= 1) {
      throw new Error('Debe existir al menos un usuario administrador en el sistema');
    }
    return this.repo.deleteUser(id);
  }
}
