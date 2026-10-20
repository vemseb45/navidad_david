import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/backend/modules/orders/order.service';

const orderService = new OrderService();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'JSON malformado' }, { status: 400 });
    }

    const signature = req.headers.get('x-bold-signature') || req.headers.get('bold-signature');

    const result = await orderService.processBoldWebhook({
      ...payload,
      rawBody,
      signature,
    });

    if (!result) {
      return NextResponse.json({
        success: true,
        message: 'Evento ignorado o ya procesado (Idempotencia)',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Estado de pago actualizado correctamente desde Webhook Bold',
      order: {
        id: result.id,
        trackingNumber: result.numero_guia,
        status: result.estado_pago,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar webhook de Bold';
    console.error('❌ [Bold Webhook] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    gateway: 'Bold Webhook Listener',
    service: 'Navidad David E-Commerce',
  });
}
