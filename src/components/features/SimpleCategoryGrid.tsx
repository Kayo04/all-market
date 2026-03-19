'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { 
  Wrench, Monitor, BookOpen, PartyPopper, Heart, Gamepad2, 
  Briefcase, Palette, PenTool, Sparkles, Car, Scissors 
} from 'lucide-react';
import { categories } from '@/lib/categories';
import { useRef } from 'react';

// Tiny icon map — one per category key
const iconMap: Record<string, React.ReactNode> = {
  Wrench:      <Wrench      size={26} strokeWidth={1.4} />,
  Monitor:     <Monitor     size={26} strokeWidth={1.4} />,
  BookOpen:    <BookOpen    size={26} strokeWidth={1.4} />,
  PartyPopper: <PartyPopper size={26} strokeWidth={1.4} />,
  Heart:       <Heart       size={26} strokeWidth={1.4} />,
  Gamepad2:    <Gamepad2    size={26} strokeWidth={1.4} />,
  Briefcase:   <Briefcase   size={26} strokeWidth={1.4} />,
  Palette:     <Palette     size={26} strokeWidth={1.4} />,
  PenTool:     <PenTool     size={26} strokeWidth={1.4} />,
  Sparkles:    <Sparkles    size={26} strokeWidth={1.4} />,
  Car:         <Car         size={26} strokeWidth={1.4} />,
  Scissors:    <Scissors    size={26} strokeWidth={1.4} />,
};

export default function SimpleCategoryGrid() {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="scg-section">
      {/* The scroll track is INSIDE a wrapper that clips it,
          but the track itself has the 1280px-grid-aligned padding
          so the first card aligns perfectly with the Navbar logo. */}
      <div className="scg-track-wrap">
        <div ref={scrollRef} className="scg-track">
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
          padding: 24px 0 8px;
          border-bottom: 1px solid var(--border);
        }

        /* Clip overflow but align the first card with the Navbar */
        .scg-track-wrap {
          overflow: hidden;
        }

        /* Scrollable flex row — padding mirrors the Navbar grid */
        .scg-track {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
          /* Left padding = same as Navbar: (screen - 1280px) / 2 + 24px */
          padding-left: calc(max(var(--grid-px), (100% - var(--grid-max)) / 2 + var(--grid-px)));
          padding-right: calc(max(var(--grid-px), (100% - var(--grid-max)) / 2 + var(--grid-px)));
          padding-bottom: 8px;
        }
        .scg-track::-webkit-scrollbar { display: none; }

        /* Each mini card */
        .scg-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: var(--text-secondary);
          white-space: nowrap;
          font-family: var(--font-sans);
          font-size: 12.5px;
          font-weight: 500;
          text-align: center;
          transition: background var(--transition-fast), color var(--transition-fast);
          min-width: 90px;
        }
        .scg-card:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .scg-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .scg-label {
          line-height: 1.3;
          max-width: 80px;
        }

        @media (max-width: 640px) {
          .scg-card { padding: 12px 14px; min-width: 72px; }
        }
      `}</style>
    </section>
  );
}
