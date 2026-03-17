'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { 
  Wrench, Monitor, BookOpen, PartyPopper, Heart, Gamepad2, 
  Briefcase, Palette, PenTool, Sparkles, Car, Scissors 
} from 'lucide-react';
import { categories } from '@/lib/categories';
import { useRef } from 'react';

const iconMap: Record<string, React.ReactNode> = {
  Wrench: <Wrench size={28} strokeWidth={1.5} />,
  Monitor: <Monitor size={28} strokeWidth={1.5} />,
  BookOpen: <BookOpen size={28} strokeWidth={1.5} />,
  PartyPopper: <PartyPopper size={28} strokeWidth={1.5} />,
  Heart: <Heart size={28} strokeWidth={1.5} />,
  Gamepad2: <Gamepad2 size={28} strokeWidth={1.5} />,
  Briefcase: <Briefcase size={28} strokeWidth={1.5} />,
  Palette: <Palette size={28} strokeWidth={1.5} />,
  PenTool: <PenTool size={28} strokeWidth={1.5} />,
  Sparkles: <Sparkles size={28} strokeWidth={1.5} />,
  Car: <Car size={28} strokeWidth={1.5} />,
  Scissors: <Scissors size={28} strokeWidth={1.5} />,
};

export default function SimpleCategoryGrid() {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  // We only show the first 9 or all 12. Let's show all 12 in a scrollable list to match Fiverr's horizontal square cards.
  const displayCategories = categories;

  return (
    <section style={{ padding: '40px 0 16px', width: '100%', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            scrollSnapType: 'x mandatory',
            padding: '0 24px',
          }}
          className="simple-category-scroll"
        >
          {displayCategories.map((cat) => {
            const label = locale === 'pt' ? cat.labelPT : cat.labelEN;
            
            return (
              <Link
                key={cat.key}
                href={`/requests?category=${cat.key}`}
                style={{
                  minWidth: '120px',
                  maxWidth: '120px',
                  height: '110px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: '16px',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
                }}
                className="simple-category-card"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  {iconMap[cat.icon]}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
      <style>{`
        .simple-category-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
