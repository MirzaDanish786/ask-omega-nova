import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';

export const Route = createFileRoute('/admin/agents')({
  component: AdminAgentsPage,
});

interface AgentConfig {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  status: string;
  schedule: string;
  lastRunAt: string | null;
  errorCount: number;
}

function AdminAgentsPage() {
  const { data: session, isPending: authLoading } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const { data: agents, isLoading } = useQuery<AgentConfig[]>({
    queryKey: ['admin', 'agents'],
    queryFn: () => api.get('/agents'),
    enabled: !!session?.user && isAdmin,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.post(`/agents/${id}/toggle`, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] }),
  });

  const runMutation = useMutation({
    mutationFn: (id: string) => api.post(`/agents/${id}/run`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] }),
  });

  if (authLoading) return <div>Loading...</div>;
  if (!session?.user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="text-destructive">Access denied.</div>;

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'text-green-400', PAUSED: 'text-yellow-400',
      ERROR: 'text-red-400', DISABLED: 'text-muted-foreground',
    };
    return map[status] ?? 'text-muted-foreground';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Agent Control Panel</h1>

      {isLoading && <p className="text-muted-foreground">Loading agents...</p>}

      <div className="space-y-4">
        {agents?.map(agent => (
          <div key={agent.id} className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Schedule: <code className="text-xs bg-muted px-1 py-0.5 rounded">{agent.schedule}</code>
                </p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className={statusColor(agent.status)}>Status: {agent.status}</span>
                  <span>Errors: {agent.errorCount}</span>
                  <span>Last run: {agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleString() : 'Never'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleMutation.mutate({ id: agent.agentId, enabled: !agent.enabled })}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    agent.enabled
                      ? 'border-destructive/50 text-destructive hover:bg-destructive/10'
                      : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {agent.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => runMutation.mutate(agent.agentId)}
                  disabled={!agent.enabled || runMutation.isPending}
                  className="px-3 py-1 text-sm rounded-md border border-primary/50 text-primary hover:bg-primary/10 disabled:opacity-50"
                >
                  Run Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {agents?.length === 0 && (
        <p className="text-muted-foreground">No agents configured.</p>
      )}
    </div>
  );
}
