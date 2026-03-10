'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    opacity: disabled || loading ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    lineHeight: 1.5,
    letterSpacing: '-0.01em',
  };

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '10px 20px', fontSize: '15px' },
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--accent)',
      color: 'white',
    },
    secondary: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'var(--error)',
      color: 'white',
    },
  };

  return (
    <button
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant] }}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          (e.target as HTMLElement).style.background = 'var(--accent-hover)';
        } else if (variant === 'secondary') {
          (e.target as HTMLElement).style.borderColor = 'var(--border-hover)';
          (e.target as HTMLElement).style.background = 'var(--bg-card-hover)';
        } else if (variant === 'ghost') {
          (e.target as HTMLElement).style.background = 'var(--accent-light)';
          (e.target as HTMLElement).style.color = 'var(--accent)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          (e.target as HTMLElement).style.background = 'var(--accent)';
        } else if (variant === 'secondary') {
          (e.target as HTMLElement).style.borderColor = 'var(--border)';
          (e.target as HTMLElement).style.background = 'var(--bg-tertiary)';
        } else if (variant === 'ghost') {
          (e.target as HTMLElement).style.background = 'transparent';
          (e.target as HTMLElement).style.color = 'var(--text-secondary)';
        }
      }}
      {...props}
    >
      {loading && (
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none"
          style={{ animation: 'spin 0.7s linear infinite' }}
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="30" strokeDashoffset="10" />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
