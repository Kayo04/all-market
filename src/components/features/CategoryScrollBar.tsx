'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  Wrench, Monitor, BookOpen, PartyPopper, Heart,
  ShoppingCart, Briefcase, Palette, PenLine, Sparkles, Car, Scissors,
} from 'lucide-react';

// Icons mapped to category keys
const CAT_ITEMS = [
  { key: 'home-repairs',   iconEN: 'Home Repairs',       iconPT: 'Reparações',       Icon: Wrench },
  { key: 'tech-digital',   iconEN: 'Tech & Digital',     iconPT: 'Tecnologia',       Icon: Monitor },
  { key: 'tutoring',       iconEN: 'Tutoring',           iconPT: 'Explicações',      Icon: BookOpen },
  { key: 'events',         iconEN: 'Events & Parties',   iconPT: 'Eventos',          Icon: PartyPopper },
  { key: 'wellness',       iconEN: 'Wellness',           iconPT: 'Bem-estar',        Icon: Heart },
  { key: 'equipment',      iconEN: 'Buy Equipment',      iconPT: 'Equipamentos',     Icon: ShoppingCart },
  { key: 'business',       iconEN: 'Business',           iconPT: 'Negócios',         Icon: Briefcase },
  { key: 'design',         iconEN: 'Design & Creative',  iconPT: 'Design',           Icon: Palette },
  { key: 'writing',        iconEN: 'Writing',            iconPT: 'Escrita',          Icon: PenLine },
  { key: 'cleaning',       iconEN: 'Cleaning',           iconPT: 'Limpeza',          Icon: Sparkles },
  { key: 'automotive',     iconEN: 'Automotive',         iconPT: 'Automóvel',        Icon: Car },
  { key: 'beauty',         iconEN: 'Beauty',             iconPT: 'Beleza',           Icon: Scissors },
];

export default function CategoryScrollBar() {
  const locale = useLocale();
  const isEN = locale !== 'pt';

  return (
    <nav className="csb-nav" aria-label={isEN ? 'Browse categories' : 'Ver categorias'}>
      <div className="csb-inner">
        <div className="csb-track">
          {CAT_ITEMS.map((cat) => {
            const { Icon } = cat;
            return (
              <Link
                key={cat.key}
                href={`/requests?category=${cat.key}`}
                className="csb-item"
              >
                <span className="csb-icon">
                  <Icon size={22} strokeWidth={1.4} />
                </span>
                <span className="csb-label">
                  {isEN ? cat.iconEN : cat.iconPT}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .csb-nav {
          width: 100%;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg-primary);
        }

        .csb-inner {
          max-width: var(--grid-max);
          margin: 0 auto;
          padding: 0 var(--grid-px);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .csb-inner::-webkit-scrollbar { display: none; }

        /* Horizontal flex track */
        .csb-track {
          display: flex;
          align-items: stretch;
          gap: 0;
          min-width: max-content;
        }

        /* Each category pill */
        .csb-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 16px 20px;
          text-decoration: none;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          transition: color 0.15s ease, border-color 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .csb-item:hover {
          color: var(--text-primary);
          border-bottom-color: var(--primary);
        }

        .csb-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.75;
        }
        .csb-item:hover .csb-icon { opacity: 1; }

        .csb-label {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          line-height: 1.3;
        }

        /* Mobile: smaller padding */
        @media (max-width: 640px) {
          .csb-item { padding: 12px 14px; gap: 5px; }
          .csb-label { font-size: 11px; }
        }
      `}</style>
    </nav>
  );
}
