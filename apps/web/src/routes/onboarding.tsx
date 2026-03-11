import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useSession } from '../lib/auth-client';
import { api } from '../lib/api';
import {
  Shield,
  BookOpen,
  UserCheck,
  Server,
  Bell,
  CheckCircle,
  Loader2,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingStep({
  step,
  currentStep,
  title,
  children,
}: {
  step: number;
  currentStep: number;
  title: string;
  children: React.ReactNode;
}) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div
      className={`rounded-xl border transition-all duration-500 ${
        isActive
          ? 'border-blue-500/40 bg-slate-800/60 shadow-lg shadow-blue-500/5'
          : isCompleted
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-slate-700/50 bg-slate-800/30'
      }`}
    >
      <div className="p-5 flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
        ) : (
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {step}
          </div>
        )}
        <span className={`font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>
          {title}
        </span>
      </div>
      {isActive && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('Operator');
  const [selectedApiMode, setSelectedApiMode] = useState('Efficient');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!session?.user) return <Navigate to="/login" />;

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me', {
        onboardingCompleted: true,
        accessLevel: selectedAccessLevel,
        apiMode: selectedApiMode,
        alertsEnabled,
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome to Ask Omega Nova
          </h1>
          <p className="text-slate-400 mt-2">
            Initial system configuration and operator onboarding.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Onboarding Progress</span>
            <span className="text-slate-400 text-sm font-mono">{currentStep} / 4</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Step 1: Introduction */}
          <OnboardingStep step={1} currentStep={currentStep} title="Introduction & System Overview">
            <p className="text-slate-400 mb-4">
              Omega Nova is a predictive simulation system for geopolitical intelligence analysis.
              Please review the terms of service before proceeding.
            </p>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-300 text-sm">
                  Terms of Service & Operational Protocols
                </span>
              </div>
              <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-600/50 text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                View Document
              </button>
            </div>
            <button
              onClick={nextStep}
              className="w-full mt-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20"
            >
              Acknowledge & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </OnboardingStep>

          {/* Step 2: Operator Profile */}
          <OnboardingStep step={2} currentStep={currentStep} title="Operator Profile Setup">
            <p className="text-slate-400 mb-4">
              Select your primary operational role. This tailors the interface to your needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Analyst', 'Operator', 'Commander'].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedAccessLevel(level)}
                  className={`h-14 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all ${
                    selectedAccessLevel === level
                      ? 'bg-blue-600 border-blue-500/50 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {level}
                </button>
              ))}
            </div>
            <button
              onClick={nextStep}
              className="w-full mt-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20"
            >
              Set Profile & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </OnboardingStep>

          {/* Step 3: System Preferences */}
          <OnboardingStep step={3} currentStep={currentStep} title="System Preferences">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-1">API Mode</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Choose how the system processes data. Efficient mode is recommended for most users.
                </p>
                <div className="flex gap-3">
                  {['Efficient', 'Real-Time'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedApiMode(mode)}
                      className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedApiMode === mode
                          ? 'bg-blue-600 border-blue-500/50 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <Server className="w-4 h-4" />
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Alert Notifications</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Enable or disable real-time notifications for critical threat alerts.
                </p>
                <button
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all ${
                    alertsEnabled
                      ? 'bg-blue-600 border-blue-500/50 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {alertsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
                </button>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="w-full mt-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-500 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20"
            >
              Save Preferences & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </OnboardingStep>

          {/* Step 4: Final Confirmation */}
          <OnboardingStep step={4} currentStep={currentStep} title="Final Confirmation">
            <p className="text-slate-400 mb-4">
              You are now ready to access the Strategic Command interface. Your clearance level is
              set to{' '}
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-sm font-semibold border border-blue-500/30">
                {selectedAccessLevel}
              </span>
              .
            </p>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
              <h3 className="text-emerald-400 font-bold text-lg">Onboarding Complete</h3>
              <p className="text-emerald-400/70 text-sm mt-1">
                Click below to enter the platform.
              </p>
            </div>
            <button
              onClick={completeOnboarding}
              disabled={loading}
              className="w-full mt-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Enter Strategic Command
                </>
              )}
            </button>
          </OnboardingStep>
        </div>

        {/* Bottom security badge */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secured with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
