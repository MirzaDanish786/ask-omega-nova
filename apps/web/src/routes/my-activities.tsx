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
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

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
    case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case 'RUNNING': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
    case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'RUNNING': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'FAILED': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
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
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ListTodo className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">My Activities</h1>
            </div>
            <p className="text-sm text-slate-500">Track and manage your simulation history</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">{filtered.length} simulations</Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search simulations..."
              className="pl-10"
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
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
            >
              <List className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No simulations found. Run your first simulation from the home page.</p>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filtered.map(sim => (
              <Link
                key={sim.id}
                to="/simulations/$id"
                params={{ id: sim.id }}
                className="block"
              >
                <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(sim.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-medium truncate group-hover:text-blue-600 transition-colors">
                        {sim.query}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">{formatDate(sim.createdAt)}</span>
                        {sim.tokensUsed && (
                          <span className="text-xs text-slate-400">{sim.tokensUsed} tokens</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(sim.status)}`}>
                      {sim.status}
                    </span>
                  </div>
                </Card>
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
                className="block"
              >
                <Card className="p-4 transition-all hover:-translate-y-1 hover:shadow-md group h-full">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(sim.status)}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(sim.status)}`}>
                      {sim.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-medium line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                    {sim.query}
                  </p>
                  <span className="text-xs text-slate-400">{formatDate(sim.createdAt)}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
