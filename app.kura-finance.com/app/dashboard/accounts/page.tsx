"use client";

import React from 'react';

export default function AccountsPage() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8B5CF6]/20 mb-6">
          <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6h-6" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Coming Soon</h1>
        <p className="text-gray-400 text-lg">Accounts management is under development</p>
        <p className="text-gray-500 text-sm mt-4">We&apos;re working hard to bring you this feature</p>
      </div>
    </div>
  );
}
