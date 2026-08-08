'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale: 'en' | 'pt' = pathname?.startsWith('/pt') ? 'pt' : 'en';

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto', padding: '140px 24px 100px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800,
        marginBottom: '10px', color: 'var(--text-primary)',
      }}>
        {locale === 'pt' ? 'Algo correu mal' : 'Something went wrong'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
        {locale === 'pt'
          ? 'Ocorreu um erro inesperado. Tenta novamente.'
          : 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '11px 22px', borderRadius: '10px',
          background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 600,
          border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}
      >
        {locale === 'pt' ? 'Tentar novamente' : 'Try again'}
      </button>
    </div>
  );
}
