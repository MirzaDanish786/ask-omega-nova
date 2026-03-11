import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { UserCheck, UserX, Loader2, Clock, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/admin/approvals')({
  component: AdminApprovalsPage,
});

interface PendingUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  accountStatus: string;
  createdAt: string;
}

function AdminApprovalsPage() {
  const { data: session, isPending: authLoading } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const { data: pendingUsers, isLoading } = useQuery<PendingUser[]>({
    queryKey: ['admin', 'pending-users'],
    queryFn: () => api.get('/users/pending'),
    enabled: !!session?.user && isAdmin,
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  if (!session?.user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="text-destructive p-8">Access denied.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          Account Approvals
        </h1>
        <p className="text-slate-400 text-sm mt-1 ml-[52px]">
          Review and approve pending user registrations
        </p>
      </div>

      {/* Stats Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingUsers?.length ?? 0}</p>
              <p className="text-slate-400 text-sm">Pending Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-slate-400 ml-3">Loading pending requests...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pendingUsers?.length === 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="py-12 text-center">
            <UserCheck className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg">All caught up!</h3>
            <p className="text-slate-400 text-sm mt-1">No pending account requests at this time.</p>
          </CardContent>
        </Card>
      )}

      {/* Pending Users List */}
      <div className="space-y-3">
        {pendingUsers?.map(user => (
          <Card key={user.id} className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-lg">
                      {(user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <p className="text-slate-400 text-sm truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.emailVerified
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                            : 'border-amber-500/30 text-amber-400 bg-amber-500/5'
                        }`}
                      >
                        {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                      </Badge>
                      <span className="text-slate-600 text-xs">
                        Registered {new Date(user.createdAt).toLocaleDateString()} at{' '}
                        {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                    size="sm"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(user.id)}
                    disabled={rejectMutation.isPending}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                    size="sm"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserX className="w-4 h-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
