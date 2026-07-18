'use client';

import type React from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, MapPin, Clock, Zap, Star,
  Wrench, Monitor, BookOpen, PartyPopper, Heart, Gamepad2,
  Briefcase, Palette, PenTool, Sparkles, Car, Scissors,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';

// Category → visual tile (icon + tint) — stands in for a photo until listings support image uploads
const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  'home-repairs': Wrench,
  'tech-digital': Monitor,
  'tutoring': BookOpen,
  'events': PartyPopper,
  'wellness': Heart,
  'equipment': Gamepad2,
  'business': Briefcase,
  'design': Palette,
  'writing': PenTool,
  'cleaning': Sparkles,
  'automotive': Car,
  'beauty': Scissors,
};

const CATEGORY_TINTS: Record<string, string> = {
  'home-repairs': '#f97316',
  'tech-digital': '#3b82f6',
  'tutoring': '#8b5cf6',
  'events': '#ec4899',
  'wellness': '#14b8a6',
  'equipment': '#6366f1',
  'business': '#64748b',
  'design': '#d946ef',
  'writing': '#f59e0b',
  'cleaning': '#06b6d4',
  'automotive': '#ef4444',
  'beauty': '#f43f5e',
};

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
  images?: string[];
  userId?: { name: string; avatar?: string };
  acceptedByProId?: string | null;
}

export default function BrowseRequestsPage() {
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
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '100px 24px 60px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '16px 12px' }}>
          {sorted.map((req) => {
            const displayPrice = req.fixedPrice ?? req.budget;
            const isUrgent = req.urgency === 'Urgent';
            // Sniper window: this request is still within its 1-hour head start
            const isFresh = !!(req.publicReleaseDate && new Date(req.publicReleaseDate).getTime() > Date.now());
            const Icon = CATEGORY_ICONS[req.category];
            const tint = CATEGORY_TINTS[req.category] || 'var(--accent)';

            return (
              <Link
                key={req._id}
                href={`/requests/${req._id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Photo when uploaded, otherwise a category-tinted icon stand-in */}
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: req.images?.[0] ? 'var(--bg-tertiary)' : `linear-gradient(160deg, ${tint}22, ${tint}0d)`,
                    }}
                  >
                    {req.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={req.images[0]}
                        alt={req.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      Icon && <Icon size={40} color={tint} strokeWidth={1.5} />
                    )}

                    {isUrgent && (
                      <div
                        style={{
                          position: 'absolute', top: '8px', left: '8px',
                          display: 'flex', alignItems: 'center', gap: '3px',
                          padding: '4px 8px', borderRadius: 'var(--radius-full)',
                          background: '#f97316', color: '#fff',
                          fontSize: '10px', fontWeight: 800,
                        }}
                      >
                        <Zap size={10} />
                        {locale === 'pt' ? 'URGENTE' : 'URGENT'}
                      </div>
                    )}
                    {req.isFeatured && (
                      <div
                        style={{
                          position: 'absolute', top: '8px', right: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        <Star size={12} color="#d4af37" fill="#d4af37" />
                      </div>
                    )}
                    {isFresh && (
                      <div
                        style={{
                          position: 'absolute', bottom: '8px', left: '8px',
                          display: 'flex', alignItems: 'center', gap: '3px',
                          padding: '3px 7px', borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(90deg, #d4af37, #f0d060)',
                          color: '#1a1200', fontSize: '9px', fontWeight: 800,
                        }}
                      >
                        <Zap size={9} />
                        {locale === 'pt' ? 'SNIPER' : 'SNIPER'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '3px' }}>
                      €{displayPrice}
                    </div>
                    <div
                      style={{
                        fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
                        lineHeight: 1.35, marginBottom: '6px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {req.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.locationLabel && (
                          <>
                            <MapPin size={11} style={{ flexShrink: 0 }} /> {req.locationLabel}
                          </>
                        )}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                        <Clock size={11} /> {timeAgo(req.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      {getCategoryLabel(req.category)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
