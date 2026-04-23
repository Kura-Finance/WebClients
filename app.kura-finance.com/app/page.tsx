"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

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

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.push('/dashboard');
    }
  }, [authStatus, router]);

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

  // Show loading state
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

  // Show login page if unauthenticated
  if (authStatus === 'unauthenticated') {
    return (
      <div className="flex-1 flex justify-center items-center p-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-[#1A1A24] bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center">
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-white">Kura Finance</h1>
            <p className="text-sm text-gray-400 mb-8">
              Manage all your finances in one place
            </p>
            
            <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
              {/* Success Message */}
              {successMessage && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-xs text-green-400">
                  {successMessage}
                </div>
              )}

              {/* Mode Switcher */}
              {authMode !== 'forgot_password' && (
                <div className="flex items-center gap-2 text-xs bg-[#1A1A24] p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                      setSuccessMessage(null);
                      setRegistrationStep('request');
                      setRegistrationCode('');
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                      authMode === 'login'
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C4B5FD]'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                      setSuccessMessage(null);
                      setRegistrationStep('request');
                      setRegistrationCode('');
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                      authMode === 'register'
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C4B5FD]'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Forgot Password Header */}
              {authMode === 'forgot_password' && (
                <div className="text-left mb-6">
                  <h2 className="text-lg font-semibold text-white mb-1">Reset Password</h2>
                  <p className="text-xs text-gray-400">
                    {resetStep === 'request'
                      ? 'Enter your email to receive a verification code.'
                      : 'Enter the verification code and your new password.'}
                  </p>
                </div>
              )}

              {/* Email Input */}
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authMode === 'forgot_password' && resetStep === 'verify'}
                placeholder="Email"
                className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Verify Step Inputs */}
              {authMode === 'forgot_password' && resetStep === 'verify' && (
                <>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="6-digit Verification Code"
                    className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60 transition-colors"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60 transition-colors"
                  />
                </>
              )}

              {/* Password Input (Login/Register) */}
              {authMode !== 'forgot_password' && (
                <input
                  type="password"
                  name={authMode === 'register' ? 'new-password' : 'current-password'}
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60 transition-colors"
                />
              )}

              {/* Register Verify Step Input */}
              {authMode === 'register' && registrationStep === 'verify' && (
                <input
                  type="text"
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value)}
                  placeholder="6-digit Verification Code"
                  className="w-full rounded-xl bg-[#0B0B0F] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/60 transition-colors"
                />
              )}

              {/* Forgot Password Link */}
              {authMode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setAuthError(null);
                      setSuccessMessage(null);
                      setResetStep('request');
                    }}
                    className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Error Message */}
              {authError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400">
                  {authError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 mt-2 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#A78BFA] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {isAuthenticating
                  ? 'Processing...'
                  : authMode === 'forgot_password'
                  ? resetStep === 'request'
                    ? 'Send Code'
                    : 'Reset Password'
                  : authMode === 'register'
                  ? registrationStep === 'request'
                    ? 'Send Verification Code'
                    : 'Create Account'
                  : 'Sign In'}
              </button>

              {/* Back to Login Link */}
              {authMode === 'forgot_password' && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                      setSuccessMessage(null);
                      setResetStep('request');
                      setResetCode('');
                    }}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}