"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';

export default function SecurityPage() {
  const router = useRouter();
  const userEmail = useAppStore((state) => state.userProfile.email);
  const requestPasswordReset = useAppStore((state) => state.requestPasswordReset);
  const changePassword = useAppStore((state) => state.changePassword);

  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!userEmail) {
      setErrorMessage('Email is missing in your profile.');
      return;
    }

    if (step === 'request') {
      try {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        await requestPasswordReset(userEmail);
        setStep('verify');
        setSuccessMessage('Verification code sent to your email.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send verification code.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!resetCode.trim()) {
      setErrorMessage('Verification code is required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      await changePassword(resetCode.trim(), newPassword);
      setStep('request');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pb-10 px-8 pt-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 px-0 text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)] hover:bg-transparent"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-[var(--kura-text)]">Security Settings</h1>
          <p className="text-[var(--kura-text-secondary)] mt-2">Manage your password security settings</p>
        </div>

        {successMessage && (
          <Alert variant="success" className="mb-6">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Your account’s first line of defence. Make sure it’s unique, impossible to guess, and stored safely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--kura-text)] mb-2">Email</label>
              <Input type="email" value={userEmail} disabled className="text-[var(--kura-text-secondary)]" />
            </div>

            {step === 'verify' && (
              <div>
                <label className="block text-sm font-medium text-[var(--kura-text)] mb-2">Verification Code</label>
                <Input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="6-digit verification code"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--kura-text)] mb-2">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
              <p className="text-[var(--kura-text-secondary)] text-sm mt-2">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--kura-text)] mb-2">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setErrorMessage('');
                  setSuccessMessage('');
                  setStep('request');
                  setResetCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={isLoading}>
                {isLoading
                  ? step === 'request'
                    ? 'Sending...'
                    : 'Changing...'
                  : step === 'request'
                    ? 'Send Verification Code'
                    : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
