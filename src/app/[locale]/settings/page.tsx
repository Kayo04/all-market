'use client';

import { useTheme } from '@/context/ThemeContext';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Moon, Sun, Monitor, ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// /settings — Appearance settings (more sections can be added here later)
// ─────────────────────────────────────────────────────────────────────────────

type ThemeOption = 'light' | 'dark';

const THEME_OPTIONS: { value: ThemeOption; labelPt: string; labelEn: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: 'light',
    labelPt: 'Claro',
    labelEn: 'Light',
    icon: <Sun size={18} />,
    desc: 'Clean white interface — best for bright environments.',
  },
  {
    value: 'dark',
    labelPt: 'Escuro',
    labelEn: 'Dark',
    icon: <Moon size={18} />,
    desc: 'Easy on the eyes — ideal for low-light use.',
  },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const locale = useLocale() as 'pt' | 'en';
  const [saved, setSaved] = useState(false);

  const selectTheme = (value: ThemeOption) => {
    if (value !== theme) {
      toggleTheme();
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Back */}
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)',
            textDecoration: 'none', marginBottom: '40px',
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={14} />
          {locale === 'pt' ? 'Voltar' : 'Back'}
        </Link>

        {/* Page header */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px', fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '6px',
        }}>
          {locale === 'pt' ? 'Definições' : 'Settings'}
        </h1>
        <p style={{
          fontSize: '14px', color: 'var(--text-tertiary)',
          marginBottom: '48px', lineHeight: 1.6,
        }}>
          {locale === 'pt'
            ? 'Personaliza a tua experiência na plataforma.'
            : 'Customise your experience on the platform.'}
        </p>

        {/* ── Section: Appearance ── */}
        <section>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '16px',
          }}>
            <Monitor size={15} color="var(--text-tertiary)" />
            <h2 style={{
              fontSize: '11px', fontWeight: 700,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              margin: 0,
            }}>
              {locale === 'pt' ? 'Aparência' : 'Appearance'}
            </h2>
          </div>

          {/* Theme cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '12px', marginBottom: '12px',
          }}>
            {THEME_OPTIONS.map(opt => {
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectTheme(opt.value)}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-start', gap: '10px',
                    padding: '18px 20px',
                    background: isActive ? 'var(--bg-card, var(--bg-secondary))' : 'var(--bg-secondary)',
                    border: isActive
                      ? '2px solid var(--text-primary)'
                      : '2px solid var(--border)',
                    borderRadius: '14px', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--font-sans)',
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {/* Selected checkmark */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={10} color="var(--bg-primary)" strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon */}
                  <div style={{ color: 'var(--text-primary)', opacity: isActive ? 1 : 0.45 }}>
                    {opt.icon}
                  </div>

                  {/* Label */}
                  <div>
                    <div style={{
                      fontSize: '14px', fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '3px',
                    }}>
                      {locale === 'pt' ? opt.labelPt : opt.labelEn}
                    </div>
                    <div style={{
                      fontSize: '11px', color: 'var(--text-tertiary)',
                      lineHeight: 1.5,
                    }}>
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Saved confirmation */}
          <div style={{
            height: '20px',
            transition: 'opacity 0.3s ease',
            opacity: saved ? 1 : 0,
          }}>
            <span style={{
              fontSize: '12px', color: 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <Check size={11} />
              {locale === 'pt' ? 'Preferência guardada' : 'Preference saved'}
            </span>
          </div>
        </section>

        {/* ── Divider — future sections go here ── */}
        <div style={{
          marginTop: '48px', paddingTop: '32px',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{
            fontSize: '12px', color: 'var(--text-tertiary)',
            opacity: 0.5,
          }}>
            {locale === 'pt'
              ? 'Mais definições (língua, notificações, privacidade) em breve.'
              : 'More settings (language, notifications, privacy) coming soon.'}
          </p>
        </div>

      </div>
    </div>
  );
}
