import { createRootRouteWithContext, Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { useSession, signOut } from '../lib/auth-client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2, LogOut } from 'lucide-react';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

// Pages that don't require authentication or sidebar
const PUBLIC_PAGES = ['/login', '/forgot-password', '/reset-password'];

function RootLayout() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPage = PUBLIC_PAGES.includes(location.pathname);
  const isOnboardingPage = location.pathname === '/onboarding';

  // Fetch full user data (with onboarding status) for authenticated users
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (session?.user && !isPublicPage) {
      setUserLoading(true);
      api.get<Record<string, unknown>>('/users/me')
        .then(data => setUserData(data))
        .catch(() => {})
        .finally(() => setUserLoading(false));
    }
  }, [session?.user?.id, isPublicPage]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0f1a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Not authenticated: show public pages directly, redirect others to /login
  if (!session?.user) {
    if (isPublicPage) return <Outlet />;
    navigate({ to: '/login' });
    return null;
  }

  // Authenticated but on a public page: redirect to dashboard
  if (isPublicPage) {
    navigate({ to: '/' });
    return null;
  }

  // Onboarding page renders without sidebar
  if (isOnboardingPage) return <Outlet />;

  // Wait for user data before checking onboarding
  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0f1a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Check if user needs onboarding (skip for admins)
  const userRole = (userData?.role ?? (session.user as Record<string, unknown>).role) as string;
  const onboardingCompleted = userData?.onboardingCompleted as boolean | undefined;
  if (userRole !== 'ADMIN' && onboardingCompleted === false) {
    navigate({ to: '/onboarding' });
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Omega Nova</h1>
          <p className="text-xs text-muted-foreground mt-1">Intelligence Analysis Platform</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/ogwi">OGWI Index</NavLink>
          <NavLink to="/simulations">Simulations</NavLink>
          <NavLink to="/early-warning">Early Warning</NavLink>
          {userRole === 'ADMIN' && (
            <>
              <div className="pt-4 pb-2 text-xs text-muted-foreground uppercase tracking-wider">Admin</div>
              <NavLink to="/admin">Admin Center</NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/agents">Agents</NavLink>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-sm font-medium">{session.user.name}</div>
          <div className="text-xs text-muted-foreground">{session.user.email}</div>
          <div className="text-xs text-muted-foreground mt-0.5 capitalize">{userRole?.toLowerCase()}</div>
          <button
            onClick={() => signOut().then(() => navigate({ to: '/login' }))}
            className="mt-2 flex items-center gap-1.5 text-xs text-destructive hover:underline"
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent"
      activeProps={{ className: 'bg-accent text-accent-foreground font-medium' }}
    >
      {children}
    </Link>
  );
}
