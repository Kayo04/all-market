'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/categories';

const categoryColors: Record<string, { bg: string; text: string }> = {
  'home-repairs': { bg: '#00391b', text: '#ffffff' },
  'tech-digital': { bg: '#00391b', text: '#ffffff' },
  tutoring: { bg: '#00391b', text: '#ffffff' },
  events: { bg: '#00391b', text: '#ffffff' },
  wellness: { bg: '#00391b', text: '#ffffff' },
  equipment: { bg: '#00391b', text: '#ffffff' },
};

const categoryColorsDark: Record<string, { bg: string; text: string }> = {
  'home-repairs': { bg: '#00391b', text: '#ffffff' },
  'tech-digital': { bg: '#00391b', text: '#ffffff' },
  tutoring: { bg: '#00391b', text: '#ffffff' },
  events: { bg: '#00391b', text: '#ffffff' },
  wellness: { bg: '#00391b', text: '#ffffff' },
  equipment: { bg: '#00391b', text: '#ffffff' },
};

export default function PopularCategories() {
  const t = useTranslations('popular');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section style={{ padding: '48px 0 32px', width: '100%', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '0 24px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => scroll('left')}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
        }}
        className="popular-scroll"
      >
        {categories.map((cat) => {
          const label = locale === 'pt' ? cat.labelPT : cat.labelEN;
          const lightColors = categoryColors[cat.key] || { bg: '#f3f4f6', text: '#374151' };
          const darkColors = categoryColorsDark[cat.key] || { bg: '#1f2937', text: '#e5e7eb' };
          const subLabels = cat.subcategories
            .slice(0, 3)
            .map((s) => (locale === 'pt' ? s.labelPT : s.labelEN));

          return (
            <Link
              key={cat.key}
              href={`/requests?category=${cat.key}`}
              style={{
                minWidth: '220px',
                maxWidth: '220px',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                textDecoration: 'none',
                scrollSnapAlign: 'start',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform var(--transition-fast)',
                overflow: 'hidden',
                position: 'relative',
              }}
              className={`popular-card popular-card-${cat.key}`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                {label}
              </h3>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  height: '140px',
                  position: 'relative',
                  padding: '16px',
                  margin: '0 -20px -24px -20px',
                  background: 'transparent',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/categories/${cat.key.replace('_', '-')}-3d.png`}
                  alt={label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .popular-scroll {
          padding-left: calc(max(24px, (100% - 1280px) / 2));
          padding-right: calc(max(24px, (100% - 1280px) / 2));
          padding-bottom: 8px;
        }
        .popular-scroll::-webkit-scrollbar { display: none; }

        [data-theme="light"] .popular-card-home-repairs { background: ${categoryColors['home-repairs'].bg}; color: ${categoryColors['home-repairs'].text}; }
        [data-theme="light"] .popular-card-tech-digital { background: ${categoryColors['tech-digital'].bg}; color: ${categoryColors['tech-digital'].text}; }
        [data-theme="light"] .popular-card-tutoring { background: ${categoryColors.tutoring.bg}; color: ${categoryColors.tutoring.text}; }
        [data-theme="light"] .popular-card-events { background: ${categoryColors.events.bg}; color: ${categoryColors.events.text}; }
        [data-theme="light"] .popular-card-wellness { background: ${categoryColors.wellness.bg}; color: ${categoryColors.wellness.text}; }
        [data-theme="light"] .popular-card-equipment { background: ${categoryColors.equipment.bg}; color: ${categoryColors.equipment.text}; }

        [data-theme="dark"] .popular-card-home-repairs { background: ${categoryColorsDark['home-repairs'].bg}; color: ${categoryColorsDark['home-repairs'].text}; }
        [data-theme="dark"] .popular-card-tech-digital { background: ${categoryColorsDark['tech-digital'].bg}; color: ${categoryColorsDark['tech-digital'].text}; }
        [data-theme="dark"] .popular-card-tutoring { background: ${categoryColorsDark.tutoring.bg}; color: ${categoryColorsDark.tutoring.text}; }
        [data-theme="dark"] .popular-card-events { background: ${categoryColorsDark.events.bg}; color: ${categoryColorsDark.events.text}; }
        [data-theme="dark"] .popular-card-wellness { background: ${categoryColorsDark.wellness.bg}; color: ${categoryColorsDark.wellness.text}; }
        [data-theme="dark"] .popular-card-equipment { background: ${categoryColorsDark.equipment.bg}; color: ${categoryColorsDark.equipment.text}; }
      `}</style>
    </section>
  );
}
