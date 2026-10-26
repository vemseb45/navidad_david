import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().email('El correo electrónico no es válido').trim().toLowerCase(),
  contrasena: z.string().min(1, 'La contraseña es obligatoria').trim(),
});

export const verify2faSchema = z.object({
  usuarioId: z.string().uuid('ID de usuario inválido'),
  codigo: z.string().regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos'),
  preAuthToken: z.string().optional(),
});

export const createUserSchema = z.object({
  nombres_apellidos: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres').trim(),
  correo_electronico: z.string().email('Correo electrónico inválido').trim().toLowerCase(),
  contrasena: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres'),
  rol: z.enum(['ADMIN', 'OPERADOR', 'SUPERADMIN']).default('ADMIN'),
  activacion_2fa: z.boolean().default(true),
});

export const toggle2faSchema = z
  .object({
    usuarioId: z.string().uuid('ID de usuario inválido').optional(),
    id: z.string().uuid('ID de usuario inválido').optional(),
    activo: z.boolean().optional(),
    activacion_2fa: z.boolean().optional(),
  })
  .refine((data) => data.usuarioId || data.id, {
    message: 'Debe especificar el ID del usuario',
  })
  .transform((data) => ({
    usuarioId: (data.usuarioId || data.id) as string,
    activo: (data.activo !== undefined ? data.activo : data.activacion_2fa) ?? true,
  }));

export type LoginInput = z.infer<typeof loginSchema>;
export type Verify2faInput = z.infer<typeof verify2faSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type Toggle2faInput = z.infer<typeof toggle2faSchema>;
