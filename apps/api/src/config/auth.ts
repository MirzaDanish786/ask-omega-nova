import { betterAuth } from 'better-auth';
import pg from 'pg';
import { env } from './env.js';
import { AppDataSource } from '../database/data-source.js';
import { User } from '../entities/index.js';

// BetterAuth v1.5+ requires a pg Pool instance (not { type, url })
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

export const auth = betterAuth({
  database: pool,
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
    sendResetPassword: async ({ user, url }) => {
      // In production, integrate a real email service (SendGrid, SES, etc.)
      // For now, log the reset URL to console so it can be used during development
      console.log(`\n===== PASSWORD RESET =====`);
      console.log(`User: ${user.email}`);
      console.log(`Reset URL: ${url}`);
      console.log(`==========================\n`);
    },
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
        type: 'string',
        defaultValue: '[]',
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
      onboardingCompleted: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
      accessLevel: {
        type: 'string',
        defaultValue: null,
        input: false,
      },
      apiMode: {
        type: 'string',
        defaultValue: null,
        input: false,
      },
      alertsEnabled: {
        type: 'boolean',
        defaultValue: true,
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
            const userRepo = AppDataSource.getRepository(User);
            await userRepo.update(user.id, { role: 'ADMIN' as any });
            console.log(`[Auth] Auto-promoted ${user.email} to ADMIN role`);
          }
        },
      },
    },
  },
});
