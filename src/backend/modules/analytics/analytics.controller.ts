import { NextRequest } from 'next/server';
import { apiResponse } from '@/backend/shared/utils/apiResponse';
import { getSessionUser } from '@/backend/shared/get-session-user';
import { AnalyticsService } from './analytics.service';
import { CustomerRepository } from '@/backend/modules/customers/customer.repository';
import { dashboardQuerySchema } from './analytics.validator';

export class AnalyticsController {
  private service: AnalyticsService;
  private customerRepo: CustomerRepository;

  constructor() {
    this.service = new AnalyticsService();
    this.customerRepo = new CustomerRepository();
  }

  // GET /api/admin/dashboard
  async getDashboardStats(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return apiResponse(false, 'No autorizado para consultar estadísticas administrativas', null, 401);
      }

      const { searchParams } = new URL(req.url);
      const queryObj = {
        fechaInicio: searchParams.get('fechaInicio') || undefined,
        fechaFin: searchParams.get('fechaFin') || undefined,
      };

      const parsed = dashboardQuerySchema.safeParse(queryObj);
      if (!parsed.success) {
        return apiResponse(false, 'Filtros de fechas inválidos', null, 400, parsed.error.flatten());
      }

      const [metrics, rawCustomers] = await Promise.all([
        this.service.getDashboardMetrics({
          fechaInicio: parsed.data.fechaInicio,
          fechaFin: parsed.data.fechaFin,
        }),
        this.customerRepo.getAllCustomersWithPurchaseHistory(),
      ]);

      const formattedCustomers = rawCustomers.map((cust) => ({
        id: cust.id,
        email: cust.correo_electronico,
        fullName: cust.nombres_apellidos,
        phone: cust.telefono,
        orders: cust.ordenes.map((order) => ({
          id: order.id,
          trackingNumber: order.numero_guia,
          totalAmount: Number(order.monto_total),
          deliveryMethod: order.metodo_entrega,
          paymentStatus: order.estado_pago,
          createdAt: order.fecha_creacion.toISOString(),
          items: order.items.map((item) => ({
            productName: item.nombre_producto,
            variantName: item.nombre_variante ?? undefined,
            quantity: item.cantidad,
            unitPrice: Number(item.precio_unitario),
          })),
        })),
      }));

      return apiResponse(
        true,
        'Estadísticas del dashboard cargadas exitosamente',
        {
          metrics,
          customers: formattedCustomers,
        },
        200
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener datos del dashboard';
      return apiResponse(false, message, null, 500);
    }
  }
}
