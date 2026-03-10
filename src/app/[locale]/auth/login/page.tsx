'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
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
        style={{ width: '100%', maxWidth: '400px', padding: '32px' }}
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
            {t('loginTitle')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {t('loginSubtitle')}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              placeholder="••••••••"
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

          <Button type="submit" fullWidth size="md" loading={loading} style={{ marginTop: '8px' }}>
            {t('loginBtn')}
          </Button>
        </form>

        {/* Register Link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}
        >
          {t('noAccount')}{' '}
          <Link
            href="/auth/register"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            {t('registerBtn')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
