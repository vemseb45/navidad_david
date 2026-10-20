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
  id: string;
  label: string;
  price: number;
  stock?: number;
  isDefault: boolean;
}

export interface StoreProductImage {
  id: string;
  storagePath: string;
  altText: string;
  widthPx?: number;
  heightPx?: number;
  isPrimary?: boolean;
}

export interface StoreProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  badgeTop?: string | null;
  badgeBottom?: string | null;
  stock: number;
  isPublished: boolean;
  sectionId: string;
  subcategoryId?: string | null;
  subcategorySlug?: string;
  subcategoryName?: string;
  images: StoreProductImage[];
  variants: StoreVariant[];
}

export interface StoreSection {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  iconName: string;
  accentColor?: string;
  layoutType: TipoLayoutSeccion;
  displayOrder: number;
  subcategories: Array<{ id: string; slug: string; name: string }>;
  products: StoreProduct[];
}

export interface CartItem {
  productId: string;
  variantId?: string;
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
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

export interface UserRecord {
  id: string;
  nombres_apellidos: string;
  correo_electronico: string;
  rol: string;
  activacion_2fa: boolean;
  ultimo_login?: string | null;
  esta_activo: boolean;
  fecha_creacion: string;
}

export interface AdminCustomerRecord {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  orders: Array<{
    id: string;
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

export interface FrequentCustomer {
  email: string;
  fullName: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUniqueCustomers: number;
  bestSellingProduct: {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  } | null;
  frequentCustomer: FrequentCustomer | null;
  notifications: Array<{
    id: string;
    orderId: string;
    title: string;
    summary: string;
    isRead: boolean;
    createdAt: string;
  }>;
}
