'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Link, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Mail, Lock, User, Eye, EyeOff, Phone, Briefcase, Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'client' | 'pro'>('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(locale === 'pt' ? 'As passwords não coincidem' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError(locale === 'pt' ? 'A password deve ter pelo menos 6 caracteres' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (locale === 'pt' ? 'Erro no registo' : 'Registration failed'));
        return;
      }

      const signInResult = await signIn('credentials', { email, password, redirect: false });
      if (signInResult?.error) {
        router.push('/auth/login');
      } else {
        router.push(role === 'pro' ? '/dashboard/pro/onboarding' : '/dashboard');
      }
    } catch {
      setError(locale === 'pt' ? 'Algo correu mal' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 60px',
      }}
    >
      <Card variant="default" hover={false} style={{ width: '100%', maxWidth: '420px', padding: '36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 800,
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            {locale === 'pt' ? 'Criar conta' : 'Create account'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {locale === 'pt' ? 'Rápido, gratuito e sem complicações.' : 'Quick, free, and no fuss.'}
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { value: 'client' as const, icon: Search, labelEN: 'I need help', labelPT: 'Preciso de ajuda' },
            { value: 'pro' as const, icon: Briefcase, labelEN: "I'm a professional", labelPT: 'Sou profissional' },
          ].map(opt => {
            const Icon = opt.icon;
            const isActive = role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  background: isActive ? 'rgba(29,191,115,0.08)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent)' : 'var(--text-tertiary)'} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                  {locale === 'pt' ? opt.labelPT : opt.labelEN}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              marginBottom: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#dc2626',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label={locale === 'pt' ? 'Nome completo' : 'Full name'}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="João Silva"
            icon={<User size={16} />}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            icon={<Mail size={16} />}
            required
          />

          <Input
            label={locale === 'pt' ? 'Telemóvel (opcional)' : 'Phone (optional)'}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+351 900 000 000"
            icon={<Phone size={16} />}
          />

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Input
              label={locale === 'pt' ? 'Password' : 'Password'}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={locale === 'pt' ? 'Mín. 6 caracteres' : 'Min. 6 characters'}
              icon={<Lock size={16} />}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Input
            label={locale === 'pt' ? 'Confirmar password' : 'Confirm password'}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            required
          />

          {/* Submit — black, no green */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              background: loading ? '#555' : '#111111',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#111111'; }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="30" strokeDashoffset="10" />
                </svg>
                {locale === 'pt' ? 'A criar...' : 'Creating...'}
              </>
            ) : (
              locale === 'pt' ? 'Criar conta' : 'Create account'
            )}
          </button>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {locale === 'pt' ? 'Já tens conta?' : 'Already have an account?'}{' '}
          <Link href="/auth/login" style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
            {locale === 'pt' ? 'Entrar' : 'Sign in'}
          </Link>
        </p>


      </Card>
    </div>
  );
}
