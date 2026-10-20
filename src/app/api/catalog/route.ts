import { NextRequest, NextResponse } from 'next/server';
import { CatalogService } from '@/backend/modules/catalog/catalog.service';

const catalogService = new CatalogService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const rawSections = isAdmin
      ? await catalogService.getAllSectionsForAdmin()
      : await catalogService.getFullStoreCatalog();

    const sections = rawSections.map((sec) => ({
      id: sec.id,
      slug: sec.slug,
      title: sec.titulo,
      subtitle: sec.subtitulo,
      badgeText: sec.texto_badge,
      iconName: sec.nombre_icono,
      accentColor: sec.color_acento,
      layoutType: sec.tipo_layout,
      displayOrder: sec.orden_visualizacion,
      subcategories: sec.subcategorias.map((sub) => ({
        id: sub.id,
        slug: sub.slug,
        name: sub.nombre,
      })),
      products: sec.productos.map((prod) => ({
        id: prod.id,
        sku: prod.sku,
        name: prod.nombre,
        description: prod.descripcion,
        basePrice: Number(prod.precio_base),
        compareAtPrice: prod.precio_comparacion ? Number(prod.precio_comparacion) : null,
        badgeTop: prod.badge_superior,
        badgeBottom: prod.badge_inferior,
        stock: prod.stock,
        isPublished: prod.esta_publicado,
        sectionId: prod.id_seccion,
        subcategoryId: prod.id_subcategoria,
        subcategorySlug: prod.subcategoria?.slug,
        subcategoryName: prod.subcategoria?.nombre,
        images: prod.imagenes.map((img) => ({
          id: img.id,
          storagePath: img.ruta_almacenamiento,
          altText: img.texto_alternativo,
          widthPx: img.ancho_px,
          heightPx: img.alto_px,
          isPrimary: img.es_principal,
        })),
        variants: prod.variantes.map((v) => ({
          id: v.id,
          label: v.etiqueta,
          price: Number(v.precio),
          stock: v.stock,
          isDefault: v.es_predeterminada,
        })),
      })),
    }));

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error obteniendo catálogo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Manejar FormData para creación de producto con imágenes binarias
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const sectionId = formData.get('sectionId') as string;
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const basePrice = Number(formData.get('basePrice'));
      const compareAtPrice = formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : undefined;
      const badgeTop = (formData.get('badgeTop') as string) || undefined;
      const badgeBottom = (formData.get('badgeBottom') as string) || undefined;
      const subcategoryName = (formData.get('subcategoryName') as string) || undefined;
      const variantsRaw = formData.get('variants') as string;

      let variants: Array<{ label: string; price: number }> | undefined;
      if (variantsRaw) {
        try {
          variants = JSON.parse(variantsRaw);
        } catch {
          // Ignorar si no es JSON válido
        }
      }

      const files = formData.getAll('images') as File[];
      const imageBuffers: Buffer[] = [];
      for (const file of files) {
        if (file && typeof file.arrayBuffer === 'function') {
          const arrayBuf = await file.arrayBuffer();
          imageBuffers.push(Buffer.from(arrayBuf));
        }
      }

      const product = await catalogService.createProductInSection({
        sectionId,
        subcategoryName,
        name,
        description,
        basePrice,
        compareAtPrice,
        badgeTop,
        badgeBottom,
        variants,
        imageBuffers,
      });

      return NextResponse.json({ success: true, data: product }, { status: 201 });
    }

    // Manejar JSON para creación inteligente de sección
    const body = await req.json();
    if (body.type === 'section' || body.title) {
      const section = await catalogService.createSmartSection({
        title: body.title,
        subtitle: body.subtitle,
        badgeText: body.badgeText,
        iconName: body.iconName,
        accentColor: body.accentColor,
        hasHeightVariants: body.hasHeightVariants,
        hasSubcategories: body.hasSubcategories,
      });
      return NextResponse.json({ success: true, data: section }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Solicitud no reconocida' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error creando recurso en el catálogo';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
