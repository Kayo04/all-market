'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            display: 'flex',
          }}>
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={{
            width: '100%',
            padding: icon ? '10px 14px 10px 40px' : '10px 14px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'all var(--transition-base)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 0 3px var(--accent-light)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--error)' }}>{error}</span>
      )}
    </div>
  );
}
