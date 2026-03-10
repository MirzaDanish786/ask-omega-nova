import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { forgetPassword, useSession } from '../lib/auth-client';
import { Shield, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 px-8 py-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-slate-900">
              <Shield className="w-9 h-9 text-white" />
            </div>

            {sent ? (
              <>
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-green-50 border border-green-200 mb-4">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Check Your Email</h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  If an account exists for <span className="font-medium text-slate-700">{email}</span>,
                  you will receive a password reset link shortly.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mt-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your email to receive a reset link
                </p>
              </>
            )}
          </div>

          {!sent && (
            <>
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="text-center mt-5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
