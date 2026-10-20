import { NextRequest } from 'next/server';
import { OrderController } from '@/backend/modules/orders/order.controller';

const controller = new OrderController();

export async function POST(req: NextRequest) {
  return controller.checkoutBold(req);
}
