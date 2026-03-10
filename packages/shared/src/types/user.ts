export enum UserRole {
  ADMIN = 'ADMIN',
  ALL_ACCESS = 'ALL_ACCESS',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  assignedModules: string[];
  companyId: string | null;
  monthlySimCount: number;
  simRateLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
