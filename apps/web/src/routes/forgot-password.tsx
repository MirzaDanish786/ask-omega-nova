import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { forgetPassword, useSession } from '../lib/auth-client';
import { Shield, Mail, Loader2, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session?.user) return <Navigate to="/" />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await forgetPassword({
        email,
        redirectTo: '/reset-password',
      });
      if (result.error) {
        setError(result.error.message ?? 'Failed to send reset email');
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 shadow-2xl shadow-black/40">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500/30 shadow-lg shadow-blue-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>

            {sent ? (
              <>
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  If an account exists for <span className="font-medium text-slate-200">{email}</span>,
                  you will receive a password reset link shortly.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors mt-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                <p className="text-muted-foreground text-sm mt-1.5">
                  Enter your email to receive a reset link
                </p>
              </>
            )}
          </CardHeader>

          {!sent && (
            <CardContent className="pt-4">
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20 mt-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="text-center mt-5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          )}
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
