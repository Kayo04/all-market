'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Building, Hash, Globe, Check, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PendingVerification {
  _id: string;
  name: string;
  email: string;
  proCategory?: string;
  verificationData?: {
    businessName?: string;
    taxId?: string;
    website?: string;
    submittedAt?: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();

  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const role = (session?.user as { role?: string } | undefined)?.role;

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/verifications');
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending ?? []);
      }
    } catch (err) {
      console.error('Error loading pending verifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    if (role !== 'admin') {
      router.push('/');
      return;
    }
    loadPending();
  }, [session, status, role, router, loadPending]);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    setActioningId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((p) => p._id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (locale === 'pt' ? 'Algo correu mal.' : 'Something went wrong.'));
      }
    } catch (err) {
      console.error('Error reviewing verification:', err);
      setError(locale === 'pt' ? 'Algo correu mal.' : 'Something went wrong.');
    } finally {
      setActioningId(null);
    }
  };

  if (status === 'loading' || !session || role !== 'admin') {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {locale === 'pt' ? 'A carregar...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '100px 24px 80px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px',
      }}>
        <ShieldCheck size={28} style={{ display: 'inline', marginRight: '10px', color: 'var(--accent)' }} />
        {locale === 'pt' ? 'Verificações Pendentes' : 'Pending Verifications'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {locale === 'pt'
          ? 'Revê os pedidos de verificação de profissionais e aprova ou rejeita.'
          : 'Review professional verification requests and approve or reject them.'}
      </p>

      {error && (
        <div style={{
          padding: '10px 14px', marginBottom: '16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: 'var(--error)', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {locale === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
      ) : pending.length === 0 ? (
        <Card hover={false} style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {locale === 'pt' ? 'Não há verificações pendentes.' : 'No pending verifications.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pending.map((p) => (
            <Card key={p._id} variant="glass" hover={false} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>{p.email}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <Building size={13} /> {p.verificationData?.businessName || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <Hash size={13} /> {p.verificationData?.taxId || '—'}
                  </div>
                  {p.verificationData?.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Globe size={13} /> {p.verificationData.website}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Button
                    size="sm"
                    loading={actioningId === p._id}
                    onClick={() => handleReview(p._id, 'approve')}
                    style={{ background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Check size={14} /> {locale === 'pt' ? 'Aprovar' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={actioningId === p._id}
                    onClick={() => handleReview(p._id, 'reject')}
                    style={{ borderColor: 'var(--error)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <X size={14} /> {locale === 'pt' ? 'Rejeitar' : 'Reject'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
