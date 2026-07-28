'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, Users, LineChart, CreditCard, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const FEATURE_ICONS = [Users, ShieldCheck, LineChart, CreditCard];

export default function NeederPro() {
  const t = useTranslations('proSection');

  return (
    <section className="np-section">
      <div className="np-container">

        {/* LEFT: Text content */}
        <div className="np-left">
          {/* Brand label */}
          <div className="np-brand">
            <span className="np-brand-name">needer</span>
            <span className="np-brand-tag"> pro.</span>
          </div>

          {/* Headline */}
          <h2 className="np-headline">
            {t('titlePrefix')}<em className="np-accent">{t('titleAccent')}</em>{t('titleSuffix')}
          </h2>

          {/* 4 Features as a simple list */}
          <div className="np-features">
            {[1, 2, 3, 4].map((n) => {
              const Icon = FEATURE_ICONS[n - 1];
              return (
                <div className="np-feat" key={n}>
                  <span className="np-feat-icon"><Icon size={17} strokeWidth={2} /></span>
                  <div>
                    <h3 className="np-feat-title">{t(`feat${n}.title`)}</h3>
                    <p className="np-feat-desc">{t(`feat${n}.desc`)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <Link href="/pro" className="np-cta">
            {t('apply')} <ArrowRight size={16} />
          </Link>
        </div>

        {/* RIGHT: an honest preview of the real public profile feature —
            not a fabricated stats dashboard */}
        <div className="np-right">
          <span className="np-preview-label">
            {t('previewLabel')}
          </span>

          <div className="np-card">
            <div className="np-card-top">
              <div className="np-avatar">A</div>
              <div className="np-card-id">
                <div className="np-card-name">
                  Ana Ferreira
                  <CheckCircle size={14} className="np-verified-icon" />
                </div>
                <div className="np-card-role">{t('previewRole')}</div>
              </div>
            </div>

            <div className="np-rating">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={13} className="np-star" fill={i < 5 ? 'currentColor' : 'none'} />
              ))}
              <span className="np-rating-num">4.9</span>
            </div>

            <div className="np-skills">
              <span className="np-skill">{t('previewSkill1')}</span>
              <span className="np-skill">{t('previewSkill2')}</span>
            </div>
          </div>

          {/* Second card peeking behind — subtle depth, not a chart */}
          <div className="np-card-back" />
        </div>
      </div>

      <style>{`
        .np-section {
          background: var(--bg-secondary);
          padding: 88px 0;
          overflow: hidden;
        }

        /* Grid-aligned container */
        .np-container {
          max-width: var(--grid-max);
          margin: 0 auto;
          padding: 0 var(--grid-px);
          display: flex;
          gap: 64px;
          align-items: center;
        }

        /* ── LEFT ── */
        .np-left {
          flex: 1 1 480px;
          min-width: 0;
        }

        .np-brand {
          display: flex;
          align-items: baseline;
          gap: 2px;
          margin-bottom: 22px;
        }
        .np-brand-name {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .np-brand-tag {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 400;
          font-style: italic;
          color: var(--text-tertiary);
        }

        .np-headline {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 40px;
        }
        .np-accent { color: var(--accent); font-style: italic; }

        /* Feature list */
        .np-features {
          display: flex;
          flex-direction: column;
          gap: 22px;
          margin-bottom: 36px;
        }
        .np-feat {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .np-feat-icon {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--accent-warm-light);
          color: var(--accent-warm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .np-feat-title {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .np-feat-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .np-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: white;
          padding: 13px 26px;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .np-cta:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        /* ── RIGHT ── */
        .np-right {
          flex: 0 0 380px;
          position: relative;
          padding-top: 8px;
        }

        .np-preview-label {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
          margin-bottom: 14px;
          margin-left: 4px;
        }

        .np-card-back {
          position: absolute;
          top: 44px;
          right: -12px;
          width: 90%;
          height: 88%;
          background: var(--accent-warm-light);
          border-radius: var(--radius-xl);
          z-index: 0;
          transform: rotate(3deg);
        }

        .np-card {
          position: relative;
          z-index: 1;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          padding: 28px 26px;
        }

        .np-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .np-avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent), #002b0d);
          color: #fff;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .np-card-name {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .np-verified-icon { color: var(--accent); flex-shrink: 0; }
        .np-card-role {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .np-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: var(--verified);
          margin-bottom: 16px;
        }
        .np-rating-num {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          margin-left: 6px;
        }

        .np-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .np-skill {
          font-size: 12.5px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          background: var(--accent-light);
          color: var(--accent);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .np-container {
            flex-direction: column;
            gap: 48px;
          }
          .np-right {
            flex: 1 1 auto;
            width: 100%;
            max-width: 380px;
          }
        }
        @media (max-width: 600px) {
          .np-section { padding: 56px 0; }
        }
      `}</style>
    </section>
  );
}
