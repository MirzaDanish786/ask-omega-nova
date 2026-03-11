import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Plane, Plus, MapPin, Calendar, Shield, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

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
    case 'LOW': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    case 'MODERATE': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'HIGH': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'CRITICAL': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  }
}

function TravelPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [trips] = useState<Trip[]>(SAMPLE_TRIPS);

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plane className="w-6 h-6 text-cyan-600" />
              <h1 className="text-2xl font-bold text-slate-900">Travel</h1>
            </div>
            <p className="text-sm text-slate-500">Plan safe travel with real-time risk intelligence</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Button>
        </div>

        {/* Trips list */}
        <div className="space-y-3">
          {trips.length === 0 ? (
            <Card className="p-12 text-center">
              <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No trips planned yet. Create your first trip to get started.</p>
            </Card>
          ) : (
            trips.map(trip => {
              const risk = getRiskColor(trip.riskLevel);
              return (
                <Card
                  key={trip.id}
                  className="p-5 transition-all hover:-translate-y-0.5 cursor-pointer group hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{trip.destination}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {trip.startDate} — {trip.endDate}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${risk.bg} ${risk.text} border ${risk.border}`}>
                            {trip.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-600 transition-colors" />
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Create trip modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Create New Trip</h2>
                <button onClick={() => setShowCreateForm(false)} className="p-1 rounded hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700">Destination</Label>
                  <Input placeholder="City, Country" className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-700">Start Date</Label>
                    <Input type="date" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-slate-700">End Date</Label>
                    <Input type="date" className="mt-1.5" />
                  </div>
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-2">
                  Create Trip
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
