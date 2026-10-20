import { NextRequest } from 'next/server';
import { CatalogController } from '@/backend/modules/catalog/catalog.controller';

const controller = new CatalogController();

export async function GET(req: NextRequest) {
  return controller.getCatalog(req);
}

export async function POST(req: NextRequest) {
  return controller.createSection(req);
}
