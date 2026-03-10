import {
  Radar,
  Scale,
  Globe,
  Waves,
  UserSquare,
  Brain,
  CloudRain,
  Shield,
  Building,
  Workflow,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const ENGINE_DATA = [
  { icon: Radar, title: 'EW Engine++', description: 'Detects shifts before they hit the news.' },
  { icon: Scale, title: 'PVI 3.0', description: 'Makes predictions measurable and provable.' },
  { icon: Globe, title: 'OGWI Fusion', description: 'Systemic risk across geopolitics, economy, environment, society.' },
  { icon: Waves, title: 'GSI', description: 'Signals from 100+ feeds fused into one coherent picture.' },
  { icon: UserSquare, title: 'LII v1.2', description: 'What leaders say vs what they actually do.' },
  { icon: Brain, title: 'CWI v2.0', description: 'Narratives, perception, propaganda — decoded.' },
  { icon: CloudRain, title: 'GRE v1.1', description: 'Climate, weather anomalies, natural stressors, infrastructure impact.' },
  { icon: Shield, title: 'Cyber Risk Fusion', description: 'APT behavior, zero-days, spillover into physical domains.' },
  { icon: Building, title: 'ORP v1.1', description: 'Translates world events into concrete corporate risks.' },
  { icon: Workflow, title: 'SEQ v2.0', description: 'Builds the logical chain behind Path 1–3.' },
];

export function IntelligenceEnginesCarousel() {
  const items = [...ENGINE_DATA, ...ENGINE_DATA, ...ENGINE_DATA];

  return (
    <div className="w-full overflow-hidden py-6">
      <div
        className="flex gap-6"
        style={{
          animation: 'engines-scroll 40s linear infinite',
          width: `${items.length * 280}px`,
        }}
      >
        {items.map((engine, idx) => (
          <Card
            key={idx}
            className="w-64 flex-none rounded-2xl p-6 relative group cursor-pointer overflow-hidden transition-transform hover:-translate-y-1.5 hover:scale-[1.03] bg-slate-950/85 backdrop-blur-xl border-white/[0.08] shadow-lg"
          >
            {/* Concentric circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${18 * i}%`,
                    height: `${18 * i}%`,
                    border: '1px solid rgba(201, 168, 113, 0.12)',
                    boxShadow: i === 3 ? '0 0 20px rgba(201, 168, 113, 0.08)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="relative z-10 mb-6 flex justify-center transition-transform group-hover:scale-110">
              <engine.icon
                className="w-16 h-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                style={{ color: '#C9A871' }}
              />
            </div>

            {/* Title */}
            <h3
              className="text-center text-base font-semibold mb-2 relative z-10"
              style={{ color: '#C9A871', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
            >
              {engine.title}
            </h3>

            {/* Description */}
            <p className="text-center text-xs text-gray-400 opacity-70 relative z-10 leading-relaxed">
              {engine.description}
            </p>

            {/* Shimmer */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(201,168,113,0.08) 50%, transparent 70%)',
                animation: 'shimmer 2s infinite',
              }}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
