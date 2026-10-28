'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Lock, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { PASSWORD_MIN } from '@/lib/validation';

// Step 2 of "forgot password": the page the emailed link opens (?token=…).
export default function ResetPasswordPage() {
  const locale = useLocale();
  const pt = locale === 'pt';
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < PASSWORD_MIN || password.length > 72) {
      setError(pt ? `A password tem de ter entre ${PASSWORD_MIN} e 72 caracteres.` : `Password must be between ${PASSWORD_MIN} and 72 characters.`);
      return;
    }
    if (password !== confirm) {
      setError(pt ? 'As passwords não coincidem.' : "Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setDone(true);
      } else if (res.status === 429) {
        setError(pt ? 'Demasiadas tentativas. Tenta novamente daqui a uns minutos.' : 'Too many attempts. Please try again in a few minutes.');
      } else if (res.status === 400) {
        setError(pt ? 'Este link é inválido ou já expirou. Pede um novo.' : 'This link is invalid or has expired. Ask for a new one.');
      } else {
        setError(pt ? 'Algo correu mal. Tenta novamente.' : 'Something went wrong. Please try again.');
      }
    } catch {
      setError(pt ? 'Algo correu mal. Tenta novamente.' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const linkStyle = { color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 32px' }}>
      <Card variant="default" hover={false} style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {pt ? 'Nova password' : 'New password'}
          </h1>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={40} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {pt ? 'A tua password foi alterada. Já podes entrar com a nova.' : 'Your password was changed. You can now sign in with the new one.'}
            </p>
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Button fullWidth>{pt ? 'Entrar' : 'Sign in'}</Button>
            </Link>
          </div>
        ) : !token ? (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {pt ? 'Este link está incompleto. ' : 'This link is incomplete. '}
            <Link href="/auth/forgot-password" style={linkStyle}>
              {pt ? 'Pede um novo link' : 'Ask for a new link'}
            </Link>
          </p>
        ) : (
          <>
            {error && (
              <div style={{ padding: '10px 14px', marginBottom: '20px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', fontSize: '13px' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label={pt ? 'Nova password' : 'New password'}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                autoComplete="new-password"
                required
              />
              <Input
                label={pt ? 'Repete a password' : 'Repeat the password'}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                autoComplete="new-password"
                required
              />
              <Button type="submit" fullWidth size="md" loading={loading} style={{ marginTop: '8px' }}>
                {pt ? 'Guardar password' : 'Save password'}
              </Button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Link href="/auth/forgot-password" style={linkStyle}>
                {pt ? 'Pedir um novo link' : 'Ask for a new link'}
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
