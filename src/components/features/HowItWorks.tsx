'use client';

import { useTranslations } from 'next-intl';
import { FileText, MessageSquare, CheckCircle } from 'lucide-react';

const steps = [
  { icon: FileText, key: 'step1', num: '01' },
  { icon: MessageSquare, key: 'step2', num: '02' },
  { icon: CheckCircle, key: 'step3', num: '03' },
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
          fontSize: '36px',
          fontWeight: 700,
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
          gap: '1px',
          background: 'var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              style={{
                background: 'var(--bg-card)',
                padding: '36px 28px',
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
                color="var(--accent)"
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
