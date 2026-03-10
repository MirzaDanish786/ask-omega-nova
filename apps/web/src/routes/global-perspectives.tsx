import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Globe, MessageSquare, Sparkles, Send, ChevronDown } from 'lucide-react';

export const Route = createFileRoute('/global-perspectives')({
  component: GlobalPerspectivesPage,
});

const GUIDED_QUESTIONS = [
  'Compare strategic doctrine shifts between Russia and China in the last 12 months',
  'How might a change in US trade policy affect European defense spending?',
  'Assess the risk of climate-driven migration on EU border stability',
  'What are the implications of the latest BRICS expansion on global trade?',
  'Evaluate cyber threat escalation patterns in the Indo-Pacific region',
];

const COUNTRIES = [
  'United States', 'China', 'Russia', 'United Kingdom', 'France', 'Germany',
  'India', 'Japan', 'Brazil', 'Turkey', 'Iran', 'Saudi Arabia', 'Israel',
  'South Korea', 'Australia', 'Nigeria', 'South Africa', 'Egypt',
];

function GlobalPerspectivesPage() {
  const [query, setQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  return (
    <div className="min-h-full" style={{ background: '#0a0e1a' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Global Perspectives</h1>
          </div>
          <p className="text-sm text-slate-400">Comparative analysis across nations, doctrines, and strategic frameworks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: World map placeholder + country selector */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map placeholder */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="aspect-[16/9] flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Interactive world map</p>
                  <p className="text-slate-600 text-xs mt-1">Select countries below for comparative analysis</p>
                </div>
              </div>
            </div>

            {/* Country selector */}
            <div
              className="rounded-xl p-4 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <h3 className="text-sm font-semibold text-white mb-3">Select Countries</h3>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map(country => (
                  <button
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCountries.includes(country)
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-slate-300'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis input */}
            <div
              className="rounded-xl p-4 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <h3 className="text-sm font-semibold text-white mb-3">Custom Analysis Prompt</h3>
              <div className="flex gap-2">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your analysis question..."
                  rows={3}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-slate-700 text-white text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
                <button className="self-end px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Guided Questions Panel */}
          <div className="space-y-4">
            <div
              className="rounded-xl p-4 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Guided Questions</h3>
              </div>
              <div className="space-y-2">
                {GUIDED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(q)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0 group-hover:text-purple-400" />
                      <span>{q}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters placeholder */}
            <div
              className="rounded-xl p-4 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <h3 className="text-sm font-semibold text-white mb-3">Perspective Filters</h3>
              <div className="space-y-3">
                {['Strategic Doctrine', 'Regime Type', 'Historical Weights'].map(filter => (
                  <div key={filter}>
                    <label className="text-xs text-slate-400 mb-1 block">{filter}</label>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-slate-700 text-sm text-slate-300">
                      All
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
