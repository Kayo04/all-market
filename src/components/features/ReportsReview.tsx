'use client';

import { useCallback, useEffect, useState } from 'react';
import { Ban, Check, ExternalLink, Flag, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

interface ReportRow {
  _id: string;
  targetType: 'request' | 'proposal' | 'user';
  targetId: string;
  targetSnapshot: string;
  reason: string;
  details?: string;
  createdAt: string;
  reporterId?: { name: string; email: string };
  targetOwnerId?: { _id: string; name: string; email: string };
}

type Action = 'dismiss' | 'remove' | 'suspend';

const REASON_PT: Record<string, string> = {
  scam: 'Burla', illegal: 'Ilegal', offensive: 'Ofensivo / assédio', spam: 'Spam', fake: 'Falso / enganador', other: 'Outro',
};
const TARGET_PT = { request: 'Pedido', proposal: 'Proposta', user: 'Conta' };

// Admin queue of open reports. Removing content or suspending an account needs a
// reason: it goes to the person affected, together with how to contest it.
export default function ReportsReview({ pt }: { pt: boolean }) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) setReports((await res.json()).reports ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (r: ReportRow, action: Action) => {
    const message = (messages[r._id] ?? '').trim();
    if (action !== 'dismiss' && message.length < 10) {
      setError(pt ? 'Escreve o motivo (mínimo 10 caracteres): vai para a pessoa afetada.' : 'Write the reason (at least 10 characters): it goes to the person affected.');
      return;
    }
    if (action === 'suspend' && !window.confirm(pt ? `Suspender a conta de ${r.targetOwnerId?.name}? Fica sem acesso e os pedidos e propostas abertos são retirados.` : `Suspend ${r.targetOwnerId?.name}'s account? They lose access and their open requests and proposals are withdrawn.`)) {
      return;
    }
    setBusy(r._id);
    setError('');
    try {
      const res = await fetch(`/api/admin/reports/${r._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message }),
      });
      if (res.ok) {
        // Sibling reports on the same target were resolved too.
        setReports((prev) => prev.filter((x) => x.targetId !== r.targetId));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (pt ? 'Algo correu mal.' : 'Something went wrong.'));
      }
    } finally {
      setBusy(null);
    }
  };

  const targetLink = (r: ReportRow) =>
    r.targetType === 'user' ? `/users/${r.targetId}` : r.targetType === 'request' ? `/requests/${r.targetId}` : null;

  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Flag size={22} color="var(--error)" />
        {pt ? 'Denúncias' : 'Reports'} {!loading && `(${reports.length})`}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {pt
          ? 'Quem denunciou recebe sempre a resposta. Se removeres ou suspenderes, a pessoa afetada recebe o motivo que escreveres.'
          : 'Reporters always get an answer. If you remove or suspend, the person affected gets the reason you write.'}
      </p>

      {error && (
        <div role="alert" style={{ padding: '10px 14px', marginBottom: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--error)', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{pt ? 'A carregar...' : 'Loading...'}</p>
      ) : reports.length === 0 ? (
        <Card hover={false} style={{ padding: '28px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{pt ? 'Não há denúncias por analisar.' : 'No reports to review.'}</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.map((r) => {
            const link = targetLink(r);
            return (
              <Card key={r._id} variant="glass" hover={false} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>
                      {pt ? TARGET_PT[r.targetType] : r.targetType} · {pt ? REASON_PT[r.reason] ?? r.reason : r.reason}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {pt ? 'Autor' : 'Author'}: {r.targetOwnerId?.name} ({r.targetOwnerId?.email}) · {pt ? 'denunciado por' : 'reported by'} {r.reporterId?.name} · {new Date(r.createdAt).toLocaleDateString(pt ? 'pt-PT' : 'en-GB')}
                    </div>
                  </div>
                  {link && (
                    <Link href={link} target="_blank" style={{ fontSize: '13px', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={13} /> {pt ? 'Abrir' : 'Open'}
                    </Link>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                  {r.targetSnapshot || '—'}
                </p>
                {r.details && (
                  <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
                    <strong>{pt ? 'Comentário de quem denunciou:' : 'Reporter comment:'}</strong> {r.details}
                  </p>
                )}
                <textarea
                  value={messages[r._id] ?? ''}
                  onChange={(e) => setMessages((m) => ({ ...m, [r._id]: e.target.value }))}
                  rows={2}
                  maxLength={2000}
                  placeholder={pt ? 'Motivo para a pessoa afetada (obrigatório para remover ou suspender)' : 'Reason for the person affected (required to remove or suspend)'}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '14px', fontFamily: 'var(--font-sans)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button size="sm" variant="secondary" loading={busy === r._id} onClick={() => decide(r, 'dismiss')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> {pt ? 'Sem problema' : 'No problem'}
                  </Button>
                  {r.targetType !== 'user' && (
                    <Button size="sm" variant="secondary" loading={busy === r._id} onClick={() => decide(r, 'remove')} style={{ borderColor: 'var(--error)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={14} /> {pt ? 'Remover conteúdo' : 'Remove content'}
                    </Button>
                  )}
                  <Button size="sm" loading={busy === r._id} onClick={() => decide(r, 'suspend')} style={{ background: 'var(--error)', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Ban size={14} /> {pt ? 'Suspender conta' : 'Suspend account'}
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
