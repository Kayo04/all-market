'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

export default function StatsAndCTA() {
  const ts = useTranslations('stats');
  const tc = useTranslations('cta');

  const stats = [
    { key: 'requests', value: '2,400+' },
    { key: 'professionals', value: '850+' },
    { key: 'categories', value: '6' },
    { key: 'satisfaction', value: '98%' },
  ];

  return (
    <>
      {/* Stats */}
      <section
        style={{
          padding: '48px 24px',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {stats.map((stat) => (
            <div key={stat.key} style={{ textAlign: 'center', flex: '1 1 120px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  marginBottom: '4px',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                {ts(stat.key)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: 700,
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            {tc('title')}
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              marginBottom: '28px',
              lineHeight: 1.7,
            }}
          >
            {tc('subtitle')}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
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
              }}
            >
              {tc('clientBtn')}
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/auth/register"
              style={{
                padding: '10px 20px',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              {tc('proBtn')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
