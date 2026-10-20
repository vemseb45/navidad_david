import { z } from 'zod';
import { TipoLayoutSeccion } from '@prisma/client';

export const createSectionSchema = z.object({
  title: z.string().min(2, 'El título de la sección es obligatorio').trim(),
  subtitle: z.string().optional(),
  badgeText: z.string().optional(),
  iconName: z.string().default('park'),
  accentColor: z.string().default('primary'),
  hasHeightVariants: z.boolean().default(false),
  hasSubcategories: z.boolean().default(false),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(2).optional(),
  basePrice: z.number().positive().optional(),
  compareAtPrice: z.number().positive().nullable().optional(),
  badgeTop: z.string().nullable().optional(),
  badgeBottom: z.string().nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
