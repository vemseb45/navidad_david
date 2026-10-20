import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/backend/modules/analytics/analytics.service';
import { CustomerRepository } from '@/backend/modules/customers/customer.repository';

const analyticsService = new AnalyticsService();
const customerRepo = new CustomerRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fechaInicio = searchParams.get('fechaInicio') || undefined;
    const fechaFin = searchParams.get('fechaFin') || undefined;

    const [metrics, rawCustomers] = await Promise.all([
      analyticsService.getDashboardMetrics({ fechaInicio, fechaFin }),
      customerRepo.getAllCustomersWithPurchaseHistory(),
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

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        customers: formattedCustomers,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener datos del dashboard';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
