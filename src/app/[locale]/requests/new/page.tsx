'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, MapPin, Euro, Send } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { categories, isEquipmentCategory } from '@/lib/categories';

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
    budget: '',
    location: '',
    itemCondition: 'any',
    acceptsTrades: false,
  });

  const selectedCat = categories.find((c) => c.key === form.category);
  const showEquipmentFields = isEquipmentCategory(form.category);

  const handleSubmit = async () => {
    if (!session) {
      router.push('/auth/login');
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
          budget: parseFloat(form.budget),
          location: { type: 'Point', coordinates: [0, 0] },
          locationLabel: form.location,
          itemCondition: showEquipmentFields ? form.itemCondition : undefined,
          acceptsTrades: showEquipmentFields ? form.acceptsTrades : undefined,
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
        {t('newTitle')}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {locale === 'pt'
          ? 'Descreve o que precisas e recebe propostas de profissionais.'
          : 'Describe what you need and receive proposals from professionals.'}
      </p>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
        {[1, 2, 3].map((s) => (
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
        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              {t('category')}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '10px',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setForm({ ...form, category: cat.key, subcategory: '' })}
                  style={{
                    padding: '14px',
                    background: form.category === cat.key ? 'var(--accent-light)' : 'var(--bg-card)',
                    border: `2px solid ${form.category === cat.key ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {locale === 'pt' ? cat.labelPT : cat.labelEN}
                </button>
              ))}
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

        {/* Step 2: Details */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              {locale === 'pt' ? 'Detalhes do Pedido' : 'Request Details'}
            </h2>

            <Input
              label={t('title')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('titlePlaceholder')}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {t('description')}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('descriptionPlaceholder')}
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

            {/* Equipment-specific fields */}
            {showEquipmentFields && (
              <>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    {t('itemCondition')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['new', 'used', 'any'] as const).map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setForm({ ...form, itemCondition: cond })}
                        style={{
                          padding: '8px 18px',
                          background: form.itemCondition === cond ? 'var(--accent-light)' : 'var(--bg-card)',
                          border: `1px solid ${form.itemCondition === cond ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-full)',
                          cursor: 'pointer',
                          color: form.itemCondition === cond ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {t(`condition${cond.charAt(0).toUpperCase() + cond.slice(1)}` as 'conditionNew')}
                      </button>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.acceptsTrades}
                    onChange={(e) => setForm({ ...form, acceptsTrades: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--accent)',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {t('acceptsTrades')}
                  </span>
                </label>
              </>
            )}

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

        {/* Step 3: Budget & Location */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              {locale === 'pt' ? 'Orçamento e Localização' : 'Budget & Location'}
            </h2>

            <Input
              label={t('budget')}
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder={t('budgetPlaceholder')}
              icon={<Euro size={16} />}
            />

            <Input
              label={t('location')}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={t('locationPlaceholder')}
              icon={<MapPin size={16} />}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <Button variant="ghost" onClick={() => setStep(2)} icon={<ArrowLeft size={16} />}>
                {tc('back')}
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!form.budget || !form.location}
                icon={<Send size={16} />}
              >
                {t('submit')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
