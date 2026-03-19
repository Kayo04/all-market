'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { 
  Wrench, Monitor, BookOpen, PartyPopper, Heart, Gamepad2, 
  Briefcase, Palette, PenTool, Sparkles, Car, Scissors 
} from 'lucide-react';
import { categories } from '@/lib/categories';

const iconMap: Record<string, React.ReactNode> = {
  Wrench:      <Wrench      size={24} strokeWidth={1.4} />,
  Monitor:     <Monitor     size={24} strokeWidth={1.4} />,
  BookOpen:    <BookOpen    size={24} strokeWidth={1.4} />,
  PartyPopper: <PartyPopper size={24} strokeWidth={1.4} />,
  Heart:       <Heart       size={24} strokeWidth={1.4} />,
  Gamepad2:    <Gamepad2    size={24} strokeWidth={1.4} />,
  Briefcase:   <Briefcase   size={24} strokeWidth={1.4} />,
  Palette:     <Palette     size={24} strokeWidth={1.4} />,
  PenTool:     <PenTool     size={24} strokeWidth={1.4} />,
  Sparkles:    <Sparkles    size={24} strokeWidth={1.4} />,
  Car:         <Car         size={24} strokeWidth={1.4} />,
  Scissors:    <Scissors    size={24} strokeWidth={1.4} />,
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
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border);
        }

        /* Clip but allow horizontal scroll on mobile */
        .scg-track-wrap {
          overflow: hidden;
        }

        /* Perfectly aligned to the grid – first card left-edge = Navbar logo left-edge */
        .scg-track {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-left: calc(max(var(--grid-px), (100% - var(--grid-max)) / 2 + var(--grid-px)));
          padding-right: calc(max(var(--grid-px), (100% - var(--grid-max)) / 2 + var(--grid-px)));
          padding-bottom: 4px;
        }
        .scg-track::-webkit-scrollbar { display: none; }

        /* Fiverr-style — white bordered square card */
        .scg-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 16px 20px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          text-decoration: none;
          color: var(--text-secondary);
          min-width: 130px;
          max-width: 140px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
          cursor: pointer;
        }
        .scg-card:hover {
          border-color: var(--border-hover);
          box-shadow: 0 4px 12px rgba(0,0,0,0.07);
          color: var(--text-primary);
        }

        .scg-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .scg-label {
          white-space: pre-wrap;
          word-break: break-word;
        }

        @media (max-width: 768px) {
          .scg-card { min-width: 110px; padding: 14px 14px 18px; }
          .scg-label { font-size: 12px; }
        }
      `}</style>
    </section>
  );
}
