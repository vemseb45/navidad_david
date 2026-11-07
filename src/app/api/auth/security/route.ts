import { NextRequest } from 'next/server';
import { AuthController } from '@/backend/modules/auth/auth.controller';

const controller = new AuthController();

export async function GET(req: NextRequest) {
  return controller.getSecurityOverview(req);
}

export async function POST(req: NextRequest) {
  return controller.unblockIp(req);
}
