import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { Settings, Loader2, Play, Power, PowerOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!session?.user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="text-destructive p-8">Access denied.</div>;

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'border-emerald-200 text-emerald-700 bg-emerald-50',
      PAUSED: 'border-amber-200 text-amber-700 bg-amber-50',
      ERROR: 'border-red-200 text-red-700 bg-red-50',
      DISABLED: 'border-slate-200 text-slate-600 bg-slate-50',
    };
    return map[status] ?? 'border-slate-200 text-slate-600 bg-slate-50';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-600" />
          </div>
          Agent Control Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1 ml-[52px]">
          Monitor and control background agents
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground ml-3">Loading agents...</span>
        </div>
      )}

      <div className="space-y-4">
        {agents?.map(agent => (
          <Card key={agent.id}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Schedule: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{agent.schedule}</code>
                  </p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <Badge variant="outline" className={`text-xs ${statusColor(agent.status)}`}>
                      {agent.status}
                    </Badge>
                    <span className="text-muted-foreground">Errors: {agent.errorCount}</span>
                    <span className="text-muted-foreground">Last run: {agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleString() : 'Never'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleMutation.mutate({ id: agent.agentId, enabled: !agent.enabled })}
                    className={agent.enabled
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }
                  >
                    {agent.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    {agent.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runMutation.mutate(agent.agentId)}
                    disabled={!agent.enabled || runMutation.isPending}
                  >
                    <Play className="w-4 h-4" />
                    Run Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && agents?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No agents configured.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
