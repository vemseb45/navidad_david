import { NextRequest } from 'next/server';
import { apiResponse } from '@/backend/shared/utils/apiResponse';
import { getSessionUser } from '@/backend/shared/get-session-user';
import { CatalogService } from './catalog.service';
import { MediaBinaryService } from './media-binary.service';
import { prisma } from '@/backend/config/prisma';
import { createSectionSchema, updateProductSchema } from './catalog.validator';

async function parseBody(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class CatalogController {
  private service: CatalogService;
  private mediaService: MediaBinaryService;

  constructor() {
    this.service = new CatalogService();
    this.mediaService = new MediaBinaryService();
  }

  // GET /api/catalog
  async getCatalog(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const isAdmin = searchParams.get('admin') === 'true';

      const rawSections = isAdmin
        ? await this.service.getAllSectionsForAdmin()
        : await this.service.getFullStoreCatalog();

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

      return apiResponse(true, 'Catálogo obtenido exitosamente', sections, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener catálogo';
      return apiResponse(false, message, null, 500);
    }
  }

  // POST /api/catalog (Crear Sección o Crear Producto con imágenes FormData)
  async createSection(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return apiResponse(false, 'No autorizado para crear elementos en el catálogo', null, 401);
      }

      const contentType = req.headers.get('content-type') || '';

      // CASO A: Creación de Producto mediante FormData con compresión Sharp WebP
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const sectionId = Number(formData.get('sectionId'));
        const name = formData.get('name') as string;
        const description = (formData.get('description') as string) || '';
        const basePrice = Number(formData.get('basePrice'));
        const compareAtPrice = formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : null;
        const badgeTop = (formData.get('badgeTop') as string) || null;
        const badgeBottom = (formData.get('badgeBottom') as string) || null;
        const stock = Number(formData.get('stock')) || 10;
        const subcategoryName = (formData.get('subcategoryName') as string) || null;
        const sku = `ND-${Date.now().toString().slice(-6)}`;

        if (!sectionId || !name || isNaN(basePrice) || basePrice <= 0) {
          return apiResponse(false, 'Faltan campos obligatorios para el producto (nombre, sección, precio válido)', null, 400);
        }

        // Resolver o crear subcategoría si se especificó
        let subcategoryId: number | null = null;
        if (subcategoryName?.trim()) {
          const subSlug = subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const existingSub = await prisma.subcategoria.findUnique({
            where: { id_seccion_slug: { id_seccion: sectionId, slug: subSlug } },
          });
          if (existingSub) {
            subcategoryId = existingSub.id;
          } else {
            const newSub = await prisma.subcategoria.create({
              data: { id_seccion: sectionId, slug: subSlug, nombre: subcategoryName.trim() },
            });
            subcategoryId = newSub.id;
          }
        }

        // Procesar imágenes
        const imageFiles = formData.getAll('images') as File[];
        const imageCreateData = [];

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const compressed = await this.mediaService.compressAndStoreBinary(buffer, cleanSlug);

            imageCreateData.push({
              ruta_almacenamiento: compressed.storagePath,
              texto_alternativo: `${name} - Imagen ${i + 1}`,
              ancho_px: compressed.widthPx,
              alto_px: compressed.heightPx,
              tamano_bytes: compressed.sizeBytes,
              checksum_sha256: compressed.checksumSha256,
              es_principal: i === 0,
              orden: i + 1,
            });
          }
        }

        const countProducts = await prisma.producto.count({ where: { id_seccion: sectionId } });

        const nuevoProducto = await prisma.producto.create({
          data: {
            id_seccion: sectionId,
            id_subcategoria: subcategoryId,
            sku,
            nombre: name,
            descripcion: description,
            precio_base: basePrice,
            precio_comparacion: compareAtPrice,
            badge_superior: badgeTop,
            badge_inferior: badgeBottom,
            stock,
            orden_visualizacion: countProducts + 1,
            esta_publicado: true,
            imagenes: {
              create: imageCreateData,
            },
          },
          include: {
            imagenes: true,
            variantes: true,
            subcategoria: true,
          },
        });

        return apiResponse(true, 'Producto creado exitosamente con compresión WebP', nuevoProducto, 201);
      }

      // CASO B: Creación de Sección Dinámica mediante JSON
      const raw = await parseBody(req);
      const parsed = createSectionSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Datos de sección inválidos', null, 400, parsed.error.flatten());
      }

      const nuevaSeccion = await this.service.createSmartSection({
        title: parsed.data.title,
        subtitle: parsed.data.subtitle,
        badgeText: parsed.data.badgeText,
        iconName: parsed.data.iconName,
        accentColor: parsed.data.accentColor,
        hasHeightVariants: parsed.data.hasHeightVariants,
        hasSubcategories: parsed.data.hasSubcategories,
      });

      return apiResponse(true, 'Sección creada exitosamente', nuevaSeccion, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear elemento en catálogo';
      return apiResponse(false, message, null, 400);
    }
  }

  // GET /api/products/[id]
  async getProductById(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
      const { id } = await context.params;
      const numId = Number(id);
      if (isNaN(numId)) {
        return apiResponse(false, 'ID de producto inválido', null, 400);
      }

      const product = await prisma.producto.findUnique({
        where: { id: numId },
        include: {
          imagenes: { orderBy: { orden: 'asc' } },
          variantes: { orderBy: { precio: 'asc' } },
          subcategoria: true,
          seccion: true,
        },
      });

      if (!product) {
        return apiResponse(false, 'Producto no encontrado', null, 404);
      }

      return apiResponse(true, 'Producto encontrado', product, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener producto';
      return apiResponse(false, message, null, 500);
    }
  }

  // PATCH /api/products/[id]
  async updateProduct(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return apiResponse(false, 'No autorizado para editar productos', null, 401);
      }

      const { id } = await context.params;
      const numId = Number(id);
      if (isNaN(numId)) {
        return apiResponse(false, 'ID de producto inválido', null, 400);
      }

      const raw = await parseBody(req);
      const parsed = updateProductSchema.safeParse(raw);

      if (!parsed.success) {
        return apiResponse(false, 'Datos de actualización inválidos', null, 400, parsed.error.flatten());
      }

      const updated = await this.service.updateProduct(numId, parsed.data);
      return apiResponse(true, 'Producto actualizado exitosamente', updated, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error actualizando producto';
      return apiResponse(false, message, null, 400);
    }
  }

  // DELETE /api/products/[id]?imageId=...
  async deleteProduct(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return apiResponse(false, 'No autorizado para eliminar productos', null, 401);
      }

      const { id } = await context.params;
      const numId = Number(id);
      if (isNaN(numId)) {
        return apiResponse(false, 'ID de producto inválido', null, 400);
      }

      const { searchParams } = new URL(req.url);
      const imageId = searchParams.get('imageId');

      if (imageId) {
        await this.service.deleteProductImage(Number(imageId));
        return apiResponse(true, 'Imagen de producto eliminada correctamente', null, 200);
      }

      await this.service.deleteProduct(numId);
      return apiResponse(true, 'Producto eliminado correctamente', null, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto o imagen';
      return apiResponse(false, message, null, 400);
    }
  }

  // POST /api/products/[id] (Subida de Imagen Sharp WebP)
  async uploadProductImage(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return apiResponse(false, 'No autorizado para subir imágenes', null, 401);
      }

      const { id } = await context.params;
      const numId = Number(id);
      if (isNaN(numId)) {
        return apiResponse(false, 'ID de producto inválido', null, 400);
      }

      const formData = await req.formData();
      const file = formData.get('image') as File | null;
      const altText = (formData.get('altText') as string) || 'Imagen del producto';

      if (!file) {
        return apiResponse(false, 'No se proporcionó ningún archivo de imagen', null, 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const cleanSlug = file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const compressed = await this.mediaService.compressAndStoreBinary(buffer, cleanSlug);

      const countImages = await prisma.imagenProducto.count({ where: { id_producto: numId } });

      const newImage = await prisma.imagenProducto.create({
        data: {
          id_producto: numId,
          ruta_almacenamiento: compressed.storagePath,
          texto_alternativo: altText,
          ancho_px: compressed.widthPx,
          alto_px: compressed.heightPx,
          tamano_bytes: compressed.sizeBytes,
          checksum_sha256: compressed.checksumSha256,
          es_principal: countImages === 0,
          orden: countImages + 1,
        },
      });

      return apiResponse(true, 'Imagen optimizada a WebP y asociada exitosamente', newImage, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar y subir imagen';
      return apiResponse(false, message, null, 500);
    }
  }
}
