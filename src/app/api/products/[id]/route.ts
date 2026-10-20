import { NextRequest } from 'next/server';
import { CatalogController } from '@/backend/modules/catalog/catalog.controller';

const controller = new CatalogController();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.getProductById(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.updateProduct(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.deleteProduct(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return controller.uploadProductImage(req, context);
}
