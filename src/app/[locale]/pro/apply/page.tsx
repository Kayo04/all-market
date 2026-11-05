'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { AlertCircle, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { categories, getCategoryByKey } from '@/lib/categories';
import { districts } from '@/lib/districts';
import { LICENCE_FOR_CATEGORY } from '@/lib/proApplication';
import { LEGAL } from '@/lib/legal';

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '14px',
  fontFamily: 'var(--font-sans)',
  backgroundColor: 'var(--bg-input)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
};
const labelStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' };

const EMPTY = {
  fullName: '',
  birthDate: '',
  phone: '',
  district: '',
  businessType: 'individual' as 'individual' | 'company',
  nif: '',
  businessName: '',
  category: '',
  subcategory: '',
  experienceYears: '',
  description: '',
  website: '',
  licenseNumber: '',
};

// The Pro application form. Submitting never makes anyone a Pro: it creates a
// pending application that an admin approves, asks to complete, or rejects.
export default function ProApplyPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const pt = locale === 'pt';
  const router = useRouter();

  const [form, setForm] = useState(EMPTY);
  const [declared, setDeclared] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const role = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/pro/apply`)}`);
      return;
    }
    if (role !== 'client') {
      router.push('/pro');
      return;
    }
    // Resubmitting after "needs_info"/"rejected": start from what was sent before.
    fetch('/api/pro-application')
      .then((r) => (r.ok ? r.json() : { application: null }))
      .then(({ application: a }) => {
        if (a && (a.status === 'pending' || a.status === 'approved')) {
          router.push('/pro');
          return;
        }
        if (a) {
          setForm({
            fullName: a.fullName ?? '',
            birthDate: a.birthDate ? String(a.birthDate).slice(0, 10) : '',
            phone: a.phone ?? '',
            district: a.district ?? '',
            businessType: a.businessType ?? 'individual',
            nif: a.nif ?? '',
            businessName: a.businessName ?? '',
            category: a.category ?? '',
            subcategory: a.subcategory ?? '',
            experienceYears: a.experienceYears != null ? String(a.experienceYears) : '',
            description: a.description ?? '',
            website: a.website ?? '',
            licenseNumber: a.licenseNumber ?? '',
          });
          setAdminMessage(a.adminMessage ?? '');
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [session, status, role, router, locale]);

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const category = getCategoryByKey(form.category);
  const licence = LICENCE_FOR_CATEGORY[form.category];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!declared) {
      setError(pt ? 'Tens de confirmar a declaração no fim do formulário.' : 'You must confirm the declaration at the end of the form.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/pro-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, experienceYears: Number(form.experienceYears || 0), declaration: true }),
      });
      if (res.ok) {
        router.push('/pro');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || (pt ? 'Algo correu mal. Tenta de novo.' : 'Something went wrong. Please try again.'));
    } catch {
      setError(pt ? 'Algo correu mal. Tenta de novo.' : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div style={{ padding: '140px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {pt ? 'A carregar...' : 'Loading...'}
      </div>
    );
  }

  const section = (n: number, title: string, hint: string) => (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>
        {n}. {title}
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{hint}</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '100px 24px 80px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
        {pt ? 'Candidatura a Pro' : 'Pro application'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
        {pt
          ? 'É gratuito. A equipa Needer analisa cada candidatura e responde-te por email. Só profissionais confirmados podem responder a pedidos.'
          : 'It is free. The Needer team reviews every application and replies by email. Only confirmed professionals can answer requests.'}
      </p>

      {adminMessage && (
        <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', marginBottom: '24px', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
          <AlertCircle size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
            <strong>{pt ? 'Mensagem da equipa Needer:' : 'Message from the Needer team:'}</strong> {adminMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card hover={false} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {section(1, pt ? 'Quem és' : 'About you', pt ? 'Como aparece no teu documento de identificação.' : 'As shown on your ID document.')}
          <Input label={pt ? 'Nome completo' : 'Full name'} id="fullName" value={form.fullName} onChange={set('fullName')} required maxLength={120} />
          <Input
            label={pt ? `Data de nascimento (tens de ter ${LEGAL.minAge} anos ou mais)` : `Date of birth (you must be ${LEGAL.minAge} or over)`}
            id="birthDate"
            type="date"
            value={form.birthDate}
            onChange={set('birthDate')}
            required
          />
          <Input label={pt ? 'Telefone' : 'Phone'} id="phone" type="tel" value={form.phone} onChange={set('phone')} required maxLength={20} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="district" style={labelStyle}>{pt ? 'Distrito onde trabalhas' : 'District you work in'}</label>
            <select id="district" value={form.district} onChange={set('district')} required style={selectStyle}>
              <option value="">{pt ? 'Escolhe o distrito…' : 'Choose a district…'}</option>
              {districts.map((d) => (
                <option key={d.key} value={d.key}>{pt ? d.labelPT : d.labelEN}</option>
              ))}
            </select>
          </div>
        </Card>

        <Card hover={false} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {section(2, pt ? 'A tua atividade' : 'Your business', pt ? 'O que fazes e como estás registado nas Finanças.' : 'What you do and how you are registered for tax.')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="businessType" style={labelStyle}>{pt ? 'Trabalhas como' : 'You work as'}</label>
            <select id="businessType" value={form.businessType} onChange={set('businessType')} style={selectStyle}>
              <option value="individual">{pt ? 'Trabalhador independente (recibos verdes / ENI)' : 'Self-employed'}</option>
              <option value="company">{pt ? 'Empresa' : 'Company'}</option>
            </select>
          </div>
          <Input
            label={form.businessType === 'company' ? (pt ? 'NIPC da empresa' : 'Company tax number (NIPC)') : 'NIF'}
            id="nif"
            value={form.nif}
            onChange={set('nif')}
            required
            inputMode="numeric"
            maxLength={12}
          />
          <Input
            label={form.businessType === 'company' ? (pt ? 'Nome da empresa' : 'Company name') : (pt ? 'Nome comercial (opcional)' : 'Trading name (optional)')}
            id="businessName"
            value={form.businessName}
            onChange={set('businessName')}
            required={form.businessType === 'company'}
            maxLength={120}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="category" style={labelStyle}>{pt ? 'Área principal' : 'Main field'}</label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: '' }))}
              required
              style={selectStyle}
            >
              <option value="">{pt ? 'Escolhe a área…' : 'Choose a field…'}</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{pt ? c.labelPT : c.labelEN}</option>
              ))}
            </select>
          </div>
          {category && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="subcategory" style={labelStyle}>{pt ? 'Especialidade' : 'Speciality'}</label>
              <select id="subcategory" value={form.subcategory} onChange={set('subcategory')} style={selectStyle}>
                <option value="">{pt ? 'Toda a área' : 'The whole field'}</option>
                {category.subcategories.map((s) => (
                  <option key={s.key} value={s.key}>{pt ? s.labelPT : s.labelEN}</option>
                ))}
              </select>
            </div>
          )}
          {licence && (
            <Input
              label={pt ? `Número de licença ${licence.name} (obrigatório nesta área)` : `${licence.name} licence number (required in this field)`}
              id="licenseNumber"
              value={form.licenseNumber}
              onChange={set('licenseNumber')}
              required
              maxLength={40}
            />
          )}
          <Input
            label={pt ? 'Anos de experiência' : 'Years of experience'}
            id="experienceYears"
            type="number"
            min={0}
            max={70}
            value={form.experienceYears}
            onChange={set('experienceYears')}
            required
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="description" style={labelStyle}>
              {pt ? 'Descreve o que fazes (mínimo 40 caracteres)' : 'Describe what you do (at least 40 characters)'}
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={set('description')}
              required
              minLength={40}
              maxLength={1500}
              rows={5}
              placeholder={pt ? 'Ex.: Eletricista certificado há 12 anos, faço instalações e reparações em casas e lojas no Porto.' : 'E.g. Certified electrician for 12 years, I do installations and repairs in homes and shops in Porto.'}
              style={{ ...selectStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
          <Input label={pt ? 'Website ou rede social (opcional)' : 'Website or social profile (optional)'} id="website" type="url" placeholder="https://" value={form.website} onChange={set('website')} maxLength={200} />
        </Card>

        <Card hover={false} style={{ padding: '24px' }}>
          {section(3, pt ? 'Comprovativos' : 'Proof', pt ? 'Brevemente vais poder enviá-los aqui.' : 'Soon you will be able to upload them here.')}
          <div style={{ display: 'flex', gap: '10px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <FileText size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {pt
                ? 'Vamos pedir o documento de identificação e um comprovativo de atividade (declaração de início de atividade ou certidão permanente). Se a equipa precisar deles antes de o envio estar disponível, contacta-te por email. Os documentos são apagados depois da decisão.'
                : 'We will ask for your ID document and proof of activity (start-of-activity declaration or company certificate). If the team needs them before uploads are available, they will contact you by email. Documents are deleted after the decision.'}
            </p>
          </div>
        </Card>

        <Card hover={false} style={{ padding: '24px' }}>
          {section(4, pt ? 'Confirmação' : 'Confirmation', pt ? 'Lê antes de enviar.' : 'Read before sending.')}
          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              style={{ width: '16px', height: '16px', marginTop: '3px', flexShrink: 0 }}
            />
            <span>
              {pt
                ? 'Declaro que os dados são verdadeiros, que tenho a atividade registada nas Finanças e as licenças que ela exige, e que aceito os '
                : 'I declare that this information is true, that my activity is registered for tax with any licence it requires, and that I accept the '}
              <Link href="/terms" target="_blank" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {pt ? 'Termos de Serviço' : 'Terms of Service'}
              </Link>
              .
            </span>
          </label>
        </Card>

        {error && (
          <p role="alert" style={{ fontSize: '14px', color: 'var(--error, #d33)' }}>
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? (pt ? 'A enviar…' : 'Sending…') : pt ? 'Enviar candidatura' : 'Send application'}
        </Button>
      </form>
    </div>
  );
}
