import {
  Usuario as PrismaUsuario,
  Seccion as PrismaSeccion,
  Subcategoria as PrismaSubcategoria,
  Producto as PrismaProducto,
  ImagenProducto as PrismaImagenProducto,
  VarianteProducto as PrismaVarianteProducto,
  Cliente as PrismaCliente,
  Orden as PrismaOrden,
  ItemOrden as PrismaItemOrden,
  NotificacionAdmin as PrismaNotificacionAdmin,
  MetodoEntrega,
  MetodoPago,
  EstadoPago,
  TipoLayoutSeccion,
} from '@prisma/client';

export type {
  MetodoEntrega,
  MetodoPago,
  EstadoPago,
  TipoLayoutSeccion,
  PrismaUsuario,
  PrismaSeccion,
  PrismaSubcategoria,
  PrismaProducto,
  PrismaImagenProducto,
  PrismaVarianteProducto,
  PrismaCliente,
  PrismaOrden,
  PrismaItemOrden,
  PrismaNotificacionAdmin,
};

export interface ProcessedBinaryImage {
  storagePath: string;
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
  checksumSha256: string;
}

export interface StoreVariant {
  id: number;
  label: string;
  price: number;
  stock?: number;
  isDefault: boolean;
}

export interface StoreProductImage {
  id: number;
  storagePath: string;
  altText: string;
  widthPx?: number;
  heightPx?: number;
  isPrimary?: boolean;
}

export interface StoreProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  badgeTop?: string | null;
  badgeBottom?: string | null;
  stock: number;
  isPublished: boolean;
  sectionId: number;
  subcategoryId?: number | null;
  subcategorySlug?: string;
  subcategoryName?: string;
  images: StoreProductImage[];
  variants: StoreVariant[];
}

export interface StoreSection {
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  iconName: string;
  accentColor?: string;
  layoutType: TipoLayoutSeccion;
  displayOrder: number;
  subcategories: Array<{ id: number; slug: string; name: string }>;
  products: StoreProduct[];
}

export interface CartItem {
  productId: number;
  variantId?: number;
  name: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

export interface CreateOrderPayload {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  deliveryMethod: MetodoEntrega;
  shippingAddress?: string;
  shippingCity?: string;
  paymentMethod: MetodoPago;
  items: Array<{
    productId: number;
    variantId?: number | null;
    quantity: number;
  }>;
}

export interface UserRecord {
  id: string; // Mantiene UUID para los usuarios de tb_users
  nombres_apellidos: string;
  correo_electronico: string;
  rol: string;
  activacion_2fa: boolean;
  ultimo_login?: string | null;
  esta_activo: boolean;
  fecha_creacion: string;
}

export interface AdminCustomerRecord {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  orders: Array<{
    id: number;
    trackingNumber: string;
    totalAmount: number;
    deliveryMethod: string;
    paymentStatus: string;
    createdAt: string;
    items: Array<{
      productName: string;
      variantName?: string;
      quantity: number;
      unitPrice: number;
    }>;
  }>;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUniqueCustomers: number;
  bestSellingProduct: {
    productId: number;
    name: string;
    unitsSold: number;
    revenue: number;
  } | null;
  frequentCustomer: {
    email: string;
    fullName: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastPurchaseDate: string;
  } | null;
  notifications: Array<{
    id: number;
    orderId: number;
    title: string;
    summary: string;
    isRead: boolean;
    createdAt: string;
  }>;
  treesSold: {
    total: number;
    tradicionales: number;
    fibraOptica: number;
    criticalStockCount: number;
  };
  ordersConversion: {
    approvedOrders: number;
    pendingOrders: number;
    conversionRate: number;
    whatsappSharePercent: number;
    webSharePercent: number;
  };
  pendingDispatch: {
    count: number;
    todayCount: number;
  };
  topProducts: Array<{
    ranking: number;
    id: number;
    name: string;
    unitsSold: number;
    revenue: number;
    percentage: number;
    badge: string;
  }>;
  categorySales: Array<{
    name: string;
    slug: string;
    revenue: number;
    percentage: number;
    color: string;
  }>;
  recentOrdersList: Array<{
    id: number;
    trackingNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    paymentStatus: string;
    deliveryMethod: string;
    city: string;
    createdAt: string;
    itemsSummary: string;
    itemCount: number;
  }>;
}
