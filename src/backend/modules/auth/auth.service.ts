import crypto from 'crypto';
import { prisma } from '@/backend/config/prisma';
import { createToken, createPreAuthToken, readPreAuthToken, SessionUser } from './security/token.service';
import { send2FAEmail } from './security/email-otp.service';

export class AuthService {
  // Hasheo de contraseña con salt seguro usando PBKDF2
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Verificación de contraseña hasheada
  public static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === key;
  }

  // Generación de código numérico de 6 dígitos para 2FA
  public static generate2FACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Paso 1 de Login: Validar correo y contraseña
  public async iniciarLogin(correo: string, contrasena: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo_electronico: correo.trim().toLowerCase() },
    });

    if (!usuario || !usuario.esta_activo) {
      throw new Error('Credenciales inválidas o usuario inactivo');
    }

    const esValida = AuthService.verifyPassword(contrasena, usuario.contrasena_hash);
    if (!esValida) {
      throw new Error('Credenciales inválidas');
    }

    const sessionUser: SessionUser = {
      id: usuario.id,
      nombres_apellidos: usuario.nombres_apellidos,
      correo_electronico: usuario.correo_electronico,
      rol: usuario.rol,
    };

    // Si tiene 2FA activado, generamos código temporal y preAuthToken JWT de 5 minutos
    if (usuario.activacion_2fa) {
      const codigo2FA = AuthService.generate2FACode();
      const expiracion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
      const preAuthToken = createPreAuthToken(usuario.id);

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          codigo_2fa_temporal: codigo2FA,
          expiracion_codigo_2fa: expiracion,
        },
      });

      console.log(`🔐 [2FA NAVIDAD DAVID] Código para ${usuario.correo_electronico}: ${codigo2FA}`);

      // Envío real del código por correo mediante SMTP
      await send2FAEmail(usuario.correo_electronico, usuario.nombres_apellidos, codigo2FA);

      return {
        requiere2FA: true,
        usuarioId: usuario.id,
        preAuthToken,
        correo: usuario.correo_electronico,
        codigoDemo: process.env.NODE_ENV !== 'production' ? codigo2FA : undefined,
      };
    }

    // Si no tiene 2FA, emite sesión JWT directamente
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimo_login: new Date() },
    });

    const token = createToken(sessionUser);

    return {
      requiere2FA: false,
      token,
      usuario: sessionUser,
    };
  }

  // Paso 2 de Login: Validar código 2FA
  public async verificar2FA(usuarioId: string, codigo: string, preAuthToken?: string) {
    // Si viene preAuthToken, podemos verificar su validez adicional
    if (preAuthToken) {
      const decoded = readPreAuthToken(preAuthToken);
      if (!decoded || decoded.userId !== usuarioId) {
        throw new Error('Token de pre-autenticación 2FA inválido o expirado');
      }
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario || !usuario.esta_activo) {
      throw new Error('Usuario no encontrado');
    }

    if (!usuario.codigo_2fa_temporal || !usuario.expiracion_codigo_2fa) {
      throw new Error('No hay solicitud de 2FA pendiente o ha expirado');
    }

    if (new Date() > usuario.expiracion_codigo_2fa) {
      throw new Error('El código 2FA ha expirado. Solicita uno nuevo.');
    }

    if (usuario.codigo_2fa_temporal.trim() !== codigo.trim()) {
      throw new Error('Código de verificación 2FA incorrecto');
    }

    // Limpiar código temporal y actualizar último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        codigo_2fa_temporal: null,
        expiracion_codigo_2fa: null,
        ultimo_login: new Date(),
      },
    });

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

  // Gestión de Usuarios en tb_users por el Administrador
  public async listarUsuarios() {
    return prisma.usuario.findMany({
      orderBy: { fecha_creacion: 'desc' },
      select: {
        id: true,
        nombres_apellidos: true,
        correo_electronico: true,
        rol: true,
        activacion_2fa: true,
        ultimo_login: true,
        esta_activo: true,
        fecha_creacion: true,
        fecha_actualizacion: true,
      },
    });
  }

  public async crearUsuario(data: {
    nombres_apellidos: string;
    correo_electronico: string;
    contrasena: string;
    rol?: string;
    activacion_2fa?: boolean;
  }) {
    const correoNormalizado = data.correo_electronico.trim().toLowerCase();
    const existe = await prisma.usuario.findUnique({
      where: { correo_electronico: correoNormalizado },
    });

    if (existe) {
      throw new Error('Ya existe un usuario registrado con este correo electrónico');
    }

    const contrasenaHash = AuthService.hashPassword(data.contrasena);

    return prisma.usuario.create({
      data: {
        nombres_apellidos: data.nombres_apellidos.trim(),
        correo_electronico: correoNormalizado,
        contrasena_hash: contrasenaHash,
        rol: data.rol || 'ADMIN',
        activacion_2fa: data.activacion_2fa !== undefined ? data.activacion_2fa : true,
      },
      select: {
        id: true,
        nombres_apellidos: true,
        correo_electronico: true,
        rol: true,
        activacion_2fa: true,
        fecha_creacion: true,
      },
    });
  }

  public async alternar2FA(usuarioId: string, activacion_2fa: boolean) {
    return prisma.usuario.update({
      where: { id: usuarioId },
      data: { activacion_2fa },
      select: {
        id: true,
        activacion_2fa: true,
      },
    });
  }

  public async eliminarUsuario(usuarioId: string) {
    return prisma.usuario.delete({
      where: { id: usuarioId },
    });
  }
}
