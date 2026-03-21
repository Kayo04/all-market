'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { X, Check } from 'lucide-react';
import { useCurrency, Currency } from '@/context/CurrencyContext';

interface Props {
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
];

const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
];

export default function PreferencesModal({ onClose }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [tab, setTab] = useState<'language' | 'currency'>('language');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const switchLocale = (code: string) => {
    router.replace(pathname, { locale: code });
    onClose();
  };

  const switchCurrency = (c: Currency) => {
    setCurrency(c);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Modal */}
        <div style={{
          background: '#ffffff', borderRadius: '12px',
          width: '440px', maxWidth: '90vw',
          padding: '28px 32px 32px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}>
          {/* Title + close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>
              Select your preferences
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8e8e8', marginBottom: '20px' }}>
            {(['language', 'currency'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 0',
                  marginRight: '24px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '15px', fontWeight: 500,
                  color: tab === t ? '#003912' : '#777',
                  borderBottom: tab === t ? '2px solid #003912' : '2px solid transparent',
                  marginBottom: '-1px',
                  textTransform: 'capitalize',
                  transition: 'color 0.15s ease',
                }}
              >
                {t === 'language' ? 'Language' : 'Currency'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'language' ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {LANGUAGES.map((lang) => {
                const active = locale === lang.code;
                return (
                  <li key={lang.code}>
                    <button
                      onClick={() => switchLocale(lang.code)}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 8px', background: 'none', border: 'none',
                        cursor: 'pointer', borderRadius: '8px',
                        fontSize: '15px', color: active ? '#1a1a1a' : '#444',
                        fontWeight: active ? 600 : 400,
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = '#f5f5f5'; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = 'none'; }}
                    >
                      <span style={{ width: '16px', color: '#003912', flexShrink: 0 }}>
                        {active && <Check size={15} strokeWidth={2.5} />}
                      </span>
                      {lang.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {CURRENCIES.map((cur) => {
                const active = currency === cur.code;
                return (
                  <li key={cur.code}>
                    <button
                      onClick={() => switchCurrency(cur.code)}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 8px', background: 'none', border: 'none',
                        cursor: 'pointer', borderRadius: '8px',
                        fontSize: '15px', color: active ? '#1a1a1a' : '#444',
                        fontWeight: active ? 600 : 400,
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = '#f5f5f5'; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = 'none'; }}
                    >
                      <span style={{ width: '16px', color: '#003912', flexShrink: 0 }}>
                        {active && <Check size={15} strokeWidth={2.5} />}
                      </span>
                      <span style={{ fontWeight: 600, minWidth: '32px', color: '#555' }}>{cur.symbol}</span>
                      {cur.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
