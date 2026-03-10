import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../lib/auth-client';
import { api } from '../lib/api';

export const Route = createFileRoute('/early-warning')({
  component: EarlyWarningPage,
});

interface EarlyWarning {
  id: string;
  region: string;
  score: number;
  severity: string;
  signals: Record<string, unknown>;
  drivers: string[];
  createdAt: string;
}

function EarlyWarningPage() {
  const { data: session, isPending: authLoading } = useSession();

  const { data: ewData, isLoading } = useQuery<EarlyWarning[]>({
    queryKey: ['early-warning', 'current'],
    queryFn: () => api.get('/early-warning/current'),
    enabled: !!session?.user,
  });

  if (authLoading) return <div>Loading...</div>;
  if (!session?.user) return <Navigate to="/login" />;

  const severityColor = (severity: string) => {
    const map: Record<string, string> = {
      SYSTEMIC: '#991b1b', CRITICAL: '#ef4444', HIGH: '#f97316',
      ELEVATED: '#eab308', STABLE: '#22c55e',
    };
    return map[severity] ?? '#6b7280';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Early Warning System</h1>

      {isLoading && <p className="text-muted-foreground">Loading early warning data...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ewData?.map(ew => (
          <div key={ew.id} className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{ew.region}</h3>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ backgroundColor: severityColor(ew.severity) + '20', color: severityColor(ew.severity) }}
              >
                {ew.severity}
              </span>
            </div>

            {/* Score Gauge */}
            <div className="mb-4">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-3xl font-bold" style={{ color: severityColor(ew.severity) }}>
                  {ew.score.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/ 1.00</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${ew.score * 100}%`, backgroundColor: severityColor(ew.severity) }}
                />
              </div>
            </div>

            {/* Drivers */}
            {ew.drivers.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Drivers</p>
                <div className="flex flex-wrap gap-1">
                  {ew.drivers.map(driver => (
                    <span key={driver} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {driver.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              Updated: {new Date(ew.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {ewData?.length === 0 && (
        <p className="text-muted-foreground">No early warning data available. Run an OGWI update to generate regional data.</p>
      )}
    </div>
  );
}
