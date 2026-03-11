import { createRootRouteWithContext, Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { useSession } from '../lib/auth-client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2, Shield, Globe, ShieldCheck, Plane, ListTodo, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { OgwiLiveTicker } from '../components/ticker/OgwiLiveTicker';
import { LiveNewsTicker } from '../components/ticker/LiveNewsTicker';
import { NotificationBell } from '../components/workspace/NotificationBell';
import { UserMenu } from '../components/workspace/UserMenu';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

const PUBLIC_PAGES = ['/login', '/forgot-password', '/reset-password', '/signup', '/verify-email', '/pending-approval'];

const NAV_ITEMS = [
  { to: '/', label: 'OmegaNova', icon: Shield },
  { to: '/global', label: 'Global', icon: Globe },
  { to: '/srm', label: 'SRM', icon: ShieldCheck },
  { to: '/travel', label: 'Travel', icon: Plane },
  { to: '/global-perspectives', label: 'Global Perspectives', icon: Globe },
  { to: '/my-activities', label: 'My Activities', icon: ListTodo },
];

function RootLayout() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicPage = PUBLIC_PAGES.includes(location.pathname);
  const isOnboardingPage = location.pathname === '/onboarding';

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

  // --- Auth guards ---
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    if (isPublicPage) return <Outlet />;
    navigate({ to: '/login' });
    return null;
  }

  // User is logged in — handle status-based routing
  const isVerifyPage = location.pathname === '/verify-email';
  const isPendingPage = location.pathname === '/pending-approval';

  if (isVerifyPage || isPendingPage) return <Outlet />;

  if (isOnboardingPage) return <Outlet />;

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userRole = (userData?.role ?? (session.user as Record<string, unknown>).role) as string;
  const emailVerified = userData?.emailVerified as boolean | undefined;
  const accountStatus = (userData?.accountStatus ?? 'PENDING') as string;
  const onboardingCompleted = userData?.onboardingCompleted as boolean | undefined;

  // Non-admin users: check email verification first, then approval status
  if (userRole !== 'ADMIN') {
    if (emailVerified === false) {
      navigate({ to: '/verify-email' });
      return null;
    }
    if (accountStatus !== 'APPROVED') {
      navigate({ to: '/pending-approval' });
      return null;
    }
    if (onboardingCompleted === false) {
      navigate({ to: '/onboarding' });
      return null;
    }
  }

  if (isPublicPage) {
    navigate({ to: '/' });
    return null;
  }

  const ogwiScore = 3.86;
  const ogwiDelta = 0.01;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ===== TOP HEADER BAR ===== */}
      <header
        className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 lg:px-6"
        style={{ background: 'linear-gradient(180deg, #1F2A3A 0%, #243044 100%)' }}
      >
        {/* Left: Mobile menu + Desktop nav */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Logo + subtitle */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#logo-grad)" />
              <path d="M12 14h16v3H12zM12 20h16v3H12zM12 26h10v3H12z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">OmegaNova</div>
            <div className="text-slate-400 text-[10px] tracking-wide">Geostrategic Intelligence</div>
          </div>
        </div>

        {/* Right: OGWI badge + controls */}
        <div className="flex items-center gap-3">
          {/* OGWI Score badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-600/50 bg-white/5">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">OGWI · EW</span>
            <span className="text-lg font-bold text-white">{ogwiScore.toFixed(2)}</span>
            <span className={`text-xs font-semibold ${ogwiDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ▲ {ogwiDelta.toFixed(2)}
            </span>
          </div>

          {/* Data Sovereignty */}
          <Button variant="ghost" size="sm" className="hidden md:flex text-slate-400 hover:text-white gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Data Sovereignty
          </Button>

          <NotificationBell />
          <UserMenu
            user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
            role={userRole}
          />

          {/* My Workspace pill */}
          <Link
            to="/my-activities"
            className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-600/50 text-sm text-white hover:bg-white/10 transition-colors"
          >
            My Workspace
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              {(session.user.name?.charAt(0) || session.user.email.charAt(0)).toUpperCase()}
            </span>
          </Link>
        </div>
      </header>

      {/* ===== MOBILE NAV ===== */}
      {mobileMenuOpen && (
        <div className="lg:hidden z-40 border-b border-slate-700/50 bg-slate-900/98 backdrop-blur-xl">
          <nav className="flex flex-col p-3 gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* ===== TICKERS ===== */}
      <LiveNewsTicker />
      <OgwiLiveTicker />

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-auto bg-white">
        <Outlet />
      </main>
    </div>
  );
}
