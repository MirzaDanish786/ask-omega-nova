import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';

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
  createdAt: string;
}

const ROLES = ['ADMIN', 'ALL_ACCESS', 'ANALYST', 'VIEWER'];

function AdminUsersPage() {
  const { data: session, isPending: authLoading } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/users'),
    enabled: !!session?.user && isAdmin,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  if (authLoading) return <div>Loading...</div>;
  if (!session?.user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="text-destructive">Access denied.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {isLoading && <p className="text-muted-foreground">Loading users...</p>}

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Sims (Monthly)</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={e => roleMutation.mutate({ id: user.id, role: e.target.value })}
                    className="px-2 py-1 rounded border border-input bg-background text-foreground text-xs"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.monthlySimCount} / {user.simRateLimit}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users?.length === 0 && (
        <p className="text-muted-foreground mt-4">No users found.</p>
      )}
    </div>
  );
}
