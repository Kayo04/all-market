'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { safeCallbackUrl } from '@/lib/redirect';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Someone sent here from a page (e.g. /pro) who needs an account instead should
  // still land back on that page after registering.
  const returnTo = safeCallbackUrl(searchParams.get('callbackUrl'));
  const registerHref = returnTo ? `/auth/register?callbackUrl=${encodeURIComponent(returnTo)}` : '/auth/register';

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
        const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
        if (callbackUrl) {
          // Full path already includes the locale prefix — bypass the locale-aware router to avoid double-prefixing
          window.location.href = callbackUrl;
        } else {
          router.push('/dashboard');
        }
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
        padding: '80px 16px 32px',
      }}
    >
      <Card
        variant="default"
        hover={false}
        style={{ width: '100%', maxWidth: '400px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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

          <div style={{ textAlign: 'right', marginTop: '-6px' }}>
            <Link
              href="/auth/forgot-password"
              style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}
            >
              {t('forgotPassword')}
            </Link>
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
            href={registerHref}
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            {t('registerBtn')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
