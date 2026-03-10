import { createAuthClient } from 'better-auth/react';

// BetterAuth requires an absolute URL (protocol + host), not a relative path.
// In dev, Vite proxies /api → localhost:3001, so we use the browser's own origin.
// In production, the same origin serves both frontend and API (via nginx proxy).
export const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/auth`,
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
