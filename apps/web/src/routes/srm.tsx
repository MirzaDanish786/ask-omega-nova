import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ShieldCheck, Building, AlertTriangle, ChevronRight, BarChart3 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const Route = createFileRoute('/srm')({
  component: SRMCenterPage,
});

const TABS = ['Overview', 'Assessments', 'Controls', 'Documents', 'Review', 'Events'];

const TRACKS = [
  {
    id: 'corporate',
    title: 'Corporate Track',
    description: 'Standard organizational resilience assessment aligned with international frameworks.',
    icon: Building,
  },
  {
    id: 'high-risk',
    title: 'High-Risk Track',
    description: 'Advanced assessment for organizations operating in elevated threat environments.',
    icon: AlertTriangle,
  },
];

function SRMCenterPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">SRM Center</h1>
          </div>
          <p className="text-sm text-slate-500">Strategic Resilience Maturity — Assess, benchmark, and strengthen your operational resilience.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-slate-900 border-emerald-600'
                  : 'text-slate-400 border-transparent hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Track selection */}
        {activeTab === 'Overview' && !selectedTrack && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Select Assessment Track</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRACKS.map(track => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className="text-left rounded-xl p-6 border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-md group"
                >
                  <div className="flex items-start justify-between">
                    <track.icon className="w-8 h-8 text-emerald-600 mb-3" />
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{track.title}</h3>
                  <p className="text-sm text-slate-500">{track.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Overview' && selectedTrack && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTrack(null)}
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Back to tracks
              </button>
            </div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedTrack === 'corporate' ? 'Corporate' : 'High-Risk'} Assessment
                </h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Begin your resilience maturity assessment. Select your industry and proceed through domain-specific evaluation questions.
              </p>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Start Assessment
              </Button>
            </Card>
          </div>
        )}

        {activeTab !== 'Overview' && (
          <Card className="p-8 text-center">
            <p className="text-slate-500">{activeTab} section coming soon.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
