import { createRootRouteWithContext, Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { useSession, signOut } from '../lib/auth-client';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated: show login page directly, redirect other pages to /login
  if (!session?.user) {
    if (isLoginPage) return <Outlet />;
    navigate({ to: '/login' });
    return null;
  }

  // Authenticated but on login page: redirect to dashboard
  if (isLoginPage) {
    navigate({ to: '/' });
    return null;
  }

  const userRole = (session.user as Record<string, unknown>).role as string;

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
            className="mt-2 text-xs text-destructive hover:underline"
          >
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
