import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/backend/modules/orders/order.service';

const orderService = new OrderService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await orderService.createGuestOrderAndBoldSession(body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando la compra';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
