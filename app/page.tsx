"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import logoIcon from './logo.webp';
import referPreview from './refer.webp';

export default function RootHubPage() {
  const authStatus = useAppStore((state) => state.authStatus);
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [registrationStep, setRegistrationStep] = useState<'request' | 'verify'>('request');
  const [registrationCode, setRegistrationCode] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetCode, setResetCode] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const login = useAppStore((state) => state.login);
  const setPlaidLinkToken = useAppStore((state) => state.setPlaidLinkToken);
  const requestPasswordReset = useAppStore((state) => state.requestPasswordReset);
  const resetPassword = useAppStore((state) => state.resetPassword);
  const requestRegistrationCode = useAppStore((state) => state.requestRegistrationCode);
  const verifyRegistration = useAppStore((state) => state.verifyRegistration);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.push('/dashboard');
    }
  }, [authStatus, router]);

  const resetToLogin = () => {
    setAuthMode('login');
    setAuthError(null);
    setSuccessMessage(null);
    setResetStep('request');
    setResetCode('');
    setRegistrationStep('request');
    setRegistrationCode('');
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);

    if (authMode === 'forgot_password') {
      if (resetStep === 'request') {
        if (!email) {
          setAuthError('Email is required.');
          return;
        }
        setIsAuthenticating(true);
        try {
          await requestPasswordReset(email.trim());
          setResetStep('verify');
          setSuccessMessage('Verification code sent to your email.');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send reset code.';
          setAuthError(message);
        } finally {
          setIsAuthenticating(false);
        }
      } else {
        if (!resetCode || !password) {
          setAuthError('Verification code and new password are required.');
          return;
        }
        setIsAuthenticating(true);
        try {
          await resetPassword(email.trim(), resetCode.trim(), password);
          setAuthMode('login');
          setResetStep('request');
          setResetCode('');
          setPassword('');
          setSuccessMessage('Password reset successfully. Please sign in with your new password.');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Password reset failed.';
          setAuthError(message);
        } finally {
          setIsAuthenticating(false);
        }
      }
      return;
    }

    setIsAuthenticating(true);

    try {
      if (authMode === 'register') {
        if (registrationStep === 'request') {
          if (!email) {
            setAuthError('Email is required.');
            return;
          }
          await requestRegistrationCode(email.trim());
          setRegistrationStep('verify');
          setSuccessMessage('Verification code sent to your email.');
          return;
        }

        if (!email || !password) {
          setAuthError('Email and password are required.');
          return;
        }

        if (password.length < 8) {
          setAuthError('Password must be at least 8 characters.');
          return;
        }

        if (!registrationCode.trim()) {
          setAuthError('Verification code is required.');
          return;
        }

        await verifyRegistration(email.trim(), password, registrationCode.trim());
        setRegistrationStep('request');
        setRegistrationCode('');
      } else {
        if (!email || !password) {
          setAuthError('Email and password are required.');
          return;
        }
        await login(email.trim(), password);
      }

      setPlaidLinkToken(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex-1 flex justify-center items-center p-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B5CF6]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    const isRegister = authMode === 'register';
    const isForgotPassword = authMode === 'forgot_password';

    return (
      <div className="min-h-screen w-full bg-[#F1F0F6] text-[#1F2937] px-6 py-6 md:px-8 flex flex-col">
        <header className="w-full flex items-center justify-between">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <Image src={logoIcon} alt="Kura icon" width={28} height={28} className="object-cover" />
          </div>
          <a
            href="https://kura-finance.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#4B5563] hover:text-[#111827] transition-colors inline-flex items-center gap-1 px-4 h-9 rounded-full border border-[#D7D7E2] bg-[#F8F8FC] hover:bg-white"          >
            Official Website
          </a>
        </header>

        <div className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-[760px] rounded-xl border border-[#DDDDE8] bg-[#F7F7FA] overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <section className="bg-[#F6F6F7] p-7 md:p-8 border-b md:border-b-0 md:border-r border-[#DDDDE8]">
              <h1 className="text-[30px] leading-none font-semibold tracking-tight mb-6">
                {isForgotPassword ? 'Reset password' : isRegister ? 'Sign up' : 'Log in'}
              </h1>

              <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
                {successMessage && (
                  <Alert variant="success" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {isForgotPassword && (
                  <p className="text-xs text-[#6B7280]">
                    {resetStep === 'request'
                      ? 'Enter your email to receive a verification code.'
                      : 'Enter the verification code and your new password.'}
                  </p>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B7280]">Email</label>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isForgotPassword && resetStep === 'verify'}
                    placeholder="you@example.com"
                    className="h-11 border-[#DADCE5] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#A8B0FF]"
                  />
                </div>

                {isForgotPassword && resetStep === 'verify' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#6B7280]">Verification code</label>
                      <Input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="6-digit verification code"
                        className="h-11 border-[#DADCE5] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#A8B0FF]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#6B7280]">New password</label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a new password"
                        className="h-11 border-[#DADCE5] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#A8B0FF]"
                      />
                    </div>
                  </>
                )}

                {!isForgotPassword && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#6B7280]">Password</label>
                    <Input
                      type="password"
                      name={isRegister ? 'new-password' : 'current-password'}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isRegister ? 'Create password' : 'Enter password'}
                      className="h-11 border-[#DADCE5] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#A8B0FF]"
                    />
                  </div>
                )}

                {isRegister && registrationStep === 'verify' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#6B7280]">Verification code</label>
                    <Input
                      type="text"
                      value={registrationCode}
                      onChange={(e) => setRegistrationCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="h-11 border-[#DADCE5] bg-white text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#A8B0FF]"
                    />
                  </div>
                )}

                <div className="min-h-6 flex items-center">
                  {!isForgotPassword && authMode === 'login' ? (
                    <Button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot_password');
                        setAuthError(null);
                        setSuccessMessage(null);
                        setResetStep('request');
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-[#6B7280] hover:text-[#374151] hover:bg-transparent"
                    >
                      Forgot password?
                    </Button>
                  ) : (
                    <span className="text-xs text-transparent select-none">Forgot password?</span>
                  )}
                </div>

                {authError && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}

                <div className="border-t border-[#E4E5EC] pt-4 space-y-3">
                  <Button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full h-11 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-sm disabled:bg-[#AEB4D9] disabled:text-white/80"
                  >
                    {isAuthenticating
                      ? 'Processing...'
                      : isForgotPassword
                        ? resetStep === 'request'
                          ? 'Send code'
                          : 'Reset password'
                        : isRegister
                          ? registrationStep === 'request'
                            ? 'Send verification code'
                            : 'Create account'
                          : 'Log in'}
                  </Button>

                  {isForgotPassword ? (
                    <Button
                      type="button"
                      onClick={resetToLogin}
                      variant="ghost"
                    className="w-full h-10 rounded-xl border border-[#DADCE5] bg-white text-[#4B5563] hover:text-[#374151] hover:bg-[#F3F4F6]"
                    >
                      Back to log in
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setAuthMode(isRegister ? 'login' : 'register');
                        setAuthError(null);
                        setSuccessMessage(null);
                        setRegistrationStep('request');
                        setRegistrationCode('');
                      }}
                      variant="ghost"
                    className="w-full h-10 rounded-xl border border-[#DADCE5] bg-white text-[#4B5563] hover:text-[#374151] hover:bg-[#F3F4F6]"
                    >
                      {isRegister ? 'Switch to log in' : 'Switch to sign up'}
                    </Button>
                  )}
                </div>
              </form>
            </section>

            <aside className="p-7 md:p-8 bg-[#F3F3F8]">
              <h2 className="text-xl font-semibold mb-2">Refer Friends. Earn 10% Lifetime. Protect More Privacy.</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                Invite your friends to Kura Finance and earn 10% lifetime commission every time they subscribe to Pro or Ultimate — while they get a full month of Pro for free.
              </p>

              <div className="rounded-xl border border-[#DADCE5] bg-white overflow-hidden h-44 relative">
                <Image src={referPreview} alt="Refer preview" fill className="object-cover" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
