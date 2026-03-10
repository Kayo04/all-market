'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section
      style={{
        padding: '32px 24px 40px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      <div style={{ maxWidth: '560px' }}>
        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '12px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          {t('title')}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(14px, 1.6vw, 16px)',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            lineHeight: 1.6,
          }}
        >
          {t('subtitle')}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/requests/new"
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background var(--transition-fast)',
            }}
          >
            {t('cta')}
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/auth/register"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              fontSize: '14px',
              textDecoration: 'none',
              border: '1px solid var(--border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            {t('ctaPro')}
          </Link>
        </div>
      </div>
    </section>
  );
}
