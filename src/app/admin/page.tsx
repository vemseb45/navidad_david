import { AnalyticsService } from '@/backend/modules/analytics/analytics.service';
import { CustomerRepository } from '@/backend/modules/customers/customer.repository';
import { CatalogService } from '@/backend/modules/catalog/catalog.service';
import { AdminDashboardView } from '@/frontend/modules/admin/AdminDashboardView';
import { DashboardMetrics, AdminCustomerRecord, StoreSection } from '@/types/domain.types';

export const instant = false;

const analyticsService = new AnalyticsService();
const customerRepo = new CustomerRepository();
const catalogService = new CatalogService();

export default async function AdminPage() {
  let metrics: DashboardMetrics = {
    totalRevenue: 0,
    totalOrders: 0,
    totalUniqueCustomers: 0,
    bestSellingProduct: null,
    frequentCustomer: null,
    notifications: [],
  };

  let customers: AdminCustomerRecord[] = [];
  let sections: StoreSection[] = [];

  try {
    const [rawMetrics, rawCustomers, rawSections] = await Promise.all([
      analyticsService.getDashboardMetrics(),
      customerRepo.getAllCustomersWithPurchaseHistory(),
      catalogService.getAllSectionsForAdmin(),
    ]);

    metrics = rawMetrics;

    customers = rawCustomers.map((cust) => ({
      id: cust.id,
      email: cust.correo_electronico,
      fullName: cust.nombres_apellidos,
      phone: cust.telefono,
      orders: cust.ordenes.map((order) => ({
        id: order.id,
        trackingNumber: order.numero_guia,
        totalAmount: Number(order.monto_total),
        deliveryMethod: order.metodo_entrega,
        paymentStatus: order.estado_pago,
        createdAt: order.fecha_creacion.toISOString(),
        items: order.items.map((item) => ({
          productName: item.nombre_producto,
          variantName: item.nombre_variante ?? undefined,
          quantity: item.cantidad,
          unitPrice: Number(item.precio_unitario),
        })),
      })),
    }));

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
    console.error('Error cargando métricas de administración:', error);
  }

  return (
    <AdminDashboardView
      initialMetrics={metrics}
      initialCustomers={customers}
      initialSections={sections}
    />
  );
}
