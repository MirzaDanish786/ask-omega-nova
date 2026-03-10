import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useSession } from '../lib/auth-client';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
    <Card
      className={`transition-all duration-500 ${
        isActive
          ? 'border-blue-500/40 bg-[#0d1525] shadow-lg shadow-blue-500/5'
          : isCompleted
            ? 'border-green-500/20 bg-[#0d1525]/50'
            : 'border-slate-700/30 bg-[#0d1525]/30'
      }`}
    >
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-3 text-base">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
          ) : (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {step}
            </div>
          )}
          <span className={isActive ? 'text-white' : 'text-slate-400'}>{title}</span>
        </CardTitle>
      </CardHeader>
      {isActive && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  );
}

function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('Operator');
  const [selectedApiMode, setSelectedApiMode] = useState('Efficient');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-[#0f2438] to-[#17314d] border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Welcome to Omega Nova
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Initial system configuration and operator onboarding.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Onboarding Progress</span>
            <span className="text-slate-400 text-sm font-mono">{currentStep} / 4</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
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
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-slate-200">
                  Terms of Service & Operational Protocols
                </span>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                View Document
              </Button>
            </div>
            <Button
              onClick={nextStep}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500"
              size="lg"
            >
              Acknowledge & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </OnboardingStep>

          {/* Step 2: Operator Profile */}
          <OnboardingStep step={2} currentStep={currentStep} title="Operator Profile Setup">
            <p className="text-slate-400 mb-4">
              Select your primary operational role. This tailors the interface to your needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Analyst', 'Operator', 'Commander'].map(level => (
                <Button
                  key={level}
                  onClick={() => setSelectedAccessLevel(level)}
                  variant={selectedAccessLevel === level ? 'default' : 'outline'}
                  className={`h-14 ${
                    selectedAccessLevel === level
                      ? 'bg-blue-600 hover:bg-blue-500 border-blue-500'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {level}
                </Button>
              ))}
            </div>
            <Button
              onClick={nextStep}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500"
              size="lg"
            >
              Set Profile & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
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
                    <Button
                      key={mode}
                      onClick={() => setSelectedApiMode(mode)}
                      variant={selectedApiMode === mode ? 'default' : 'outline'}
                      className={`flex-1 ${
                        selectedApiMode === mode
                          ? 'bg-blue-600 hover:bg-blue-500 border-blue-500'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <Server className="w-4 h-4" />
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Alert Notifications</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Enable or disable real-time notifications for critical threat alerts.
                </p>
                <Button
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  variant={alertsEnabled ? 'default' : 'outline'}
                  className={`w-full ${
                    alertsEnabled
                      ? 'bg-blue-600 hover:bg-blue-500 border-blue-500'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {alertsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
                </Button>
              </div>
            </div>
            <Button
              onClick={nextStep}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500"
              size="lg"
            >
              Save Preferences & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </OnboardingStep>

          {/* Step 4: Final Confirmation */}
          <OnboardingStep step={4} currentStep={currentStep} title="Final Confirmation">
            <p className="text-slate-400 mb-4">
              You are now ready to access the Strategic Command interface. Your clearance level is
              set to <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{selectedAccessLevel}</Badge>.
            </p>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <h3 className="text-green-400 font-bold text-lg">Onboarding Complete</h3>
              <p className="text-green-400/70 text-sm mt-1">
                Click below to enter the platform.
              </p>
            </div>
            <Button
              onClick={completeOnboarding}
              disabled={loading}
              className="w-full mt-6 bg-green-600 hover:bg-green-500"
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
      </div>
    </div>
  );
}
