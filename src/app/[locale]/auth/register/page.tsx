'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Mail, Lock, User, Eye, EyeOff, MapPin, Briefcase, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: role, 2: details
  const [role, setRole] = useState<'client' | 'pro' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          locationLabel: location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed, redirect to login
        router.push('/auth/login');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong');
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
      <Card
        variant="default"
        hover={false}
        style={{ width: '100%', maxWidth: '440px', padding: '32px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            {t('registerTitle')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {t('registerSubtitle')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              marginBottom: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '16px',
                color: 'var(--text-primary)',
              }}
            >
              {t('roleSelect')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Client Option */}
              <button
                type="button"
                onClick={() => { setRole('client'); setStep(2); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  background: role === 'client' ? 'var(--accent-light)' : 'var(--bg-card)',
                  border: `2px solid ${role === 'client' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-base)',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShoppingBag size={18} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {t('roleClient')}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Post requests & find professionals
                  </div>
                </div>
              </button>

              {/* Pro Option */}
              <button
                type="button"
                onClick={() => { setRole('pro'); setStep(2); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  background: role === 'pro' ? 'var(--accent-light)' : 'var(--bg-card)',
                  border: `2px solid ${role === 'pro' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-base)',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(34, 197, 94, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Briefcase size={18} color="var(--success)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {t('rolePro')}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Respond to requests & grow your business
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Back to role selection */}
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                alignSelf: 'flex-start',
                padding: 0,
                marginBottom: '4px',
              }}
            >
              ← {role === 'client' ? t('roleClient') : t('rolePro')}
            </button>

            <Input
              label={t('name')}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              icon={<User size={16} />}
              required
            />

            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              icon={<Mail size={16} />}
              required
            />

            <div style={{ position: 'relative' }}>
              <Input
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
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
              label={t('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              required
            />

            <Input
              label="Location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lisboa, Portugal"
              icon={<MapPin size={16} />}
            />

            <Button type="submit" fullWidth size="md" loading={loading} style={{ marginTop: '8px' }}>
              {t('registerBtn')}
            </Button>
          </form>
        )}

        {/* Login Link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}
        >
          {t('hasAccount')}{' '}
          <Link
            href="/auth/login"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            {t('loginBtn')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
