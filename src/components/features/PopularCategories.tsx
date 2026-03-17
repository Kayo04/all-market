'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/categories';

// Each category card gets a distinct background color to look vibrant
const cardColors: Record<string, string> = {
  'home-repairs':  '#1e3a2f',
  'tech-digital':  '#1a2e4a',
  tutoring:        '#2d1b4e',
  events:          '#3a1a2e',
  wellness:        '#1a3a2a',
  equipment:       '#1a2a3a',
  business:        '#2a1e00',
  design:          '#1a3a3a',
  writing:         '#3a2a1a',
  cleaning:        '#1a3a20',
  automotive:      '#2a2030',
  beauty:          '#3a1a32',
};

export default function PopularCategories() {
  const locale = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);

  // How many cards are visible at a time (responsive handled via CSS)
  const CARDS_PER_PAGE = 5;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(categories.length / CARDS_PER_PAGE);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const scroll = (dir: 'left' | 'right') => {
    if (dir === 'left' && canPrev) setPage((p) => p - 1);
    if (dir === 'right' && canNext) setPage((p) => p + 1);
  };

  const offset = page * CARDS_PER_PAGE * (220 + 16); // card width + gap

  return (
    <section className="popular-section">
      {/* Header row */}
      <div className="popular-header">
        <h2 className="popular-title">
          {locale === 'pt' ? 'Categorias Populares' : 'Popular Categories'}
        </h2>
        <div className="popular-arrows">
          <button
            className={`popular-arrow ${canPrev ? '' : 'popular-arrow--disabled'}`}
            onClick={() => scroll('left')}
            aria-label="Previous"
            disabled={!canPrev}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`popular-arrow ${canNext ? '' : 'popular-arrow--disabled'}`}
            onClick={() => scroll('right')}
            aria-label="Next"
            disabled={!canNext}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Carousel viewport — clips overflow so only current page is visible */}
      <div className="popular-viewport">
        <div
          ref={trackRef}
          className="popular-track"
          style={{ transform: `translateX(-${offset}px)` }}
        >
          {categories.map((cat) => {
            const label = locale === 'pt' ? cat.labelPT : cat.labelEN;
            const bg = cardColors[cat.key] || '#1a2a3a';

            return (
              <Link
                key={cat.key}
                href={`/requests?category=${cat.key}`}
                className="popular-card"
                style={{ background: bg }}
              >
                {/* Title at top */}
                <h3 className="popular-card-title">{label}</h3>

                {/* Image at bottom */}
                <div className="popular-card-image-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/categories/${cat.key}-3d.png`}
                    alt={label}
                    className="popular-card-image"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .popular-section {
          padding: 48px 0 40px;
          width: 100%;
          overflow: hidden;
        }

        .popular-header {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .popular-title {
          font-size: 28px;
          font-weight: 700;
          font-family: var(--font-display);
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .popular-arrows {
          display: flex;
          gap: 8px;
        }

        .popular-arrow {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .popular-arrow:hover {
          background: var(--bg-secondary);
          border-color: var(--text-secondary);
        }
        .popular-arrow--disabled {
          opacity: 0.35;
          cursor: default;
          pointer-events: none;
        }

        /* Clip: only the visible page shows */
        .popular-viewport {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          overflow: hidden;
        }

        /* Sliding track */
        .popular-track {
          display: flex;
          gap: 16px;
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        /* Individual card */
        .popular-card {
          min-width: 220px;
          max-width: 220px;
          height: 260px;
          border-radius: 16px;
          padding: 20px 18px 0;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .popular-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.22);
        }

        .popular-card-title {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          margin-bottom: auto;
          flex-shrink: 0;
        }

        .popular-card-image-wrap {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding-bottom: 0;
          margin: 8px -18px 0;
          overflow: hidden;
        }

        .popular-card-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 0 0 16px 16px;
        }

        @media (max-width: 768px) {
          .popular-viewport {
            padding: 0 16px;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .popular-track {
            transform: none !important;
            transition: none;
          }
          .popular-arrows {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
