"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PlaidContextType {
  isPlaidReady: boolean;
  plaidError: string | null;
}

const PlaidContext = createContext<PlaidContextType | null>(null);

export function PlaidProvider({ children }: { children: ReactNode }) {
  const [isPlaidReady, setIsPlaidReady] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Plaid is already available
    if (typeof window !== 'undefined' && window.Plaid) {
      console.log('[PlaidProvider] Plaid SDK already available');
      setIsPlaidReady(true);
      return;
    }

    // Listen for script load event (more reliable than polling)
    const handlePlaidReady = () => {
      if (window.Plaid) {
        console.log('[PlaidProvider] Plaid SDK loaded via DOMContentLoaded');
        setIsPlaidReady(true);
      }
    };

    // Also use the dynamic checking approach as fallback
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.Plaid) {
        console.log('[PlaidProvider] Plaid SDK detected after', attempts, 'attempts');
        setIsPlaidReady(true);
        clearInterval(checkInterval);
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        const errorMsg = 'Plaid SDK failed to load after 10 seconds';
        console.error('[PlaidProvider]', errorMsg);
        setPlaidError(errorMsg);
      }
    }, 100);

    document.addEventListener('DOMContentLoaded', handlePlaidReady);
    window.addEventListener('load', handlePlaidReady);

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('DOMContentLoaded', handlePlaidReady);
      window.removeEventListener('load', handlePlaidReady);
    };
  }, []);

  return (
    <PlaidContext.Provider value={{ isPlaidReady, plaidError }}>
      {children}
    </PlaidContext.Provider>
  );
}

export function usePlaidReady() {
  const context = useContext(PlaidContext);
  if (!context) {
    throw new Error('usePlaidReady must be used within PlaidProvider');
  }
  return context;
}
