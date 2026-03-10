import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '../lib/auth-client';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-sm text-muted-foreground">Welcome</h3>
          <p className="text-lg font-semibold mt-1">{session?.user?.name}</p>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-sm text-muted-foreground">Role</h3>
          <p className="text-lg font-semibold mt-1">
            {((session?.user as Record<string, unknown>)?.role as string) ?? 'VIEWER'}
          </p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-sm text-muted-foreground">Status</h3>
          <p className="text-lg font-semibold mt-1 text-green-400">Authenticated</p>
        </div>
      </div>
    </div>
  );
}
