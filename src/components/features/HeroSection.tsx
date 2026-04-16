'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Send, Sparkles, Star, CheckCircle, RotateCcw } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AIPro {
    _id: string;
    name: string;
    rating: number;
    proCategory: string;
    isVerified: boolean;
    hasSponsoredSpot: boolean;
    isSponsored: boolean;
    locationLabel?: string;
}

interface AIMatchResult {
    message: string;
    category: string;
    type: 'service' | 'product';
    urgency: 'Normal' | 'High' | 'Urgent';
    budget: number | null;
    tags: string[];
    city: string;
    pros: AIPro[];
    requestId?: string;
    isProduct: boolean;
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    result?: AIMatchResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
    const rounded = Math.round(rating);
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={10}
                    fill={i <= rounded ? '#d4af37' : 'transparent'}
                    color={i <= rounded ? '#d4af37' : 'rgba(255,255,255,0.2)'}
                />
            ))}
            <span style={{ fontSize: '11px', color: '#d4af37', marginLeft: '4px', fontWeight: 700 }}>
                {rating > 0 ? rating.toFixed(1) : 'New'}
            </span>
        </span>
    );
}

function ProCard({ pro, locale, index }: { pro: AIPro; locale: string; index: number }) {
    const isSponsored = pro.isSponsored;
    const initials = pro.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            style={{
                flexShrink: 0,
                width: '190px',
                background: isSponsored
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.04))'
                    : 'rgba(255,255,255,0.05)',
                border: isSponsored
                    ? '1.5px solid rgba(212,175,55,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '14px',
                position: 'relative',
                boxShadow: isSponsored ? '0 4px 20px rgba(212,175,55,0.15)' : 'none',
                animation: `fadeIn 0.35s ease ${index * 0.12}s both`,
            }}
        >
            {/* Sponsored label */}
            {isSponsored && (
                <div
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'linear-gradient(90deg, #d4af37, #f0d060)',
                        color: '#1a1200',
                        fontSize: '9px',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        padding: '2px 7px',
                        borderRadius: '99px',
                    }}
                >
                    ✦ SPONSORED
                </div>
            )}

            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isSponsored
                            ? 'linear-gradient(135deg, #d4af37, #a07e1a)'
                            : 'linear-gradient(135deg, #003912, #006020)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '2px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#fff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '90px',
                            }}
                        >
                            {pro.name}
                        </span>
                        {pro.isVerified && (
                            <CheckCircle size={12} color="#22c55e" style={{ flexShrink: 0 }} />
                        )}
                    </div>
                    <Stars rating={pro.rating} />
                </div>
            </div>

            {/* Category */}
            {pro.proCategory && (
                <div
                    style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: '12px',
                        textTransform: 'capitalize',
                    }}
                >
                    {pro.proCategory}
                    {pro.locationLabel ? ` · ${pro.locationLabel}` : ''}
                </div>
            )}

            {/* CTA */}
            <Link
                href="/requests/new"
                style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '8px',
                    background: isSponsored
                        ? 'linear-gradient(135deg, #d4af37, #b8952a)'
                        : 'var(--accent)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                }}
            >
                {locale === 'pt' ? 'Contactar' : 'Contact'}
            </Link>
        </div>
    );
}

function ThinkingDots() {
    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            {/* AI avatar */}
            <div
                style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003912, #00601f)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 12px rgba(0,57,18,0.4)',
                }}
            >
                <Sparkles size={13} color="#fff" />
            </div>
            <div
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px 14px 14px 14px',
                    padding: '14px 18px',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                }}
            >
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.5)',
                            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main HeroSection
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = {
    pt: [
        'Eletricista urgente Porto 🔥',
        'BMW Série 1 abaixo de €10k',
        'Canalizador de emergência',
        'Limpeza doméstica Lisboa',
    ],
    en: [
        'Emergency electrician Porto 🔥',
        'BMW Series 1 under €10k',
        'Emergency plumber',
        'House cleaning Lisbon',
    ],
};

