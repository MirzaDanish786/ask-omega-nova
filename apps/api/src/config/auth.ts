import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './database.js';
import { env } from './env.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: [
    env.FRONTEND_URL,
    // Dev: browser may resolve localhost as 127.0.0.1 or [::1], sending a different Origin header
    ...(env.NODE_ENV === 'development' ? [
      'http://127.0.0.1:5173',
      'http://[::1]:5173',
    ] : []),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'VIEWER',
        input: false,
      },
      assignedModules: {
        type: 'string[]',
        defaultValue: [],
        input: false,
      },
      companyId: {
        type: 'string',
        defaultValue: null,
        input: false,
      },
      monthlySimCount: {
        type: 'number',
        defaultValue: 0,
        input: false,
      },
      simRateLimit: {
        type: 'number',
        defaultValue: 50,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Auto-promote ADMIN_EMAIL to ADMIN role on signup
        after: async (user) => {
          if (user.email === env.ADMIN_EMAIL) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: 'ADMIN' },
            });
            console.log(`[Auth] Auto-promoted ${user.email} to ADMIN role`);
          }
        },
      },
    },
  },
});
