import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { Users, Activity, BarChart3, Clock, Settings, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/admin/')({
  component: AdminCenterPage,
});

interface AdminStats {
  users: number;
  simulations: number;
  ogwiUpdates30d: number;
}

function AdminCenterPage() {
  const { data: session, isPending: authLoading } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats'),
    enabled: !!session?.user && isAdmin,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!session?.user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="text-destructive p-8">Access denied. Admin role required.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Shield className="w-5 h-5 text-slate-600" />
          </div>
          Admin Center
        </h1>
        <p className="text-muted-foreground text-sm mt-1 ml-[52px]">
          System overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Users} title="Total Users" value={stats?.users ?? 0} />
        <StatCard icon={Activity} title="Total Simulations" value={stats?.simulations ?? 0} />
        <StatCard icon={BarChart3} title="OGWI Updates (30d)" value={stats?.ogwiUpdates30d ?? 0} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={Clock}
            title="Account Approvals"
            description="Review and approve pending user registrations"
            href="/admin/approvals"
          />
          <QuickAction
            icon={Users}
            title="User Management"
            description="Manage user roles and module access"
            href="/admin/users"
          />
          <QuickAction
            icon={Settings}
            title="Agent Control"
            description="Monitor and control background agents"
            href="/admin/agents"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon: Icon, title, description, href }: { icon: any; title: string; description: string; href: string }) {
  return (
    <Link to={href}>
      <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
        <CardContent className="py-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
