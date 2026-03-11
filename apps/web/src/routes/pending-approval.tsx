import { createFileRoute, Navigate } from '@tanstack/react-router';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-5 bg-amber-50 border border-amber-200 shadow-sm">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pending Approval
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Your account request has been submitted
            </p>
          </CardHeader>

          <CardContent className="pt-2 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h3 className="text-amber-700 font-semibold text-base">Awaiting Administrator Review</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your email has been verified successfully. An administrator will review your
                access request and approve your account. You will receive an email notification
                once your account is activated.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-600 font-bold text-sm">
                    {(session.user.name?.charAt(0) || session.user.email.charAt(0)).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-medium text-sm truncate">{session.user.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{session.user.email}</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => signOut().then(() => window.location.href = '/login')}
              className="w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secured with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
