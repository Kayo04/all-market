'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Cookie } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const STORAGE_KEY = 'needer_cookie_notice_ack';

// We only ever set one cookie today — NextAuth's strictly-necessary session cookie —
// so this is a transparency notice, not an opt-in consent flow. If/when a non-essential
// cookie (analytics, ads, etc.) is added, this must become a real consent gate that
// blocks that script until the user opts in, with real category toggles.
export default function CookieBanner() {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // localStorage is only available post-mount; this is the one render where we
        // learn whether to show the banner, so the extra render here is unavoidable.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — skip showing rather than risk an error loop
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore — banner will just show again next visit, not harmful
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={locale === 'pt' ? 'Aviso de cookies' : 'Cookie notice'}
      style={{
        position: 'fixed',
        left: '16px',
        right: '16px',
        bottom: '16px',
        zIndex: 1000,
        maxWidth: '560px',
        margin: '0 auto',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        padding: '18px 20px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
      }}
    >
      <Cookie size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '10px' }}>
          {locale === 'pt'
            ? 'Usamos apenas o cookie estritamente necessário para manter a tua sessão iniciada. Não usamos cookies de publicidade ou análise.'
            : 'We use only the strictly necessary cookie that keeps you signed in. No advertising or analytics cookies.'}{' '}
          <Link href="/privacy#cookies" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {locale === 'pt' ? 'Saber mais' : 'Learn more'}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          style={{
            padding: '8px 18px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {locale === 'pt' ? 'Entendi' : 'Got it'}
        </button>
      </div>
    </div>
  );
}
