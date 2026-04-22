'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Search } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Product-only suggestion chips
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = {
    pt: [
        'BMW Série 1 abaixo de €10k 🚗',
        'PS5 usado Porto',
        'iPhone 15 Pro Max',
        'MacBook Pro M3',
        'Sofá 3 lugares',
    ],
    en: [
        'BMW Series 1 under €10k 🚗',
        'Used PS5 Porto',
        'iPhone 15 Pro Max',
        'MacBook Pro M3',
        'Rolex Submariner',
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HeroSection — Products / Reverse Marketplace entry point
// Submitting routes to /concierge?q=… for AI matching (services live there)
// but for products we could also handle them — same route, AI will detect type.
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroSection() {
    const locale = useLocale() as 'pt' | 'en';
    const router = useRouter();
    const [query, setQuery] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    }, []);

    // Submitting routes to /concierge with the query so the AI can find sellers.
    const handleSubmit = useCallback(
        (overrideQuery?: string) => {
            const q = (overrideQuery ?? query).trim();
            if (!q) return;
            router.push(`/concierge?q=${encodeURIComponent(q)}`);
        },
        [query, router]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const autoResize = (el: HTMLTextAreaElement) => {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    };

    const suggestions = SUGGESTIONS[locale] ?? SUGGESTIONS.en;

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
            {/* ── Video background ────────────────────────────────────── */}
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

            {/* ── Gradient overlay ─────────────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5,5,8,0.6) 0%, rgba(5,5,8,0.85) 100%)',
                    zIndex: 1,
                }}
            />

            {/* ── Content ──────────────────────────────────────────────── */}
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
                <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>

                    {/* Eyebrow label */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '5px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.13)',
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
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.78)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {locale === 'pt' ? 'Marketplace Reverso · Produtos' : 'Reverse Marketplace · Products'}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(36px, 6vw, 62px)',
                            fontWeight: 800,
                            color: '#ffffff',
                            lineHeight: 1.07,
                            letterSpacing: '-0.035em',
                            marginBottom: '16px',
                        }}
                    >
                        {locale === 'pt'
                            ? <>O que queres <span style={{ color: '#4ade80' }}>comprar</span> hoje?</>
                            : <>What do you want to <span style={{ color: '#4ade80' }}>buy</span> today?</>}
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontSize: '16px',
                            color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.7,
                            maxWidth: '520px',
                            margin: '0 auto 36px',
                        }}
                    >
                        {locale === 'pt'
                            ? 'Publica o que procuras. Vendedores premium contactam-te em minutos — sem pesquisa, sem intermediários.'
                            : 'Post what you\'re looking for. Premium sellers reach out in minutes — no searching, no middlemen.'}
                    </p>

                    {/* Input box */}
                    <div
                        style={{
                            position: 'relative',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1.5px solid rgba(255,255,255,0.16)',
                            borderRadius: '18px',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 48px rgba(0,0,0,0.45)',
                            marginBottom: '20px',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onFocus={() => {}}
                    >
                        <textarea
                            ref={textareaRef}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                autoResize(e.target);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                locale === 'pt'
                                    ? "Ex: 'BMW Série 1 abaixo de €10k', 'PS5 usado no Porto', 'iPhone 15 Pro Max'..."
                                    : "E.g. 'BMW Series 1 under €10k', 'Used PS5 in Porto', 'iPhone 15 Pro Max'..."
                            }
                            rows={2}
                            style={{
                                width: '100%',
                                padding: '20px 64px 20px 24px',
                                fontSize: '15px',
                                fontFamily: 'var(--font-sans)',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#ffffff',
                                resize: 'none',
                                lineHeight: 1.6,
                                minHeight: '68px',
                                maxHeight: '140px',
                                boxSizing: 'border-box',
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
                                width: '40px',
                                height: '40px',
                                background: query.trim()
                                    ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                                    : 'rgba(255,255,255,0.10)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: query.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s ease, transform 0.15s ease',
                                boxShadow: query.trim() ? '0 4px 16px rgba(34,197,94,0.35)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (query.trim())
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                            }}
                        >
                            <Search size={16} />
                        </button>
                    </div>

                    {/* Suggestion chips */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            marginBottom: '40px',
                        }}
                    >
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', alignSelf: 'center', marginRight: '2px' }}>
                            {locale === 'pt' ? 'Tendência:' : 'Trending:'}
                        </span>
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleSubmit(s)}
                                style={{
                                    padding: '6px 14px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '99px',
                                    color: 'rgba(255,255,255,0.75)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.13)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)';
                                    (e.currentTarget as HTMLElement).style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Trust / value props */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        {[
                            { icon: '🛡️', text: locale === 'pt' ? 'Vendedores verificados' : 'Verified sellers' },
                            { icon: '⚡', text: locale === 'pt' ? 'Resposta em minutos' : 'Response in minutes' },
                            { icon: '🏆', text: locale === 'pt' ? 'Melhores preços garantidos' : 'Best prices guaranteed' },
                        ].map(({ icon, text }) => (
                            <div
                                key={text}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.40)',
                                    fontWeight: 500,
                                }}
                            >
                                <span style={{ fontSize: '14px' }}>{icon}</span>
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Keyframe for brand pill dot ───────────────────────────── */}
            <style>{`
                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.75); }
                }
                section textarea::placeholder { color: rgba(255,255,255,0.28) !important; }
            `}</style>
        </section>
    );
}
