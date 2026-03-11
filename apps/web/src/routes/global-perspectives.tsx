import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Globe, MessageSquare, Sparkles, Send, ChevronDown } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

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
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900">Global Perspectives</h1>
          </div>
          <p className="text-sm text-slate-500">Comparative analysis across nations, doctrines, and strategic frameworks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: World map placeholder + country selector */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map placeholder */}
            <Card className="overflow-hidden">
              <div className="aspect-[16/9] flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Interactive world map</p>
                  <p className="text-slate-400 text-xs mt-1">Select countries below for comparative analysis</p>
                </div>
              </div>
            </Card>

            {/* Country selector */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Select Countries</h3>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map(country => (
                  <button
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCountries.includes(country)
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </Card>

            {/* Analysis input */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Custom Analysis Prompt</h3>
              <div className="flex gap-2">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your analysis question..."
                  rows={3}
                  className="flex-1"
                />
                <Button className="self-end bg-purple-600 hover:bg-purple-700 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: Guided Questions Panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-slate-900">Guided Questions</h3>
              </div>
              <div className="space-y-2">
                {GUIDED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(q)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-slate-300 mt-0.5 flex-shrink-0 group-hover:text-purple-500" />
                      <span>{q}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Filters */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Perspective Filters</h3>
              <div className="space-y-3">
                {['Strategic Doctrine', 'Regime Type', 'Historical Weights'].map(filter => (
                  <div key={filter}>
                    <label className="text-xs text-slate-500 mb-1 block">{filter}</label>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
                      All
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
