import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';

export const Route = createFileRoute('/simulations/')({
  component: SimulationsPage,
});

interface Simulation {
  id: string;
  query: string;
  status: string;
  answer: string | null;
  tokensUsed: number;
  ogwiSnapshot: number | null;
  createdAt: string;
}

function SimulationsPage() {
  const { data: session, isPending: authLoading } = useSession();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');

  const { data: simulations, isLoading } = useQuery<Simulation[]>({
    queryKey: ['simulations'],
    queryFn: () => api.get('/simulations'),
    enabled: !!session?.user,
  });

  const createMutation = useMutation({
    mutationFn: (q: string) => api.post<Simulation>('/simulations', { query: q }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      setQuery('');
    },
  });

  if (authLoading) return <div>Loading...</div>;
  if (!session?.user) return <Navigate to="/login" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) createMutation.mutate(query.trim());
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ask Omega — Simulations</h1>

      {/* Query Input */}
      <div className="p-6 rounded-lg border border-border bg-card mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">New Analysis Query</h3>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask Omega a geopolitical or security question..."
            className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={createMutation.isPending || !query.trim()}
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Sending...' : 'Ask Omega'}
          </button>
        </form>
        {createMutation.isError && (
          <p className="text-destructive text-sm mt-2">{(createMutation.error as Error).message}</p>
        )}
      </div>

      {/* Simulation History */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Simulations</h3>
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {simulations?.length === 0 && <p className="text-muted-foreground text-sm">No simulations yet. Ask Omega a question to get started.</p>}
        {simulations?.map(sim => (
          <Link key={sim.id} to="/simulations/$id" params={{ id: sim.id }}
            className="block p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{sim.query}</p>
                {sim.answer && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sim.answer.slice(0, 200)}...</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <StatusBadge status={sim.status} />
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(sim.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-green-500/20 text-green-400',
    RUNNING: 'bg-blue-500/20 text-blue-400',
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    FAILED: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}
