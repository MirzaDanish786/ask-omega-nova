import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plane, Plus, MapPin, Calendar, Shield, AlertTriangle, ChevronRight, X } from 'lucide-react';

export const Route = createFileRoute('/travel')({
  component: TravelPage,
});

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

const SAMPLE_TRIPS: Trip[] = [
  { id: '1', destination: 'Istanbul, Turkey', startDate: '2026-03-15', endDate: '2026-03-20', riskLevel: 'MODERATE', status: 'UPCOMING' },
  { id: '2', destination: 'London, United Kingdom', startDate: '2026-04-01', endDate: '2026-04-05', riskLevel: 'LOW', status: 'UPCOMING' },
];

function getRiskColor(level: string) {
  switch (level) {
    case 'LOW': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
    case 'MODERATE': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'HIGH': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
    case 'CRITICAL': return { bg: 'bg-red-800/10', text: 'text-red-300', border: 'border-red-800/20' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
}

function TravelPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [trips] = useState<Trip[]>(SAMPLE_TRIPS);

  return (
    <div className="min-h-full" style={{ background: '#0a0e1a' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plane className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">Travel</h1>
            </div>
            <p className="text-sm text-slate-400">Plan safe travel with real-time risk intelligence</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>
        </div>

        {/* Trips list */}
        <div className="space-y-3">
          {trips.length === 0 ? (
            <div
              className="rounded-xl p-12 border text-center"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <Plane className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No trips planned yet. Create your first trip to get started.</p>
            </div>
          ) : (
            trips.map(trip => {
              const risk = getRiskColor(trip.riskLevel);
              return (
                <div
                  key={trip.id}
                  className="rounded-xl p-5 border transition-all hover:-translate-y-0.5 cursor-pointer group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{trip.destination}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {trip.startDate} — {trip.endDate}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${risk.bg} ${risk.text} border ${risk.border}`}>
                            {trip.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create trip modal placeholder */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
              className="w-full max-w-lg rounded-2xl p-6 border"
              style={{ background: 'rgba(15, 23, 42, 0.98)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Create New Trip</h2>
                <button onClick={() => setShowCreateForm(false)} className="p-1 rounded hover:bg-white/10">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Destination</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-700 text-white text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-slate-700 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 transition-colors mt-2">
                  Create Trip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
