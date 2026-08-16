'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Clock, MessageSquare } from 'lucide-react';
import { categories } from '@/lib/categories';

// ─────────────────────────────────────────────────────────────────────────────
// LiveNeedsFeed — "what people need today"
// The homepage face of the reverse marketplace: the thing on display is DEMAND,
// not a directory of professionals. Pros scan this to find work to bid on.
// Public on purpose — GET /api/requests serves open requests without a session.
// ─────────────────────────────────────────────────────────────────────────────

const LIMIT = 6;

interface FeedItem {
    _id: string;
    title: string;
    category: string;
    budget: number;
    urgency?: string;
    locationLabel?: string;
    createdAt: string;
    proposalCount: number;
}

function timeAgo(iso: string, locale: string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return locale === 'pt' ? 'agora' : 'just now';
    if (mins < 60) return locale === 'pt' ? `há ${mins} min` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return locale === 'pt' ? `há ${hrs}h` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return locale === 'pt' ? `há ${days}d` : `${days}d ago`;
}

export default function LiveNeedsFeed() {
    const locale = useLocale() as 'pt' | 'en';
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/requests?status=open&limit=${LIMIT}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => {
                if (cancelled || !data) return;
                setItems(data.requests ?? []);
            })
            .catch(() => { /* homepage section — stay silent, just render nothing */ })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const categoryLabel = (key: string) => {
        const cat = categories.find(c => c.key === key);
        if (!cat) return key;
        return locale === 'pt' ? cat.labelPT : cat.labelEN;
    };

    // An empty feed on a marketing page looks broken, so render nothing at all
    // rather than an empty "what people need today" heading with a void beneath it.
    if (!loading && items.length === 0) return null;

    return (
        <section style={{ padding: '72px 0', background: 'var(--bg-primary)' }}>
            {/* `shimmer` is not a global keyframe — globals.css only defines fadeIn
                and spin — so the skeleton needs its own or it animates nothing. */}
            <style>{`
                @keyframes needsFeedShimmer {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.45; }
                }
            `}</style>
            <div className="grid-container">
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: '20px', flexWrap: 'wrap', marginBottom: '28px',
                }}>
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            marginBottom: '10px',
                        }}>
                            <span style={{
                                width: '7px', height: '7px', borderRadius: '50%',
                                background: 'var(--accent)',
                                boxShadow: '0 0 0 3px var(--accent-light)',
                            }} />
                            <span style={{
                                fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em',
                                textTransform: 'uppercase', color: 'var(--text-tertiary)',
                            }}>
                                {locale === 'pt' ? 'Ao vivo' : 'Live'}
                            </span>
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(26px, 4vw, 38px)',
                            fontWeight: 600, lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                            color: 'var(--text-primary)',
                        }}>
                            {locale === 'pt' ? 'O que as pessoas precisam hoje' : 'What people need today'}
                        </h2>
                    </div>

                    <Link
                        href="/requests"
                        className="nav-hover"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '9px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '13px', fontWeight: 600,
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {locale === 'pt' ? 'Ver todos os pedidos' : 'See all requests'}
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '14px',
                }}>
                    {loading
                        ? Array.from({ length: LIMIT }).map((_, i) => (
                            <div key={i} style={{
                                height: '132px', borderRadius: 'var(--radius-lg)',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                animation: `needsFeedShimmer 1.6s ease-in-out ${i * 0.1}s infinite`,
                            }} />
                        ))
                        : items.map(item => (
                            <Link
                                key={item._id}
                                href={`/requests/${item._id}`}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    padding: '18px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    textDecoration: 'none',
                                    transition: 'border-color var(--transition-base), transform var(--transition-base)',
                                    minHeight: '132px',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--border-accent)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    marginBottom: '10px', flexWrap: 'wrap',
                                }}>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
                                        textTransform: 'uppercase', color: 'var(--accent)',
                                    }}>
                                        {categoryLabel(item.category)}
                                    </span>
                                    {item.urgency === 'Urgent' && (
                                        <span style={{
                                            fontSize: '10px', fontWeight: 700,
                                            padding: '2px 7px', borderRadius: 'var(--radius-sm)',
                                            background: 'var(--accent-warm-light)',
                                            color: 'var(--accent-warm)',
                                            textTransform: 'uppercase', letterSpacing: '0.04em',
                                        }}>
                                            {locale === 'pt' ? 'Urgente' : 'Urgent'}
                                        </span>
                                    )}
                                </div>

                                <h3 style={{
                                    fontSize: '15px', fontWeight: 600, lineHeight: 1.35,
                                    color: 'var(--text-primary)',
                                    marginBottom: '12px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>
                                    {item.title}
                                </h3>

                                <div style={{
                                    marginTop: 'auto',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    fontSize: '11.5px', color: 'var(--text-tertiary)',
                                    flexWrap: 'wrap',
                                }}>
                                    {item.budget > 0 && (
                                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                                            {item.budget}€
                                        </span>
                                    )}
                                    {item.locationLabel && <span>{item.locationLabel}</span>}
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={11} />
                                        {timeAgo(item.createdAt, locale)}
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <MessageSquare size={11} />
                                        {item.proposalCount}
                                    </span>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </section>
    );
}
