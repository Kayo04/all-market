'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Euro, Clock, Zap, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';

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

  const urlQuery = searchParams.get('q') || '';

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const prevCountRef = useRef(0);

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

  // Filter client-side — both services and products show here
  const filtered = requests.filter((r) => {
    if (!searchTerm) return true;
    return (
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
          {locale === 'pt' ? 'Pedidos Abertos' : 'Open Requests'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {locale === 'pt'
            ? 'O que as pessoas estão à procura agora — serviços e produtos. Consegues ajudar?'
            : "What people are looking for right now — services and products. Can you help?"}
        </p>

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
              placeholder={locale === 'pt' ? 'Pesquisar pedidos...' : 'Search requests...'}
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
            {categories.map((cat) => (
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
              ? 'Sem pedidos encontrados. Sê o primeiro a publicar!'
              : 'No requests found. Be the first to post!'}
          </p>
          <Link href="/concierge" style={{ textDecoration: 'none' }}>
            <Button>{locale === 'pt' ? 'Publicar Pedido' : 'Post a Request'}</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {sorted.map((req) => {
            const displayPrice = req.fixedPrice ?? req.budget;
            const isUrgent = req.urgency === 'Urgent';
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

                <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
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

                {/* View & respond — routes to the request detail page, where the real proposal flow lives */}
                <Link
                  href={`/requests/${req._id}`}
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
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {locale === 'pt' ? 'Ver e Responder' : 'View & Respond'}
                  <ArrowRight size={14} />
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
