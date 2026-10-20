import { prisma } from '@/backend/config/prisma';

export class CatalogRepository {
  public async getActiveStoreCatalog() {
    return prisma.seccion.findMany({
      where: { esta_activa: true },
      orderBy: { orden_visualizacion: 'asc' },
      include: {
        subcategorias: {
          orderBy: { nombre: 'asc' },
        },
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

  public async getProductById(id: string) {
    return prisma.producto.findUnique({
      where: { id },
      include: {
        imagenes: { orderBy: { orden: 'asc' } },
        variantes: { orderBy: { precio: 'asc' } },
        subcategoria: true,
        seccion: true,
      },
    });
  }

  public async updateProduct(
    id: string,
    data: {
      nombre?: string;
      descripcion?: string;
      precio_base?: number;
      precio_comparacion?: number | null;
      badge_superior?: string | null;
      badge_inferior?: string | null;
      stock?: number;
      esta_publicado?: boolean;
    }
  ) {
    return prisma.producto.update({
      where: { id },
      data,
      include: {
        imagenes: true,
        variantes: true,
        subcategoria: true,
      },
    });
  }

  public async deleteProduct(id: string) {
    return prisma.producto.delete({
      where: { id },
    });
  }
}
