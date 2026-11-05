'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Flag, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type Target = 'request' | 'proposal' | 'user';

const REASONS: { key: string; pt: string; en: string }[] = [
  { key: 'scam', pt: 'Burla ou tentativa de fraude', en: 'Scam or fraud attempt' },
  { key: 'illegal', pt: 'Conteúdo ou produto ilegal', en: 'Illegal content or product' },
  { key: 'offensive', pt: 'Ofensivo, ameaça ou assédio', en: 'Offensive, threat or harassment' },
  { key: 'spam', pt: 'Spam ou publicidade', en: 'Spam or advertising' },
  { key: 'fake', pt: 'Falso ou enganador', en: 'Fake or misleading' },
  { key: 'other', pt: 'Outro motivo', en: 'Other reason' },
];

// Small "Report" link that opens a dialog. Hidden on the user's own content.
export default function ReportButton({ targetType, targetId, ownerId }: { targetType: Target; targetId: string; ownerId?: string }) {
  const { data: session } = useSession();
  const locale = useLocale();
  const pt = locale === 'pt';
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (userId && ownerId && userId === ownerId) return null;

  const send = async () => {
    setError('');
    if (!reason) {
      setError(pt ? 'Escolhe um motivo.' : 'Choose a reason.');
      return;
    }
    if (reason === 'other' && details.trim().length < 10) {
      setError(pt ? 'Descreve o problema (mínimo 10 caracteres).' : 'Describe the problem (at least 10 characters).');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, details: details.trim() }),
      });
      if (res.ok) {
        setState('done');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(res.status === 429 ? (pt ? 'Enviaste demasiadas denúncias hoje. Tenta amanhã.' : 'Too many reports today. Try again tomorrow.') : data.error || (pt ? 'Algo correu mal.' : 'Something went wrong.'));
      setState('idle');
    } catch {
      setError(pt ? 'Algo correu mal.' : 'Something went wrong.');
      setState('idle');
    }
  };

  const label = { request: pt ? 'Denunciar pedido' : 'Report request', proposal: pt ? 'Denunciar' : 'Report', user: pt ? 'Denunciar conta' : 'Report account' }[targetType];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', padding: 0, fontSize: '12px', color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
      >
        <Flag size={12} /> {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-primary, var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', color: 'var(--text-primary)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{label}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={pt ? 'Fechar' : 'Close'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={18} />
              </button>
            </div>

            {!session ? (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {pt ? 'Para denunciar tens de ' : 'To report you need to '}
                <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>{pt ? 'iniciar sessão' : 'sign in'}</Link>
                {pt ? '. Também podes escrever para ' : '. You can also write to '}
                {/* Same contact the Terms give for reports without an account. */}
                <Link href="/terms" style={{ color: 'var(--accent)' }}>{pt ? 'o contacto nos Termos' : 'the contact in the Terms'}</Link>.
              </p>
            ) : state === 'done' ? (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {pt ? 'Obrigado. A equipa Needer vai analisar a denúncia e dizer-te o que decidiu.' : 'Thank you. The Needer team will review the report and tell you what it decided.'}
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {REASONS.map((r) => (
                    <label key={r.key} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                      <input type="radio" name="report-reason" value={r.key} checked={reason === r.key} onChange={() => setReason(r.key)} />
                      {pt ? r.pt : r.en}
                    </label>
                  ))}
                </div>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder={pt ? 'Conta-nos o que se passa (opcional, obrigatório em "Outro motivo")' : 'Tell us what is wrong (optional, required for "Other reason")'}
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px', fontFamily: 'var(--font-sans)', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '10px', resize: 'vertical', marginBottom: '12px' }}
                />
                {error && <p role="alert" style={{ fontSize: '13px', color: 'var(--error)', marginBottom: '10px' }}>{error}</p>}
                <button
                  type="button"
                  onClick={send}
                  disabled={state === 'sending'}
                  style={{ width: '100%', padding: '11px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: state === 'sending' ? 'wait' : 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  {state === 'sending' ? (pt ? 'A enviar…' : 'Sending…') : pt ? 'Enviar denúncia' : 'Send report'}
                </button>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '10px', lineHeight: 1.5 }}>
                  {pt ? 'Quem publicou não fica a saber quem denunciou.' : 'The author is not told who reported it.'}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
