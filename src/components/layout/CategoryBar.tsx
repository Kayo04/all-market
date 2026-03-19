'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Flame } from 'lucide-react';
import { categories } from '@/lib/categories';
import { useState, useEffect } from 'react';

export default function CategoryBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!isHomePage) return;
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    h();
    return () => window.removeEventListener('scroll', h);
  }, [isHomePage]);

  const visible = !isHomePage || scrollY > 800;

  return (
    <>
      <div className={`catbar${visible ? ' catbar--show' : ''}`}>
        <div className="catbar-inner">
          {/* Trending */}
          <Link href="/requests" className="catbar-link catbar-trending">
            <Flame size={13} color="#ef4444" strokeWidth={2.5} />
            {locale === 'pt' ? 'Em Alta' : 'Trending'}
          </Link>

          <div className="catbar-divider" />

          {/* Category links */}
          {categories.map((cat) => {
            const label = locale === 'pt' ? cat.labelPT : cat.labelEN;
            return (
              <Link key={cat.key} href={`/requests?category=${cat.key}`} className="catbar-link">
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer to push content below the fixed bar (only on non-home pages) */}
      {!isHomePage && <div style={{ height: '40px', flexShrink: 0 }} />}

      <style>{`
        .catbar {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          z-index: 999;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          transform: translateY(-110%);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        }
        .catbar--show {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        /* Centered, aligned to the same 1280px grid as the Navbar */
        .catbar-inner {
          max-width: var(--grid-max);
          margin: 0 auto;
          padding: 0 var(--grid-px);
          height: 40px;
          display: flex;
          align-items: center;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .catbar-inner::-webkit-scrollbar { display: none; }

        .catbar-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 14px;
          height: 40px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 400;
          color: var(--text-secondary);
          text-decoration: none;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color var(--transition-fast), border-color var(--transition-fast);
          flex-shrink: 0;
        }
        .catbar-link:hover {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary);
        }
        .catbar-trending {
          font-weight: 500;
          color: var(--text-primary);
          padding-left: 0;
        }

        .catbar-divider {
          width: 1px;
          height: 16px;
          background: var(--border);
          flex-shrink: 0;
          margin: 0 8px;
        }
      `}</style>
    </>
  );
}
