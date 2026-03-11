import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { UserCheck, UserX, Loader2, Clock, Mail, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; user: PendingUser } | null>(null);

  const { data: pendingUsers, isLoading } = useQuery<PendingUser[]>({
    queryKey: ['admin', 'pending-users'],
    queryFn: () => api.get('/users/pending'),
    enabled: !!session?.user && isAdmin,
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction(null);
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!session?.user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="text-destructive p-8">Access denied.</div>;

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          Account Approvals
        </h1>
        <p className="text-muted-foreground text-sm mt-1 ml-[52px]">
          Review and approve pending user registrations
        </p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingUsers?.length ?? 0}</p>
              <p className="text-muted-foreground text-sm">Pending Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground ml-3">Loading pending requests...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pendingUsers?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-slate-900 font-semibold text-lg">All caught up!</h3>
            <p className="text-muted-foreground text-sm mt-1">No pending account requests at this time.</p>
          </CardContent>
        </Card>
      )}

      {/* Pending Users List */}
      <div className="space-y-3">
        {pendingUsers?.map(user => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-600 font-bold text-lg">
                      {(user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-900 font-medium truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <p className="text-muted-foreground text-sm truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.emailVerified
                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                            : 'border-amber-200 text-amber-700 bg-amber-50'
                        }`}
                      >
                        {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        Registered {new Date(user.createdAt).toLocaleDateString()} at{' '}
                        {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setConfirmAction({ type: 'approve', user })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setConfirmAction({ type: 'reject', user })}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    size="sm"
                  >
                    <UserX className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'approve' ? 'Approve User Account' : 'Reject User Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'approve' ? (
                <>
                  Are you sure you want to approve <strong>{confirmAction.user.name}</strong> ({confirmAction.user.email})?
                  They will receive an email notification and be able to log in to the platform.
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>{confirmAction?.user.name}</strong> ({confirmAction?.user.email})?
                  They will be notified that their account request was not approved.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === 'approve') {
                  approveMutation.mutate(confirmAction.user.id);
                } else {
                  rejectMutation.mutate(confirmAction.user.id);
                }
              }}
              disabled={isMutating}
              className={confirmAction?.type === 'approve'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmAction?.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
