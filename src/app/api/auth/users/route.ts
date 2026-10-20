import { NextRequest } from 'next/server';
import { AuthController } from '@/backend/modules/auth/auth.controller';

const controller = new AuthController();

export async function GET(req: NextRequest) {
  return controller.getUsers(req);
}

export async function POST(req: NextRequest) {
  return controller.createUser(req);
}

export async function PATCH(req: NextRequest) {
  return controller.updateUser(req);
}

export async function DELETE(req: NextRequest) {
  return controller.deleteUser(req);
}
