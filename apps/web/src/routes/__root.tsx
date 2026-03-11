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

const PUBLIC_PAGES = ['/login', '/forgot-password', '/reset-password', '/signup'];
const STATUS_PAGES = ['/verify-email', '/pending-approval', '/onboarding'];

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
  const isStatusPage = STATUS_PAGES.includes(location.pathname);
  const isOnboardingPage = location.pathname === '/onboarding';
  const isVerifyPage = location.pathname === '/verify-email';
  const isPendingPage = location.pathname === '/pending-approval';

  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // Always fetch user data for logged-in users (regardless of page)
  useEffect(() => {
    if (session?.user) {
      setUserLoading(true);
      api.get<Record<string, unknown>>('/users/me')
        .then(data => setUserData(data))
        .catch(() => {})
        .finally(() => setUserLoading(false));
    }
  }, [session?.user?.id]);

  // --- Auth guards ---
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!session?.user) {
    if (isPublicPage) return <Outlet />;
    navigate({ to: '/login' });
    return null;
  }

  // Logged in — wait for user data before making routing decisions
  if (userLoading || !userData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userRole = (userData.role ?? (session.user as Record<string, unknown>).role) as string;
  const emailVerified = userData.emailVerified as boolean | undefined;
  const accountStatus = (userData.accountStatus ?? 'PENDING') as string;
  const onboardingCompleted = userData.onboardingCompleted as boolean | undefined;

  // Non-admin users: status-based routing with actual data
  if (userRole !== 'ADMIN') {
    // Step 1: Email not verified → must verify
    if (emailVerified === false) {
      if (!isVerifyPage) {
        navigate({ to: '/verify-email' });
        return null;
      }
      return <Outlet />;
    }

    // Step 2: Account not approved → pending approval screen
    if (accountStatus !== 'APPROVED') {
      if (!isPendingPage) {
        navigate({ to: '/pending-approval' });
        return null;
      }
      return <Outlet />;
    }

    // Step 3: Onboarding not completed → must complete onboarding
    if (onboardingCompleted === false) {
      if (!isOnboardingPage) {
        navigate({ to: '/onboarding' });
        return null;
      }
      return <Outlet />;
    }
  }

  // User is fully approved — redirect away from status/public pages to home
  if (isPublicPage || isStatusPage) {
    navigate({ to: '/' });
    return null;
  }

  const ogwiScore = 3.86;
  const ogwiDelta = 0.01;
  const userInitial = (session.user.name?.charAt(0) || session.user.email.charAt(0)).toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Topnav inline styles matching old project */}
      <style>{`
        .topnav { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; font-family: Inter, "SF Pro Display", "Helvetica Neue", Arial, ui-sans-serif, system-ui; }
        .topnav-item {
          display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 10px;
          color: rgba(255,255,255,0.85);
          background: transparent; text-decoration: none;
          font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
          transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease;
          gap: 6px;
        }
        .topnav-item:hover { color: #FFFFFF; background: rgba(255,255,255,0.08); }
        .topnav-item.active { color: #FFFFFF; font-weight: 600; background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.6); }
        .workspace-pill { display:inline-flex; align-items:center; gap:10px; padding:8px 14px; border-radius:9999px; background:rgba(255,255,255,0.92); color:#0F172A; text-decoration:none; font-size:13.5px; font-weight:600; letter-spacing:0.2px; }
        .workspace-pill:hover { background: rgba(255,255,255,0.98); }
        .initial-badge { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:6px; background:#FFFFFF; color:#0F172A; font-weight:700; font-size:12px; box-shadow:0 0 0 1px rgba(15,23,42,0.06); }
      `}</style>

      {/* ===== TOP HEADER BAR ===== */}
      <header
        className="sticky top-0 z-50"
        style={{ background: 'linear-gradient(180deg, #1F2A3A 0%, #243044 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* Row 1: Navigation + My Workspace pill */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="h-12 flex items-center justify-between">
            {/* Left: Mobile hamburger + Nav tabs */}
            <div className="flex items-center gap-6">
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="topnav-item"
                  aria-label="Open menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>

              <nav className="hidden md:flex items-center topnav" style={{ gap: '20px' }}>
                {NAV_ITEMS.map(item => {
                  const isActive = item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`topnav-item ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: My Workspace pill */}
            <Link to="/my-activities" className="hidden md:inline-flex workspace-pill">
              <span>My Workspace</span>
              <span className="initial-badge">{userInitial}</span>
            </Link>
          </div>
        </div>

        {/* Row 2: Branding + OGWI + Controls */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between border-t border-white/[0.06]">
            {/* Left: Logo + branding */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
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
                <div className="text-white font-bold text-lg leading-tight">OmegaNova</div>
                <div className="text-slate-400 text-xs tracking-wide">Geostrategic Intelligence</div>
              </div>
            </div>

            {/* Right: OGWI badge + Data Sovereignty + Bell + User */}
            <div className="flex items-center gap-4">
              {/* OGWI Score badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600/50 bg-white/5">
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">OGWI · EW</span>
                <span className="text-xl font-bold text-white">{ogwiScore.toFixed(2)}</span>
                <span className={`text-xs font-semibold ${ogwiDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {ogwiDelta > 0 ? '▲' : '▼'} {ogwiDelta.toFixed(2)}
                </span>
              </div>

              {/* Data Sovereignty */}
              <button className="hidden lg:inline-flex topnav-item" style={{ fontSize: '13px', gap: '6px', color: 'rgba(255,255,255,0.6)' }}>
                <Shield className="w-4 h-4" />
                Data Sovereignty
              </button>

              <NotificationBell />
              <UserMenu
                user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
                role={userRole}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE NAV ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden z-40 border-b border-white/10" style={{ background: 'linear-gradient(180deg, #1F2A3A 0%, #243044 100%)' }}>
          <nav className="flex flex-col p-4 gap-2">
            {NAV_ITEMS.map(item => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`topnav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="h-4 w-4" />
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
      <main className="flex-1 overflow-auto bg-white topnav">
        <Outlet />
      </main>
    </div>
  );
}
