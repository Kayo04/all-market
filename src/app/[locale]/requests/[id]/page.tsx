'use client';

import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Euro,
  Clock,
  User,
  CheckCircle,
  Zap,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';

interface RequestDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: number;
  fixedPrice?: number;
  locationLabel?: string;
  status: string;
  urgency?: 'urgent' | 'standard';
  isFeatured: boolean;
  intentConfirmed?: boolean;
  createdAt: string;
  userId?: { name: string; avatar?: string };
  acceptedByProId?: { name: string; avatar?: string; isVerified?: boolean } | null;
}

export default function RequestDetailPage() {
  const { data: session } = useSession();
  const tr = useTranslations('request');
  const locale = useLocale();
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [acceptResult, setAcceptResult] = useState<{ success: boolean; msg: string } | null>(null);

  const userRole = (session?.user as { role?: string })?.role;
  const isPro = userRole === 'pro';
  const userId = (session?.user as { id?: string })?.id;
  const isOwner = request?.userId && (request.userId as unknown as { _id?: string })?._id === userId;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/requests?limit=100`);
        if (res.ok) {
          const data = await res.json();
          const found = data.requests?.find((r: RequestDetail) => r._id === id);
          if (found) setRequest(found);
        }
      } catch (err) {
        console.error('Error loading:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const handleAccept = async () => {
    if (!session) return;
    setAccepting(true);
    setAcceptResult(null);
    try {
      const res = await fetch(`/api/requests/${id}/accept`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAcceptResult({
          success: true,
          msg: locale === 'pt'
            ? '✅ Trabalho aceite! O cliente foi notificado. Entra em contacto.'
            : '✅ Job accepted! The client has been notified. Reach out to them.',
        });
        // Refresh request
        const refreshRes = await fetch(`/api/requests?limit=100`);
        if (refreshRes.ok) {
          const d = await refreshRes.json();
          const found = d.requests?.find((r: RequestDetail) => r._id === id);
          if (found) setRequest(found);
        }
      } else {
        setAcceptResult({
          success: false,
          msg: locale === 'pt'
            ? '❌ Tarde demais. Outro profissional já aceitou este trabalho.'
            : '❌ Too late. Another professional already accepted this job.',
        });
      }
    } catch {
      setAcceptResult({ success: false, msg: 'Error' });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{locale === 'pt' ? 'A carregar...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{locale === 'pt' ? 'Pedido não encontrado' : 'Request not found'}</p>
      </div>
    );
  }

  const displayPrice = request.fixedPrice ?? request.budget;
  const isUrgent = request.urgency === 'urgent';
  const isOpen = request.status === 'open';
  const isAccepted = request.status === 'accepted';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Request Details Card */}
      <Card
        variant="glass"
        hover={false}
        style={{
          padding: '32px',
          marginBottom: '24px',
          border: isUrgent ? '2px solid #f97316' : undefined,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isUrgent && (
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #f97316, #ef4444)',
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {isUrgent && (
            <Badge variant="warning" style={{ background: '#f97316', color: '#fff' }}>
              <Zap size={10} style={{ display: 'inline', marginRight: '3px' }} />
              {locale === 'pt' ? 'URGENTE' : 'URGENT'}
            </Badge>
          )}
          {request.isFeatured && <Badge variant="warning">⭐ {tr('featured')}</Badge>}
          <Badge variant="accent">{getCategoryLabel(request.category)}</Badge>
          <Badge variant={isOpen ? 'success' : isAccepted ? 'warning' : 'default'}>
            {isOpen
              ? (locale === 'pt' ? 'Aberto' : 'Open')
              : isAccepted
              ? (locale === 'pt' ? 'Aceite' : 'Accepted')
              : tr(`status${request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', '')}` as 'statusOpen')}
          </Badge>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
          {request.title}
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
          {request.description}
        </p>

        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-tertiary)', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Euro size={14} />
            <strong style={{ color: 'var(--text-primary)', fontSize: '20px' }}>€{displayPrice}</strong>
            <span style={{ fontSize: '12px' }}>{locale === 'pt' ? '(preço fixo)' : '(fixed price)'}</span>
          </span>
          {request.locationLabel && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} /> {request.locationLabel}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> {new Date(request.createdAt).toLocaleDateString(locale)}
          </span>
          {request.userId && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> {request.userId.name}
            </span>
          )}
        </div>

        {/* Intent Confirmed Badge */}
        {request.intentConfirmed && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              color: 'var(--success)',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={13} />
            {locale === 'pt' ? 'Cliente confirmou orçamento' : 'Client confirmed budget'}
          </div>
        )}
      </Card>

      {/* ─── Status: Accepted — show winner ─── */}
      {isAccepted && (
        <Card variant="glass" hover={false} style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            {locale === 'pt' ? 'Trabalho Atribuído!' : 'Job Assigned!'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'Um profissional verificado aceitou este trabalho. Entrarão em contacto em breve.'
              : 'A verified professional has accepted this job. They will contact you shortly.'}
          </p>
        </Card>
      )}

      {/* ─── Status: Open — Accept button for pros ─── */}
      {isOpen && isPro && (
        <Card variant="glass" hover={false} style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            {locale === 'pt' ? 'Aceitar este Trabalho' : 'Accept This Job'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {locale === 'pt'
              ? `O cliente paga €${displayPrice} ao primeiro profissional verificado que aceitar. Sem negociação, sem espera.`
              : `The client pays €${displayPrice} to the first verified pro who accepts. No negotiation, no waiting.`}
          </p>

          {acceptResult && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: 'var(--radius-md)',
                background: acceptResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${acceptResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: acceptResult.success ? 'var(--success)' : 'var(--error)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {acceptResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {acceptResult.msg}
            </div>
          )}

          {!acceptResult && (
            <button
              onClick={handleAccept}
              disabled={accepting}
              style={{
                width: '100%',
                padding: '16px',
                background: isUrgent
                  ? 'linear-gradient(135deg, #f97316, #ef4444)'
                  : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: 800,
                cursor: accepting ? 'not-allowed' : 'pointer',
                opacity: accepting ? 0.7 : 1,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                letterSpacing: '0.01em',
              }}
            >
              {accepting ? (
                locale === 'pt' ? 'A aceitar...' : 'Accepting...'
              ) : (
                <>
                  <Zap size={18} />
                  {locale === 'pt' ? `Aceitar este trabalho por €${displayPrice}` : `Accept this job for €${displayPrice}`}
                </>
              )}
            </button>
          )}
        </Card>
      )}

      {/* ─── Status: Open — Waiting state for Needers ─── */}
      {isOpen && !isPro && !isOwner && (
        <Card hover={false} style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {locale === 'pt' ? 'Apenas profissionais verificados podem aceitar este trabalho.' : 'Only verified professionals can accept this job.'}
          </p>
        </Card>
      )}

      {isOpen && isOwner && (
        <Card variant="glass" hover={false} style={{ padding: '28px', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid var(--accent)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
            {locale === 'pt' ? '⏳ À espera de um profissional...' : '⏳ Waiting for a professional...'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'O primeiro profissional verificado a aceitar ficará com o trabalho. Serás notificado imediatamente.'
              : 'The first verified pro to accept will get the job. You will be notified immediately.'}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </Card>
      )}
    </div>
  );
}
