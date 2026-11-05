'use client';

import { useCallback, useEffect, useState } from 'react';
import { Briefcase, Check, ExternalLink, HelpCircle, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getCategoryByKey } from '@/lib/categories';
import { districtLabel } from '@/lib/districts';
import { ageOn, LICENCE_FOR_CATEGORY } from '@/lib/proApplication';

interface Application {
  _id: string;
  userId?: { name: string; email: string; createdAt?: string };
  fullName: string;
  birthDate: string;
  phone: string;
  district: string;
  businessType: 'individual' | 'company';
  nif: string;
  businessName?: string;
  category: string;
  subcategory?: string;
  experienceYears: number;
  description: string;
  website?: string;
  licenseNumber?: string;
  submittedAt: string;
}

type Action = 'approve' | 'needs_info' | 'reject';

// Admin queue of Pro applications. Every decision can carry a message to the
// applicant; asking for more info or rejecting requires one (the API enforces it).
export default function ProApplicationsReview({ pt }: { pt: boolean }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pro-applications');
      if (res.ok) setApps((await res.json()).applications ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id: string, action: Action) => {
    const message = (messages[id] ?? '').trim();
    if (action !== 'approve' && message.length < 10) {
      setError(pt ? 'Escreve uma mensagem (mínimo 10 caracteres) a explicar o que falta ou porque rejeitas.' : 'Write a message (at least 10 characters) explaining what is missing or why you reject.');
      return;
    }
    setBusy(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/pro-applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message }),
      });
      if (res.ok) {
        setApps((prev) => prev.filter((a) => a._id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (pt ? 'Algo correu mal.' : 'Something went wrong.'));
      }
    } finally {
      setBusy(null);
    }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', gap: '8px', fontSize: '13px', lineHeight: 1.6 }}>
      <span style={{ color: 'var(--text-tertiary)', minWidth: '130px' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  );

  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase size={22} color="var(--accent)" />
        {pt ? 'Candidaturas a Pro' : 'Pro applications'} {!loading && `(${apps.length})`}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {pt
          ? 'Confirma o NIF e, nas áreas reguladas, a licença no registo oficial antes de aprovar. A mensagem vai por email para o candidato.'
          : 'Check the NIF and, in regulated fields, the licence in the official register before approving. The message is emailed to the applicant.'}
      </p>

      {error && (
        <div role="alert" style={{ padding: '10px 14px', marginBottom: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--error)', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{pt ? 'A carregar...' : 'Loading...'}</p>
      ) : apps.length === 0 ? (
        <Card hover={false} style={{ padding: '28px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{pt ? 'Não há candidaturas por analisar.' : 'No applications to review.'}</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {apps.map((a) => {
            const cat = getCategoryByKey(a.category);
            const sub = cat?.subcategories.find((s) => s.key === a.subcategory);
            const licence = LICENCE_FOR_CATEGORY[a.category];
            return (
              <Card key={a._id} variant="glass" hover={false} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{a.fullName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {a.userId?.email} · {pt ? 'enviada a' : 'sent on'} {new Date(a.submittedAt).toLocaleDateString(pt ? 'pt-PT' : 'en-GB')}
                  </div>
                </div>
                <div>
                  {row(pt ? 'Idade' : 'Age', `${ageOn(new Date(a.birthDate))} (${String(a.birthDate).slice(0, 10)})`)}
                  {row(pt ? 'Telefone' : 'Phone', a.phone)}
                  {row(pt ? 'Distrito' : 'District', districtLabel(a.district, pt ? 'pt' : 'en'))}
                  {row(pt ? 'Tipo' : 'Type', a.businessType === 'company' ? (pt ? 'Empresa' : 'Company') : (pt ? 'Independente' : 'Self-employed'))}
                  {row(a.businessType === 'company' ? 'NIPC' : 'NIF', a.nif)}
                  {row(pt ? 'Nome comercial' : 'Business name', a.businessName)}
                  {row(pt ? 'Área' : 'Field', `${cat ? (pt ? cat.labelPT : cat.labelEN) : a.category}${sub ? ` / ${pt ? sub.labelPT : sub.labelEN}` : ''}`)}
                  {licence &&
                    row(
                      licence.name,
                      <>
                        {a.licenseNumber}{' '}
                        <a href={licence.registerUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                          <ExternalLink size={12} style={{ display: 'inline' }} /> {pt ? 'registo oficial' : 'official register'}
                        </a>
                      </>
                    )}
                  {row(pt ? 'Experiência' : 'Experience', `${a.experienceYears} ${pt ? 'anos' : 'years'}`)}
                  {row(
                    'Website',
                    a.website ? (
                      <a href={a.website} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--accent)' }}>
                        {a.website}
                      </a>
                    ) : ''
                  )}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                  {a.description}
                </p>
                <textarea
                  value={messages[a._id] ?? ''}
                  onChange={(e) => setMessages((m) => ({ ...m, [a._id]: e.target.value }))}
                  rows={3}
                  maxLength={2000}
                  placeholder={pt ? 'Mensagem para o candidato (obrigatória para pedir informação ou rejeitar)' : 'Message to the applicant (required to ask for info or reject)'}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '14px', fontFamily: 'var(--font-sans)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button size="sm" loading={busy === a._id} onClick={() => decide(a._id, 'approve')} style={{ background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> {pt ? 'Aprovar' : 'Approve'}
                  </Button>
                  <Button size="sm" variant="secondary" loading={busy === a._id} onClick={() => decide(a._id, 'needs_info')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HelpCircle size={14} /> {pt ? 'Pedir mais informação' : 'Ask for more info'}
                  </Button>
                  <Button size="sm" variant="secondary" loading={busy === a._id} onClick={() => decide(a._id, 'reject')} style={{ borderColor: 'var(--error)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={14} /> {pt ? 'Rejeitar' : 'Reject'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
