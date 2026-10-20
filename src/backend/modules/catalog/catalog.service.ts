import { prisma } from '@/backend/config/prisma';
import { MediaBinaryService } from './media-binary.service';
import { TipoLayoutSeccion } from '@prisma/client';

export class CatalogService {
  constructor(private readonly mediaService = new MediaBinaryService()) {}

  public async getFullStoreCatalog() {
    return prisma.seccion.findMany({
      where: { esta_activa: true },
      orderBy: { orden_visualizacion: 'asc' },
      include: {
        subcategorias: true,
        productos: {
          where: { esta_publicado: true },
          orderBy: { orden_visualizacion: 'asc' },
          include: {
            imagenes: { orderBy: { orden: 'asc' } },
            variantes: { orderBy: { precio: 'asc' } },
            subcategoria: true,
          },
        },
      },
    });
  }

  public async getAllSectionsForAdmin() {
    return prisma.seccion.findMany({
      orderBy: { orden_visualizacion: 'asc' },
      include: {
        subcategorias: true,
        productos: {
          orderBy: { orden_visualizacion: 'asc' },
          include: {
            imagenes: { orderBy: { orden: 'asc' } },
            variantes: { orderBy: { precio: 'asc' } },
            subcategoria: true,
          },
        },
      },
    });
  }

  // Crea una nueva sección calculando automáticamente su posición e ícono sugerido
  public async createSmartSection(input: {
    title: string;
    subtitle?: string;
    badgeText?: string;
    iconName?: string;
    accentColor?: string;
    hasHeightVariants?: boolean;
    hasSubcategories?: boolean;
  }) {
    const slug = input.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const maxOrderAgg = await prisma.seccion.aggregate({ _max: { orden_visualizacion: true } });
    const nextOrder = (maxOrderAgg._max.orden_visualizacion ?? 0) + 1;

    // Inferencia inteligente del layout de la sección
    let layoutType: TipoLayoutSeccion = TipoLayoutSeccion.GRILLA_ESTANDAR;
    if (input.hasHeightVariants) layoutType = TipoLayoutSeccion.TARJETAS_CON_VARIANTES;
    else if (input.hasSubcategories) layoutType = TipoLayoutSeccion.CHIPS_FILTRABLES;

    return prisma.seccion.create({
      data: {
        slug,
        titulo: input.title,
        subtitulo: input.subtitle,
        texto_badge: input.badgeText ?? 'Nueva Colección',
        nombre_icono: input.iconName ?? 'redeem',
        color_acento: input.accentColor ?? 'primary',
        tipo_layout: layoutType,
        orden_visualizacion: nextOrder,
      },
    });
  }

