'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default function PreFooterCTA() {
  const t = useTranslations('preFooter');

  return (
    <section>
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #1b3a24, #003912)',
        padding: '88px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '36px'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 50px)',
          fontWeight: 600,
          fontStyle: 'italic',
          color: '#fdfbf6',
          letterSpacing: '-0.01em',
          maxWidth: '760px',
          margin: 0,
          lineHeight: 1.15
        }}>
          {t('title')}
        </h2>

        <Link
          href="/auth/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fdfbf6',
            color: '#003912',
            padding: '14px 32px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'all 0.2s',
            border: '2px solid #fdfbf6'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#fdfbf6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#fdfbf6';
            (e.currentTarget as HTMLElement).style.color = '#003912';
          }}
        >
          {t('cta')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
