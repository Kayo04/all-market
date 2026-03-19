'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { 
  Wrench, Monitor, BookOpen, PartyPopper, Heart, Gamepad2, 
  Briefcase, Palette, PenTool, Sparkles, Car, Scissors 
} from 'lucide-react';
import { categories } from '@/lib/categories';

const iconMap: Record<string, React.ReactNode> = {
  Wrench:      <Wrench      size={22} strokeWidth={1.4} />,
  Monitor:     <Monitor     size={22} strokeWidth={1.4} />,
  BookOpen:    <BookOpen    size={22} strokeWidth={1.4} />,
  PartyPopper: <PartyPopper size={22} strokeWidth={1.4} />,
  Heart:       <Heart       size={22} strokeWidth={1.4} />,
  Gamepad2:    <Gamepad2    size={22} strokeWidth={1.4} />,
  Briefcase:   <Briefcase   size={22} strokeWidth={1.4} />,
  Palette:     <Palette     size={22} strokeWidth={1.4} />,
  PenTool:     <PenTool     size={22} strokeWidth={1.4} />,
  Sparkles:    <Sparkles    size={22} strokeWidth={1.4} />,
  Car:         <Car         size={22} strokeWidth={1.4} />,
  Scissors:    <Scissors    size={22} strokeWidth={1.4} />,
};

export default function SimpleCategoryGrid() {
  const locale = useLocale();

  return (
    <section className="scg-section">
      <div className="scg-track-wrap">
        <div className="scg-track">
          {categories.map((cat) => {
            const label = locale === 'pt' ? cat.labelPT : cat.labelEN;
            return (
              <Link
                key={cat.key}
                href={`/requests?category=${cat.key}`}
                className="scg-card"
              >
                <span className="scg-icon">{iconMap[cat.icon]}</span>
                <span className="scg-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .scg-section {
          width: 100%;
          overflow: hidden;
          padding: 20px 0 16px;
          border-bottom: 1px solid var(--border);
        }

        .scg-track-wrap {
          overflow: hidden;
        }

        /* Grid-aligned scroll track */
        .scg-track {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-left: calc(max(var(--grid-px), (100% - var(--grid-max)) / 2 + var(--grid-px)));
          padding-right: calc(max(var(--grid-px), (100% - var(--grid-max)) / 2 + var(--grid-px)));
          padding-bottom: 4px;
        }
        .scg-track::-webkit-scrollbar { display: none; }

        /* Compact Fiverr-style bordered card */
        .scg-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 14px 14px 16px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          text-decoration: none;
          color: var(--text-secondary);
          min-width: 105px;
          max-width: 115px;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          line-height: 1.3;
          text-align: center;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
          cursor: pointer;
        }
        .scg-card:hover {
          border-color: var(--border-hover);
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
          color: var(--text-primary);
        }

        .scg-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .scg-card:hover .scg-icon {
          color: var(--text-primary);
        }

        .scg-label {
          white-space: pre-wrap;
          word-break: break-word;
        }

        @media (max-width: 768px) {
          .scg-card {
            min-width: 88px;
            padding: 12px 10px 14px;
            font-size: 11.5px;
          }
        }
      `}</style>
    </section>
  );
}
