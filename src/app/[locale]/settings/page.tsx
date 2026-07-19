'use client';

import { useTheme } from '@/context/ThemeContext';
import { useCurrency, Currency } from '@/context/CurrencyContext';
import { useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { Moon, Sun, Monitor, ArrowLeft, Check, Globe, DollarSign, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// /settings — Appearance + Language + Currency
// ─────────────────────────────────────────────────────────────────────────────

type ThemeOption = 'light' | 'dark';

const THEME_OPTIONS: {
  value: ThemeOption;
  labelPt: string;
  labelEn: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
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

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string; desc: string }[] = [
  { value: 'EUR', label: 'Euro', symbol: '€', desc: 'European Union · €' },
  { value: 'USD', label: 'US Dollar', symbol: '$', desc: 'United States · $' },
  { value: 'GBP', label: 'British Pound', symbol: '£', desc: 'United Kingdom · £' },
];

const LANGUAGE_OPTIONS: { value: 'pt' | 'en'; label: string; flag: string }[] = [
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <h2 style={{
        fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)',
        letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0,
      }}>
        {label}
      </h2>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const locale = useLocale() as 'pt' | 'en';
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [saved, setSaved] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const flash = (key: string) => {
    setSaved(key);
    setTimeout(() => setSaved(null), 1800);
  };

  const DELETE_KEYWORD = locale === 'pt' ? 'APAGAR' : 'DELETE';

  const handleDeleteAccount = async () => {
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/' });
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || (locale === 'pt' ? 'Algo correu mal.' : 'Something went wrong.'));
        setDeleting(false);
      }
    } catch {
      setDeleteError(locale === 'pt' ? 'Algo correu mal.' : 'Something went wrong.');
      setDeleting(false);
    }
  };

  const selectTheme = (value: ThemeOption) => {
    if (value !== theme) { toggleTheme(); flash('theme'); }
  };

  const selectCurrency = (value: Currency) => {
    if (value !== currency) { setCurrency(value); flash('currency'); }
  };

  const selectLocale = (value: 'pt' | 'en') => {
    if (value !== locale) {
      router.replace(pathname, { locale: value });
      flash('language');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Back */}
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)',
            textDecoration: 'none', marginBottom: '40px',
          }}
        >
          <ArrowLeft size={14} />
          {locale === 'pt' ? 'Voltar' : 'Back'}
        </Link>

        {/* Page header */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', marginBottom: '6px',
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

        {/* ── APPEARANCE ── */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader icon={<Monitor size={14} />} label={locale === 'pt' ? 'Aparência' : 'Appearance'} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {THEME_OPTIONS.map(opt => {
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectTheme(opt.value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: '10px', padding: '18px 20px',
                    background: isActive ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                    border: `2px solid ${isActive ? 'var(--text-primary)' : 'var(--border)'}`,
                    borderRadius: '14px', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--font-sans)',
                    transition: 'border-color 0.2s ease',
                    position: 'relative',
                  }}
                >
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
                  <div style={{ color: 'var(--text-primary)', opacity: isActive ? 1 : 0.45 }}>
                    {opt.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {locale === 'pt' ? opt.labelPt : opt.labelEn}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {saved === 'theme' && <SavedNote locale={locale} />}
        </section>

        <Divider />

        {/* ── LANGUAGE ── */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader icon={<Globe size={14} />} label={locale === 'pt' ? 'Língua' : 'Language'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {LANGUAGE_OPTIONS.map(opt => {
              const isActive = locale === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectLocale(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'var(--bg-secondary)',
                    border: `1.5px solid ${isActive ? 'var(--text-primary)' : 'var(--border)'}`,
                    borderRadius: '12px', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>{opt.flag}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {opt.label}
                    </span>
                  </div>
                  {isActive && <Check size={15} color="var(--text-primary)" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
          {saved === 'language' && <SavedNote locale={locale} />}
        </section>

        <Divider />

        {/* ── CURRENCY ── */}
        <section style={{ marginBottom: '40px' }}>
          <SectionHeader icon={<DollarSign size={14} />} label={locale === 'pt' ? 'Moeda' : 'Currency'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {CURRENCY_OPTIONS.map(opt => {
              const isActive = currency === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectCurrency(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'var(--bg-secondary)',
                    border: `1.5px solid ${isActive ? 'var(--text-primary)' : 'var(--border)'}`,
                    borderRadius: '12px', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)',
                      flexShrink: 0,
                    }}>
                      {opt.symbol}
                    </span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                  {isActive && <Check size={15} color="var(--text-primary)" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
          {saved === 'currency' && <SavedNote locale={locale} />}
        </section>

        {session?.user && (
          <>
            <Divider />

            {/* ── DANGER ZONE ── */}
            <section>
              <SectionHeader icon={<AlertTriangle size={14} />} label={locale === 'pt' ? 'Zona de Perigo' : 'Danger Zone'} />

              {!showDeleteConfirm ? (
                <div style={{
                  padding: '18px 20px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '16px', flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {locale === 'pt' ? 'Apagar conta' : 'Delete account'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                      {locale === 'pt'
                        ? 'Remove permanentemente os teus dados pessoais. Esta ação não pode ser desfeita.'
                        : 'Permanently erases your personal data. This cannot be undone.'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: '10px 18px', borderRadius: '10px',
                      border: '1px solid rgba(239,68,68,0.4)', background: 'transparent',
                      color: '#dc2626', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0,
                    }}
                  >
                    {locale === 'pt' ? 'Apagar conta' : 'Delete account'}
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '20px',
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '14px',
                }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '14px' }}>
                    {locale === 'pt'
                      ? `Isto vai apagar permanentemente o teu nome, email, telefone, biografia e foto de perfil. Os teus pedidos e propostas passados ficam, mas deixam de estar associados a ti. Não é possível desfazer. Escreve "${DELETE_KEYWORD}" para confirmar.`
                      : `This permanently erases your name, email, phone, bio, and profile photo. Your past requests and proposals remain, but are no longer linked to you. This cannot be undone. Type "${DELETE_KEYWORD}" to confirm.`}
                  </p>

                  {deleteError && (
                    <div style={{
                      padding: '10px 14px', marginBottom: '12px', borderRadius: 'var(--radius-md)',
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#dc2626', fontSize: '13px',
                    }}>
                      {deleteError}
                    </div>
                  )}

                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={DELETE_KEYWORD}
                    style={{
                      width: '100%', padding: '10px 14px', marginBottom: '14px',
                      fontSize: '14px', fontFamily: 'var(--font-sans)',
                      backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(''); }}
                      disabled={deleting}
                      style={{
                        padding: '10px 18px', borderRadius: '10px',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
                        cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {locale === 'pt' ? 'Cancelar' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== DELETE_KEYWORD || deleting}
                      style={{
                        padding: '10px 18px', borderRadius: '10px', border: 'none',
                        background: deleteConfirmText === DELETE_KEYWORD ? '#dc2626' : 'var(--border)',
                        color: deleteConfirmText === DELETE_KEYWORD ? '#fff' : 'var(--text-tertiary)',
                        fontSize: '13px', fontWeight: 700,
                        cursor: deleteConfirmText === DELETE_KEYWORD && !deleting ? 'pointer' : 'not-allowed',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {deleting
                        ? (locale === 'pt' ? 'A apagar...' : 'Deleting...')
                        : (locale === 'pt' ? 'Apagar permanentemente' : 'Permanently delete')}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* Coming soon footer */}
        <Divider />
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', opacity: 0.5, marginTop: '24px' }}>
          {locale === 'pt'
            ? 'Mais definições (notificações, privacidade) em breve.'
            : 'More settings (notifications, privacy) coming soon.'}
        </p>

      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SavedNote({ locale }: { locale: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
      <Check size={11} color="var(--text-tertiary)" />
      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
        {locale === 'pt' ? 'Guardado' : 'Saved'}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0' }} />;
}
