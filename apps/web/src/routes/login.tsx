import { createFileRoute, useNavigate, Navigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { signIn, signUp, useSession } from '../lib/auth-client';
import { Shield, Loader2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      if (isSignUp) {
        const result = await signUp.email({ email, password, name });
        if (result.error) {
          setError(result.error.message ?? 'Sign up failed');
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? 'Sign in failed');
          return;
        }
      }
      navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-700/50 shadow-2xl shadow-black/40">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500/30 shadow-lg shadow-blue-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Omega Nova
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              {isSignUp ? 'Create your secure account' : 'Strategic Command Access'}
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Full Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                    <Input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required={isSignUp}
                      className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

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

              <div className="space-y-1.5">
                <Label className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10 pr-11 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50"
                    placeholder="••••••••"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20 mt-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSignUp ? 'Creating account...' : 'Authenticating...'}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    {isSignUp ? 'Create Account' : 'Access System'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-0">
            {/* Divider */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-slate-700/50" />
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-between w-full">
              <Link
                to="/forgot-password"
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </Link>
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isSignUp ? (
                  <>Have an account? <span className="font-semibold text-blue-400">Sign in</span></>
                ) : (
                  <>Need an account? <span className="font-semibold text-blue-400">Sign up</span></>
                )}
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Bottom security badge */}
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
