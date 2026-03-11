import { createFileRoute } from '@tanstack/react-router';
import { Globe, Shield, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const Route = createFileRoute('/global')({
  component: GlobalSituationPage,
});

const DOMAINS = [
  'Security', 'Political', 'Economic', 'Climate', 'Narrative', 'Cyber', 'Stability', 'Health',
];

const REGIONS = [
  { name: 'Middle East', score: 3.46, delta: 0.00, level: 'ELEVATED' },
  { name: 'Africa', score: 3.16, delta: 0.00, level: 'ELEVATED' },
  { name: 'Asia', score: 3.05, delta: 0.00, level: 'ELEVATED' },
  { name: 'Europe', score: 2.97, delta: 0.00, level: 'ELEVATED' },
  { name: 'North America', score: 2.73, delta: 0.00, level: 'ELEVATED' },
  { name: 'South America', score: 2.80, delta: 0.00, level: 'ELEVATED' },
  { name: 'Oceania', score: 3.04, delta: 0.00, level: 'ELEVATED' },
];

function getScoreColor(score: number) {
  if (score >= 4.5) return '#7a1022';
  if (score >= 4.0) return '#b42318';
  if (score >= 3.5) return '#b44a05';
  if (score >= 3.0) return '#ad6b00';
  if (score >= 2.5) return '#606b2f';
  return '#1f7a4a';
}

function GlobalSituationPage() {
  return (
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Situation View</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time geopolitical risk assessment across all regions</p>
        </div>

        {/* Domain navigation strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {DOMAINS.map((domain, idx) => (
            <button
              key={domain}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                idx === 0
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Regional OGWI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {REGIONS.map(region => (
            <div
              key={region.name}
              className="rounded-xl p-5 border border-slate-200 bg-white transition-all hover:-translate-y-1 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{region.name}</h3>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ background: getScoreColor(region.score) }}
                >
                  {region.level}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold" style={{ color: getScoreColor(region.score) }}>
                  {region.score.toFixed(2)}
                </span>
                <span className={`text-xs font-semibold pb-1 ${region.delta > 0 ? 'text-red-500' : region.delta < 0 ? 'text-green-500' : 'text-slate-400'}`}>
                  {region.delta > 0 ? '▲' : region.delta < 0 ? '▼' : '–'} {Math.abs(region.delta).toFixed(2)}
                </span>
              </div>
              {/* Heatband */}
              <div className="mt-3 h-2 rounded-full overflow-hidden flex">
                <div className="flex-1" style={{ background: '#1f7a4a' }} />
                <div className="flex-1" style={{ background: '#606b2f' }} />
                <div className="flex-1" style={{ background: '#ad6b00' }} />
                <div className="flex-1" style={{ background: '#b44a05' }} />
                <div className="flex-1" style={{ background: '#b42318' }} />
                <div className="flex-1" style={{ background: '#7a1022' }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400">1</span>
                <span className="text-[9px] text-slate-400">5</span>
              </div>
            </div>
          ))}
        </div>

        {/* GSI Panel */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-slate-900">Global Stress Index (GSI)</h2>
          </div>
          <p className="text-sm text-slate-500">
            The GSI aggregates signals from 100+ intelligence feeds into a unified stress metric.
            Detailed domain-level analysis and early warning indicators are available for each region.
          </p>
        </Card>

        {/* Early Warning */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">Early Warning Indicators</h2>
          </div>
          <p className="text-sm text-slate-500">
            Domain-specific threat indicators monitoring security, political, economic, climate, narrative, cyber, stability, and health signals.
          </p>
        </Card>
      </div>
    </div>
  );
}
