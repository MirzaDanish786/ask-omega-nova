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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
    <Card
      className={`transition-all duration-500 ${
        isActive
          ? 'border-blue-300 bg-blue-50/50 shadow-md'
          : isCompleted
            ? 'border-emerald-200 bg-emerald-50/50'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="p-5 flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
        ) : (
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {step}
          </div>
        )}
        <span className={`font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
          {title}
        </span>
      </div>
      {isActive && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-5 bg-slate-100 border border-slate-200 shadow-sm">
            <Shield className="w-10 h-10 text-slate-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome to Ask Omega Nova
          </h1>
          <p className="text-muted-foreground mt-2">
            Initial system configuration and operator onboarding.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm font-medium">Onboarding Progress</span>
            <span className="text-muted-foreground text-sm font-mono">{currentStep} / 4</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Onboarding Steps */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Step 1: Introduction */}
          <OnboardingStep step={1} currentStep={currentStep} title="Introduction & System Overview">
            <p className="text-slate-600 mb-4">
              Omega Nova is a predictive simulation system for geopolitical intelligence analysis.
              Please review the terms of service before proceeding.
            </p>
            <Card className="bg-slate-50 border-slate-200">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-700 text-sm">
                    Terms of Service & Operational Protocols
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  View Document
                </Button>
              </div>
            </Card>
            <Button onClick={nextStep} className="w-full mt-6" size="lg">
              Acknowledge & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </OnboardingStep>

          {/* Step 2: Operator Profile */}
          <OnboardingStep step={2} currentStep={currentStep} title="Operator Profile Setup">
            <p className="text-slate-600 mb-4">
              Select your primary operational role. This tailors the interface to your needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Analyst', 'Operator', 'Commander'].map(level => (
                <Button
                  key={level}
                  variant={selectedAccessLevel === level ? 'default' : 'outline'}
                  onClick={() => setSelectedAccessLevel(level)}
                  className="h-14"
                >
                  <UserCheck className="w-4 h-4" />
                  {level}
                </Button>
              ))}
            </div>
            <Button onClick={nextStep} className="w-full mt-6" size="lg">
              Set Profile & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </OnboardingStep>

          {/* Step 3: System Preferences */}
          <OnboardingStep step={3} currentStep={currentStep} title="System Preferences">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">API Mode</h4>
                <p className="text-slate-600 text-sm mb-3">
                  Choose how the system processes data. Efficient mode is recommended for most users.
                </p>
                <div className="flex gap-3">
                  {['Efficient', 'Real-Time'].map(mode => (
                    <Button
                      key={mode}
                      variant={selectedApiMode === mode ? 'default' : 'outline'}
                      onClick={() => setSelectedApiMode(mode)}
                      className="flex-1"
                    >
                      <Server className="w-4 h-4" />
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Alert Notifications</h4>
                <p className="text-slate-600 text-sm mb-3">
                  Enable or disable real-time notifications for critical threat alerts.
                </p>
                <Button
                  variant={alertsEnabled ? 'default' : 'outline'}
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className="w-full"
                >
                  <Bell className="w-4 h-4" />
                  {alertsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
                </Button>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full mt-6" size="lg">
              Save Preferences & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </OnboardingStep>

          {/* Step 4: Final Confirmation */}
          <OnboardingStep step={4} currentStep={currentStep} title="Final Confirmation">
            <p className="text-slate-600 mb-4">
              You are now ready to access the Strategic Command interface. Your clearance level is
              set to{' '}
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200">
                {selectedAccessLevel}
              </span>
              .
            </p>
            <Card className="bg-emerald-50 border-emerald-200">
              <div className="p-4 text-center">
                <h3 className="text-emerald-700 font-bold text-lg">Onboarding Complete</h3>
                <p className="text-emerald-600 text-sm mt-1">
                  Click below to enter the platform.
                </p>
              </div>
            </Card>
            <Button
              onClick={completeOnboarding}
              disabled={loading}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
              size="lg"
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
            </Button>
          </OnboardingStep>
        </div>

        {/* Bottom security badge */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secured with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
