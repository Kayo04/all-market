'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Briefcase, CheckCircle, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Link } from '@/i18n/navigation';

// Becoming a pro is never instant: it will be an application (professional details
// + proof of qualification) that an admin reviews. Until that form exists, this
// page only routes people to an account and explains the process — accounts are
// created as clients on /auth/register, which brings them back here afterwards.
export default function BecomeProPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const pt = locale === 'pt';

  const user = session?.user as { id?: string; role?: string } | undefined;
  const isLoggedIn = !!user?.id;
  const isAlreadyPro = user?.role === 'pro';
  // Login/register redirect with window.location, so the path needs its locale prefix.
  const returnTo = encodeURIComponent(`/${locale}/pro`);

  if (status === 'loading') return null;

  // ── Already a pro ─────────────────────────────────────────────
  if (isAlreadyPro) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
        <Card hover={false} style={{ maxWidth: '420px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <CheckCircle size={52} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
            {pt ? 'Já és um Profissional!' : "You're already a Professional!"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {pt ? 'Acede ao teu painel de profissional para gerir as tuas propostas.' : 'Head to your pro dashboard to manage your proposals.'}
          </p>
          <Link href="/dashboard/pro" style={{ textDecoration: 'none' }}>
            <Button fullWidth>{pt ? 'Ver painel profissional' : 'View Pro Dashboard'}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
      <Card variant="default" hover={false} style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Briefcase size={24} color="var(--accent)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {pt ? 'Torna-te Profissional' : 'Become a Professional'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {pt
              ? 'Para garantir a qualidade, cada profissional é confirmado pela equipa Needer antes de poder responder a pedidos.'
              : 'To keep quality high, every professional is confirmed by the Needer team before they can answer requests.'}
          </p>
        </div>

        {isLoggedIn ? (
          // ── Logged-in client: application form not built yet ──
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <ShieldCheck size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {pt
                ? 'As candidaturas a profissional abrem em breve. Vais preencher os teus dados profissionais e enviar provas da tua qualificação; depois de confirmarmos, a tua conta passa a profissional.'
                : 'Professional applications open soon. You\'ll fill in your professional details and send proof of your qualifications; once we confirm them, your account becomes a professional one.'}
            </p>
          </div>
        ) : (
          // ── Not logged in: create an account (or sign in) first, then come back ──
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {pt ? 'Primeiro, cria a tua conta Needer.' : 'First, create your Needer account.'}
            </p>
            <Link href={`/auth/register?callbackUrl=${returnTo}`} style={{ textDecoration: 'none' }}>
              <Button fullWidth>{pt ? 'Criar conta' : 'Create account'}</Button>
            </Link>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {pt ? 'Já tens conta?' : 'Already have an account?'}{' '}
              <Link href={`/auth/login?callbackUrl=${returnTo}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                {pt ? 'Entrar' : 'Sign in'}
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
