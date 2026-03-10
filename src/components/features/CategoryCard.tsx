'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import {
  Wrench,
  Monitor,
  BookOpen,
  PartyPopper,
  Heart,
  Gamepad2,
} from 'lucide-react';
import { categories } from '@/lib/categories';
import type { Category } from '@/types';

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Wrench,
  Monitor,
  BookOpen,
  PartyPopper,
  Heart,
  Gamepad2,
};

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const locale = useLocale();
  const Icon = iconMap[category.icon];
  const label = locale === 'pt' ? category.labelPT : category.labelEN;
  const subcategories = category.subcategories.map((s) =>
    locale === 'pt' ? s.labelPT : s.labelEN
  );

  return (
    <div
      style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        transition: 'border-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        {Icon && <Icon size={18} color="var(--text-tertiary)" />}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </h3>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {subcategories.map((sub) => (
          <span
            key={sub}
            style={{
              padding: '3px 8px',
              fontSize: '12px',
              fontWeight: 400,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            {sub}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CategoriesSection() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
      }}
    >
      {categories.map((cat) => (
        <CategoryCard key={cat.key} category={cat} />
      ))}
    </div>
  );
}
