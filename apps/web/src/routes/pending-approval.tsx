import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { useSession, signOut } from '../lib/auth-client';
import { Shield, Loader2, Lock, Clock, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/pending-approval')({
  component: PendingApprovalPage,
});

function PendingApprovalPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 shadow-2xl shadow-black/40">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Pending Approval
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Your account request has been submitted
            </p>
          </CardHeader>

          <CardContent className="pt-2 space-y-6">
            <Card className="bg-amber-500/5 border-amber-500/20">
              <div className="p-5 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-amber-400 font-semibold text-base">Awaiting Administrator Review</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your email has been verified successfully. An administrator will review your
                  access request and approve your account. You will receive an email notification
                  once your account is activated.
                </p>
              </div>
            </Card>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm">
                    {(session.user.name?.charAt(0) || session.user.email.charAt(0)).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{session.user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{session.user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => signOut().then(() => window.location.href = '/login')}
                className="w-full border-slate-600/50 text-slate-400 hover:text-white hover:border-slate-500"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secured with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
