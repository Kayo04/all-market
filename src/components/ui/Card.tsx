'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated';
  hover?: boolean;
  padding?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'default',
  hover = true,
  padding = '24px',
  style,
  onClick,
}: CardProps) {
  const baseStyles: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    padding,
    transition: 'border-color var(--transition-fast)',
    cursor: onClick ? 'pointer' : 'default',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
    },
    glass: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
    },
    elevated: {
      background: 'var(--bg-elevated)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border)',
    },
  };

  return (
    <div
      style={{ ...baseStyles, ...variantStyles[variant], ...style }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        }
      }}
    >
      {children}
    </div>
  );
}
