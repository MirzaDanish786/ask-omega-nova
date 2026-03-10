import { UserRole } from '../types/user.js';
import { ROLE_HIERARCHY, ROLE_DEFAULT_MODULES, type ModuleName } from '../constants/roles.js';

export interface CanUser {
  role: UserRole;
  email: string;
  assignedModules: string[];
}

const ADMIN_EMAILS = ['admin@omega-nova.com'];

export function can(user: CanUser, action: string, module?: ModuleName): boolean {
  if (!user) return false;

  if (ADMIN_EMAILS.includes(user.email)) return true;
  if (user.role === UserRole.ADMIN) return true;

  if (module) {
    const userModules = user.assignedModules.length > 0
      ? user.assignedModules
      : ROLE_DEFAULT_MODULES[user.role];
    if (!userModules.includes(module)) return false;
  }

  const role: string = user.role;
  switch (action) {
    case 'admin:access':
      return role === UserRole.ADMIN;
    case 'simulation:create':
      return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.ANALYST];
    case 'ogwi:view':
    case 'early-warning:view':
      return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.VIEWER];
    case 'knowledge-base:view':
      return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.ANALYST];
    case 'knowledge-base:manage':
      return role === UserRole.ADMIN;
    default:
      return false;
  }
}

export function isAdmin(user: CanUser): boolean {
  return user.role === UserRole.ADMIN || ADMIN_EMAILS.includes(user.email);
}
