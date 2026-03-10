'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Flame } from 'lucide-react';
import { categories } from '@/lib/categories';

export default function CategoryBar() {
  const t = useTranslations('categoryBar');
  const locale = useLocale();

  return (
    <div
      style={{
        position: 'fixed',
        top: '56px',
        left: 0,
        right: 0,
        zIndex: 999,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          height: '44px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
        className="category-bar-scroll"
      >
        {/* Trending */}
        <Link
          href="/requests"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            borderRadius: 'var(--radius-md)',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Flame size={14} color="#ef4444" />
          {t('trending')}
        </Link>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '20px',
            background: 'var(--border)',
            flexShrink: 0,
            margin: '0 4px',
          }}
        />

        {/* Categories */}
        {categories.map((cat) => {
          const label = locale === 'pt' ? cat.labelPT : cat.labelEN;
          return (
            <Link
              key={cat.key}
              href={`/requests?category=${cat.key}`}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <style>{`
        .category-bar-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
