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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-5 bg-slate-100 border border-slate-200 shadow-sm">
              <Shield className="w-10 h-10 text-slate-600" />
            </div>

            {sent ? (
              <>
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-emerald-50 border border-emerald-200 mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Check Your Email</h1>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  If an account exists for <span className="font-medium text-slate-900">{email}</span>,
                  you will receive a password reset link shortly.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mt-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                <p className="text-muted-foreground text-sm mt-1.5">
                  Enter your email to receive a reset link
                </p>
              </>
            )}
          </CardHeader>

          {!sent && (
            <CardContent className="pt-4">
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2"
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
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          )}
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
