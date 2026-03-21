'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'EUR' | 'USD' | 'GBP';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
}

const SYMBOLS: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£' };

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'EUR',
  setCurrency: () => {},
  symbol: '€',
});

function detectCurrency(): Currency {
  if (typeof navigator === 'undefined') return 'EUR';
  const lang = navigator.language || '';
  if (lang.startsWith('en-US')) return 'USD';
  if (lang.startsWith('en-GB')) return 'GBP';
  return 'EUR';
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR');

  // On mount: load from localStorage or auto-detect from browser locale
  useEffect(() => {
    const saved = localStorage.getItem('needer_currency') as Currency | null;
    if (saved && ['EUR', 'USD', 'GBP'].includes(saved)) {
      setCurrencyState(saved);
    } else {
      setCurrencyState(detectCurrency());
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('needer_currency', c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol: SYMBOLS[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
