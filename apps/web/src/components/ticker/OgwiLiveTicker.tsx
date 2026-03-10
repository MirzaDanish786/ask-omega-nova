import { useEffect, useState } from 'react';
import { Globe, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface OgwiRegion {
  region: string;
  score: number;
  delta30d: number;
}

interface OgwiCurrentResponse {
  global: { score: number; crisisLevel: string };
  regional: OgwiRegion[];
  earlyWarning: unknown;
}

export function OgwiLiveTicker() {
  const [regions, setRegions] = useState<OgwiRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<OgwiCurrentResponse>('/ogwi/current')
      .then(data => {
        setRegions(data.regional || []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-8 flex items-center px-4 border-b border-slate-800/30 bg-slate-900/85 backdrop-blur-xl">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 mr-2" />
        <span className="text-xs text-slate-400">Loading OGWI data...</span>
      </div>
    );
  }

  if (error || regions.length === 0) {
    return (
      <div className="h-8 flex items-center px-4 border-b border-slate-800/30 bg-slate-900/85 backdrop-blur-xl">
        <AlertCircle className="w-3.5 h-3.5 text-slate-500 mr-2" />
        <span className="text-xs text-slate-500">OGWI feed unavailable</span>
      </div>
    );
  }

  const items = [...regions, ...regions];

  return (
    <div className="h-8 flex items-center overflow-hidden border-b border-slate-800/30 bg-slate-900/85 backdrop-blur-xl relative">
      {/* Indicator */}
      <div className="flex items-center gap-2 px-4 flex-shrink-0 z-10 bg-slate-900/95">
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">OGWI</span>
        <div
          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          style={{ animation: 'live-pulse 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(52, 211, 153, 0.5)' }}
        />
      </div>

      {/* Marquee */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex items-center gap-4 whitespace-nowrap"
          style={{ animation: 'ogwi-scroll 28s linear infinite' }}
        >
          {items.map((region, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
                  {region.region}
                </span>
                <span className="text-xs font-bold text-slate-100">
                  {region.score.toFixed(2)}
                </span>
                <span className={`text-[10px] font-semibold ${region.delta30d > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {region.delta30d > 0 ? '▲' : '▼'} {Math.abs(region.delta30d).toFixed(2)}
                </span>
              </div>
              <div className="w-px h-3 bg-slate-600/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
