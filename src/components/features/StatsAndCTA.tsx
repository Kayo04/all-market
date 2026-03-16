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
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '48px',
          }}
        >
          {stats.map((stat) => (
            <div key={stat.key} style={{ textAlign: 'center', flex: '0 1 auto' }}>
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
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 700,
              marginBottom: '16px',
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
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/requests/new"
              style={{
                padding: '10px 20px',
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              {tc('clientBtn')}
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/auth/register"
              style={{
                padding: '10px 20px',
                background: '#ffffff',
                color: '#000000',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '14px',
                textDecoration: 'none',
                border: '1px solid #000000',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#000000';
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#ffffff';
                (e.currentTarget as HTMLElement).style.color = '#000000';
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
