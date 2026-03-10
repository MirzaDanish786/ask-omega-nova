import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '../lib/auth-client';
import { useState } from 'react';
import { api } from '../lib/api';
import {
  Sparkles,
  Send,
  Plus,
  Shield,
  Crown,
  Radar,
  Globe,
  Brain,
  Waves,
  Scale,
  CloudRain,
  Building,
  Workflow,
  UserSquare,
  ChevronDown,
} from 'lucide-react';
import { WeeklyBriefCard } from '../components/reports/WeeklyBriefCard';
import { IntelligenceEnginesCarousel } from '../components/omega/IntelligenceEnginesCarousel';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';

export const Route = createFileRoute('/')({
  component: OmegaNovaPage,
});

const EXAMPLE_PROMPTS = [
  'What is the current geopolitical risk landscape in the Middle East?',
  'Assess the impact of EU sanctions on Russian energy exports',
  'How might the upcoming elections affect NATO alliance stability?',
];

const CATEGORY_TAGS = [
  'GEOPOLITICS', 'SECURITY', 'RISK MANAGEMENT', 'CONFLICT',
  'ECONOMICS', 'CYBER', 'CLIMATE', 'SUPPLY CHAINS',
];

function OmegaNovaPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simMode, setSimMode] = useState(true); // SIM mode on by default

  const handleSubmit = async () => {
    if (!query.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await api.post<{ id: string }>('/simulations', { query: query.trim() });
      navigate({ to: '/simulations/$id', params: { id: result.id } });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <div className="min-h-full" style={{ background: '#0a0e1a' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* ===== QUICK INSIGHTS BUTTON ===== */}
        <div>
          <Button variant="outline" className="gap-2 border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5">
            <Plus className="w-4 h-4" />
            Add Quick Insights
          </Button>
        </div>

        {/* ===== WEEKLY EXECUTIVE BRIEF ===== */}
        <WeeklyBriefCard />

        {/* ===== CATEGORY TAGS BAND ===== */}
        <div className="flex items-center justify-center py-4">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORY_TAGS.map((tag, idx) => (
              <span key={tag} className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold tracking-[0.15em] uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #C9A871, #D4B896)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {tag}
                </span>
                {idx < CATEGORY_TAGS.length - 1 && (
                  <span className="text-slate-600 text-xs">•</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ===== MAIN INPUT AREA ===== */}
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-1 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,113,0.2), rgba(201,168,113,0.05), rgba(201,168,113,0.2))',
              boxShadow: '0 0 40px rgba(201, 168, 113, 0.08)',
            }}
          >
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(10, 14, 23, 0.95)', backdropFilter: 'blur(20px)' }}
            >
              {/* Mode toggles */}
              <div className="flex items-center gap-2 mb-3">
                <Button
                  variant={simMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSimMode(true)}
                  className={`text-xs font-semibold ${simMode ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  SIM
                </Button>
                <Button
                  variant={!simMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSimMode(false)}
                  className={`text-xs font-semibold ${!simMode ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  TA
                </Button>
              </div>

              {/* Textarea */}
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask Omega Nova anything about global geopolitical intelligence..."
                rows={3}
                className="w-full bg-transparent text-white text-sm placeholder:text-slate-500 resize-none border-0 shadow-none focus-visible:ring-0"
              />

              {/* Bottom bar */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-600" />
                  <span className="text-[10px] text-slate-600">Powered by intelligence engines</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={!query.trim() || isSubmitting}
                  className="gap-2 disabled:opacity-30 transition-all"
                  style={{
                    background: query.trim() ? 'rgba(201, 168, 113, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: query.trim() ? '#C9A871' : '#64748b',
                    borderColor: query.trim() ? 'rgba(201, 168, 113, 0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {simMode ? 'Run Simulation' : 'Assess Threat'}
                </Button>
              </div>
            </div>
          </div>

          {/* Example prompts */}
          <div className="mt-4 space-y-2">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(prompt)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all group"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0 group-hover:text-amber-500/50 transition-colors" />
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{prompt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ===== PREMIUM FEATURES BUTTON ===== */}
        <div className="flex justify-center py-2">
          <Button
            variant="outline"
            className="gap-2 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,113,0.15), rgba(201,168,113,0.05))',
              borderColor: 'rgba(201, 168, 113, 0.25)',
              color: '#C9A871',
            }}
          >
            <Crown className="w-4 h-4" />
            Premium Features
          </Button>
        </div>

        {/* ===== INTELLIGENCE ENGINES CAROUSEL ===== */}
        <div>
          <IntelligenceEnginesCarousel />
        </div>
      </div>
    </div>
  );
}
