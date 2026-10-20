import { NextRequest, NextResponse } from 'next/server';
import { CatalogService } from '@/backend/modules/catalog/catalog.service';
import { prisma } from '@/backend/config/prisma';

const catalogService = new CatalogService();

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await prisma.producto.findUnique({
      where: { id },
      include: {
        imagenes: { orderBy: { orden: 'asc' } },
        variantes: { orderBy: { precio: 'asc' } },
        subcategoria: true,
        seccion: true,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener producto';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await catalogService.updateProduct(id, {
      name: body.name,
      description: body.description,
      basePrice: body.basePrice !== undefined ? Number(body.basePrice) : undefined,
      compareAtPrice: body.compareAtPrice !== undefined ? (body.compareAtPrice ? Number(body.compareAtPrice) : null) : undefined,
      badgeTop: body.badgeTop !== undefined ? body.badgeTop : undefined,
      badgeBottom: body.badgeBottom !== undefined ? body.badgeBottom : undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error actualizando producto';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, error: 'Archivo de imagen requerido' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const newImage = await catalogService.addProductImage(id, buffer);

    return NextResponse.json({ success: true, data: newImage }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error subiendo imagen al producto';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');

    if (imageId) {
      await catalogService.deleteProductImage(imageId);
      return NextResponse.json({ success: true, message: 'Imagen eliminada correctamente' });
    }

    await catalogService.deleteProduct(id);
    return NextResponse.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
