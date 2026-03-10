import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../lib/auth-client';
import { api } from '../lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell,
} from 'recharts';

export const Route = createFileRoute('/ogwi')({
  component: OgwiPage,
});

interface OgwiCurrent {
  ogwiScore: number;
  crisisLevel: string;
  date: string;
  regionalBreakdown: Array<{
    region: string;
    score: number;
    crisisLevel: string;
    earlyWarning: { score: number; severity: string; color: string };
  }>;
}

interface OgwiHistorical {
  id: string;
  date: string;
  ogwiScore: number;
  crisisLevel: string;
}

interface ForecastPoint {
  year: number;
  projected: number;
  confidence50: [number, number];
  confidence80: [number, number];
}

function OgwiPage() {
  const { data: session, isPending: authLoading } = useSession();

  const { data: current } = useQuery<OgwiCurrent>({
    queryKey: ['ogwi', 'current'],
    queryFn: () => api.get('/ogwi/current'),
    enabled: !!session?.user,
  });

  const { data: historical } = useQuery<OgwiHistorical[]>({
    queryKey: ['ogwi', 'historical'],
    queryFn: () => api.get('/ogwi/historical?limit=30'),
    enabled: !!session?.user,
  });

  const { data: forecast } = useQuery<ForecastPoint[]>({
    queryKey: ['ogwi', 'forecast'],
    queryFn: () => api.get('/ogwi/forecast'),
    enabled: !!session?.user,
  });

  if (authLoading) return <div>Loading...</div>;
  if (!session?.user) return <Navigate to="/login" />;

  const crisisColor = (level: string) => {
    const colors: Record<string, string> = {
      CATASTROPHIC: '#991b1b', CRITICAL: '#ef4444', HIGH: '#f97316',
      ELEVATED: '#eab308', STABLE: '#22c55e',
    };
    return colors[level] ?? '#6b7280';
  };

  const histData = (historical ?? [])
    .slice()
    .reverse()
    .map(h => ({ date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: h.ogwiScore }));

  const forecastData = (forecast ?? []).map(f => ({
    year: f.year,
    projected: f.projected,
    low80: f.confidence80[0], high80: f.confidence80[1],
    low50: f.confidence50[0], high50: f.confidence50[1],
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">OGWI — Omega GlobalWatch Index</h1>

      {/* Current Score */}
      {current && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 p-6 rounded-lg border border-border bg-card text-center">
            <p className="text-sm text-muted-foreground mb-2">Current OGWI</p>
            <p className="text-5xl font-bold" style={{ color: crisisColor(current.crisisLevel) }}>
              {current.ogwiScore.toFixed(2)}
            </p>
            <p className="mt-2 text-sm font-medium px-3 py-1 rounded-full inline-block"
              style={{ backgroundColor: crisisColor(current.crisisLevel) + '20', color: crisisColor(current.crisisLevel) }}>
              {current.crisisLevel}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{current.date}</p>
          </div>

          {/* Regional Breakdown */}
          <div className="col-span-2 p-6 rounded-lg border border-border bg-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Regional Breakdown</h3>
            <div className="space-y-3">
              {current.regionalBreakdown.map(r => (
                <div key={r.region} className="flex items-center justify-between">
                  <span className="text-sm w-28">{r.region}</span>
                  <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${(r.score / 5) * 100}%`,
                      backgroundColor: crisisColor(r.crisisLevel),
                    }} />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">{r.score.toFixed(2)}</span>
                  <span className="text-xs w-20 text-right" style={{ color: r.earlyWarning.color }}>
                    {r.earlyWarning.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Chart */}
      {histData.length > 0 && (
        <div className="p-6 rounded-lg border border-border bg-card mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">30-Day Historical Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={histData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2, 32.6%, 17.5%)" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis domain={[1, 5]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Forecast Chart */}
      {forecastData.length > 0 && (
        <div className="p-6 rounded-lg border border-border bg-card mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">10-Year Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2, 32.6%, 17.5%)" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis domain={[1, 5]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Area type="monotone" dataKey="high80" stackId="1" stroke="none" fill="#3b82f620" />
              <Area type="monotone" dataKey="low80" stackId="2" stroke="none" fill="transparent" />
              <Area type="monotone" dataKey="high50" stackId="3" stroke="none" fill="#3b82f640" />
              <Area type="monotone" dataKey="low50" stackId="4" stroke="none" fill="transparent" />
              <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Regional Bar Chart */}
      {current && (
        <div className="p-6 rounded-lg border border-border bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Regional OGWI Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={current.regionalBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2, 32.6%, 17.5%)" />
              <XAxis dataKey="region" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {current.regionalBreakdown.map((entry, index) => (
                  <Cell key={index} fill={crisisColor(entry.crisisLevel)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
