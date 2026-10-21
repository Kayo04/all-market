'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { Search } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion chips — mixed services + products, since Needer handles both
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = {
    pt: [
        'Eletricista urgente',
        'Explicador de Matemática',
        'BMW Série 1 abaixo de €10k 🚗',
        'PS5 usado Porto',
        'iPhone 15 Pro Max',
    ],
    en: [
        'Emergency electrician',
        'Math tutor',
        'BMW Series 1 under €10k 🚗',
        'Used PS5 Porto',
        'iPhone 15 Pro Max',
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Background reel — the hero cycles through every clip instead of looping one.
// Order is fixed so the sequence is predictable; add or remove files here only.
// ─────────────────────────────────────────────────────────────────────────────

const HERO_VIDEOS = [
    '/2239241-hd_1920_1080_24fps.mp4',
    '/3768941-hd_1920_1080_25fps.mp4',
    '/4941457-hd_1920_1080_25fps.mp4',
    '/4974884-hd_1920_1080_25fps.mp4',
    '/5234724-hd_1920_1080_25fps.mp4',
    '/6764455-hd_1920_1080_30fps.mp4',
    '/7989732-hd_1920_1080_25fps.mp4',
];

const FADE_MS = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// HeroSection — reverse marketplace entry point (services AND products)
// The search bar searches what PEOPLE NEED, not who's offering. It routes to
// /requests?q=… (the needs feed). Posting your own need is a separate, deliberate
// action ("Criar pedido" in the navbar → /concierge), so that browsing the
// marketplace never turns into browsing a directory of professionals.
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroSection() {
    const locale = useLocale() as 'pt' | 'en';
    const router = useRouter();
    const [query, setQuery] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Two stacked <video> slots: one on screen, one silently preloading the next
    // clip. When the visible one ends we crossfade to its neighbour, then load the
    // clip after that into the slot which just faded out — so the reel advances
    // through the whole playlist without ever cutting to a blank frame.
    const videoA = useRef<HTMLVideoElement>(null);
    const videoB = useRef<HTMLVideoElement>(null);
    const [srcs, setSrcs] = useState<[string, string]>([HERO_VIDEOS[0], HERO_VIDEOS[1]]);
    const [active, setActive] = useState<0 | 1>(0);
    const queued = useRef(1); // playlist index currently held by the hidden slot

    useEffect(() => {
        const visible = active === 0 ? videoA : videoB;
        visible.current?.play().catch(() => {});
    }, [active]);

    const advance = useCallback(() => {
        setActive(previous => {
            queued.current = (queued.current + 1) % HERO_VIDEOS.length;
            const upcoming = HERO_VIDEOS[queued.current];
            // Wait out the crossfade before swapping the outgoing slot's source,
            // otherwise the clip fading away blinks to black halfway through.
            window.setTimeout(() => {
                setSrcs(current => {
                    const next: [string, string] = [...current];
                    next[previous] = upcoming;
                    return next;
                });
            }, FADE_MS + 100);
            return (1 - previous) as 0 | 1;
        });
    }, []);

    // Searches the needs feed — what people are asking for — not professionals.
    const handleSubmit = useCallback(
        (overrideQuery?: string) => {
            const q = (overrideQuery ?? query).trim();
            if (!q) return;
            router.push(`/requests?q=${encodeURIComponent(q)}`);
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
                // About half a screen: categories and live requests must be visible
                // without scrolling, like any marketplace homepage.
                minHeight: 'min(62vh, 600px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* ── Video background — crossfading reel ──────────────────── */}
            {([0, 1] as const).map(slot => (
                <video
                    key={slot}
                    ref={slot === 0 ? videoA : videoB}
                    muted
                    playsInline
                    preload="auto"
                    src={srcs[slot]}
                    onEnded={advance}
                    onError={advance}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: active === slot ? 1 : 0,
                        transition: `opacity ${FADE_MS}ms ease-in-out`,
                        zIndex: 0,
                    }}
                />
            ))}

            {/* ── Gradient overlay ─────────────────────────────────────── */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(27,20,14,0.55) 0%, rgba(23,17,12,0.88) 100%)',
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
                    padding: '96px 24px 40px',
                }}
            >
                <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>

                    {/* Eyebrow label */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '5px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.13)',
                            borderRadius: '99px',
                            backdropFilter: 'blur(12px)',
                            marginBottom: '16px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.78)',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {locale === 'pt' ? 'Marketplace Reverso' : 'Reverse Marketplace'}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(38px, 6vw, 66px)',
                            fontWeight: 600,
                            color: '#fdfbf6',
                            lineHeight: 1.06,
                            letterSpacing: '-0.02em',
                            marginBottom: '18px',
                        }}
                    >
                        {locale === 'pt'
                            ? <>O que as pessoas <em style={{ color: '#7fd1a0', fontStyle: 'italic', fontWeight: 500 }}>precisam</em> hoje?</>
                            : <>What do people <em style={{ color: '#7fd1a0', fontStyle: 'italic', fontWeight: 500 }}>need</em> today?</>}
                    </h1>

                    {/* Subtitle */}
                    <p
                        style={{
                            fontSize: '16px',
                            color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.7,
                            maxWidth: '520px',
                            margin: '0 auto 24px',
                        }}
                    >
                        {locale === 'pt'
                            ? 'Vê o que as pessoas estão a pedir agora — serviços e produtos. Precisas de algo? Cria o teu pedido e deixa as ofertas virem ter contigo.'
                            : 'See what people are asking for right now — services and products. Need something yourself? Post a request and let the offers come to you.'}
                    </p>

                    {/* Input box */}
                    <div
                        style={{
                            position: 'relative',
                            background: 'rgba(253,251,246,0.06)',
                            border: '1.5px solid rgba(253,251,246,0.18)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 48px rgba(0,0,0,0.4)',
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
                                    ? "Procurar pedidos: 'eletricista', 'mudanças', 'PS5'..."
                                    : "Search requests: 'electrician', 'house move', 'PS5'..."
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
                                    ? 'linear-gradient(135deg, #2f9e5c, #4cb87a)'
                                    : 'rgba(253,251,246,0.10)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#fff',
                                cursor: query.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s ease, transform 0.15s ease',
                                boxShadow: query.trim() ? '0 4px 16px rgba(47,158,92,0.35)' : 'none',
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
                            marginBottom: '20px',
                        }}
                    >
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', alignSelf: 'center', marginRight: '2px' }}>
                            {locale === 'pt' ? 'Exemplos:' : 'Examples:'}
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

                    {/* Secondary path. The search above browses what OTHER people
                        need; this is how you post your own. Without it the posting
                        half of the marketplace only exists in the navbar. */}
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                        {locale === 'pt' ? 'Precisas de alguma coisa? ' : 'Need something yourself? '}
                        <Link
                            href="/concierge"
                            style={{ color: '#7fd1a0', fontWeight: 600, textDecoration: 'none' }}
                        >
                            {locale === 'pt' ? 'Criar pedido →' : 'Post a request →'}
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                section textarea::placeholder { color: rgba(255,255,255,0.28) !important; }
            `}</style>
        </section>
    );
}
