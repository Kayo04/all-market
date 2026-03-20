'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Wrench, Monitor, BookOpen, Heart, Briefcase, Palette } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: <Wrench size={28} strokeWidth={1.3} />,
    en: 'Home Repairs',
    pt: 'Reparações',
    descEN: 'Plumbers, electricians, painters & more',
    descPT: 'Canalizadores, eletricistas, pintores',
    key: 'home-repairs',
    color: '#fff9f0',
    iconColor: '#c97d30',
  },
  {
    icon: <Monitor size={28} strokeWidth={1.3} />,
    en: 'Tech & Digital',
    pt: 'Tecnologia',
    descEN: 'Websites, apps, social media & IT',
    descPT: 'Websites, apps, redes sociais e TI',
    key: 'tech-digital',
    color: '#f0f5ff',
    iconColor: '#3b6fd4',
  },
  {
    icon: <Heart size={28} strokeWidth={1.3} />,
    en: 'Wellness',
    pt: 'Bem-estar',
    descEN: 'Personal trainers, massage & health',
    descPT: 'Personal trainers, massagens e saúde',
    key: 'wellness',
    color: '#fff0f5',
    iconColor: '#c9336a',
  },
  {
    icon: <BookOpen size={28} strokeWidth={1.3} />,
    en: 'Tutoring',
    pt: 'Explicações',
    descEN: 'Languages, maths, music & prep',
    descPT: 'Línguas, matemática, música',
    key: 'tutoring',
    color: '#f0fbf5',
    iconColor: '#2e8c56',
  },
  {
    icon: <Briefcase size={28} strokeWidth={1.3} />,
    en: 'Business',
    pt: 'Negócios',
    descEN: 'Legal, accounting & consulting',
    descPT: 'Jurídico, contabilidade e consultoria',
    key: 'business',
    color: '#f5f0ff',
    iconColor: '#7c3dd4',
  },
  {
    icon: <Palette size={28} strokeWidth={1.3} />,
    en: 'Design',
    pt: 'Design',
    descEN: 'Logos, branding & creative work',
    descPT: 'Logótipos, branding e criatividade',
    key: 'design',
    color: '#fff0fb',
    iconColor: '#c9338c',
  },
];

export default function SimpleCategoryGrid() {
  const locale = useLocale();
  const isEN = locale !== 'pt';

  return (
    <section className="scg-section">
      <div className="scg-inner">
        <p className="scg-label">
          {isEN ? 'Explore services' : 'Explorar serviços'}
        </p>
        <div className="scg-grid">
          {HIGHLIGHTS.map((h) => (
            <Link key={h.key} href={`/requests?category=${h.key}`} className="scg-tile">
              <span className="scg-tile-icon" style={{ background: h.color, color: h.iconColor }}>
                {h.icon}
              </span>
              <span className="scg-tile-text">
                <span className="scg-tile-name">{isEN ? h.en : h.pt}</span>
                <span className="scg-tile-desc">{isEN ? h.descEN : h.descPT}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .scg-section {
          width: 100%;
          padding: 28px 0 24px;
        }

        .scg-inner {
          max-width: var(--grid-max);
          margin: 0 auto;
          padding: 0 var(--grid-px);
        }

        .scg-label {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
          margin-bottom: 14px;
        }

        .scg-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }

        .scg-tile {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          padding: 16px 14px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          text-decoration: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
          cursor: pointer;
        }
        .scg-tile:hover {
          border-color: var(--border-hover);
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }

        .scg-tile-icon {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .scg-tile-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .scg-tile-name {
          font-family: var(--font-sans);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .scg-tile-desc {
          font-family: var(--font-sans);
          font-size: 11.5px;
          font-weight: 400;
          color: var(--text-tertiary);
          line-height: 1.4;
        }

        /* Tablet: 3 cols */
        @media (max-width: 900px) {
          .scg-grid { grid-template-columns: repeat(3, 1fr); }
        }
        /* Mobile: 2 cols */
        @media (max-width: 540px) {
          .scg-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .scg-tile { padding: 12px 10px; }
          .scg-tile-icon { width: 38px; height: 38px; border-radius: 8px; }
          .scg-tile-name { font-size: 12.5px; }
          .scg-tile-desc { display: none; }
        }
      `}</style>
    </section>
  );
}
