import { prisma } from '@/backend/config/prisma';
import { EstadoPago } from '@prisma/client';

export class OrderRepository {
  public async findByTrackingNumber(numeroGuia: string) {
    return prisma.orden.findUnique({
      where: { numero_guia: numeroGuia },
      include: {
        cliente: true,
        items: {
          include: {
            producto: {
              include: { imagenes: true },
            },
            variante: true,
          },
        },
        notificacion: true,
      },
    });
  }

  public async findByBoldReference(referenciaBold: string) {
    return prisma.orden.findUnique({
      where: { referencia_bold: referenciaBold },
      include: {
        cliente: true,
        items: true,
        notificacion: true,
      },
    });
  }

  public async updatePaymentStatus(
    orderId: number,
    estado: EstadoPago,
    idTransaccionBold?: string
  ) {
    return prisma.orden.update({
      where: { id: orderId },
      data: {
        estado_pago: estado,
        id_transaccion_bold: idTransaccionBold ?? undefined,
      },
      include: {
        cliente: true,
        items: true,
      },
    });
  }

  public async getRecentOrders(take = 20) {
    return prisma.orden.findMany({
      orderBy: { fecha_creacion: 'desc' },
      take,
      include: {
        cliente: true,
        items: true,
      },
    });
  }
}
