import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';

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

  if (authLoading) return <div>Loading...</div>;
  if (!session?.user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="text-destructive">Access denied. Admin role required.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={stats?.users ?? 0} />
        <StatCard title="Total Simulations" value={stats?.simulations ?? 0} />
        <StatCard title="OGWI Updates (30d)" value={stats?.ogwiUpdates30d ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAction title="User Management" description="Manage user roles and module access" href="/admin/users" />
        <QuickAction title="Agent Control" description="Monitor and control background agents" href="/admin/agents" />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QuickAction({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a href={href} className="block p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </a>
  );
}
