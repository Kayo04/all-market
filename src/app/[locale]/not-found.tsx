'use client';

import { usePathname } from 'next/navigation';

// Deliberately avoids next-intl's useLocale()/Link: this boundary can render
// before NextIntlClientProvider mounts (e.g. an invalid locale segment causes
// the locale layout to call notFound() before it returns any JSX), so it reads
// the locale straight off the URL instead of relying on that context.
export default function NotFound() {
  const pathname = usePathname();
  const locale: 'en' | 'pt' = pathname?.startsWith('/pt') ? 'pt' : 'en';

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto', padding: '140px 24px 100px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px' }}>
        404
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800,
        marginBottom: '10px', color: 'var(--text-primary)',
      }}>
        {locale === 'pt' ? 'Página não encontrada' : 'Page not found'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
        {locale === 'pt'
          ? 'A página que procuras não existe ou foi movida.'
          : "The page you're looking for doesn't exist or was moved."}
      </p>
      <a
        href={`/${locale}`}
        style={{
          display: 'inline-block', padding: '11px 22px', borderRadius: '10px',
          background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        {locale === 'pt' ? 'Voltar ao início' : 'Back to home'}
      </a>
    </div>
  );
}
