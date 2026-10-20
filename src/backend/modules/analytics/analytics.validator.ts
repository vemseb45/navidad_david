import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
