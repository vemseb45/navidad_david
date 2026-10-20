import { NextRequest } from 'next/server';
import { OrderController } from '@/backend/modules/orders/order.controller';

const controller = new OrderController();

export async function POST(req: NextRequest) {
  return controller.handleBoldWebhook(req);
}

export async function GET(req: NextRequest) {
  return controller.statusWebhook(req);
}
