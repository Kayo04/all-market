'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, MapPin, Euro, Send, Zap, Clock, ShieldCheck, ImagePlus, X, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { categories } from '@/lib/categories';

// Preserves in-progress form data across the login redirect (see handleSubmit) —
// sessionStorage so it never survives past the tab/session.
const DRAFT_KEY = 'needer_request_draft';

export default function NewRequestPage() {
  const { data: session } = useSession();
  const t = useTranslations('request');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = categories.find((c) => c.key === searchParams.get('category'))?.key || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: initialCategory,
    subcategory: '',
    fixedPrice: '',
    location: locale === 'pt' ? 'Porto, Portugal' : 'Porto, Portugal',
    urgency: 'Normal' as 'Urgent' | 'Normal',
    intentConfirmed: false,
    images: [] as string[],
  });

  const MAX_IMAGES = 5;

  // Restore a draft saved before an unauthenticated user was sent to log in
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        sessionStorage.removeItem(DRAFT_KEY);
        const draft = JSON.parse(raw);
        setForm((f) => ({ ...f, ...draft }));
        setStep(4);
      }
    } catch {
      // corrupt or inaccessible storage — ignore, user just re-fills the form
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCat = categories.find((c) => c.key === form.category);

  const handleImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageError('');
    const slotsLeft = MAX_IMAGES - form.images.length;
    const toUpload = Array.from(files).slice(0, slotsLeft);

    setImageUploading(true);
    try {
      for (const file of toUpload) {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body });
        if (res.ok) {
          const data = await res.json();
          setForm((f) => ({ ...f, images: [...f.images, data.url] }));
        } else {
          const data = await res.json().catch(() => ({}));
          setImageError(data.error || (locale === 'pt' ? 'Falha ao enviar imagem.' : 'Failed to upload image.'));
        }
      }
    } catch {
      setImageError(locale === 'pt' ? 'Falha ao enviar imagem.' : 'Failed to upload image.');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  };

  const handleSubmit = async () => {
    if (!session) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch {
        // storage unavailable (private browsing, quota) — proceed anyway, just without the draft
      }
      const returnTo = window.location.pathname + window.location.search;
      window.location.href = `/${locale}/auth/login?callbackUrl=${encodeURIComponent(returnTo)}`;
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
          images: form.images,
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
                ? 'Serviços ou produtos. Reparações de emergência em destaque.'
                : 'Services or products. Emergency repairs featured.'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '10px',
              }}
            >
              {categories.map((cat) => {
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

            {/* Photos */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                {locale === 'pt' ? 'Fotos (opcional)' : 'Photos (optional)'}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {form.images.map((url) => (
                  <div
                    key={url}
                    style={{
                      position: 'relative', width: '76px', height: '76px',
                      borderRadius: 'var(--radius-md)', overflow: 'hidden',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      aria-label={locale === 'pt' ? 'Remover imagem' : 'Remove image'}
                      style={{
                        position: 'absolute', top: '3px', right: '3px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {form.images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    style={{
                      width: '76px', height: '76px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border)',
                      background: 'var(--bg-card)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '4px', cursor: imageUploading ? 'wait' : 'pointer',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {imageUploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                    <span style={{ fontSize: '10px' }}>{form.images.length}/{MAX_IMAGES}</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={(e) => handleImageSelect(e.target.files)}
                style={{ display: 'none' }}
              />
              {imageError && (
                <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '6px' }}>{imageError}</p>
              )}
            </div>

            {/* Urgency toggle */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                {locale === 'pt' ? 'Urgência' : 'Urgency'}
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, urgency: 'Urgent' })}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: form.urgency === 'Urgent' ? 'rgba(249,115,22,0.1)' : 'var(--bg-card)',
                    border: `2px solid ${form.urgency === 'Urgent' ? '#f97316' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Zap size={20} color={form.urgency === 'Urgent' ? '#f97316' : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: form.urgency === 'Urgent' ? '#f97316' : 'var(--text-primary)' }}>
                    {locale === 'pt' ? 'AGORA' : 'RIGHT NOW'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {locale === 'pt' ? 'Preciso hoje' : 'Need it today'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, urgency: 'Normal' })}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: form.urgency === 'Normal' ? 'var(--accent-light)' : 'var(--bg-card)',
                    border: `2px solid ${form.urgency === 'Normal' ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Clock size={20} color={form.urgency === 'Normal' ? 'var(--accent)' : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: form.urgency === 'Normal' ? 'var(--accent)' : 'var(--text-primary)' }}>
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
              min="1"
              step="1"
              value={form.fixedPrice}
              onChange={(e) => setForm({ ...form, fixedPrice: e.target.value })}
              placeholder={locale === 'pt' ? 'Ex: 80' : 'E.g.: 80'}
              icon={<Euro size={16} />}
            />
            {form.fixedPrice !== '' && parseFloat(form.fixedPrice) <= 0 && (
              <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '-8px' }}>
                {locale === 'pt' ? 'O preço tem de ser maior que €0.' : 'Price must be greater than €0.'}
              </p>
            )}

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
              <Button
                onClick={() => setStep(4)}
                disabled={!form.fixedPrice || parseFloat(form.fixedPrice) <= 0 || !form.location}
                icon={<ArrowRight size={16} />}
              >
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
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {form.images.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                  ))}
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{form.title}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>€{form.fixedPrice}</span>
                <span>{form.location}</span>
                {form.urgency === 'Urgent' && (
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
