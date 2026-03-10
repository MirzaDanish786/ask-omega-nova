import { useState } from 'react';
import { Globe, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeeklyBriefProps {
  title?: string;
  dateRange?: { start: string; end: string };
  executiveOverview?: string;
  crossDomainConvergence?: string;
  lookingAhead?: string;
}

export function WeeklyBriefCard({
  title = 'Weekly Executive Brief',
  dateRange,
  executiveOverview,
  crossDomainConvergence,
  lookingAhead,
}: WeeklyBriefProps) {
  const [collapsed, setCollapsed] = useState(false);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const startDate = dateRange?.start || formatDate(weekStart);
  const endDate = dateRange?.end || formatDate(weekEnd);

  return (
    <Card className="rounded-2xl overflow-hidden bg-white border-slate-200/80 shadow-sm">
      <CardHeader
        className="flex flex-row items-center justify-between cursor-pointer py-4 px-6"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5" style={{ color: '#C9A871' }} />
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{startDate} — {endDate}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
          {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </Button>
      </CardHeader>

      {!collapsed && (
        <CardContent className="px-6 pb-6 space-y-4">
          {executiveOverview && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Executive Overview</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{executiveOverview}</p>
            </div>
          )}
          {crossDomainConvergence && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Cross-Domain Convergence</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{crossDomainConvergence}</p>
            </div>
          )}
          {lookingAhead && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Looking Ahead</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{lookingAhead}</p>
            </div>
          )}
          {!executiveOverview && !crossDomainConvergence && !lookingAhead && (
            <p className="text-sm text-slate-500 text-center py-4">
              Weekly executive brief will be available soon.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
