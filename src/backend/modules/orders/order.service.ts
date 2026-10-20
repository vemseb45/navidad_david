import { prisma } from '@/backend/config/prisma';
import { CustomerRepository } from '../customers/customer.repository';
import { BoldPaymentProvider } from './bold-payment.provider';
import { TrackingGenerator } from '@/backend/shared/tracking-generator';
import { MetodoEntrega, MetodoPago, EstadoPago } from '@prisma/client';

export class OrderService {
  private readonly customerRepo: CustomerRepository;
  private readonly boldProvider: BoldPaymentProvider;

  constructor(
    customerRepo = new CustomerRepository(),
    boldProvider = new BoldPaymentProvider()
  ) {
    this.customerRepo = customerRepo;
    this.boldProvider = boldProvider;
  }

  public async createGuestOrderAndBoldSession(payload: {
    customer: { fullName: string; email: string; phone: string };
    deliveryMethod: MetodoEntrega;
    shippingAddress?: string;
    shippingCity?: string;
    paymentMethod: MetodoPago;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
  }) {
    // 1. Validar que si elige envío a domicilio exista dirección
    if (payload.deliveryMethod === MetodoEntrega.DOMICILIO && !payload.shippingAddress?.trim()) {
      throw new Error('La dirección de envío es obligatoria para despachos a domicilio.');
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error('El carrito no puede estar vacío.');
    }

    // 2. Resolver cliente único por correo electrónico (Sin duplicar jamás)
    const customer = await this.customerRepo.upsertByEmail(payload.customer);

    const trackingNumber = TrackingGenerator.generateTrackingNumber();
    const boldReference = TrackingGenerator.generateBoldReference(trackingNumber);

    // 3. Calcular totales desde la base de datos (Seguridad contra manipulación en frontend)
    let totalAmount = 0;
    const preparedItems: Array<{
      id_producto: string;
      id_variante?: string;
      nombre_producto: string;
      nombre_variante?: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }> = [];

    for (const item of payload.items) {
      const product = await prisma.producto.findUniqueOrThrow({
        where: { id: item.productId },
        include: { variantes: true },
      });

      const selectedVariant = item.variantId
        ? product.variantes.find((v) => v.id === item.variantId)
        : undefined;

      const unitPrice = selectedVariant ? Number(selectedVariant.precio) : Number(product.precio_base);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      preparedItems.push({
        id_producto: product.id,
        id_variante: selectedVariant?.id,
        nombre_producto: product.nombre,
        nombre_variante: selectedVariant?.etiqueta,
        cantidad: item.quantity,
        precio_unitario: unitPrice,
        subtotal,
      });
    }

    // 4. Crear link de pago oficial con la API de Bold (Al igual que en Barber_Tech_BF)
    const paymentUrl = await this.boldProvider.createPaymentLink(
      boldReference,
      `Compra Navidad David - Guía ${trackingNumber}`,
      totalAmount
    );

    // 5. Crear orden + notificación para el Admin en una sola transacción ACID
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.orden.create({
        data: {
          numero_guia: trackingNumber,
          referencia_bold: boldReference,
          id_cliente: customer.id,
          metodo_entrega: payload.deliveryMethod,
          direccion_envio:
            payload.deliveryMethod === MetodoEntrega.DOMICILIO ? payload.shippingAddress : null,
          ciudad_envio:
            payload.deliveryMethod === MetodoEntrega.DOMICILIO ? payload.shippingCity : null,
          metodo_pago: payload.paymentMethod,
          estado_pago: EstadoPago.PENDIENTE,
          url_pago_bold: paymentUrl,
          monto_total: totalAmount,
          items: {
            create: preparedItems,
          },
        },
        include: { items: true, cliente: true },
      });

      const productSummary = preparedItems
        .map((i) => `${i.cantidad}x ${i.nombre_producto}${i.nombre_variante ? ` (${i.nombre_variante})` : ''}`)
        .join(', ');

      await tx.notificacionAdmin.create({
        data: {
          id_orden: createdOrder.id,
          titulo: `🎄 Nueva compra pendiente: $${totalAmount.toLocaleString('es-CO')} COP`,
          resumen: `Guía: ${trackingNumber} | Cliente: ${customer.nombres_apellidos} (${customer.correo_electronico}) | Productos: ${productSummary} | Entrega: ${
            payload.deliveryMethod === MetodoEntrega.RECOGIDA_TIENDA
              ? 'Recoge en tienda (Ir por el arbolito)'
              : `Envío a domicilio (${payload.shippingCity}: ${payload.shippingAddress})`
          } | Método: ${payload.paymentMethod}`,
        },
      });

      return createdOrder;
    });

    return {
      orderId: order.id,
      trackingNumber: order.numero_guia,
      totalAmount,
      boldPaymentUrl: paymentUrl,
      boldReference,
    };
  }

  public async getOrderByTrackingNumber(trackingNumber: string) {
    return prisma.orden.findUnique({
      where: { numero_guia: trackingNumber },
      include: {
        cliente: true,
        items: true,
      },
    });
  }

  public async processBoldWebhook(payload: {
    type?: string;
    status?: string;
    reference?: string;
    data?: {
      metadata?: { reference?: string };
      payment_id?: string;
      reference?: string;
      status?: string;
    };
    rawBody?: string;
    signature?: string | null;
  }) {
    // 1. Validar firma del webhook si se proporciona
    if (payload.rawBody && payload.signature) {
      const isValid = this.boldProvider.validateBoldSignature(payload.rawBody, payload.signature);
      if (!isValid) {
        throw new Error('Firma criptográfica del Webhook de Bold no válida');
      }
    }

    // 2. Extraer referencia (formato Barber_Tech_BF: payload.data?.metadata?.reference o payload.data?.reference)
    const referencia =
      payload.data?.metadata?.reference ||
      payload.data?.reference ||
      payload.reference;

    if (!referencia) {
      console.warn('⚠️ [Bold Webhook] Webhook recibido sin referencia externa.');
      return null;
    }

    // 3. Buscar la orden asociada
    const orden = await prisma.orden.findFirst({
      where: {
        OR: [{ referencia_bold: referencia }, { numero_guia: referencia }],
      },
      include: { cliente: true, items: true },
    });

    if (!orden) {
      console.warn(`⚠️ [Bold Webhook] Orden no encontrada para referencia: ${referencia}`);
      return null;
    }

    // 4. Idempotencia: Si ya está aprobada, no duplicar procesamiento
    if (orden.estado_pago === EstadoPago.APROBADO) {
      console.log(`ℹ️ [Bold Webhook] Ignorado por idempotencia. Orden ${orden.numero_guia} ya está Aprobada.`);
      return orden;
    }

    // 5. Determinar estado final (SALE_APPROVED, SALE_REJECTED, etc.)
    const tipoEvento = payload.type || payload.data?.status || payload.status;
    const nuevoEstado = this.boldProvider.mapBoldStatus(tipoEvento);
    const paymentId = payload.data?.payment_id || `BOLD-TX-${Date.now()}`;

    return prisma.$transaction(async (tx) => {
      const ordenActualizada = await tx.orden.update({
        where: { id: orden.id },
        data: {
          estado_pago: nuevoEstado,
          id_transaccion_bold: paymentId,
        },
        include: { cliente: true, items: true },
      });

      const statusEmoji = nuevoEstado === EstadoPago.APROBADO ? '✅' : '❌';
      const statusText = nuevoEstado === EstadoPago.APROBADO ? 'PAGO APROBADO' : 'PAGO RECHAZADO';

      await tx.notificacionAdmin.create({
        data: {
          id_orden: orden.id,
          titulo: `${statusEmoji} ${statusText} Bold: $${Number(orden.monto_total).toLocaleString('es-CO')} COP`,
          resumen: `Guía: ${orden.numero_guia} | Cliente: ${orden.cliente.nombres_apellidos} (${orden.cliente.correo_electronico}) | Estado Bold: ${tipoEvento} | Transacción: ${paymentId}`,
        },
      });

      return ordenActualizada;
    });
  }
}
