'use client';

import { useTheme } from '@/context/ThemeContext';
import { useCurrency, Currency } from '@/context/CurrencyContext';
import { useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { Moon, Sun, Monitor, ArrowLeft, Check, Globe, DollarSign, AlertTriangle, Download, Bell, Lock } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

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

type PrefKey = 'proposals' | 'messages' | 'newRequests' | 'reviews';

const NOTIFICATION_OPTIONS: {
  key: PrefKey;
  labelEn: string; labelPt: string;
  descEn: string; descPt: string;
}[] = [
  {
    key: 'proposals',
    labelEn: 'Proposals', labelPt: 'Propostas',
    descEn: 'New proposals on your requests, and when yours is accepted or declined.',
    descPt: 'Novas propostas nos teus pedidos, e quando a tua é aceite ou recusada.',
  },
  {
    key: 'messages',
    labelEn: 'Messages', labelPt: 'Mensagens',
    descEn: 'When someone sends you a message.',
    descPt: 'Quando alguém te envia uma mensagem.',
  },
  {
    key: 'newRequests',
    labelEn: 'New requests', labelPt: 'Novos pedidos',
    descEn: 'New requests posted in your professional category.',
    descPt: 'Novos pedidos publicados na tua categoria profissional.',
  },
  {
    key: 'reviews',
    labelEn: 'Reviews', labelPt: 'Avaliações',
    descEn: 'When a client leaves you a review.',
    descPt: 'Quando um cliente te deixa uma avaliação.',
  },
];

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      style={{
        width: '40px', height: '23px', borderRadius: '99px', flexShrink: 0,
        border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'),
        background: on ? 'var(--accent)' : 'var(--bg-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        padding: 0, position: 'relative',
        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      <span
        style={{
          position: 'absolute', top: '2px', left: on ? '19px' : '2px',
          width: '17px', height: '17px', borderRadius: '50%',
          background: on ? '#fff' : 'var(--text-tertiary)',
          transition: 'left var(--transition-fast)',
        }}
      />
    </button>
  );
}

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

  const [prefs, setPrefs] = useState<Record<PrefKey, boolean> | null>(null);
  const [prefSaving, setPrefSaving] = useState<PrefKey | null>(null);
  const [prefError, setPrefError] = useState('');

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const userId = (session?.user as { id?: string } | undefined)?.id;

  const flash = (key: string) => {
    setSaved(key);
    setTimeout(() => setSaved(null), 1800);
  };

  const loadPrefs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setPrefs(data.notificationPrefs);
      }
    } catch (err) {
      console.error('Error loading notification preferences:', err);
    }
  }, [userId]);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const togglePref = async (key: PrefKey) => {
    if (!prefs || !userId) return;
    const next = !prefs[key];
    setPrefs({ ...prefs, [key]: next });   // optimistic
    setPrefSaving(key);
    setPrefError('');
    try {
      const res = await fetch(`/api/users/${userId}/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: next }),
      });
      if (!res.ok) {
        setPrefs((p) => (p ? { ...p, [key]: !next } : p));   // roll back
        setPrefError(locale === 'pt' ? 'Não foi possível guardar.' : 'Could not save.');
      }
    } catch {
      setPrefs((p) => (p ? { ...p, [key]: !next } : p));
      setPrefError(locale === 'pt' ? 'Não foi possível guardar.' : 'Could not save.');
    } finally {
      setPrefSaving(null);
    }
  };

  const handlePasswordChange = async () => {
    if (!userId) return;
    setPwError('');
    setPwSuccess(false);

    if (pwForm.next !== pwForm.confirm) {
      setPwError(locale === 'pt' ? 'As passwords novas não coincidem.' : 'New passwords do not match.');
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError(locale === 'pt'
        ? 'A password deve ter pelo menos 6 caracteres.'
        : 'Password must be at least 6 characters.');
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwForm({ current: '', next: '', confirm: '' });
        setPwSuccess(true);
        setTimeout(() => setPwSuccess(false), 4000);
      } else {
        setPwError(data.error || (locale === 'pt' ? 'Algo correu mal.' : 'Something went wrong.'));
      }
    } catch {
      setPwError(locale === 'pt' ? 'Algo correu mal.' : 'Something went wrong.');
    } finally {
      setPwSaving(false);
    }
  };

  const DELETE_KEYWORD = locale === 'pt' ? 'APAGAR' : 'DELETE';

  const handleDeleteAccount = async () => {
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

            {/* ── NOTIFICATIONS ── */}
            <section>
              <SectionHeader icon={<Bell size={14} />} label={locale === 'pt' ? 'Notificações' : 'Notifications'} />

              {prefError && (
                <div style={{
                  padding: '10px 14px', marginBottom: '12px', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--error)', fontSize: '13px',
                }}>
                  {prefError}
                </div>
              )}

              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                overflow: 'hidden',
              }}>
                {NOTIFICATION_OPTIONS.map((opt, i) => (
                  <div
                    key={opt.key}
                    style={{
                      padding: '16px 20px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {locale === 'pt' ? opt.labelPt : opt.labelEn}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                        {locale === 'pt' ? opt.descPt : opt.descEn}
                      </div>
                    </div>
                    <Toggle
                      on={prefs ? prefs[opt.key] : true}
                      disabled={!prefs || prefSaving === opt.key}
                      onClick={() => togglePref(opt.key)}
                    />
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '10px', lineHeight: 1.5 }}>
                {locale === 'pt'
                  ? 'Avisos sobre a tua conta (por exemplo, o resultado da verificação) são sempre enviados.'
                  : 'Notices about your account (for example, your verification outcome) are always sent.'}
              </p>
            </section>

            <Divider />

            {/* ── SECURITY ── */}
            <section>
              <SectionHeader icon={<Lock size={14} />} label={locale === 'pt' ? 'Segurança' : 'Security'} />

              <div style={{
                padding: '18px 20px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {locale === 'pt' ? 'Alterar password' : 'Change password'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {locale === 'pt'
                    ? 'Precisas da password atual para definir uma nova.'
                    : 'You need your current password to set a new one.'}
                </div>

                {pwError && (
                  <div style={{
                    padding: '10px 14px', marginBottom: '12px', borderRadius: '10px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: 'var(--error)', fontSize: '13px',
                  }}>
                    {pwError}
                  </div>
                )}

                {pwSuccess && (
                  <div style={{
                    padding: '10px 14px', marginBottom: '12px', borderRadius: '10px',
                    background: 'var(--accent-light)', border: '1px solid var(--accent)',
                    color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Check size={14} />
                    {locale === 'pt' ? 'Password alterada.' : 'Password changed.'}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {([
                    { key: 'current' as const, ph: locale === 'pt' ? 'Password atual' : 'Current password' },
                    { key: 'next' as const, ph: locale === 'pt' ? 'Nova password' : 'New password' },
                    { key: 'confirm' as const, ph: locale === 'pt' ? 'Confirmar nova password' : 'Confirm new password' },
                  ]).map((f) => (
                    <input
                      key={f.key}
                      type="password"
                      value={pwForm[f.key]}
                      onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                      placeholder={f.ph}
                      autoComplete={f.key === 'current' ? 'current-password' : 'new-password'}
                      style={{
                        width: '100%', padding: '10px 14px', fontSize: '14px',
                        fontFamily: 'var(--font-sans)',
                        background: 'var(--bg-input)', color: 'var(--text-primary)',
                        border: '1px solid var(--border)', borderRadius: '10px', outline: 'none',
                      }}
                    />
                  ))}

                  <button
                    onClick={handlePasswordChange}
                    disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                    style={{
                      alignSelf: 'flex-start', marginTop: '4px',
                      padding: '10px 18px', borderRadius: '10px', border: 'none',
                      background: (!pwForm.current || !pwForm.next || !pwForm.confirm)
                        ? 'var(--border)' : 'var(--accent)',
                      color: (!pwForm.current || !pwForm.next || !pwForm.confirm)
                        ? 'var(--text-tertiary)' : '#fff',
                      fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                      cursor: (pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm)
                        ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {pwSaving
                      ? (locale === 'pt' ? 'A guardar...' : 'Saving...')
                      : (locale === 'pt' ? 'Alterar password' : 'Change password')}
                  </button>
                </div>
              </div>
            </section>

            <Divider />

            {/* ── YOUR DATA ── */}
            <section>
              <SectionHeader icon={<Download size={14} />} label={locale === 'pt' ? 'Os Teus Dados' : 'Your Data'} />
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
                    {locale === 'pt' ? 'Descarregar os teus dados' : 'Download your data'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                    {locale === 'pt'
                      ? 'Exporta a tua conta, pedidos, propostas e mensagens num ficheiro JSON.'
                      : 'Export your account, requests, proposals, and messages as a JSON file.'}
                  </div>
                </div>
                <a
                  href={`/api/users/${(session.user as { id?: string }).id}/export`}
                  download
                  style={{
                    padding: '10px 18px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'var(--bg-primary)',
                    color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0,
                    textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  {locale === 'pt' ? 'Descarregar' : 'Download'}
                </a>
              </div>
            </section>

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
                      color: 'var(--error)', fontSize: '13px', fontWeight: 600,
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
                      color: 'var(--error)', fontSize: '13px',
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
                        background: deleteConfirmText === DELETE_KEYWORD ? 'var(--error)' : 'var(--border)',
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
