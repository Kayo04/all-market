'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, Users, LineChart, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

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
            {t('title').split('premium')[0]}
            <span className="np-accent">premium</span>{' '}
            {t('title').split('premium')[1] || ''}
          </h2>

          {/* 4 Features in 2-column grid */}
          <div className="np-features">
            <div className="np-feat">
              <Users size={22} className="np-feat-icon" />
              <h3 className="np-feat-title">{t('feat1.title')}</h3>
              <p className="np-feat-desc">{t('feat1.desc')}</p>
            </div>
            <div className="np-feat">
              <ShieldCheck size={22} className="np-feat-icon" />
              <h3 className="np-feat-title">{t('feat2.title')}</h3>
              <p className="np-feat-desc">{t('feat2.desc')}</p>
            </div>
            <div className="np-feat">
              <LineChart size={22} className="np-feat-icon" />
              <h3 className="np-feat-title">{t('feat3.title')}</h3>
              <p className="np-feat-desc">{t('feat3.desc')}</p>
            </div>
            <div className="np-feat">
              <CreditCard size={22} className="np-feat-icon" />
              <h3 className="np-feat-title">{t('feat4.title')}</h3>
              <p className="np-feat-desc">{t('feat4.desc')}</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/pro/apply"
            className="np-cta"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#000'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#404145'; }}
          >
            {t('apply')} <ArrowRight size={16} />
          </Link>
        </div>

        {/* RIGHT: Visual card mockup (matching reference image) */}
        <div className="np-right">
          {/* Floating "Project Status" badge */}
          <div className="np-badge">
            <div className="np-badge-ring">
              <svg viewBox="0 0 36 36" className="np-ring-svg">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#eee" strokeWidth="3.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#003912" strokeWidth="3.5" strokeDasharray="92, 100" />
              </svg>
              <span className="np-ring-pct">92%</span>
            </div>
            <div>
              <div className="np-badge-title">Project Status</div>
              <div className="np-badge-sub">4 steps out of 5</div>
            </div>
          </div>

          {/* Main card */}
          <div className="np-card">
            {/* Chart area */}
            <div className="np-chart-wrap">
              <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="np-chart-svg">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#003912" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#003912" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d="M0,80 L0,50 C30,55 60,35 90,28 C120,21 150,15 200,10 L200,80 Z" fill="url(#chartGrad)" />
                <path d="M0,50 C30,55 60,35 90,28 C120,21 150,15 200,10" fill="none" stroke="#003912" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Stats row */}
            <div className="np-stats">
              <div className="np-stat">
                <span className="np-stat-num">98%</span>
                <span className="np-stat-lbl">Client satisfaction</span>
              </div>
              <div className="np-stat-div" />
              <div className="np-stat">
                <span className="np-stat-num">3.2k</span>
                <span className="np-stat-lbl">Active projects</span>
              </div>
              <div className="np-stat-div" />
              <div className="np-stat">
                <span className="np-stat-num">24h</span>
                <span className="np-stat-lbl">Avg. response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .np-section {
          background: #f0f4f2;
          padding: 80px 0;
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
          margin-bottom: 20px;
        }
        .np-brand-name {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
          color: #404145;
          letter-spacing: -0.02em;
        }
        .np-brand-tag {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 400;
          color: #8b8b94;
        }

        .np-headline {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #404145;
          margin-bottom: 40px;
        }
        .np-accent { color: #003912; }

        /* 2-col feature grid */
        .np-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px 40px;
          margin-bottom: 36px;
        }
        .np-feat { display: flex; flex-direction: column; gap: 8px; }
        .np-feat-icon { color: #003912; }
        .np-feat-title {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 600;
          color: #404145;
        }
        .np-feat-desc {
          font-size: 14px;
          color: #62646a;
          line-height: 1.5;
        }

        .np-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #404145;
          color: white;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: background 0.2s;
        }

        /* ── RIGHT ── */
        .np-right {
          flex: 0 0 420px;
          position: relative;
          padding-top: 40px;
        }

        /* Floating badge */
        .np-badge {
          position: absolute;
          top: 0;
          right: 24px;
          background: white;
          padding: 14px 18px;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14);
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 10;
        }
        .np-badge-ring {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }
        .np-ring-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .np-ring-pct {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #404145;
        }
        .np-badge-title {
          font-size: 14px;
          font-weight: 700;
          color: #404145;
          white-space: nowrap;
        }
        .np-badge-sub {
          font-size: 12px;
          color: #8b8b94;
        }

        /* Main white card */
        .np-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          overflow: hidden;
          padding: 32px 28px 28px;
        }

        .np-chart-wrap {
          width: 100%;
          height: 140px;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fdf9;
          margin-bottom: 24px;
        }
        .np-chart-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .np-stats {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .np-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 8px;
        }
        .np-stat-num {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: #404145;
          line-height: 1;
        }
        .np-stat-lbl {
          font-size: 11.5px;
          color: #8b8b94;
          text-align: center;
        }
        .np-stat-div {
          width: 1px;
          height: 40px;
          background: #e4e5e7;
          flex-shrink: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .np-container {
            flex-direction: column;
            gap: 40px;
          }
          .np-right {
            flex: 1 1 auto;
            width: 100%;
          }
        }
        @media (max-width: 600px) {
          .np-features {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .np-headline { margin-bottom: 28px; }
          .np-section { padding: 48px 0; }
          .np-badge { right: 16px; top: -10px; padding: 10px 14px; }
          .np-right { padding-top: 30px; }
          .np-card { padding: 24px 20px 20px; }
          .np-chart-wrap { height: 110px; }
        }
        @media (max-width: 500px) {
          .np-features { grid-template-columns: 1fr; }
          .np-badge { right: 16px; }
        }
      `}</style>
    </section>
  );
}
