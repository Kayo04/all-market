'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import {
  MapPin, Euro, Clock, User, CheckCircle, Zap,
  XCircle, Star, MessageSquare, ArrowLeft, Sparkles,
  ThumbsUp, Send as SendIcon, FileText,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
  urgency?: string;
  isFeatured: boolean;
  createdAt: string;
  userId?: { _id?: string; name: string };
  acceptedByProId?: { name: string } | null;
  images?: string[];
}

interface ProposalData {
  _id: string;
  proId: { _id: string; name: string; avatar?: string; isVerified?: boolean; rating?: number; ratings?: { score: number }[] };
  message: string;
  price: number;
  status: string;
  createdAt: string;
}

interface DraftItem {
  _id: string;
  title: string;
  message: string;
  defaultPrice?: number;
}

interface CompareResult {
  recommendedProposalId: string;
  summary: string;
  highlights?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock proposal enrichment for demo (mock proId fields)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PRO_DATA: Record<string, { name: string; isVerified: boolean; rating: number }> = {
  'mock-plumb-1': { name: 'AquaFix Pro', isVerified: true, rating: 4.9 },
  'mock-plumb-2': { name: 'Carlos Canalização', isVerified: true, rating: 4.6 },
  'mock-plumb-3': { name: 'Rui & Filhos', isVerified: false, rating: 4.4 },
  'mock-elec-1': { name: 'Electro Solutions', isVerified: true, rating: 4.9 },
  'mock-elec-2': { name: 'José Ramos', isVerified: true, rating: 4.7 },
  'mock-elec-3': { name: 'G&M Electricidade', isVerified: false, rating: 4.5 },
  'mock-clean-1': { name: 'CleanHome Elite', isVerified: true, rating: 4.9 },
  'mock-clean-2': { name: 'Brilho Total', isVerified: true, rating: 4.7 },
  'mock-mech-1': { name: 'AutoTech Premium', isVerified: true, rating: 4.9 },
  'mock-mech-2': { name: 'Oficina Central', isVerified: true, rating: 4.6 },
};

function enrichProposal(p: ProposalData): ProposalData {
  // If proId is a string (mock), build a synthetic proId object
  if (typeof p.proId === 'string') {
    const mock = MOCK_PRO_DATA[p.proId as string];
    return {
      ...p,
      proId: {
        _id: p.proId as string,
        name: mock?.name ?? 'Professional',
        isVerified: mock?.isVerified ?? false,
        ratings: mock ? [{ score: mock.rating }] : [],
      },
    };
  }
  return p;
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal Card
// ─────────────────────────────────────────────────────────────────────────────

function ProposalCard({
  proposal, locale, isOwner, onAction, isAiPick,
}: {
  proposal: ProposalData;
  locale: string;
  isOwner: boolean;
  onAction: (id: string, action: 'accept' | 'reject') => void;
  isAiPick?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const pro = proposal.proId;
  const proName = pro?.name ?? 'Professional';
  const initials = proName.charAt(0).toUpperCase();
  const proRating = pro?.rating ?? pro?.ratings?.[0]?.score;
  const isPending = proposal.status === 'pending';
  const isAccepted = proposal.status === 'accepted';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px',
        background: isAccepted ? 'rgba(34,197,94,0.05)' : hovered ? 'var(--bg-secondary)' : 'var(--bg-primary)',
        border: `1px solid ${isAccepted ? 'rgba(34,197,94,0.25)' : isAiPick ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
        borderRadius: '14px',
        transition: 'all 0.15s ease',
        animation: 'fadeSlideIn 0.3s ease both',
      }}
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <Link
          href={`/users/${pro?._id ?? ''}`}
          style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', fontWeight: 800, color: 'var(--accent)',
            textDecoration: 'none',
          }}
        >
          {initials}
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + badge + price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                href={`/users/${pro?._id ?? ''}`}
                style={{ fontSize: '15px', fontWeight: 700, textDecoration: 'none', color: 'var(--text-primary)' }}
              >
                {proName}
              </Link>
              {isAiPick && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  padding: '2px 8px', borderRadius: '99px',
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                  fontSize: '10px', fontWeight: 700, color: '#22c55e',
                }}>
                  ✨ {locale === 'pt' ? 'Escolha da IA' : 'AI Pick'}
                </span>
              )}
              {pro?.isVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: '#22c55e' }}>
                  <CheckCircle size={11} /> {locale === 'pt' ? 'Verificado' : 'Verified'}
                </span>
              )}
              {!!proRating && proRating > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <Star size={10} fill="currentColor" /> {proRating.toFixed(1)}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', flexShrink: 0,
            }}>
              €{proposal.price}
            </span>
          </div>

          {/* Message */}
          <p style={{
            fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7,
            margin: '0 0 14px 0',
          }}>
            {proposal.message}
          </p>

          {/* Time + status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <Clock size={10} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
              {new Date(proposal.createdAt).toLocaleString(locale, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
            </span>

            {/* Status badge or action buttons */}
            {isAccepted ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 14px', borderRadius: '99px',
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                fontSize: '12px', fontWeight: 700, color: '#22c55e',
              }}>
                <CheckCircle size={12} /> {locale === 'pt' ? 'Aceite' : 'Accepted'}
              </span>
            ) : proposal.status === 'rejected' ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 14px', borderRadius: '99px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '12px', fontWeight: 600, color: 'rgba(239,68,68,0.7)',
              }}>
                <XCircle size={12} /> {locale === 'pt' ? 'Rejeitada' : 'Declined'}
              </span>
            ) : isPending && isOwner ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onAction(proposal._id, 'accept')}
                  style={{
                    padding: '7px 18px', background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {locale === 'pt' ? '✓ Aceitar' : '✓ Accept'}
                </button>
                <button
                  onClick={() => onAction(proposal._id, 'reject')}
                  style={{
                    padding: '7px 14px',
                    background: 'transparent', color: 'var(--text-tertiary)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease', fontFamily: 'var(--font-sans)',
                  }}
                >
                  {locale === 'pt' ? 'Recusar' : 'Decline'}
                </button>
              </div>
            ) : isPending ? (
              <span style={{
                padding: '5px 12px', borderRadius: '99px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)',
              }}>
                {locale === 'pt' ? 'Pendente' : 'Pending'}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const { data: session } = useSession();
  const locale = useLocale() as 'pt' | 'en';
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  // Goes back to wherever the user actually came from (Browse Requests, concierge, a
  // direct link, etc.) instead of a hardcoded destination that's wrong most of the time.
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}/requests`);
    }
  };

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const [actionError, setActionError] = useState('');
  const [completeError, setCompleteError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [proposalSubmitError, setProposalSubmitError] = useState('');
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');

  const genericError = locale === 'pt' ? 'Ocorreu um erro. Tenta novamente.' : 'Something went wrong. Please try again.';

  const userId = (session?.user as { id?: string })?.id;
  const isOwner = request?.userId?._id === userId;
  const isOpen = request?.status === 'open';
  const isAccepted = request?.status === 'accepted';
  const isClosed = request?.status === 'closed';
  const isUrgent = request?.urgency === 'Urgent' || request?.urgency === 'urgent';
  const displayPrice = request?.fixedPrice ?? request?.budget ?? 0;
  const userRole = (session?.user as { role?: string })?.role;
  const isPro = userRole === 'pro';
  const alreadyProposed = proposals.some(p => p.proId?._id === userId);

  // Load request
  const loadRequest = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.request) setRequest(data.request);
      }
    } catch (err) {
      console.error('Error loading request:', err);
    }
  }, [id]);

  // Load proposals
  const loadProposals = useCallback(async () => {
    try {
      const res = await fetch(`/api/proposals?requestId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setProposals((data.proposals ?? []).map(enrichProposal));
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    async function init() {
      await Promise.all([loadRequest(), loadProposals()]);
      setLoading(false);
    }
    init();
  }, [loadRequest, loadProposals]);

  // Poll for new proposals every 15s while request is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(loadProposals, 15000);
    return () => clearInterval(interval);
  }, [isOpen, loadProposals]);

  // Invalidate a stale AI comparison when the proposal set changes size (e.g. a new
  // proposal arrives via the 15s poll) — never auto-refire, just clear so the user
  // knows to click "Compare with AI" again.
  const prevProposalsCountRef = useRef(proposals.length);
  useEffect(() => {
    if (proposals.length !== prevProposalsCountRef.current) {
      prevProposalsCountRef.current = proposals.length;
      setCompareResult(null);
      setCompareError('');
    }
  }, [proposals.length]);

  // Load the pro's saved draft templates for the proposal form (optional — failure just hides the dropdown)
  useEffect(() => {
    if (!isPro || isOwner || !request) return;
    let cancelled = false;
    fetch('/api/drafts')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data && !cancelled) setDrafts(data.drafts || []); })
      .catch(err => console.error('Error loading drafts:', err));
    return () => { cancelled = true; };
  }, [isPro, isOwner, request]);

  // Handle proposal accept/reject
  const handleProposalAction = async (proposalId: string, action: 'accept' | 'reject') => {
    setActionLoading(proposalId);
    setActionError('');
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await Promise.all([loadRequest(), loadProposals()]);
      } else {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || genericError);
      }
    } catch (err) {
      console.error('Error updating proposal:', err);
      setActionError(genericError);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle AI proposal comparison
  const handleCompare = async () => {
    setCompareLoading(true);
    setCompareError('');
    try {
      const res = await fetch('/api/proposals/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCompareResult(data);
      } else {
        setCompareError(data.error || genericError);
      }
    } catch (err) {
      console.error('Error comparing proposals:', err);
      setCompareError(genericError);
    } finally {
      setCompareLoading(false);
    }
  };

  // Handle marking job as complete
  const handleComplete = async () => {
    setCompleteLoading(true);
    setCompleteError('');
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      if (res.ok) {
        await loadRequest();
      } else {
        const data = await res.json().catch(() => ({}));
        setCompleteError(data.error || genericError);
      }
    } catch (err) {
      console.error('Error completing job:', err);
      setCompleteError(genericError);
    } finally {
      setCompleteLoading(false);
    }
  };

  // Handle review submission
  const handleReview = async () => {
    const acceptedPro = proposals.find(p => p.status === 'accepted');
    if (!acceptedPro?.proId?._id) return;

    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await fetch(`/api/users/${acceptedPro.proId._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: reviewScore, comment: reviewComment }),
      });
      if (res.ok) {
        setReviewSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setReviewError(data.error || genericError);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(genericError);
    } finally {
      setReviewLoading(false);
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '3px solid var(--accent)', borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {locale === 'pt' ? 'A carregar...' : 'Loading...'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          {locale === 'pt' ? 'Pedido não encontrado' : 'Request not found'}
        </p>
      </div>
    );
  }

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const acceptedProposal = proposals.find(p => p.status === 'accepted');

  // Shared message-button row, rendered in both the Accepted and Closed states
  // (contact should stay available after the job is marked complete, not just while active).
  const messageButtons = acceptedProposal && (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {isOwner && (
        <Link
          href={`/messages/${id}?with=${acceptedProposal.proId._id}&name=${encodeURIComponent(acceptedProposal.proId.name)}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px',
            background: 'transparent', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: '10px',
            fontSize: '14px', fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <MessageSquare size={15} />
          {locale === 'pt' ? 'Mensagem ao Profissional' : 'Message Pro'}
        </Link>
      )}
      {isPro && acceptedProposal.proId._id === userId && request?.userId?._id && (
        <Link
          href={`/messages/${id}?with=${request.userId?._id}&name=${encodeURIComponent(request.userId?.name ?? '')}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px',
            background: 'transparent', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: '10px',
            fontSize: '14px', fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <MessageSquare size={15} />
          {locale === 'pt' ? 'Mensagem ao Cliente' : 'Message Client'}
        </Link>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '80px 24px 60px' }}>

      {/* ── Back link ── */}
      <button
        type="button"
        onClick={goBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'var(--text-tertiary)', textDecoration: 'none',
          marginBottom: '24px', transition: 'color 0.15s ease',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
      >
        <ArrowLeft size={14} />
        {locale === 'pt' ? 'Voltar' : 'Back'}
      </button>

      {/* ── Request Card ── */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${isUrgent ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
        borderRadius: '18px',
        padding: '28px',
        marginBottom: '20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {isUrgent && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f97316, #ef4444)' }} />
        )}

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {isUrgent && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '6px',
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
              fontSize: '10px', fontWeight: 700, color: '#f97316', textTransform: 'uppercase',
            }}>
              <Zap size={10} /> {locale === 'pt' ? 'Urgente' : 'Urgent'}
            </span>
          )}
          <span style={{
            padding: '4px 10px', borderRadius: '6px',
            background: isOpen ? 'rgba(34,197,94,0.08)' : isAccepted ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isOpen ? 'rgba(34,197,94,0.2)' : isAccepted ? 'rgba(59,130,246,0.2)' : 'var(--border)'}`,
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            color: isOpen ? '#22c55e' : isAccepted ? '#3b82f6' : 'var(--text-tertiary)',
          }}>
            {isOpen ? (locale === 'pt' ? 'Aberto' : 'Open') : isAccepted ? (locale === 'pt' ? 'Atribuído' : 'Assigned') : request.status}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'capitalize',
          }}>
            {request.subcategory?.replace(/-/g, ' ') || request.category}
          </span>
        </div>

        {request.images && request.images.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {request.images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`${request.title} ${i + 1}`}
                style={{
                  width: '140px', height: '140px', objectFit: 'cover',
                  borderRadius: 'var(--radius-md)', flexShrink: 0,
                  border: '1px solid var(--border)',
                }}
              />
            ))}
          </div>
        )}

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
          {request.title}
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '18px' }}>
          {request.description}
        </p>

        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          {displayPrice > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Euro size={13} /> <strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>€{displayPrice}</strong>
            </span>
          )}
          {request.locationLabel && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} /> {request.locationLabel}</span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} /> {new Date(request.createdAt).toLocaleDateString(locale)}
          </span>
          {request.userId?.name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={13} /> {request.userId.name}</span>
          )}
        </div>
      </div>

      {/* ── Accepted State ── */}
      {isAccepted && acceptedProposal && (
        <div style={{
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '16px',
          padding: '24px', marginBottom: '20px', textAlign: 'center',
        }}>
          <CheckCircle size={36} color="#22c55e" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
            {locale === 'pt' ? 'Profissional Atribuído!' : 'Professional Assigned!'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {locale === 'pt'
              ? `${acceptedProposal.proId.name} foi selecionado por €${acceptedProposal.price}. Entrarão em contacto em breve.`
              : `${acceptedProposal.proId.name} was selected for €${acceptedProposal.price}. They will reach out shortly.`}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isOwner && (
              <button
                onClick={handleComplete}
                disabled={completeLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px',
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 700,
                  cursor: completeLoading ? 'wait' : 'pointer',
                  opacity: completeLoading ? 0.7 : 1,
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <ThumbsUp size={15} />
                {completeLoading
                  ? (locale === 'pt' ? 'A processar...' : 'Processing...')
                  : (locale === 'pt' ? 'Marcar como Concluído' : 'Mark as Complete')}
              </button>
            )}
          </div>
          {completeError && (
            <div style={{
              padding: '10px 14px', marginTop: '12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#dc2626', fontSize: '13px', textAlign: 'left',
            }}>
              {completeError}
            </div>
          )}
          <div style={{ marginTop: '10px' }}>
            {messageButtons}
          </div>
        </div>
      )}

      {/* ── Closed State (Job Done) ── */}
      {isClosed && (
        <div style={{
          background: 'rgba(59,130,246,0.05)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '16px',
          padding: '24px', marginBottom: '20px', textAlign: 'center',
        }}>
          <ThumbsUp size={36} color="#3b82f6" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
            {locale === 'pt' ? 'Trabalho Concluído!' : 'Job Complete!'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {locale === 'pt'
              ? 'Este trabalho foi marcado como concluído. Obrigado por usar o Needer!'
              : 'This job has been marked as complete. Thank you for using Needer!'}
          </p>
          {messageButtons}
        </div>
      )}

      {/* ── Review Form (shown when closed + owner + not yet reviewed) ── */}
      {isClosed && isOwner && acceptedProposal && !reviewSubmitted && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Star size={16} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              {locale === 'pt'
                ? `Avalia ${acceptedProposal.proId.name}`
                : `Review ${acceptedProposal.proId.name}`}
            </h3>
          </div>

          {/* Star selector */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onClick={() => setReviewScore(s)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px', transition: 'transform 0.1s ease',
                  transform: reviewScore >= s ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <Star
                  size={28}
                  color={reviewScore >= s ? '#facc15' : 'var(--border)'}
                  fill={reviewScore >= s ? '#facc15' : 'none'}
                />
              </button>
            ))}
            <span style={{ alignSelf: 'center', marginLeft: '8px', fontSize: '14px', fontWeight: 700 }}>
              {reviewScore}/5
            </span>
          </div>

          {/* Comment */}
          <textarea
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            placeholder={locale === 'pt' ? 'Como foi a experiência? (opcional)' : 'How was the experience? (optional)'}
            rows={3}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px', resize: 'vertical',
              fontSize: '14px', color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.6,
              marginBottom: '14px',
              boxSizing: 'border-box',
            }}
          />

          {reviewError && (
            <div style={{
              padding: '10px 14px', marginBottom: '14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#dc2626', fontSize: '13px',
            }}>
              {reviewError}
            </div>
          )}

          <button
            onClick={handleReview}
            disabled={reviewLoading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 24px',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700,
              cursor: reviewLoading ? 'wait' : 'pointer',
              opacity: reviewLoading ? 0.7 : 1,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <SendIcon size={13} />
            {reviewLoading
              ? (locale === 'pt' ? 'A enviar...' : 'Submitting...')
              : (locale === 'pt' ? 'Enviar Avaliação' : 'Submit Review')}
          </button>
        </div>
      )}

      {/* ── Review Submitted Confirmation ── */}
      {reviewSubmitted && (
        <div style={{
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '16px',
          padding: '20px', marginBottom: '20px', textAlign: 'center',
        }}>
          <CheckCircle size={24} color="#22c55e" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {locale === 'pt' ? 'Avaliação enviada! Obrigado pelo teu feedback.' : 'Review submitted! Thank you for your feedback.'}
          </p>
        </div>
      )}

      {/* ── Waiting State (owner, open, no proposals yet) ── */}
      {isOpen && isOwner && proposals.length === 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px', marginBottom: '20px', textAlign: 'center',
        }}>
          <Sparkles size={28} color="var(--accent)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
            {locale === 'pt' ? 'À espera de propostas...' : 'Waiting for proposals...'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
            {locale === 'pt'
              ? 'Os profissionais estão a ser notificados. Em média, a primeira proposta chega em ~8 minutos.'
              : 'Professionals are being notified. On average, the first proposal arrives in ~8 minutes.'}
          </p>
          <div style={{
            display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '16px',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--accent)', opacity: 0.5,
                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Proposals Section ── */}
      {proposals.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <MessageSquare size={16} color="var(--accent)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {locale === 'pt'
                  ? `${proposals.length} Proposta${proposals.length > 1 ? 's' : ''}`
                  : `${proposals.length} Proposal${proposals.length > 1 ? 's' : ''}`}
              </h2>
              {isOpen && pendingProposals.length > 0 && (
                <span style={{
                  padding: '3px 10px', borderRadius: '99px',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  fontSize: '11px', fontWeight: 700, color: '#22c55e',
                }}>
                  {pendingProposals.length} {locale === 'pt' ? 'pendente' : 'pending'}
                </span>
              )}
            </div>

            {isOwner && isOpen && pendingProposals.length >= 2 && (
              <button
                onClick={handleCompare}
                disabled={compareLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: '8px',
                  fontSize: '12px', fontWeight: 700, color: '#22c55e',
                  cursor: compareLoading ? 'wait' : 'pointer',
                  opacity: compareLoading ? 0.7 : 1,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <Sparkles size={13} />
                {compareLoading
                  ? (locale === 'pt' ? 'A comparar...' : 'Comparing...')
                  : compareResult
                    ? (locale === 'pt' ? '↻ Comparar novamente' : '↻ Compare again')
                    : (locale === 'pt' ? '✨ Comparar com IA' : '✨ Compare with AI')}
              </button>
            )}
          </div>

          {compareError && (
            <div style={{
              padding: '10px 14px', marginBottom: '12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#dc2626', fontSize: '13px',
            }}>
              {compareError}
            </div>
          )}

          {compareResult && pendingProposals.length >= 2 && (
            <div style={{
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '14px',
              padding: '18px 20px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={15} color="#22c55e" />
                <h3 style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {locale === 'pt' ? 'Recomendação da IA' : 'AI Recommendation'}
                </h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, margin: compareResult.highlights?.length ? '0 0 10px 0' : 0 }}>
                {compareResult.summary}
              </p>
              {!!compareResult.highlights?.length && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {compareResult.highlights.map((h, i) => (
                    <span key={i} style={{
                      padding: '4px 10px', borderRadius: '99px',
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                      fontSize: '11px', fontWeight: 600, color: '#22c55e',
                    }}>
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {actionError && (
            <div style={{
              padding: '10px 14px', marginBottom: '12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#dc2626', fontSize: '13px',
            }}>
              {actionError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {proposals.map(p => (
              <ProposalCard
                key={p._id}
                proposal={p}
                locale={locale}
                isOwner={!!isOwner}
                onAction={handleProposalAction}
                isAiPick={compareResult?.recommendedProposalId === p._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Pro Proposal Form (visible to pros on open requests) ── */}
      {isOpen && isPro && !isOwner && !alreadyProposed && !proposalSent && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileText size={16} color="var(--accent)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              {locale === 'pt' ? 'Enviar proposta' : 'Submit proposal'}
            </h3>
          </div>

          {drafts.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                {locale === 'pt' ? 'Usar um modelo guardado' : 'Use a saved template'}
              </label>
              <select
                value={selectedDraftId}
                onChange={e => {
                  const draftId = e.target.value;
                  setSelectedDraftId(draftId);
                  const draft = drafts.find(d => d._id === draftId);
                  if (draft) {
                    setProposalMessage(draft.message);
                    if (draft.defaultPrice) setProposalPrice(String(draft.defaultPrice));
                  }
                }}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">{locale === 'pt' ? '— Escrever do zero —' : '— Write from scratch —'}</option>
                {drafts.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
              </select>
            </div>
          )}

          <textarea
            value={proposalMessage}
            onChange={e => setProposalMessage(e.target.value)}
            placeholder={locale === 'pt'
              ? 'Apresenta-te e explica porque és a melhor escolha para este trabalho...'
              : 'Introduce yourself and explain why you are the best choice for this job...'}
            rows={4}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px', resize: 'vertical',
              fontSize: '14px', color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.6, marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />

          {proposalSubmitError && (
            <div style={{
              padding: '10px 14px', marginBottom: '12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#dc2626', fontSize: '13px',
            }}>
              {proposalSubmitError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 140px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                {locale === 'pt' ? 'Preço (€)' : 'Price (€)'}
              </label>
              <input
                type="number"
                min="1"
                value={proposalPrice}
                onChange={e => setProposalPrice(e.target.value)}
                placeholder="€"
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '16px', fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={async () => {
                if (!proposalMessage.trim() || !proposalPrice) return;
                setProposalLoading(true);
                setProposalSubmitError('');
                try {
                  const res = await fetch('/api/proposals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      requestId: id,
                      message: proposalMessage.trim(),
                      price: parseFloat(proposalPrice),
                    }),
                  });
                  if (res.ok) {
                    setProposalSent(true);
                    await loadProposals();
                  } else {
                    const data = await res.json().catch(() => ({}));
                    setProposalSubmitError(data.error || genericError);
                  }
                } catch (err) {
                  console.error('Error submitting proposal:', err);
                  setProposalSubmitError(genericError);
                } finally {
                  setProposalLoading(false);
                }
              }}
              disabled={proposalLoading || !proposalMessage.trim() || !proposalPrice}
              style={{
                padding: '10px 20px',
                background: proposalMessage.trim() && proposalPrice ? 'var(--accent)' : 'var(--border)',
                color: proposalMessage.trim() && proposalPrice ? '#fff' : 'var(--text-tertiary)',
                border: 'none', borderRadius: '10px',
                fontSize: '13px', fontWeight: 700,
                cursor: proposalMessage.trim() && proposalPrice && !proposalLoading ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-sans)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <SendIcon size={13} />
              {proposalLoading
                ? (locale === 'pt' ? 'A enviar...' : 'Sending...')
                : (locale === 'pt' ? 'Enviar proposta' : 'Send proposal')}
            </button>
          </div>
        </div>
      )}

      {/* ── Proposal Sent Confirmation (for pros) ── */}
      {proposalSent && (
        <div style={{
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '16px',
          padding: '20px', marginBottom: '20px', textAlign: 'center',
        }}>
          <CheckCircle size={24} color="#22c55e" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {locale === 'pt'
              ? 'Proposta enviada! O cliente será notificado.'
              : 'Proposal sent! The client will be notified.'}
          </p>
        </div>
      )}

      {/* ── Already Proposed (for pros) ── */}
      {isOpen && isPro && !isOwner && alreadyProposed && !proposalSent && (
        <div style={{
          background: 'rgba(59,130,246,0.05)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '16px',
          padding: '16px', marginBottom: '20px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'Já enviaste uma proposta para este pedido.'
              : 'You already submitted a proposal for this request.'}
          </p>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
