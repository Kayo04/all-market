'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, MapPin, Euro, Send, Zap, Clock, ShieldCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { categories } from '@/lib/categories';

// Only service categories — products removed per pivot
const serviceCategories = categories.filter((c) => c.type === 'service');

export default function NewRequestPage() {
  const { data: session } = useSession();
  const t = useTranslations('request');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    fixedPrice: '',
    location: locale === 'pt' ? 'Porto, Portugal' : 'Porto, Portugal',
    urgency: 'standard' as 'urgent' | 'standard',
    intentConfirmed: false,
  });

  const selectedCat = serviceCategories.find((c) => c.key === form.category);

  const handleSubmit = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!form.intentConfirmed) {
      setError(locale === 'pt' ? 'Tens de confirmar o teu compromisso.' : 'You must confirm your commitment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          subcategory: form.subcategory,
          budget: parseFloat(form.fixedPrice),
          fixedPrice: parseFloat(form.fixedPrice),
          urgency: form.urgency,
          intentConfirmed: form.intentConfirmed,
          location: { type: 'Point', coordinates: [0, 0] },
          locationLabel: form.location,
        }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create request');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const TOTAL_STEPS = 4;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 24px 60px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        {locale === 'pt' ? 'Publicar Trabalho' : 'Post a Job'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {locale === 'pt'
          ? 'Define o preço. O primeiro profissional verificado a aceitar fica com o trabalho.'
          : 'Set your price. The first verified pro to accept gets the job.'}
      </p>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: 'var(--radius-full)',
              background: s <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'background var(--transition-base)',
            }}
          />
        ))}
      </div>

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

      <Card variant="glass" hover={false} style={{ padding: '32px' }}>
        {/* ─── Step 1: Category ─── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              {t('category')}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {locale === 'pt'
                ? 'Apenas serviços. Reparações de emergência em destaque.'
                : 'Services only. Emergency repairs featured.'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '10px',
              }}
            >
              {serviceCategories.map((cat) => {
                const isEmergency = cat.key === 'home-repairs';
                return (
                  <button
                    key={cat.key}
                    onClick={() => setForm({ ...form, category: cat.key, subcategory: '' })}
                    style={{
                      padding: '14px',
                      background: form.category === cat.key ? 'var(--accent-light)' : 'var(--bg-card)',
                      border: `2px solid ${form.category === cat.key ? 'var(--accent)' : isEmergency ? '#f97316' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      fontWeight: 600,
                      position: 'relative',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {isEmergency && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: '#f97316',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {locale === 'pt' ? 'TOP' : 'TOP'}
                      </span>
                    )}
                    {locale === 'pt' ? cat.labelPT : cat.labelEN}
                  </button>
                );
              })}
            </div>

            {selectedCat && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  {t('subcategory')}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedCat.subcategories.map((sub) => (
                    <button
                      key={sub.key}
                      onClick={() => setForm({ ...form, subcategory: sub.key })}
                      style={{
                        padding: '8px 16px',
                        background: form.subcategory === sub.key ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                        border: `1px solid ${form.subcategory === sub.key ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer',
                        color: form.subcategory === sub.key ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {locale === 'pt' ? sub.labelPT : sub.labelEN}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <Button
                onClick={() => setStep(2)}
                disabled={!form.category || !form.subcategory}
                icon={<ArrowRight size={16} />}
              >
                {tc('next')}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 2: Details ─── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                {locale === 'pt' ? 'Detalhes do Trabalho' : 'Job Details'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {locale === 'pt'
                  ? 'Quanto mais claro fores, mais rápido um profissional aceita.'
                  : 'The clearer you are, the faster a pro will accept.'}
              </p>
            </div>

            <Input
              label={t('title')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={locale === 'pt' ? 'Ex: Preciso de canalizador urgente' : 'E.g.: Need a plumber urgently'}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {t('description')}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={locale === 'pt' ? 'Descreve o problema com detalhe...' : 'Describe the problem in detail...'}
                rows={5}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Urgency toggle */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                {locale === 'pt' ? 'Urgência' : 'Urgency'}
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, urgency: 'urgent' })}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: form.urgency === 'urgent' ? 'rgba(249,115,22,0.1)' : 'var(--bg-card)',
                    border: `2px solid ${form.urgency === 'urgent' ? '#f97316' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Zap size={20} color={form.urgency === 'urgent' ? '#f97316' : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: form.urgency === 'urgent' ? '#f97316' : 'var(--text-primary)' }}>
                    {locale === 'pt' ? 'AGORA' : 'RIGHT NOW'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {locale === 'pt' ? 'Preciso hoje' : 'Need it today'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, urgency: 'standard' })}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: form.urgency === 'standard' ? 'var(--accent-light)' : 'var(--bg-card)',
                    border: `2px solid ${form.urgency === 'standard' ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Clock size={20} color={form.urgency === 'standard' ? 'var(--accent)' : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: form.urgency === 'standard' ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {locale === 'pt' ? 'FLEXÍVEL' : 'FLEXIBLE'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {locale === 'pt' ? 'Esta semana' : 'This week'}
                  </span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft size={16} />}>
                {tc('back')}
              </Button>
              <Button onClick={() => setStep(3)} disabled={!form.title || !form.description} icon={<ArrowRight size={16} />}>
                {tc('next')}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Fixed Price & Location ─── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                {locale === 'pt' ? 'Preço Fixo & Localização' : 'Fixed Price & Location'}
              </h2>
              <div
                style={{
                  padding: '12px 14px',
                  background: 'rgba(249,115,22,0.08)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  color: '#f97316',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Zap size={14} />
                {locale === 'pt'
                  ? 'Este é o preço que pagas. O primeiro profissional a aceitar fica com o trabalho — sem negociação.'
                  : 'This is the price you pay. The first pro to accept gets the job — no negotiation.'}
              </div>
            </div>

            <Input
              label={locale === 'pt' ? 'Preço Fixo (€)' : 'Fixed Price (€)'}
              type="number"
              value={form.fixedPrice}
              onChange={(e) => setForm({ ...form, fixedPrice: e.target.value })}
              placeholder={locale === 'pt' ? 'Ex: 80' : 'E.g.: 80'}
              icon={<Euro size={16} />}
            />

            <Input
              label={t('location')}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Porto, Portugal"
              icon={<MapPin size={16} />}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft size={16} />}>
                {tc('back')}
              </Button>
              <Button onClick={() => setStep(4)} disabled={!form.fixedPrice || !form.location} icon={<ArrowRight size={16} />}>
                {tc('next')}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 4: Confirm Intent ─── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                {locale === 'pt' ? 'Confirmar Compromisso' : 'Confirm Commitment'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {locale === 'pt'
                  ? 'Para proteger os nossos profissionais de pedidos falsos, confirma que és sério.'
                  : 'To protect our pros from fake requests, confirm you are serious.'}
              </p>
            </div>

            {/* Job Summary */}
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                {locale === 'pt' ? 'Resumo do Pedido' : 'Job Summary'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{form.title}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>€{form.fixedPrice}</span>
                <span>{form.location}</span>
                {form.urgency === 'urgent' && (
                  <span style={{ color: '#f97316', fontWeight: 600 }}>
                    🔥 {locale === 'pt' ? 'Urgente' : 'Urgent'}
                  </span>
                )}
              </div>
            </div>

            {/* Intent Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '16px',
                background: form.intentConfirmed ? 'rgba(0,80,30,0.08)' : 'var(--bg-card)',
                border: `2px solid ${form.intentConfirmed ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <input
                type="checkbox"
                checked={form.intentConfirmed}
                onChange={(e) => setForm({ ...form, intentConfirmed: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />
              <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                <strong>{locale === 'pt' ? 'Confirmo' : 'I confirm'}</strong>{' '}
                {locale === 'pt'
                  ? `que tenho os €${form.fixedPrice || '—'} disponíveis e que pagarei ao primeiro profissional verificado que aceitar este trabalho.`
                  : `that I have €${form.fixedPrice || '—'} available and will pay the first verified professional who accepts this job.`}
              </span>
            </label>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
              }}
            >
              <ShieldCheck size={14} />
              {locale === 'pt'
                ? 'O teu pedido só é publicado quando confirmares. Não existe pagamento agora.'
                : 'Your job is only published once you confirm. No payment is taken now.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <Button variant="ghost" onClick={() => setStep(3)} icon={<ArrowLeft size={16} />}>
                {tc('back')}
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!form.intentConfirmed}
                icon={<Send size={16} />}
              >
                {locale === 'pt' ? 'Publicar Trabalho' : 'Publish Job'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
