'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Wrench, Briefcase, Gamepad2, Car } from 'lucide-react';

const CASES = [
  {
    icon: <Wrench size={20} strokeWidth={1.5} />,
    labelEN: 'Local Service',
    labelPT: 'Serviço Local',
    queryEN: 'I need an electrician\nin Porto, ASAP.',
    queryPT: 'Preciso de um eletricista\nem Porto, urgente.',
    color: '#fff7ed',
    iconBg: '#f97316',
    href: '/requests/new?category=home-repairs',
  },
  {
    icon: <Briefcase size={20} strokeWidth={1.5} />,
    labelEN: 'Professional Hire',
    labelPT: 'Contratação',
    queryEN: 'I need a Marketing\nDirector for 3 months.',
    queryPT: 'Preciso de um Diretor\nde Marketing por 3 meses.',
    color: '#eff6ff',
    iconBg: '#3b82f6',
    href: '/requests/new?category=business',
  },
  {
    icon: <Gamepad2 size={20} strokeWidth={1.5} />,
    labelEN: 'Buy a Product',
    labelPT: 'Comprar Produto',
    queryEN: 'Looking for a PS4\nunder €400.',
    queryPT: 'Quero uma PS4\naté 400€.',
    color: '#f0fdf4',
    iconBg: '#22c55e',
    href: '/requests/new?category=equipment',
  },
  {
    icon: <Car size={20} strokeWidth={1.5} />,
    labelEN: 'Big Purchase',
    labelPT: 'Grande Compra',
    queryEN: 'Looking for a BMW\nSeries 1, under €15k.',
    queryPT: 'Quero um BMW\nSérie 1, até 15.000€.',
    color: '#fdf4ff',
    iconBg: '#a855f7',
    href: '/requests/new?category=automotive',
  },
];

export default function UseCaseShowcase() {
  const locale = useLocale();
  const isEN = locale !== 'pt';

  return (
    <section className="uc-section">
      <div className="uc-inner">
        {/* Outer container */}
        <div className="uc-box">
          {/* Header */}
          <div className="uc-box-header">
            <p className="uc-box-label">
              {isEN ? 'What can you post?' : 'O que podes publicar?'}
            </p>
            <p className="uc-box-sub">
              {isEN
                ? 'Services, professionals or products — any need, any budget.'
                : 'Serviços, profissionais ou produtos — qualquer necessidade, qualquer orçamento.'}
            </p>
          </div>

          {/* 2×2 grid of use-case cards */}
          <div className="uc-grid">
            {CASES.map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="uc-card"
              >
                {/* Icon pill */}
                <span className="uc-card-icon" style={{ background: c.iconBg }}>
                  {c.icon}
                </span>
                {/* Type label */}
                <span className="uc-card-type">
                  {isEN ? c.labelEN : c.labelPT}
                </span>
                {/* Example query — the "post" */}
                <span className="uc-card-query">
                  {isEN ? c.queryEN : c.queryPT}
                </span>
                {/* Subtle CTA */}
                <span className="uc-card-cta">
                  {isEN ? 'Post this →' : 'Publicar →'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .uc-section {
          width: 100%;
          padding: 28px 0 32px;
        }

        .uc-inner {
          max-width: var(--grid-max);
          margin: 0 auto;
          padding: 0 var(--grid-px);
        }

        /* Outer container — single rounded card */
        .uc-box {
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 28px;
          background: var(--bg-primary);
        }

        .uc-box-header {
          margin-bottom: 20px;
        }

        .uc-box-label {
          font-family: var(--font-sans);
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .uc-box-sub {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.4;
        }

        /* 2×2 grid */
        .uc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Each use-case card — square shaped, uniform light green */
        .uc-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 24px;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid transparent;
          background: #e8f5ee;
          aspect-ratio: 1 / 1;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
          cursor: pointer;
        }
        .uc-card:hover {
          border-color: rgba(0,0,0,0.10);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        /* Coloured icon pill */
        .uc-card-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        /* Small "type" label */
        .uc-card-type {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-tertiary);
        }

        /* The example "post" text — looks like a real request */
        .uc-card-query {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
          white-space: pre-line;
        }

        /* Subtle "Post this →" link */
        .uc-card-cta {
          font-family: var(--font-sans);
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-tertiary);
          margin-top: auto;
          transition: color 0.15s ease;
        }
        .uc-card:hover .uc-card-cta {
          color: var(--text-primary);
        }

        /* Tablet: keep 2 cols but reduce padding */
        @media (max-width: 768px) {
          .uc-box { padding: 20px; }
          .uc-card { padding: 16px; gap: 8px; }
          .uc-card-query { font-size: 13.5px; }
        }

        /* Mobile: stack to 1 col */
        @media (max-width: 480px) {
          .uc-grid { grid-template-columns: 1fr; }
          .uc-box { padding: 16px; border-radius: 14px; }
        }
      `}</style>
    </section>
  );
}
