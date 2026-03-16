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
        background: '#4a0b12', /* Deep dark burgundy */
        padding: '80px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '48px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          maxWidth: '800px',
          margin: 0,
          lineHeight: 1.1
        }}>
          {t('title')}
        </h2>
        
        <Link
          href="/auth/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            color: '#4a0b12',
            padding: '14px 32px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'all 0.2s',
            border: '2px solid #ffffff'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#ffffff';
            (e.currentTarget as HTMLElement).style.color = '#4a0b12';
          }}
        >
          {t('cta')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
