import { Navigate } from '@tanstack/react-router';
import { useSession } from './auth-client';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && (session.user as Record<string, unknown>).role !== requiredRole) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You need the <span className="font-mono">{requiredRole}</span> role to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
