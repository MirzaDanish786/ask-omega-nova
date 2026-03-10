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
          ? 'border-slate-300 bg-white shadow-lg'
          : isCompleted
            ? 'border-green-200 bg-green-50/50'
            : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div className="p-5 flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
        ) : (
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {step}
          </div>
        )}
        <span className={`font-semibold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-slate-900">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome to Ask Omega Nova
          </h1>
          <p className="text-slate-500 mt-2">
            Initial system configuration and operator onboarding.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Onboarding Progress</span>
            <span className="text-slate-500 text-sm font-mono">{currentStep} / 4</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Step 1: Introduction */}
          <OnboardingStep step={1} currentStep={currentStep} title="Introduction & System Overview">
            <p className="text-slate-600 mb-4">
              Omega Nova is a predictive simulation system for geopolitical intelligence analysis.
              Please review the terms of service before proceeding.
            </p>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700 text-sm">
                  Terms of Service & Operational Protocols
                </span>
              </div>
              <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors">
                View Document
              </button>
            </div>
            <button
              onClick={nextStep}
              className="w-full mt-6 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Acknowledge & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </OnboardingStep>

          {/* Step 2: Operator Profile */}
          <OnboardingStep step={2} currentStep={currentStep} title="Operator Profile Setup">
            <p className="text-slate-600 mb-4">
              Select your primary operational role. This tailors the interface to your needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Analyst', 'Operator', 'Commander'].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedAccessLevel(level)}
                  className={`h-14 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all ${
                    selectedAccessLevel === level
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {level}
                </button>
              ))}
            </div>
            <button
              onClick={nextStep}
              className="w-full mt-6 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Set Profile & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </OnboardingStep>

          {/* Step 3: System Preferences */}
          <OnboardingStep step={3} currentStep={currentStep} title="System Preferences">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">API Mode</h4>
                <p className="text-slate-500 text-sm mb-3">
                  Choose how the system processes data. Efficient mode is recommended for most users.
                </p>
                <div className="flex gap-3">
                  {['Efficient', 'Real-Time'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedApiMode(mode)}
                      className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedApiMode === mode
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Server className="w-4 h-4" />
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Alert Notifications</h4>
                <p className="text-slate-500 text-sm mb-3">
                  Enable or disable real-time notifications for critical threat alerts.
                </p>
                <button
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all ${
                    alertsEnabled
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {alertsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
                </button>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="w-full mt-6 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Save Preferences & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </OnboardingStep>

          {/* Step 4: Final Confirmation */}
          <OnboardingStep step={4} currentStep={currentStep} title="Final Confirmation">
            <p className="text-slate-600 mb-4">
              You are now ready to access the Strategic Command interface. Your clearance level is
              set to{' '}
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200">
                {selectedAccessLevel}
              </span>
              .
            </p>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <h3 className="text-green-700 font-bold text-lg">Onboarding Complete</h3>
              <p className="text-green-600 text-sm mt-1">
                Click below to enter the platform.
              </p>
            </div>
            <button
              onClick={completeOnboarding}
              disabled={loading}
              className="w-full mt-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
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
      </div>
    </div>
  );
}
