import { CatalogService } from '@/backend/modules/catalog/catalog.service';
import { StorefrontView } from '@/frontend/modules/store/StorefrontView';
import { StoreSection } from '@/types/domain.types';

export const instant = false;

const catalogService = new CatalogService();

export default async function HomePage() {
  let sections: StoreSection[] = [];

  try {
    const rawSections = await catalogService.getFullStoreCatalog();

    sections = rawSections.map((sec) => ({
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
  } catch (error) {
    console.error('Error cargando catálogo en servidor:', error);
  }

  return <StorefrontView initialSections={sections} />;
}
