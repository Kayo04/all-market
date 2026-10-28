'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Mail, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// Step 1 of "forgot password": ask for the email. The API answers the same way
// whether or not the account exists, so this page always shows the same success.
export default function ForgotPasswordPage() {
  const locale = useLocale();
  const pt = locale === 'pt';
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok) {
        setSent(true);
      } else if (res.status === 429) {
        setError(pt ? 'Demasiadas tentativas. Tenta novamente daqui a uns minutos.' : 'Too many attempts. Please try again in a few minutes.');
      } else if (res.status === 400) {
        setError(pt ? 'Escreve um email válido.' : 'Enter a valid email.');
      } else {
        setError(pt ? 'Algo correu mal. Tenta novamente.' : 'Something went wrong. Please try again.');
      }
    } catch {
      setError(pt ? 'Algo correu mal. Tenta novamente.' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 32px' }}>
      <Card variant="default" hover={false} style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {pt ? 'Recuperar password' : 'Reset your password'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {pt
              ? 'Escreve o email da tua conta e enviamos-te um link para escolheres uma nova password.'
              : "Enter your account's email and we'll send you a link to choose a new password."}
          </p>
        </div>

        {sent ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <CheckCircle size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {pt
                ? 'Se existir uma conta com este email, vais receber um link nos próximos minutos. O link é válido durante 1 hora. Vê também a pasta de spam.'
                : "If an account exists for this email, you'll get a link in the next few minutes. It's valid for 1 hour. Check your spam folder too."}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ padding: '10px 14px', marginBottom: '20px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', fontSize: '13px' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                icon={<Mail size={16} />}
                required
              />
              <Button type="submit" fullWidth size="md" loading={loading} style={{ marginTop: '8px' }}>
                {pt ? 'Enviar link' : 'Send link'}
              </Button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            {pt ? 'Voltar a entrar' : 'Back to sign in'}
          </Link>
        </p>
      </Card>
    </div>
  );
}
