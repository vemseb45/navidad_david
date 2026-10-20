import { prisma } from '@/backend/config/prisma';

export class AuthRepository {
  async findByEmail(correo: string) {
    return prisma.usuario.findUnique({
      where: { correo_electronico: correo },
    });
  }

  async findById(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
    });
  }

  async updateLastLogin(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: { ultimo_login: new Date() },
    });
  }

  async updatePasswordHash(id: string, contrasena_hash: string) {
    return prisma.usuario.update({
      where: { id },
      data: { contrasena_hash },
    });
  }

  async set2FACode(id: string, codigo: string, expiracion: Date) {
    return prisma.usuario.update({
      where: { id },
      data: {
        codigo_2fa_temporal: codigo,
        expiracion_codigo_2fa: expiracion,
      },
    });
  }

  async clear2FACode(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: {
        codigo_2fa_temporal: null,
        expiracion_codigo_2fa: null,
        ultimo_login: new Date(),
      },
    });
  }

  async listUsers() {
    return prisma.usuario.findMany({
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
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async createUser(data: {
    nombres_apellidos: string;
    correo_electronico: string;
    contrasena_hash: string;
    rol: string;
    activacion_2fa: boolean;
  }) {
    return prisma.usuario.create({
      data: {
        ...data,
        esta_activo: true,
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

  async update2FAStatus(id: string, activacion_2fa: boolean) {
    return prisma.usuario.update({
      where: { id },
      data: { activacion_2fa },
      select: {
        id: true,
        nombres_apellidos: true,
        correo_electronico: true,
        activacion_2fa: true,
      },
    });
  }

  async deleteUser(id: string) {
    return prisma.usuario.delete({
      where: { id },
    });
  }

  async countUsers() {
    return prisma.usuario.count();
  }
}
