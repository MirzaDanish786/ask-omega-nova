import { createAuthClient } from 'better-auth/react';

// BetterAuth client — baseURL is the server origin.
// BetterAuth appends the basePath (/api/auth) automatically.
// In dev, Vite proxies /api → localhost:3001.
// In production, the same origin serves both frontend and API (via nginx/reverse proxy).
export const authClient = createAuthClient({
  baseURL: window.location.origin,
});

export const { useSession, signIn, signUp, signOut } = authClient;

// Password reset helpers — these exist at runtime but BetterAuth types may not expose them directly
export const forgetPassword = (authClient as any).forgetPassword as (opts: {
  email: string;
  redirectTo?: string;
}) => Promise<{ error?: { message?: string } }>;

export const resetPassword = (authClient as any).resetPassword as (opts: {
  newPassword: string;
}) => Promise<{ error?: { message?: string } }>;
