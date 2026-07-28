'use client';

import { useTranslations } from 'next-intl';
import { Euro, Zap, ShieldCheck } from 'lucide-react';

const steps = [
  { icon: Euro, key: 'step1', num: '01', color: 'var(--accent)' },
  { icon: Zap, key: 'step2', num: '02', color: 'var(--accent-warm)' },
  { icon: ShieldCheck, key: 'step3', num: '03', color: 'var(--accent)' },
];

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px, 4vw, 40px)',
          fontWeight: 600,
          marginBottom: '48px',
          letterSpacing: '-0.02em',
          textAlign: 'center',
        }}
      >
        {t('title')}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 28px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Step {step.num}
                </span>
              </div>

              <Icon
                size={20}
                color={step.color}
                style={{ marginBottom: '12px' }}
              />

              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  letterSpacing: '-0.01em',
                }}
              >
                {t(`${step.key}Title`)}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {t(`${step.key}Desc`)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
