import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';

export const Route = createFileRoute('/simulations/$id')({
  component: SimulationDetailPage,
});

interface Simulation {
  id: string;
  query: string;
  status: string;
  threadId: string | null;
  answer: string | null;
  tokensUsed: number;
  ogwiSnapshot: number | null;
  kbArticlesUsed: string[];
  createdAt: string;
  updatedAt: string;
}

function SimulationDetailPage() {
  const { id } = Route.useParams();
  const { data: session, isPending: authLoading } = useSession();
  const queryClient = useQueryClient();
  const [followUp, setFollowUp] = useState('');

  const { data: sim, isLoading } = useQuery<Simulation>({
    queryKey: ['simulation', id],
    queryFn: () => api.get(`/simulations/${id}`),
    enabled: !!session?.user,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === 'RUNNING' || data?.status === 'PENDING' ? 2000 : false;
    },
  });

  const continueMutation = useMutation({
    mutationFn: (message: string) => api.post<Simulation>(`/simulations/${id}/continue`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation', id] });
      setFollowUp('');
    },
  });

  if (authLoading) return <div>Loading...</div>;
  if (!session?.user) return <Navigate to="/login" />;
  if (isLoading) return <div className="text-muted-foreground">Loading simulation...</div>;
  if (!sim) return <div className="text-destructive">Simulation not found</div>;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim() && sim.threadId) continueMutation.mutate(followUp.trim());
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Simulation Detail</h1>

      {/* Query */}
      <div className="p-6 rounded-lg border border-border bg-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Query</h3>
          <StatusBadge status={sim.status} />
        </div>
        <p className="text-foreground">{sim.query}</p>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>OGWI at query: {sim.ogwiSnapshot?.toFixed(2) ?? 'N/A'}</span>
          <span>Tokens: {sim.tokensUsed}</span>
          <span>{new Date(sim.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Answer */}
      {sim.status === 'RUNNING' || sim.status === 'PENDING' ? (
        <div className="p-6 rounded-lg border border-border bg-card mb-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-muted-foreground">Omega is analyzing your query...</span>
          </div>
        </div>
      ) : sim.answer ? (
        <div className="p-6 rounded-lg border border-border bg-card mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Response</h3>
          <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">
            {sim.answer}
          </div>
        </div>
      ) : sim.status === 'FAILED' ? (
        <div className="p-6 rounded-lg border border-destructive/50 bg-destructive/10 mb-6">
          <p className="text-destructive">Simulation failed. Please try again with a different query.</p>
        </div>
      ) : null}

      {/* KB Articles Used */}
      {sim.kbArticlesUsed.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-card mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Knowledge Base Sources</h3>
          <div className="flex flex-wrap gap-2">
            {sim.kbArticlesUsed.map(id => (
              <span key={id} className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{id}</span>
            ))}
          </div>
        </div>
      )}

      {/* Continue Thread */}
      {sim.threadId && sim.status === 'COMPLETED' && (
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Continue Conversation</h3>
          <form onSubmit={handleContinue} className="flex gap-3">
            <input
              type="text"
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={continueMutation.isPending || !followUp.trim()}
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {continueMutation.isPending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
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
