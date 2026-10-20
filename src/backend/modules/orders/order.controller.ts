import { NextRequest } from 'next/server';
import { apiResponse } from '@/backend/shared/utils/apiResponse';
import { OrderService } from './order.service';
import { guestCheckoutSchema } from './order.validator';

async function parseBody(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class OrderController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  // POST /api/checkout/bold
  async checkoutBold(req: NextRequest) {
    try {
      const raw = await parseBody(req);
      const parsed = guestCheckoutSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Datos de checkout inválidos', null, 400, parsed.error.flatten());
      }

      const result = await this.service.createGuestOrderAndBoldSession({
        customer: parsed.data.customer,
        deliveryMethod: parsed.data.deliveryMethod,
        shippingAddress: parsed.data.shippingAddress,
        shippingCity: parsed.data.shippingCity,
        paymentMethod: parsed.data.paymentMethod,
        items: parsed.data.items,
      });

      return apiResponse(true, 'Orden y enlace de pago generados exitosamente', result, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error procesando la compra con Bold';
      return apiResponse(false, message, null, 400);
    }
  }

  // POST /api/webhooks/bold
  async handleBoldWebhook(req: NextRequest) {
    try {
      const rawBody = await req.text();
      let payload;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return apiResponse(false, 'Payload JSON malformado', null, 400);
      }

      const signature = req.headers.get('x-bold-signature') || req.headers.get('bold-signature');

      const result = await this.service.processBoldWebhook({
        ...payload,
        rawBody,
        signature,
      });

      if (!result) {
        return apiResponse(true, 'Evento ignorado o ya procesado (Idempotencia)', null, 200);
      }

      return apiResponse(
        true,
        'Estado de pago actualizado correctamente desde Webhook Bold',
        {
          id: result.id,
          trackingNumber: result.numero_guia,
          status: result.estado_pago,
        },
        200
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar webhook de Bold';
      console.error('❌ [Bold Webhook Controller] Error:', error);
      return apiResponse(false, message, null, 400);
    }
  }

  // GET /api/webhooks/bold
  async statusWebhook(_req: NextRequest) {
    return apiResponse(
      true,
      'Bold Webhook Listener activo',
      {
        status: 'online',
        gateway: 'Bold Webhook Listener',
        service: 'Navidad David E-Commerce',
      },
      200
    );
  }
}