export default function HeroSection() {
    const locale = useLocale() as 'pt' | 'en';
    const [query, setQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const idleTextareaRef = useRef<HTMLTextAreaElement>(null);
    const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isChat = messages.length > 0 || isThinking;

    // ── Start video ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    }, []);

    // ── Auto-scroll to latest message ────────────────────────────────────────
    useEffect(() => {
        if (isChat) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
        }
    }, [messages, isThinking, isChat]);

    // ── Submit query ─────────────────────────────────────────────────────────
    const handleSubmit = useCallback(
        async (overrideQuery?: string) => {
            const q = (overrideQuery ?? query).trim();
            if (!q || isThinking) return;

            setMessages((prev) => [...prev, { role: 'user', content: q }]);
            setQuery('');

            // Reset textarea heights
            if (idleTextareaRef.current) idleTextareaRef.current.style.height = 'auto';
            if (chatTextareaRef.current) chatTextareaRef.current.style.height = 'auto';

            setIsThinking(true);

            try {
                const res = await fetch('/api/ai-match', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: q, locale }),
                });

                if (res.ok) {
                    const result: AIMatchResult = await res.json();
                    setMessages((prev) => [
                        ...prev,
                        { role: 'ai', content: result.message, result },
                    ]);
                } else {
                    throw new Error('API error');
                }
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        content:
                            locale === 'pt'
                                ? 'Algo correu mal. Tenta novamente.'
                                : 'Something went wrong. Please try again.',
                    },
                ]);
            } finally {
                setIsThinking(false);
                setTimeout(() => chatTextareaRef.current?.focus(), 200);
            }
        },
        [query, isThinking, locale]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleReset = () => {
        setMessages([]);
        setIsThinking(false);
        setQuery('');
    };

    const autoResize = (el: HTMLTextAreaElement, max = 140) => {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, max) + 'px';
    };

    const suggestions = SUGGESTIONS[locale] ?? SUGGESTIONS.en;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <section
            style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* ── Video background ─────────────────────────────────────── */}
            <video
                ref={videoRef}
                muted
                playsInline
                loop
                src="/2239241-hd_1920_1080_24fps.mp4"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                }}
            />

            {/* ── Dark overlay — deeper in chat mode ───────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: isChat
                        ? 'rgba(5,5,8,0.92)'
                        : 'linear-gradient(to bottom, rgba(5,5,8,0.55) 0%, rgba(5,5,8,0.8) 100%)',
                    zIndex: 1,
                    transition: 'background 0.5s ease',
                }}
            />

            {/* ── Content ───────────────────────────────────────────────── */}
            {!isChat ? (
                /* ──────────────── IDLE STATE ──────────────────────────── */
                <div
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '120px 24px 80px',
                    }}
                >
                    <div style={{ maxWidth: '680px', width: '100%', textAlign: 'center' }}>

                        {/* Brand pill */}
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.14)',
                                borderRadius: '99px',
                                backdropFilter: 'blur(12px)',
                                marginBottom: '28px',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    background: '#22c55e',
                                    animation: 'pulseDot 2s ease-in-out infinite',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.88)',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                ✦ Needer AI Concierge
                            </span>
                        </div>

                        {/* Headline */}
                        <h1
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(38px, 6.5vw, 64px)',
                                fontWeight: 800,
                                color: '#ffffff',
                                lineHeight: 1.06,
                                letterSpacing: '-0.03em',
                                marginBottom: '18px',
                            }}
                        >
                            {locale === 'pt' ? 'O que precisas hoje?' : 'What do you need today?'}
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                fontSize: '16px',
                                color: 'rgba(255,255,255,0.62)',
                                lineHeight: 1.65,
                                maxWidth: '500px',
                                margin: '0 auto 36px',
                            }}
                        >
                            {locale === 'pt'
                                ? 'Escreve em linguagem natural. A nossa IA encontra o profissional certo em segundos.'
                                : 'Type in natural language. Our AI finds the right professional in seconds.'}
                        </p>

                        {/* Input box */}
                        <div
                            style={{
                                position: 'relative',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1.5px solid rgba(255,255,255,0.18)',
                                borderRadius: '16px',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                                marginBottom: '20px',
                                transition: 'border-color 0.2s ease',
                            }}
                            onFocus={() => {}}
                        >
                            <textarea
                                ref={idleTextareaRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    autoResize(e.target, 140);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    locale === 'pt'
                                        ? "Ex: 'Quero um BMW Série 1 abaixo de €10k' ou 'O candeeiro da casa de banho fez faísca, preciso de eletricista'..."
                                        : "E.g. 'I want a BMW Series 1 under €10k' or 'My bathroom lamp sparked and I need an electrician'..."
                                }
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '20px 60px 20px 22px',
                                    fontSize: '15px',
                                    fontFamily: 'var(--font-sans)',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#ffffff',
                                    resize: 'none',
                                    lineHeight: 1.6,
                                    minHeight: '64px',
                                    maxHeight: '140px',
                                }}
                            />
                            {/* Send button */}
                            <button
                                onClick={() => handleSubmit()}
                                disabled={!query.trim()}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    bottom: '12px',
                                    width: '38px',
                                    height: '38px',
                                    background: query.trim()
                                        ? 'var(--accent)'
                                        : 'rgba(255,255,255,0.12)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    cursor: query.trim() ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s ease',
                                }}
                            >
                                <Send size={15} />
                            </button>
                        </div>

                        {/* Suggestion chips */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                marginBottom: '36px',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '13px',
                                    color: 'rgba(255,255,255,0.45)',
                                    alignSelf: 'center',
                                }}
                            >
                                {locale === 'pt' ? 'Populares:' : 'Popular:'}
                            </span>
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleSubmit(s)}
                                    style={{
                                        padding: '7px 15px',
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.14)',
                                        borderRadius: '99px',
                                        color: 'rgba(255,255,255,0.82)',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-sans)',
                                        backdropFilter: 'blur(8px)',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.background =
                                            'rgba(255,255,255,0.14)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.background =
                                            'rgba(255,255,255,0.07)';
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Trust stats */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.38)',
                            }}
                        >
                            <span>✓ {locale === 'pt' ? '1.200+ profissionais verificados' : '1,200+ verified professionals'}</span>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span>✓ {locale === 'pt' ? 'Resposta em menos de 5 min' : 'Response in under 5 min'}</span>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span>✓ Porto & {locale === 'pt' ? 'Lisboa' : 'Lisbon'}</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* ──────────────── CHAT STATE ──────────────────────────── */
                <div
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '740px',
                        width: '100%',
                        margin: '0 auto',
                        padding: '0 16px',
                        minHeight: '100vh',
                    }}
                >
                    {/* Chat header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '88px 0 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                            marginBottom: '12px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    background: '#22c55e',
                                    animation: 'pulseDot 2s ease-in-out infinite',
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.8)',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                ✦ Needer AI
                            </span>
                        </div>

                        <button
                            onClick={handleReset}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '99px',
                                color: 'rgba(255,255,255,0.65)',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                    'rgba(255,255,255,0.13)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                    'rgba(255,255,255,0.07)';
                            }}
                        >
                            <RotateCcw size={11} />
                            {locale === 'pt' ? 'Nova pesquisa' : 'New search'}
                        </button>
                    </div>

                    {/* Messages list */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            paddingBottom: '120px',
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: '20px',
                                    animation: 'fadeIn 0.3s ease both',
                                }}
                            >
                                {msg.role === 'user' ? (
                                    /* User bubble */
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <div
                                            style={{
                                                maxWidth: '72%',
                                                background: 'var(--accent)',
                                                color: '#fff',
                                                borderRadius: '16px 16px 4px 16px',
                                                padding: '12px 18px',
                                                fontSize: '14px',
                                                lineHeight: 1.65,
                                            }}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    /* AI bubble */
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        {/* AI avatar */}
                                        <div
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #003912, #00601f)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                marginTop: '2px',
                                                boxShadow: '0 0 14px rgba(0,57,18,0.5)',
                                            }}
                                        >
                                            <Sparkles size={13} color="#fff" />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Text bubble */}
                                            <div
                                                style={{
                                                    background: 'rgba(255,255,255,0.06)',
                                                    border: '1px solid rgba(255,255,255,0.10)',
                                                    borderRadius: '4px 16px 16px 16px',
                                                    padding: '13px 18px',
                                                    fontSize: '14px',
                                                    lineHeight: 1.70,
                                                    color: 'rgba(255,255,255,0.9)',
                                                    backdropFilter: 'blur(12px)',
                                                    marginBottom:
                                                        msg.result?.pros?.length || msg.result?.isProduct
                                                            ? '12px'
                                                            : '0',
                                                }}
                                            >
                                                {msg.content}
                                            </div>

                                            {/* Pro cards */}
                                            {msg.result?.pros && msg.result.pros.length > 0 && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '10px',
                                                        overflowX: 'auto',
                                                        paddingBottom: '6px',
                                                        scrollbarWidth: 'none',
                                                        marginBottom: '10px',
                                                    }}
                                                >
                                                    {msg.result.pros.map((pro, idx) => (
                                                        <ProCard
                                                            key={pro._id ?? idx}
                                                            pro={pro}
                                                            locale={locale}
                                                            index={idx}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* No pros found */}
                                            {msg.result && !msg.result.isProduct && msg.result.pros?.length === 0 && (
                                                <div
                                                    style={{
                                                        padding: '10px 14px',
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        borderRadius: '10px',
                                                        fontSize: '13px',
                                                        color: 'rgba(255,255,255,0.5)',
                                                        marginBottom: '10px',
                                                    }}
                                                >
                                                    {locale === 'pt'
                                                        ? 'Nenhum profissional disponível nesta categoria de momento. O teu pedido foi publicado — entraremos em contacto em breve.'
                                                        : 'No professionals available in this category right now. Your request was posted — we\'ll reach out soon.'}
                                                </div>
                                            )}

                                            {/* Product / Sniper promo card */}
                                            {msg.result?.isProduct && (
                                                <div
                                                    style={{
                                                        background: 'rgba(212,175,55,0.07)',
                                                        border: '1px solid rgba(212,175,55,0.28)',
                                                        borderRadius: '12px',
                                                        padding: '14px 16px',
                                                        fontSize: '13px',
                                                        color: 'rgba(212,175,55,0.92)',
                                                        display: 'flex',
                                                        gap: '10px',
                                                        alignItems: 'flex-start',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '16px', flexShrink: 0 }}>⚡</span>
                                                    <div>
                                                        <strong style={{ display: 'block', marginBottom: '4px' }}>
                                                            {locale === 'pt'
                                                                ? 'Sniper Premium disponível'
                                                                : 'Sniper Premium available'}
                                                        </strong>
                                                        {locale === 'pt'
                                                            ? 'Com o Sniper Premium, vendedores vêem o teu pedido 1 hora antes dos restantes — aumenta as tuas hipóteses de resposta rápida.'
                                                            : 'With Sniper Premium, sellers see your request 1 hour before everyone else — increasing your chances of a fast reply.'}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action row */}
                                            {msg.result?.requestId && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        marginTop: '10px',
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <Link
                                                        href={`/requests/${msg.result.requestId}`}
                                                        style={{
                                                            padding: '7px 14px',
                                                            background: 'var(--accent)',
                                                            color: '#fff',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        {locale === 'pt' ? 'Ver pedido' : 'View request'}
                                                    </Link>
                                                    <Link
                                                        href="/requests"
                                                        style={{
                                                            padding: '7px 14px',
                                                            background: 'rgba(255,255,255,0.07)',
                                                            border: '1px solid rgba(255,255,255,0.12)',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        {locale === 'pt' ? 'Ver todos' : 'Browse all'}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Thinking indicator */}
                        {isThinking && <ThinkingDots />}

                        <div ref={chatEndRef} />
                    </div>

                    {/* ── Fixed input bar ────────────────────────────────── */}
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            maxWidth: '740px',
                            padding: '14px 16px 20px',
                            background: 'rgba(5,5,8,0.88)',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid rgba(255,255,255,0.07)',
                            zIndex: 10,
                        }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1.5px solid rgba(255,255,255,0.14)',
                                borderRadius: '13px',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <textarea
                                ref={chatTextareaRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    autoResize(e.target, 100);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    locale === 'pt'
                                        ? 'Faz outra pergunta...'
                                        : 'Ask another question...'
                                }
                                rows={1}
                                disabled={isThinking}
                                style={{
                                    width: '100%',
                                    padding: '12px 50px 12px 16px',
                                    fontSize: '14px',
                                    fontFamily: 'var(--font-sans)',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#ffffff',
                                    resize: 'none',
                                    lineHeight: 1.5,
                                    minHeight: '44px',
                                    maxHeight: '100px',
                                }}
                            />
                            <button
                                onClick={() => handleSubmit()}
                                disabled={!query.trim() || isThinking}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    bottom: '8px',
                                    width: '32px',
                                    height: '32px',
                                    background:
                                        query.trim() && !isThinking
                                            ? 'var(--accent)'
                                            : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor:
                                        query.trim() && !isThinking ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s ease',
                                }}
                            >
                                <Send size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Global keyframe animations ─────────────────────────── */}
            <style>{`
                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.75); }
                }
                @keyframes dotBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
                    30% { transform: translateY(-6px); opacity: 1; }
                }
                textarea::placeholder { color: rgba(255,255,255,0.32) !important; }
            `}</style>
        </section>
    );
}
