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
  Send,
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
  locationLabel?: string;
  status: string;
  isFeatured: boolean;
  itemCondition?: string;
  acceptsTrades?: boolean;
  createdAt: string;
  userId?: { name: string; avatar?: string };
}

interface ProposalItem {
  _id: string;
  message: string;
  price: number;
  status: string;
  createdAt: string;
  proId?: { name: string; avatar?: string; isVerified: boolean };
}

export default function RequestDetailPage() {
  const { data: session } = useSession();
  const t = useTranslations('proposal');
  const tr = useTranslations('request');
  const locale = useLocale();
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal form
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Drafts
  const [drafts, setDrafts] = useState<{ _id: string; title: string; message: string; defaultPrice?: number }[]>([]);

  const userRole = (session?.user as { role?: string })?.role;
  const isPro = userRole === 'pro';

  useEffect(() => {
    async function load() {
      try {
        // Fetch request details — we use the general requests API and filter client-side
        // In a real app, you'd have a GET /api/requests/[id] route
        const [reqRes, propRes] = await Promise.all([
          fetch(`/api/requests?limit=100`),
          fetch(`/api/proposals?requestId=${id}`),
        ]);

        if (reqRes.ok) {
          const reqData = await reqRes.json();
          const found = reqData.requests?.find((r: RequestDetail) => r._id === id);
          if (found) setRequest(found);
        }

        if (propRes.ok) {
          const propData = await propRes.json();
          setProposals(propData.proposals || []);
        }

        // Fetch drafts if pro
        if (isPro) {
          const draftRes = await fetch('/api/drafts');
          if (draftRes.ok) {
            const draftData = await draftRes.json();
            setDrafts(draftData.drafts || []);
          }
        }
      } catch (err) {
        console.error('Error loading:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isPro]);

  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const handleUseDraft = (draftId: string) => {
    const draft = drafts.find((d) => d._id === draftId);
    if (draft) {
      setProposalMessage(draft.message);
      if (draft.defaultPrice) setProposalPrice(draft.defaultPrice.toString());
    }
  };

  const handleSubmitProposal = async () => {
    if (!proposalMessage || !proposalPrice) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          message: proposalMessage,
          price: parseFloat(proposalPrice),
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setProposalMessage('');
        setProposalPrice('');
        // Refresh proposals
        const propRes = await fetch(`/api/proposals?requestId=${id}`);
        if (propRes.ok) {
          const propData = await propRes.json();
          setProposals(propData.proposals || []);
        }
      } else {
        const data = await res.json();
        setSubmitError(data.error || 'Failed to submit');
      }
    } catch {
      setSubmitError('Something went wrong');
    } finally {
      setSubmitting(false);
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Request Details */}
      <Card variant="glass" hover={false} style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {request.isFeatured && <Badge variant="warning">⭐ {tr('featured')}</Badge>}
          <Badge variant="accent">{getCategoryLabel(request.category)}</Badge>
          <Badge variant="success">{tr(`status${request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', '')}` as 'statusOpen')}</Badge>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
          {request.title}
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
          {request.description}
        </p>

        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Euro size={14} /> <strong style={{ color: 'var(--text-primary)' }}>€{request.budget}</strong>
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

        {/* Equipment fields */}
        {request.itemCondition && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '13px' }}>
            <Badge>{tr(`condition${request.itemCondition.charAt(0).toUpperCase() + request.itemCondition.slice(1)}` as 'conditionNew')}</Badge>
            {request.acceptsTrades && (
              <Badge variant="success">{locale === 'pt' ? 'Aceita trocas' : 'Accepts trades'}</Badge>
            )}
          </div>
        )}
      </Card>

      {/* Proposals List */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
        {t('title')} ({proposals.length})
      </h2>

      {proposals.length === 0 ? (
        <Card hover={false} style={{ textAlign: 'center', padding: '40px 24px', marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {locale === 'pt' ? 'Ainda sem propostas.' : 'No proposals yet.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {proposals.map((prop) => (
            <Card key={prop._id} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {prop.proId?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {prop.proId?.name || 'Professional'}
                      {prop.proId?.isVerified && (
                        <CheckCircle size={14} color="var(--verified)" />
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {new Date(prop.createdAt).toLocaleDateString(locale)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>
                    €{prop.price}
                  </div>
                  <Badge variant={prop.status === 'accepted' ? 'success' : prop.status === 'rejected' ? 'error' : 'default'}>
                    {t(prop.status as 'pending')}
                  </Badge>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {prop.message}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Proposal Form (Pro only) */}
      {isPro && !submitSuccess && (
        <Card variant="glass" hover={false} style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            {t('sendProposal')}
          </h3>

          {submitError && (
            <div
              style={{
                padding: '10px 14px',
                marginBottom: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--error)',
                fontSize: '13px',
              }}
            >
              {submitError}
            </div>
          )}

          {/* Draft selector */}
          {drafts.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {t('useDraft')}
              </label>
              <select
                onChange={(e) => handleUseDraft(e.target.value)}
                defaultValue=""
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              >
                <option value="" disabled>{t('selectDraft')}</option>
                {drafts.map((d) => (
                  <option key={d._id} value={d._id}>{d.title}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {t('message')}
              </label>
              <textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                rows={4}
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

            <Input
              label={t('price')}
              type="number"
              value={proposalPrice}
              onChange={(e) => setProposalPrice(e.target.value)}
              placeholder={t('pricePlaceholder')}
              icon={<Euro size={16} />}
            />

            <Button
              onClick={handleSubmitProposal}
              loading={submitting}
              disabled={!proposalMessage || !proposalPrice}
              icon={<Send size={16} />}
            >
              {t('submit')}
            </Button>
          </div>
        </Card>
      )}

      {submitSuccess && (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '40px' }}>
          <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
            {locale === 'pt' ? 'Proposta enviada com sucesso!' : 'Proposal submitted successfully!'}
          </h3>
        </Card>
      )}
    </div>
  );
}
