import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  ListTodo,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Pin,
  Filter,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';

export const Route = createFileRoute('/my-activities')({
  component: MyActivitiesPage,
});

interface Simulation {
  id: string;
  query: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  tokensUsed?: number;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'RUNNING': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    case 'PENDING': return <Clock className="w-4 h-4 text-amber-400" />;
    case 'FAILED': return <XCircle className="w-4 h-4 text-red-400" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'RUNNING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'FAILED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

function MyActivitiesPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    api.get<Simulation[]>('/simulations')
      .then(setSimulations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = simulations.filter(s => {
    const matchesSearch = s.query.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-full" style={{ background: '#0a0e1a' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ListTodo className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">My Activities</h1>
            </div>
            <p className="text-sm text-slate-400">Track and manage your simulation history</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{filtered.length} simulations</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search simulations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-slate-700 text-white text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            {['all', 'COMPLETED', 'RUNNING', 'PENDING', 'FAILED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10' : ''}`}
            >
              <List className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10' : ''}`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-xl p-12 border text-center"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <ListTodo className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No simulations found. Run your first simulation from the home page.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filtered.map(sim => (
              <Link
                key={sim.id}
                to="/simulations/$id"
                params={{ id: sim.id }}
                className="block rounded-xl p-4 border transition-all hover:-translate-y-0.5 group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(sim.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate group-hover:text-blue-300 transition-colors">
                      {sim.query}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{formatDate(sim.createdAt)}</span>
                      {sim.tokensUsed && (
                        <span className="text-xs text-slate-600">{sim.tokensUsed} tokens</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(sim.status)}`}>
                    {sim.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(sim => (
              <Link
                key={sim.id}
                to="/simulations/$id"
                params={{ id: sim.id }}
                className="block rounded-xl p-4 border transition-all hover:-translate-y-1 group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(sim.status)}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(sim.status)}`}>
                    {sim.status}
                  </span>
                </div>
                <p className="text-sm text-white font-medium line-clamp-2 group-hover:text-blue-300 transition-colors mb-2">
                  {sim.query}
                </p>
                <span className="text-xs text-slate-500">{formatDate(sim.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