  // Agrega un producto a una sección existente y reconfigura la sección si el producto trae variantes
  public async createProductInSection(input: {
    sectionId: string;
    subcategoryName?: string;
    name: string;
    description: string;
    basePrice: number;
    compareAtPrice?: number;
    badgeTop?: string;
    badgeBottom?: string;
    variants?: Array<{ label: string; price: number }>;
    imageBuffers: Buffer[];
  }) {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sku = `ND-${Date.now().toString().slice(-6)}`;

    // 1. Comprimir todas las imágenes a binarios WebP fuera del repo
    const processedImages = await Promise.all(
      input.imageBuffers.map((buf) => this.mediaService.compressAndStoreBinary(buf, slug))
    );

    return prisma.$transaction(async (tx) => {
      // 2. Si incluye subcategoría nueva o existente, resolverla automáticamente
      let subcategoryId: string | undefined;
      if (input.subcategoryName) {
        const subSlug = input.subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sub = await tx.subcategoria.upsert({
          where: { id_seccion_slug: { id_seccion: input.sectionId, slug: subSlug } },
          update: {},
          create: { id_seccion: input.sectionId, slug: subSlug, nombre: input.subcategoryName },
        });
        subcategoryId = sub.id;

        // Actualizar sección a CHIPS_FILTRABLES si tiene subcategorías
        await tx.seccion.update({
          where: { id: input.sectionId },
          data: { tipo_layout: TipoLayoutSeccion.CHIPS_FILTRABLES },
        });
      }

      // 3. Si el producto tiene variantes (ej. alturas), asegurar que la sección soporte TARJETAS_CON_VARIANTES
      if (input.variants && input.variants.length > 0) {
        await tx.seccion.update({
          where: { id: input.sectionId },
          data: { tipo_layout: TipoLayoutSeccion.TARJETAS_CON_VARIANTES },
        });
      }

      const maxProdOrder = await tx.producto.aggregate({
        where: { id_seccion: input.sectionId },
        _max: { orden_visualizacion: true },
      });

      // 4. Crear producto con rutas de binarios e información normalizada
      return tx.producto.create({
        data: {
          id_seccion: input.sectionId,
          id_subcategoria: subcategoryId,
          sku,
          nombre: input.name,
          descripcion: input.description,
          precio_base: input.basePrice,
          precio_comparacion: input.compareAtPrice,
          badge_superior: input.badgeTop,
          badge_inferior: input.badgeBottom,
          orden_visualizacion: (maxProdOrder._max.orden_visualizacion ?? 0) + 1,
          imagenes: {
            create: processedImages.map((img, idx) => ({
              ruta_almacenamiento: img.storagePath,
              texto_alternativo: `${input.name} - Vista ${idx + 1}`,
              ancho_px: img.widthPx,
              alto_px: img.heightPx,
              tamano_bytes: img.sizeBytes,
              checksum_sha256: img.checksumSha256,
              es_principal: idx === 0,
              orden: idx,
            })),
          },
          variantes: input.variants?.length
            ? {
                create: input.variants.map((v, idx) => ({
                  etiqueta: v.label,
                  precio: v.price,
                  es_predeterminada: idx === 0,
                })),
              }
            : undefined,
        },
        include: { imagenes: true, variantes: true, subcategoria: true },
      });
    });
  }

  public async updateProduct(
    productId: string,
    data: {
      name?: string;
      description?: string;
      basePrice?: number;
      compareAtPrice?: number | null;
      badgeTop?: string | null;
      badgeBottom?: string | null;
      stock?: number;
      isPublished?: boolean;
    }
  ) {
    return prisma.producto.update({
      where: { id: productId },
      data: {
        nombre: data.name,
        descripcion: data.description,
        precio_base: data.basePrice,
        precio_comparacion: data.compareAtPrice,
        badge_superior: data.badgeTop,
        badge_inferior: data.badgeBottom,
        stock: data.stock,
        esta_publicado: data.isPublished,
      },
      include: {
        imagenes: true,
        variantes: true,
        subcategoria: true,
      },
    });
  }

  public async addProductImage(productId: string, fileBuffer: Buffer) {
    const product = await prisma.producto.findUniqueOrThrow({ where: { id: productId } });
    const slug = product.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const processed = await this.mediaService.compressAndStoreBinary(fileBuffer, slug);

    const maxSort = await prisma.imagenProducto.aggregate({
      where: { id_producto: productId },
      _max: { orden: true },
    });

    return prisma.imagenProducto.create({
      data: {
        id_producto: productId,
        ruta_almacenamiento: processed.storagePath,
        texto_alternativo: `${product.nombre} - Nueva imagen`,
        ancho_px: processed.widthPx,
        alto_px: processed.heightPx,
        tamano_bytes: processed.sizeBytes,
        checksum_sha256: processed.checksumSha256,
        orden: (maxSort._max.orden ?? 0) + 1,
      },
    });
  }

  public async deleteProductImage(imageId: string) {
    const img = await prisma.imagenProducto.findUniqueOrThrow({ where: { id: imageId } });
    await this.mediaService.deleteBinaryFromDisk(img.ruta_almacenamiento);
    return prisma.imagenProducto.delete({ where: { id: imageId } });
  }

  public async deleteProduct(productId: string) {
    const product = await prisma.producto.findUnique({
      where: { id: productId },
      include: { imagenes: true },
    });

    if (!product) return null;

    for (const img of product.imagenes) {
      await this.mediaService.deleteBinaryFromDisk(img.ruta_almacenamiento);
    }

    return prisma.producto.delete({
      where: { id: productId },
    });
  }
}
