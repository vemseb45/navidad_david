import { prisma } from '@/backend/config/prisma';

export class CustomerRepository {
  public async upsertByEmail(data: { email: string; fullName: string; phone: string }) {
    const normalizedEmail = data.email.trim().toLowerCase();
    return prisma.cliente.upsert({
      where: { correo_electronico: normalizedEmail },
      update: {
        nombres_apellidos: data.fullName.trim(),
        telefono: data.phone.trim(),
      },
      create: {
        correo_electronico: normalizedEmail,
        nombres_apellidos: data.fullName.trim(),
        telefono: data.phone.trim(),
      },
    });
  }

  public async getByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return prisma.cliente.findUnique({
      where: { correo_electronico: normalizedEmail },
      include: {
        ordenes: {
          orderBy: { fecha_creacion: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });
  }

  public async getAllCustomersWithPurchaseHistory() {
    return prisma.cliente.findMany({
      orderBy: { fecha_actualizacion: 'desc' },
      include: {
        ordenes: {
          orderBy: { fecha_creacion: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });
  }
}
