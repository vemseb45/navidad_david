import { z } from 'zod';
import { MetodoEntrega, MetodoPago } from '@prisma/client';

export const guestCheckoutSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2, 'El nombre completo es requerido').trim(),
    email: z.string().email('Correo electrónico inválido').trim().toLowerCase(),
    phone: z.string().min(7, 'Número de teléfono o WhatsApp inválido').trim(),
  }),
  deliveryMethod: z.nativeEnum(MetodoEntrega).default(MetodoEntrega.DOMICILIO),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  paymentMethod: z.nativeEnum(MetodoPago).default(MetodoPago.PSE),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive('ID de producto inválido'),
        variantId: z.coerce.number().int().positive().optional().nullable(),
        quantity: z.number().int().positive('La cantidad debe ser al menos 1'),
      })
    )
    .min(1, 'El carrito debe contener al menos 1 producto'),
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;
