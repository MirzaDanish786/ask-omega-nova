import { UserRole } from '../types/user.js';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 100,
  [UserRole.ALL_ACCESS]: 80,
  [UserRole.ANALYST]: 50,
  [UserRole.VIEWER]: 10,
};

export const ALL_MODULES = [
  'ogwi',
  'simulations',
  'early-warning',
  'knowledge-base',
  'admin',
  'agents',
  'notifications',
] as const;

export type ModuleName = (typeof ALL_MODULES)[number];

export const ROLE_DEFAULT_MODULES: Record<UserRole, ModuleName[]> = {
  [UserRole.ADMIN]: [...ALL_MODULES],
  [UserRole.ALL_ACCESS]: ['ogwi', 'simulations', 'early-warning', 'knowledge-base', 'notifications'],
  [UserRole.ANALYST]: ['ogwi', 'simulations', 'early-warning', 'notifications'],
  [UserRole.VIEWER]: ['ogwi', 'notifications'],
};
