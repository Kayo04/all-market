'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/categories';

const CARD_WIDTH = 220;
const CARD_GAP = 16;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;

// Light mint green for the image inset — floats image with visible light space around it
const IMAGE_SECTION_BG = '#c8ead4';

export default function PopularCategories() {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    return () => el.removeEventListener('scroll', updateArrows);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  };

  return (
    <section className="pc-section">
      {/* Title */}
      <div className="pc-header">
        <h2 className="pc-title">
          {locale === 'pt' ? 'Categorias Populares' : 'Popular Categories'}
        </h2>
      </div>

      {/* Carousel wrapper with side arrows */}
      <div className="pc-outer">
        {/* Left floating arrow */}
        <button
          className={`pc-arrow pc-arrow--left${canScrollLeft ? '' : ' pc-arrow--hidden'}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Scrollable track */}
        <div ref={scrollRef} className="pc-track">
          {categories.map((cat) => {
            const label = locale === 'pt' ? cat.labelPT : cat.labelEN;
            return (
              <Link
                key={cat.key}
                href={`/requests?category=${cat.key}`}
                className="pc-card"
              >
                {/* Dark green header with category name */}
                <div className="pc-card-header">
                  <span className="pc-card-title">{label}</span>
                </div>
                {/* Image inset — slightly lighter green with dark green frame around it */}
                <div
                  className="pc-card-img-section"
                  style={{ background: IMAGE_SECTION_BG }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/categories/${cat.key}-3d.png`}
                    alt={label}
                    className="pc-card-img"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right floating arrow */}
        <button
          className={`pc-arrow pc-arrow--right${canScrollRight ? '' : ' pc-arrow--hidden'}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      <style>{`
        /* ── Section ── */
        .pc-section {
          padding: 48px 0 40px;
          width: 100%;
        }

        .pc-header {
          max-width: var(--grid-max);
          margin: 0 auto;
          padding: 0 var(--grid-px);
          margin-bottom: 24px;
        }

        .pc-title {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        /* ── Outer wrapper ── */
        .pc-outer {
          position: relative;
          max-width: var(--grid-max);
          margin: 0 auto;
        }

        /* ── Scrollable track ── */
        .pc-track {
          display: flex;
          gap: ${CARD_GAP}px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          padding: 4px var(--grid-px) 12px;
        }
        .pc-track::-webkit-scrollbar { display: none; }

        /* ── Individual card ── */
        .pc-card {
          flex-shrink: 0;
          min-width: ${CARD_WIDTH}px;
          max-width: ${CARD_WIDTH}px;
          border-radius: 14px;
          background: #003912;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.22);
        }

        /* Dark green header section */
        .pc-card-header {
          padding: 18px 16px 14px;
          flex-shrink: 0;
          height: 72px;
          display: flex;
          align-items: flex-start;
        }

        /* Category name — top, white, bold */
        .pc-card-title {
          font-family: var(--font-sans);
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.35;
          display: block;
          max-width: 90%;
        }

        /* Image inset: light mint green, image fills completely */
        .pc-card-img-section {
          margin: 0 10px 10px 10px;
          border-radius: 12px;
          overflow: hidden;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 165px;
          padding: 0;
        }

        .pc-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Floating arrows ── */
        .pc-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #222;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pc-arrow:hover {
          box-shadow: 0 4px 18px rgba(0,0,0,0.25);
          transform: translateY(-50%) scale(1.06);
        }
        .pc-arrow--left  { left: -10px; }
        .pc-arrow--right { right: -10px; }
        .pc-arrow--hidden {
          opacity: 0;
          pointer-events: none;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .pc-arrow { display: none; }
          .pc-section { padding: 32px 0 28px; }
          .pc-track { padding: 4px 16px 12px; }
          .pc-title { font-size: 20px; }
          .pc-card {
            min-width: 160px;
            max-width: 160px;
          }
          .pc-card-img { height: 100px; }
          .pc-card-img-section { min-height: 120px; padding: 12px; }
          .pc-header { margin-bottom: 16px; padding: 0 16px; }
        }
        @media (max-width: 480px) {
          .pc-card {
            min-width: 145px;
            max-width: 145px;
          }
          .pc-card-title { font-size: 13px; }
          .pc-card-header { padding: 14px 12px 10px; }
          .pc-card-img-section { padding: 10px; min-height: 108px; }
          .pc-card-img { height: 88px; }
        }
      `}</style>
    </section>
  );
}
