"use client";

import React, { useState } from 'react';
import Image from 'next/image';

type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown';

function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/windows|mac|linux/.test(userAgent)) return 'desktop';
  return 'unknown';
}

export default function DownloadPage() {
  const [deviceType] = useState<DeviceType>(detectDeviceType);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1A1A24] bg-[#0B0B0F]/80 backdrop-blur-md p-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Kura Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-lg font-bold">Kura</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {deviceType === 'ios' && (
          <div className="w-full max-w-md space-y-8">
            {/* iOS Content */}
            <div className="text-center space-y-4 mb-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/ios/AppIcon.appiconset/icon-180.png"
                  alt="Kura iOS App"
                  width={120}
                  height={120}
                  className="rounded-3xl shadow-2xl"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Kura Finance</h1>
              <p className="text-gray-400 text-lg">
                manage all your finances in one place, from traditional banking to crypto assets
              </p>
            </div>

            {/* Download Button */}
            <div className="space-y-4">
              <a
                href="https://apps.apple.com/app/kura-finance/id6503625647"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-[#8B5CF6] text-white text-lg font-semibold hover:bg-[#A78BFA] transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2.01.77-3.27.82-1.31.05-2.3-1.23-3.16-2.44-2.37-3.05-3.28-7.05-3.16-11.08C5.75 9.72 7.88 8.58 9.99 8.58c1.34 0 2.54.77 3.22.77.69 0 1.93-.77 3.25-.64 1.31.12 2.54.9 3.42 2.05.21.16.42.35.62.54-.25.18-.48.37-.7.58-1.56 1.52-1.84 4.29-.4 6.15z" />
                </svg>
                Download on the App Store
              </a>
              <p className="text-center text-sm text-gray-500">
                iOS 14.0 or later
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8 border-t border-white/10">
              <h2 className="text-xl font-bold">Features</h2>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Connect Bank Accounts (Plaid)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Real-time Transaction Tracking
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Crypto Asset Management
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Asset Analysis Dashboard
                </li>
              </ul>
            </div>
          </div>
        )}

        {deviceType === 'android' && (
          <div className="w-full max-w-md space-y-8">
            {/* Android Content */}
            <div className="text-center space-y-4 mb-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/android/mipmap-xxxhdpi/ic_launcher.png"
                  alt="Kura Android App"
                  width={120}
                  height={120}
                  className="rounded-3xl shadow-2xl"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Kura Finance</h1>
              <p className="text-gray-400 text-lg">
                Manage all your financial assets in one place, from traditional banking to crypto assets
              </p>
            </div>

            {/* Download Button */}
            <div className="space-y-4">
              <a
                href="https://play.google.com/store/apps/details?id=com.kurafinance.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-[#8B5CF6] text-white text-lg font-semibold hover:bg-[#A78BFA] transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13.5h8V3H3v10.5zm9.5-9v8.5h8V4.5h-8zm4.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM3 14.5h8v8H3v-8z" />
                </svg>
                Download on Google Play
              </a>
              <p className="text-center text-sm text-gray-500">
                Android 8.0 or later
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8 border-t border-white/10">
              <h2 className="text-xl font-bold">Features</h2>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Connect Bank Accounts (Plaid)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Real-time Transaction Tracking
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Crypto Asset Management
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6] text-xl">✓</span>
                  Asset Analysis Dashboard
                </li>
              </ul>
            </div>
          </div>
        )}

        {deviceType === 'desktop' && (
          <div className="w-full max-w-2xl space-y-8">
            {/* Desktop Content */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-5xl font-bold tracking-tight">Kura Finance</h1>
              <p className="text-gray-400 text-xl">
                Manage all your financial assets in one place, from traditional banking to crypto assets
              </p>
            </div>

            {/* Platform Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* iOS Card */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-8 space-y-6 hover:border-[#8B5CF6]/30 transition-colors">
                <div className="flex justify-center">
                  <Image
                    src="/ios/AppIcon.appiconset/icon-180.png"
                    alt="Kura iOS App"
                    width={100}
                    height={100}
                    className="rounded-2xl"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">iOS</h2>
                  <p className="text-gray-400">iPhone and iPad</p>
                </div>
                <a
                  href="https://apps.apple.com/app/kura-finance/id6503625647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors text-center"
                >
                  Download on the App Store
                </a>
              </div>

              {/* Android Card */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-8 space-y-6 hover:border-[#8B5CF6]/30 transition-colors">
                <div className="flex justify-center">
                  <Image
                    src="/android/mipmap-xxxhdpi/ic_launcher.png"
                    alt="Kura Android App"
                    width={100}
                    height={100}
                    className="rounded-2xl"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Android</h2>
                  <p className="text-gray-400">Android phones and tablets</p>
                </div>
                <a
                  href="https://play.google.com/store/apps/details?id=com.kurafinance.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors text-center"
                >
                  Download on Google Play
                </a>
              </div>
            </div>

            {/* Web App Info */}
            <div className="rounded-3xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-8 text-center space-y-3">
              <h2 className="text-xl font-bold">Or Use the Web App</h2>
              <p className="text-gray-400">
                You can also access the Kura Finance web version directly in your browser
              </p>
              <a
                href="/dashboard"
                className="inline-block py-3 px-8 rounded-xl bg-[#8B5CF6] text-white font-semibold hover:bg-[#A78BFA] transition-colors"
              >
                Enter Web App
              </a>
            </div>
          </div>
        )}

        {deviceType === 'unknown' && (
          <div className="w-full max-w-md text-center space-y-6">
            <h1 className="text-4xl font-bold">Kura Finance</h1>
            <p className="text-gray-400 text-lg">
              Download our app or use the web version to manage all your finances in one place, from traditional banking to crypto assets
            </p>
            <div className="rounded-2xl border border-white/10 p-6 bg-white/5 space-y-4">
              <div className="text-gray-500">Detecting device...</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1A24] bg-[#0B0B0F]/50 p-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          © 2026 Kura Finance. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
