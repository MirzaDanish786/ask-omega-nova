import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { resetPassword } from '../lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({ newPassword: password });
      if (result.error) {
        setError(result.error.message ?? 'Failed to reset password');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate({ to: '/login' }), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-[#0f2438] to-[#17314d] border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Omega Nova</h1>
          <p className="text-sm text-slate-400 mt-1">Intelligence Analysis Platform</p>
        </div>

        {/* Card */}
        <Card className="bg-[#0d1525] border-slate-700/50 shadow-2xl shadow-black/50">
          {success ? (
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <CardTitle className="text-lg text-white">Password Reset Successful</CardTitle>
                <p className="text-sm text-slate-400">
                  Your password has been updated. Redirecting to sign in...
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go to Sign In
                </Link>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-lg text-white">Set New Password</CardTitle>
                <CardDescription>
                  Enter your new password below. Must be at least 8 characters.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">New Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-10 pr-10 bg-[#0a1020] border-slate-600/50 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50"
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm" className="text-slate-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        id="confirm"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-10 bg-[#0a1020] border-slate-600/50 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
