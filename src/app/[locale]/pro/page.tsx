'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { AlertCircle, Briefcase, CheckCircle, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Link } from '@/i18n/navigation';
import NeederPro from '@/components/features/NeederPro';

// Becoming a pro is never instant: it is an application (/pro/apply) that an admin
// reviews. This page explains it, sends logged-out visitors to an account first
// (/auth/register brings them back here), and shows a client where their
// application stands.
export default function BecomeProPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const pt = locale === 'pt';

  const user = session?.user as { id?: string; role?: string } | undefined;
  const isLoggedIn = !!user?.id;
  const isAlreadyPro = user?.role === 'pro';
  // Login/register redirect with window.location, so the path needs its locale prefix.
  const returnTo = encodeURIComponent(`/${locale}/pro`);

  const [application, setApplication] = useState<{ status: string; adminMessage?: string; submittedAt?: string } | null | undefined>(undefined);
  useEffect(() => {
    if (!isLoggedIn || isAlreadyPro) return;
    fetch('/api/pro-application')
      .then((r) => (r.ok ? r.json() : { application: null }))
      .then((d) => setApplication(d.application ?? null))
      .catch(() => setApplication(null));
  }, [isLoggedIn, isAlreadyPro]);

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
    // The pitch (what a pro gets) sits above the application card; the navbar is
    // fixed, so the section starts below it.
    <div style={{ paddingTop: '64px' }}>
    <NeederPro showCta={false} />
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 24px 80px' }}>
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
          // ── Logged-in client: start the application, or see where it stands ──
          <ApplicationStatus application={application} pt={pt} />
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
    </div>
  );
}

function ApplicationStatus({
  application,
  pt,
}: {
  application: { status: string; adminMessage?: string; submittedAt?: string } | null | undefined;
  pt: boolean;
}) {
  if (application === undefined) return null;

  const box = (icon: React.ReactNode, text: React.ReactNode) => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '16px' }}>
      {icon}
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</div>
    </div>
  );
  const button = (label: string) => (
    <Link href="/pro/apply" style={{ textDecoration: 'none' }}>
      <Button fullWidth>{label}</Button>
    </Link>
  );
  const message = application?.adminMessage ? (
    <p style={{ marginTop: '6px' }}>
      <strong>{pt ? 'Mensagem da equipa:' : 'Message from the team:'}</strong> {application.adminMessage}
    </p>
  ) : null;

  if (!application) {
    return (
      <>
        {box(
          <Briefcase size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />,
          pt
            ? 'Preenche os teus dados profissionais (cerca de 5 minutos). A equipa Needer analisa a candidatura e responde-te por email.'
            : 'Fill in your professional details (about 5 minutes). The Needer team reviews the application and replies by email.'
        )}
        {button(pt ? 'Começar candidatura' : 'Start application')}
      </>
    );
  }
  if (application.status === 'pending') {
    const since = application.submittedAt ? new Date(application.submittedAt).toLocaleDateString(pt ? 'pt-PT' : 'en-GB') : '';
    return box(
      <Clock size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />,
      pt
        ? `A tua candidatura está em análise${since ? ` desde ${since}` : ''}. Vais receber a resposta por email.`
        : `Your application is under review${since ? ` since ${since}` : ''}. You will get the answer by email.`
    );
  }
  if (application.status === 'needs_info') {
    return (
      <>
        {box(
          <AlertCircle size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />,
          <>
            {pt ? 'Precisamos de mais informação para decidir.' : 'We need more information to decide.'}
            {message}
          </>
        )}
        {button(pt ? 'Atualizar candidatura' : 'Update application')}
      </>
    );
  }
  return (
    <>
      {box(
        <AlertCircle size={20} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: '2px' }} />,
        <>
          {pt ? 'A tua candidatura não foi aprovada.' : 'Your application was not approved.'}
          {message}
        </>
      )}
      {button(pt ? 'Candidatar-me de novo' : 'Apply again')}
    </>
  );
}
