import { NextRequest } from 'next/server';
import { AuthController } from '@/backend/modules/auth/auth.controller';

const controller = new AuthController();

export async function POST(req: NextRequest) {
  return controller.verify2fa(req);
}
