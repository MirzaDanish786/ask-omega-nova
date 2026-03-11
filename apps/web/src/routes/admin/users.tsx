import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { Users, Search, Loader2, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
});

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  assignedModules: string[];
  monthlySimCount: number;
  simRateLimit: number;
  accountStatus: string;
  createdAt: string;
}

const ROLES = ['ADMIN', 'ALL_ACCESS', 'ANALYST', 'VIEWER'];

function AdminUsersPage() {
  const { data: session, isPending: authLoading } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [roleChange, setRoleChange] = useState<{ user: User; newRole: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; user: User } | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/users'),
    enabled: !!session?.user && isAdmin,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleChange(null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
      setConfirmAction(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] });
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

  const filteredUsers = users?.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1 ml-[52px]">
            Manage user roles and access permissions
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {users?.length ?? 0} users
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground ml-3">Loading users...</span>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Sims (Monthly)</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers?.map(user => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-slate-600 font-medium text-xs">
                            {(user.name?.charAt(0) || '?').toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={e => {
                          if (e.target.value !== user.role) {
                            setRoleChange({ user, newRole: e.target.value });
                          }
                        }}
                        className="px-2 py-1 rounded border border-input bg-background text-foreground text-xs cursor-pointer hover:border-slate-400 transition-colors"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.accountStatus === 'APPROVED'
                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                            : user.accountStatus === 'REJECTED'
                            ? 'border-red-200 text-red-700 bg-red-50'
                            : 'border-amber-200 text-amber-700 bg-amber-50'
                        }`}
                      >
                        {user.accountStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.monthlySimCount} / {user.simRateLimit}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user.accountStatus === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => setConfirmAction({ type: 'approve', user })}
                            className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmAction({ type: 'reject', user })}
                            className="h-7 px-2.5 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!isLoading && filteredUsers?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search ? 'No users match your search.' : 'No users found.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={!!roleChange} onOpenChange={(open) => { if (!open) setRoleChange(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the role of <strong>{roleChange?.user.name}</strong> ({roleChange?.user.email})
              from <Badge variant="outline" className="mx-1 text-xs">{roleChange?.user.role}</Badge>
              to <Badge variant="outline" className="mx-1 text-xs">{roleChange?.newRole}</Badge>?
              {roleChange?.newRole === 'ADMIN' && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: Admin users have full access to all features and user management.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={roleMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!roleChange) return;
                roleMutation.mutate({ id: roleChange.user.id, role: roleChange.newRole });
              }}
              disabled={roleMutation.isPending}
            >
              {roleMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Yes, Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve/Reject Confirmation Dialog */}
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
