import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent' | 'verified';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

export default function Badge({ children, variant = 'default', style }: BadgeProps) {
  const colors: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    default: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border)' },
    success: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', border: 'rgba(34, 197, 94, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: 'rgba(245, 158, 11, 0.3)' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', border: 'rgba(239, 68, 68, 0.3)' },
    accent: { bg: 'var(--accent-light)', color: 'var(--accent)', border: 'var(--border-accent)' },
    verified: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--verified)', border: 'rgba(245, 158, 11, 0.3)' },
  };

  const c = colors[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {variant === 'verified' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {children}
    </span>
  );
}
