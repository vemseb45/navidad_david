import { AnalyticsService } from '@/backend/modules/analytics/analytics.service';
import { CustomerRepository } from '@/backend/modules/customers/customer.repository';
import { CatalogService } from '@/backend/modules/catalog/catalog.service';
import { AuthRepository } from '@/backend/modules/auth/auth.repository';
import { DashboardMetrics, AdminCustomerRecord, StoreSection, UserRecord } from '@/types/domain.types';

export function getEmptyAdminMetrics(): DashboardMetrics {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    totalUniqueCustomers: 0,
    bestSellingProduct: null,
    frequentCustomer: null,
    notifications: [],
    treesSold: {
      total: 0,
      tradicionales: 0,
      fibraOptica: 0,
      criticalStockCount: 0,
    },
    ordersConversion: {
      approvedOrders: 0,
      pendingOrders: 0,
      conversionRate: 0,
      whatsappSharePercent: 58,
      webSharePercent: 42,
    },
    pendingDispatch: {
      count: 0,
      todayCount: 0,
    },
    topProducts: [],
    categorySales: [],
    recentOrdersList: [],
  };
}

/**
 * Carga segura de métricas, clientes y catálogo de productos para vistas administrativas
 */
export async function getAdminInitialData(): Promise<{
  metrics: DashboardMetrics;
  customers: AdminCustomerRecord[];
  sections: StoreSection[];
  users: UserRecord[];
}> {
  const analyticsService = new AnalyticsService();
  const customerRepo = new CustomerRepository();
  const catalogService = new CatalogService();
  const authRepo = new AuthRepository();

  const [rawMetrics, rawCustomers, rawSections, rawUsers] = await Promise.all([
    analyticsService.getDashboardMetrics(),
    customerRepo.getAllCustomersWithPurchaseHistory(),
    catalogService.getAllSectionsForAdmin(),
    authRepo.listUsers(),
  ]);

  const customers: AdminCustomerRecord[] = rawCustomers.map((cust) => ({
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

  const sections: StoreSection[] = rawSections.map((sec) => ({
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

  const users: UserRecord[] = rawUsers.map((u) => ({
    id: u.id,
    nombres_apellidos: u.nombres_apellidos,
    correo_electronico: u.correo_electronico,
    rol: u.rol,
    activacion_2fa: u.activacion_2fa,
    ultimo_login: u.ultimo_login ? u.ultimo_login.toISOString() : null,
    esta_activo: u.esta_activo,
    fecha_creacion: u.fecha_creacion.toISOString(),
  }));

  return {
    metrics: rawMetrics,
    customers,
    sections,
    users,
  };
}
