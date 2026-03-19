'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { 
  Wrench, Monitor, BookOpen, PartyPopper, Heart, Gamepad2, 
  Briefcase, Palette, PenTool, Sparkles, Car, Scissors 
} from 'lucide-react';
import { categories } from '@/lib/categories';

const iconMap: Record<string, React.ReactNode> = {
  Wrench:      <Wrench      size={28} strokeWidth={1.2} />,
  Monitor:     <Monitor     size={28} strokeWidth={1.2} />,
  BookOpen:    <BookOpen    size={28} strokeWidth={1.2} />,
  PartyPopper: <PartyPopper size={28} strokeWidth={1.2} />,
  Heart:       <Heart       size={28} strokeWidth={1.2} />,
  Gamepad2:    <Gamepad2    size={28} strokeWidth={1.2} />,
  Briefcase:   <Briefcase   size={28} strokeWidth={1.2} />,
  Palette:     <Palette     size={28} strokeWidth={1.2} />,
  PenTool:     <PenTool     size={28} strokeWidth={1.2} />,
  Sparkles:    <Sparkles    size={28} strokeWidth={1.2} />,
  Car:         <Car         size={28} strokeWidth={1.2} />,
  Scissors:    <Scissors    size={28} strokeWidth={1.2} />,
};

export default function SimpleCategoryGrid() {
  const locale = useLocale();

  return (
    <section className="scg-section">
      <div className="scg-overflow">
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
          padding: 28px 0 24px;
          border-bottom: 1px solid var(--border);
        }

        /* Overflow clip but keep grid alignment */
        .scg-overflow {
          overflow-x: auto;
          overflow-y: visible;
          scrollbar-width: none;
        }
        .scg-overflow::-webkit-scrollbar { display: none; }

        /* Track starts/ends at the 1280px grid boundary — same as Navbar */
        .scg-track {
          display: flex;
          gap: 12px;
          min-width: max-content;
          /* Align left edge to the grid */
          padding-left: calc(max(var(--grid-px), (100vw - var(--grid-max)) / 2 + var(--grid-px)));
          padding-right: calc(max(var(--grid-px), (100vw - var(--grid-max)) / 2 + var(--grid-px)));
          padding-bottom: 2px;
        }

        /* Square card — same proportions as Fiverr */
        .scg-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          padding: 18px 16px 16px;
          width: 128px;
          height: 108px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          text-decoration: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .scg-card:hover {
          border-color: var(--text-tertiary);
          box-shadow: 0 4px 14px rgba(0,0,0,0.07);
          color: var(--text-primary);
        }

        .scg-icon {
          display: flex;
          align-items: center;
          color: inherit;
          flex-shrink: 0;
        }

        .scg-label {
          font-family: var(--font-sans);
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.35;
          color: inherit;
          word-break: break-word;
          white-space: normal;
        }

        /* Mobile: slightly smaller */
        @media (max-width: 640px) {
          .scg-card {
            width: 110px;
            height: 96px;
            padding: 14px 12px 12px;
          }
          .scg-label { font-size: 12px; }
        }
      `}</style>
    </section>
  );
}
