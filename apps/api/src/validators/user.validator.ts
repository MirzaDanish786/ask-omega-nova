import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ALL_ACCESS', 'ANALYST', 'VIEWER'], {
    errorMap: () => ({ message: 'Invalid role. Must be ADMIN, ALL_ACCESS, ANALYST, or VIEWER' }),
  }),
});

export const updateModulesSchema = z.object({
  modules: z.array(
    z.enum(['ogwi', 'simulations', 'early-warning', 'knowledge-base', 'admin', 'agents', 'notifications']),
  ),
});
