'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { Shield, Building, Hash, Globe, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function VerifyPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();

  const [verificationStatus, setVerificationStatus] = useState('none');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    businessName: '',
    taxId: '',
    website: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    async function checkStatus() {
      try {
        const res = await fetch('/api/verified');
        if (res.ok) {
          const data = await res.json();
          setVerificationStatus(data.verificationStatus || 'none');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
        setVerificationStatus('pending');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Back */}
      <Link
        href="/dashboard/pro"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={14} />
        {locale === 'pt' ? 'Voltar ao Dashboard' : 'Back to Dashboard'}
      </Link>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        <Shield size={28} style={{ display: 'inline', marginRight: '10px', color: 'var(--accent)' }} />
        {locale === 'pt' ? 'Verificação Profissional' : 'Professional Verification'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {locale === 'pt'
          ? 'Verifica a tua identidade para ganhar o selo de confiança e atrair mais clientes.'
          : 'Verify your identity to earn the trust badge and attract more clients.'}
      </p>

      {/* Already verified */}
      {verificationStatus === 'approved' && (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '40px' }}>
          <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>
            {locale === 'pt' ? 'Estás Verificado!' : 'You are Verified!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'O teu perfil tem o selo de verificação visível para todos os clientes.'
              : 'Your profile shows the verification badge for all clients to see.'}
          </p>
        </Card>
      )}

      {/* Pending */}
      {(verificationStatus === 'pending' || submitted) && verificationStatus !== 'approved' && (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '40px' }}>
          <Clock size={48} color="var(--warning)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>
            {locale === 'pt' ? 'Em Análise' : 'Under Review'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'O teu pedido de verificação foi enviado. Vamos analisar e notificar-te em breve.'
              : 'Your verification request has been submitted. We will review and notify you shortly.'}
          </p>
        </Card>
      )}

      {/* Form */}
      {verificationStatus === 'none' && !submitted && (
        <>
          {/* Benefits */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            {[
              { icon: '✓', text: locale === 'pt' ? 'Selo de confiança no perfil' : 'Trust badge on profile' },
              { icon: '↑', text: locale === 'pt' ? 'Prioridade nos resultados' : 'Priority in search results' },
              { icon: '★', text: locale === 'pt' ? 'Mais propostas aceites' : 'More proposals accepted' },
            ].map((b) => (
              <Card key={b.text} hover={false} style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{b.icon}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{b.text}</div>
              </Card>
            ))}
          </div>

          <Card variant="glass" hover={false} style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label={locale === 'pt' ? 'Nome da Empresa' : 'Business Name'}
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="All Services, Lda."
                icon={<Building size={16} />}
                required
              />

              <Input
                label={locale === 'pt' ? 'NIF / Tax ID' : 'Tax ID'}
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                placeholder="123456789"
                icon={<Hash size={16} />}
                required
              />

              <Input
                label={locale === 'pt' ? 'Website (opcional)' : 'Website (optional)'}
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
                icon={<Globe size={16} />}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={submitting}
                disabled={!form.businessName || !form.taxId}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #1dbf73, #10b981)',
                }}
              >
                {locale === 'pt' ? 'Submeter Verificação' : 'Submit Verification'}
              </Button>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
