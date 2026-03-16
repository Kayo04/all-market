'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '40px 24px 20px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '32px',
        }}
      >
        {/* Brand */}
        <div style={{ maxWidth: '240px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            <span>needer</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            {t('tagline')}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('links')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {tn('home')}
            </Link>
            <Link href="/requests" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {tn('requests')}
            </Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('legal')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('privacy')}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('terms')}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('contact')}</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '32px auto 0',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-tertiary)',
        }}
      >
        © {new Date().getFullYear()} NEEDER. {t('rights')}
      </div>
    </footer>
  );
}
