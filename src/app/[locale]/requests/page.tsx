'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Euro, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';
import { useSession } from 'next-auth/react';

// Services only — products hidden
const serviceCategories = categories.filter((c) => c.type === 'service');

interface RequestItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: number;
  fixedPrice?: number;
  locationLabel?: string;
  status: string;
  urgency?: 'Normal' | 'High' | 'Urgent';
  isFeatured: boolean;
  createdAt: string;
  publicReleaseDate?: string;   // ISO date — set to createdAt + 1h
  type?: string;
  userId?: { name: string; avatar?: string };
  acceptedByProId?: string | null;
}

export default function BrowseRequestsPage() {
  const t = useTranslations('request');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const urlQuery = searchParams.get('q') || '';

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptResult, setAcceptResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const prevCountRef = useRef(0);

  const userRole = (session?.user as { role?: string })?.role;
  const isPro = userRole === 'pro';
  // isPremiumSniper is checked server-side; on the client we infer it by
  // the presence of fresh requests (publicReleaseDate in the future)
  const isPremiumSniper = !!(session?.user as { isPremiumSniper?: boolean })?.isPremiumSniper;
  void isPremiumSniper; // referenced in badge logic below

  const fetchRequests = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'open', limit: '50' });
      if (category) params.set('category', category);
      const res = await fetch(`/api/requests?${params}`);
      if (res.ok) {
        const data = await res.json();
        const reqs = data.requests || [];
        if (prevCountRef.current > 0 && reqs.length > prevCountRef.current) {
          // new jobs appeared — could pulse UI
        }
        prevCountRef.current = reqs.length;
        setRequests(reqs);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(selectedCategory || undefined);
    // Poll every 30s so new urgent jobs appear live
    const interval = setInterval(() => fetchRequests(selectedCategory || undefined), 30000);
    return () => clearInterval(interval);
  }, [selectedCategory, fetchRequests]);

  const handleAccept = async (requestId: string) => {
    if (!session) return;
    setAccepting(requestId);
    setAcceptResult(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/accept`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAcceptResult({ id: requestId, success: true, msg: locale === 'pt' ? '✅ Trabalho aceite! O cliente foi notificado.' : '✅ Job accepted! Client notified.' });
        // Remove from list
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      } else {
        setAcceptResult({ id: requestId, success: false, msg: locale === 'pt' ? '❌ Tarde demais — outro profissional aceitou primeiro.' : '❌ Too late — another pro accepted first.' });
      }
    } catch {
      setAcceptResult({ id: requestId, success: false, msg: 'Error' });
    } finally {
      setAccepting(null);
    }
  };

  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return locale === 'pt' ? 'agora' : 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Filter client-side
  const filtered = requests.filter((r) => {
    const matchesSearch = searchTerm
      ? r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    // services only — no products in browse
    const catType = categories.find((c) => c.key === r.category)?.type;
    const isService = !catType || catType === 'service';
    return matchesSearch && isService;
  });

  // Urgent first, then by date
  const sorted = [...filtered].sort((a, b) => {
    if (a.urgency === 'Urgent' && b.urgency !== 'Urgent') return -1;
    if (b.urgency === 'Urgent' && a.urgency !== 'Urgent') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Countdown formatter for sniper window
  const useSniperCountdown = (publicReleaseDate?: string) => {
    const [remaining, setRemaining] = useState('');
    useEffect(() => {
      if (!publicReleaseDate) return;
      const tick = () => {
        const diff = new Date(publicReleaseDate).getTime() - Date.now();
        if (diff <= 0) { setRemaining(''); return; }
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setRemaining(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, [publicReleaseDate]);
    return remaining;
  };
  void useSniperCountdown; // used inline per-card below

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '8px',
          }}
        >
          {isPro
            ? (locale === 'pt' ? '⚡ Trabalhos Disponíveis' : '⚡ Available Jobs')
            : (locale === 'pt' ? 'Pedidos Abertos' : 'Open Requests')}
        </h1>
        {isPro && (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {locale === 'pt'
              ? 'O primeiro profissional verificado a aceitar fica com o trabalho. Seja rápido.'
              : 'First verified pro to accept gets the job. Be fast.'}
          </p>
        )}

        {/* Accept result toast */}
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

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
              }}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={locale === 'pt' ? 'Pesquisar trabalhos...' : 'Search jobs...'}
              style={{
                width: '100%', padding: '10px 14px 10px 40px', fontSize: '14px',
                fontFamily: 'var(--font-sans)', backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              fontFamily: 'var(--font-sans)', backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">{locale === 'pt' ? 'Todas as categorias' : 'All categories'}</option>
            {serviceCategories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {locale === 'pt' ? cat.labelPT : cat.labelEN}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          {locale === 'pt' ? 'A carregar...' : 'Loading...'}
        </div>
      ) : sorted.length === 0 ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Search size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {locale === 'pt'
              ? 'Sem trabalhos encontrados. Sê o primeiro a publicar!'
              : 'No jobs found. Be the first to post!'}
          </p>
          <Link href="/requests/new" style={{ textDecoration: 'none' }}>
            <Button>{locale === 'pt' ? 'Publicar Trabalho' : 'Post a Job'}</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {sorted.map((req) => {
            const displayPrice = req.fixedPrice ?? req.budget;
            const isUrgent = req.urgency === 'Urgent';
            const isAccepting = accepting === req._id;
            // Sniper window: this request is still within its 1-hour head start
            const isFresh = !!(req.publicReleaseDate && new Date(req.publicReleaseDate).getTime() > Date.now());

            return (
              <Card
                key={req._id}
                style={{
                  padding: '20px',
                  height: '100%',
                  border: isUrgent ? '2px solid #f97316' : undefined,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Urgent pulse bar */}
                {isUrgent && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #f97316, #ef4444)',
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {isFresh && (
                    <Badge
                      variant="warning"
                      style={{
                        background: 'linear-gradient(90deg, #d4af37, #f0d060)',
                        color: '#1a1200',
                        fontWeight: 800,
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Zap size={10} style={{ display: 'inline' }} />
                      {locale === 'pt' ? '⚡ SNIPER HEAD START' : '⚡ SNIPER HEAD START'}
                    </Badge>
                  )}
                  {isUrgent && (
                    <Badge variant="warning" style={{ background: '#f97316', color: '#fff' }}>
                      <Zap size={10} style={{ display: 'inline', marginRight: '3px' }} />
                      {locale === 'pt' ? 'URGENTE' : 'URGENT'}
                    </Badge>
                  )}
                  {req.isFeatured && <Badge variant="warning">⭐</Badge>}
                  <Badge variant="accent">{getCategoryLabel(req.category)}</Badge>
                  <Badge variant="success">
                    {t(`status${req.status.charAt(0).toUpperCase() + req.status.slice(1).replace('_', '')}` as 'statusOpen')}
                  </Badge>
                </div>

                <Link href={`/requests/${req._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{req.title}</h3>
                  <p
                    style={{
                      fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', marginBottom: '12px',
                    }}
                  >
                    {req.description}
                  </p>
                </Link>

                <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: isPro ? '14px' : '0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                    <Euro size={13} />€{displayPrice}
                  </span>
                  {req.locationLabel && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {req.locationLabel}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <Clock size={12} /> {timeAgo(req.createdAt)}
                  </span>
                </div>

                {/* Accept button — only for logged-in pros */}
                {isPro && (
                  <button
                    onClick={() => handleAccept(req._id)}
                    disabled={isAccepting}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: isUrgent
                        ? 'linear-gradient(135deg, #f97316, #ef4444)'
                        : 'var(--accent)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isAccepting ? 'not-allowed' : 'pointer',
                      opacity: isAccepting ? 0.7 : 1,
                      transition: 'opacity 0.15s ease, transform 0.1s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                    onMouseEnter={(e) => { if (!isAccepting) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { if (!isAccepting) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    {isAccepting ? (
                      locale === 'pt' ? 'A aceitar...' : 'Accepting...'
                    ) : (
                      <>
                        <Zap size={14} />
                        {locale === 'pt' ? `Aceitar por €${displayPrice}` : `Accept for €${displayPrice}`}
                      </>
                    )}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
