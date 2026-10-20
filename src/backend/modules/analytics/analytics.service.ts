import { prisma } from '@/backend/config/prisma';

export interface DateFilter {
  fechaInicio?: string;
  fechaFin?: string;
}

export class AnalyticsService {
  public async getDashboardMetrics(filtro?: DateFilter) {
    const whereFecha: { gte?: Date; lte?: Date } = {};

    if (filtro?.fechaInicio) {
      whereFecha.gte = new Date(filtro.fechaInicio);
    }
    if (filtro?.fechaFin) {
      // Ajustar al final del día
      const fin = new Date(filtro.fechaFin);
      fin.setHours(23, 59, 59, 999);
      whereFecha.lte = fin;
    }

    const orderWhere = Object.keys(whereFecha).length > 0 ? { fecha_creacion: whereFecha } : {};

    const [salesAgg, topProductGroup, recentNotifications, totalCustomers, clientOrdersGroup] =
      await Promise.all([
        // 1. Ventas totales y cantidad de órdenes
        prisma.orden.aggregate({
          where: orderWhere,
          _sum: { monto_total: true },
          _count: { id: true },
        }),

        // 2. Producto más vendido
        prisma.itemOrden.groupBy({
          by: ['id_producto', 'nombre_producto'],
          where: Object.keys(whereFecha).length > 0 ? { orden: { fecha_creacion: whereFecha } } : undefined,
          _sum: { cantidad: true, subtotal: true },
          orderBy: { _sum: { cantidad: 'desc' } },
          take: 1,
        }),

        // 3. Notificaciones recientes
        prisma.notificacionAdmin.findMany({
          orderBy: { fecha_creacion: 'desc' },
          take: 15,
          include: { orden: true },
        }),

        // 4. Clientes únicos
        prisma.cliente.count(),

        // 5. Cliente más frecuente (por número de órdenes y monto gastado)
        prisma.orden.groupBy({
          by: ['id_cliente'],
          where: orderWhere,
          _count: { id: true },
          _sum: { monto_total: true },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
        }),
      ]);

    // Resolver datos del cliente más frecuente
    let frequentCustomer = null;
    if (clientOrdersGroup.length > 0 && clientOrdersGroup[0].id_cliente) {
      const clienteData = await prisma.cliente.findUnique({
        where: { id: clientOrdersGroup[0].id_cliente },
        include: {
          ordenes: {
            orderBy: { fecha_creacion: 'desc' },
            take: 1,
          },
        },
      });

      if (clienteData) {
        frequentCustomer = {
          email: clienteData.correo_electronico,
          fullName: clienteData.nombres_apellidos,
          phone: clienteData.telefono,
          totalOrders: clientOrdersGroup[0]._count.id,
          totalSpent: Number(clientOrdersGroup[0]._sum.monto_total ?? 0),
          lastPurchaseDate: clienteData.ordenes[0]?.fecha_creacion?.toISOString() || new Date().toISOString(),
        };
      }
    }

    const bestSeller = topProductGroup[0]
      ? {
          productId: topProductGroup[0].id_producto,
          name: topProductGroup[0].nombre_producto,
          unitsSold: topProductGroup[0]._sum.cantidad ?? 0,
          revenue: Number(topProductGroup[0]._sum.subtotal ?? 0),
        }
      : null;

    return {
      totalRevenue: Number(salesAgg._sum.monto_total ?? 0),
      totalOrders: salesAgg._count.id,
      totalUniqueCustomers: totalCustomers,
      bestSellingProduct: bestSeller,
      frequentCustomer,
      notifications: recentNotifications.map((n) => ({
        id: n.id,
        orderId: n.id_orden,
        title: n.titulo,
        summary: n.resumen,
        isRead: n.esta_leida,
        createdAt: n.fecha_creacion.toISOString(),
      })),
    };
  }
}
