import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronRight, Settings, Users, BarChart3, Crown, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { signOut } from '@/lib/auth-client';
import { Link, useNavigate } from '@tanstack/react-router';

interface UserMenuProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  role: string;
}

export function UserMenu({ user, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isAdmin = role === 'ADMIN';
  const initial = user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/login' });
  };

  const adminItems = [
    { label: 'Admin Center', icon: Settings, to: '/admin' },
    { label: 'Account Approvals', icon: UserCheck, to: '/admin/approvals' },
    { label: 'User Management', icon: Users, to: '/admin/users' },
    { label: 'Agent Control', icon: BarChart3, to: '/admin/agents' },
  ];

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-white hover:bg-white/10"
      >
        <User className="w-5 h-5" />
      </Button>

      {open && (
        <Card className="absolute right-0 mt-2 w-80 z-50 overflow-hidden bg-white border-slate-200 shadow-xl">
          {/* Account header */}
          <div className="px-4 py-4">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-3">My Account</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600 gap-1">
                <Crown className="w-3 h-3" />
                {role}
              </Badge>
            </div>
          </div>
          <Separator className="bg-slate-200" />

          {/* My Activities */}
          <Link
            to="/my-activities"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">My Activities</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
          <Separator className="bg-slate-100" />

          {/* Admin tools */}
          {isAdmin && (
            <>
              <div className="px-4 py-2 flex items-center gap-1.5">
                <Crown className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Admin Tools</span>
              </div>
              {adminItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    <span className="text-sm text-slate-600 group-hover:text-purple-700 transition-colors">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </Link>
              ))}
              <Separator className="bg-slate-100" />
            </>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-2.5 px-4 py-3 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>

          <Separator className="bg-slate-100" />
          <div className="px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400">Omega Nova v1.0</span>
          </div>
        </Card>
      )}
    </div>
  );
}
