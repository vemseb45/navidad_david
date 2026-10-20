import { NextRequest } from 'next/server';
import { MediaController } from '@/backend/modules/catalog/media.controller';

const controller = new MediaController();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return controller.serveBinary(req, context);
}
