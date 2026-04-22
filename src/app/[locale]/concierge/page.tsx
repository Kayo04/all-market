'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Star, CheckCircle, Zap, Send, Shield, Award } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Pro {
  _id: string;
  name: string;
  rating: number;
  proCategory: string;
  isVerified: boolean;
  hasSponsoredSpot: boolean;
  isSponsored: boolean;
  locationLabel: string;
}

interface ResultBlock {
  query: string;
  message: string;
  pros: Pro[];
  urgency: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion chips — service-oriented
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = {
  pt: [
    'Eletricista urgente Porto',
    'Canalizador emergência Lisboa',
    'Programador React 2 semanas',
    'Personal trainer Lisboa',
    'Limpeza doméstica Braga',
  ],
  en: [
    'Emergency electrician Porto',
    'Plumber urgently Lisbon',
    'React developer 2-week sprint',
    'Personal trainer Lisbon',
    'House cleaning Porto',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader — a single pulsing status line
// ─────────────────────────────────────────────────────────────────────────────
function ScanningState({ locale }: { locale: string }) {
  const [step, setStep] = useState(0);
  const steps = locale === 'pt'
    ? ['A verificar profissionais disponíveis…', 'A analisar avaliações e certificações…', 'A selecionar os melhores para si…']
    : ['Scanning available professionals…', 'Analysing ratings and certifications…', 'Selecting the best matches for you…'];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1600);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div style={{ padding: '32px 0 8px' }}>
      {/* Skeleton request header */}
      <div style={{
        height: '32px', width: '55%', borderRadius: '8px',
        background: 'rgba(255,255,255,0.06)',
        animation: 'shimmer 1.6s ease-in-out infinite',
        marginBottom: '28px',
      }} />

      {/* Status line */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '28px',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#a3a3a3',
          animation: 'pulseDot 1.6s ease-in-out infinite',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.40)',
          fontStyle: 'italic', transition: 'opacity 0.4s ease',
        }}>
          {steps[step]}
        </span>
      </div>

      {/* Skeleton pro cards */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          height: '80px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '10px',
          animation: `shimmer 1.6s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trust badge helper
// ─────────────────────────────────────────────────────────────────────────────
function TrustBadge({ isSponsored, locale }: { isSponsored: boolean; locale: string }) {
  if (isSponsored) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 9px', borderRadius: '6px',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
        color: 'rgba(255,255,255,0.70)', textTransform: 'uppercase',
      }}>
        <Shield size={9} />
        {locale === 'pt' ? 'Parceiro Premium' : 'Premium Partner'}
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pro card
// ─────────────────────────────────────────────────────────────────────────────
function ProCard({ pro, index, locale }: { pro: Pro; index: number; locale: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '18px 20px',
        background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        cursor: 'pointer',
        animation: `riseIn 0.35s ease ${index * 0.08}s both`,
        borderColor: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Rank number */}
      <span style={{
        fontSize: '11px', fontWeight: 700,
        color: index === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
        width: '18px', flexShrink: 0, textAlign: 'center',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {index + 1}
      </span>

      {/* Avatar */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: index === 0
          ? 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
          : 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: 800, color: 'rgba(255,255,255,0.75)',
        border: index === 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
      }}>
        {pro.name.charAt(0)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '14px', fontWeight: 600, color: '#ffffff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {pro.name}
          </span>
          {pro.isVerified && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.04em',
            }}>
              <CheckCircle size={10} /> {locale === 'pt' ? 'Verificado' : 'Verified'}
            </span>
          )}
          <TrustBadge isSponsored={pro.isSponsored} locale={locale} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={11} fill="#ffffff" color="#ffffff" style={{ opacity: 0.7 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
              {pro.rating.toFixed(1)}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>·</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>{pro.locationLabel}</span>
          {index === 0 && (
            <>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>·</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Award size={10} color="rgba(255,255,255,0.45)" />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                  {locale === 'pt' ? 'Top Rated' : 'Top Rated'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <button style={{
        padding: '9px 18px', flexShrink: 0,
        background: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '9px', color: '#fff',
        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s ease', whiteSpace: 'nowrap',
        fontFamily: 'var(--font-sans)',
      }}>
        {locale === 'pt' ? 'Contactar' : 'Contact'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result block — query becomes an H2, pros slide in below
// ─────────────────────────────────────────────────────────────────────────────
function ResultBlock({ block, locale, index }: { block: ResultBlock; locale: string; index: number }) {
  return (
    <div style={{
      paddingBottom: '48px',
      borderBottom: index > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
      marginBottom: index > 0 ? '48px' : 0,
    }}>
      {/* Urgency flag */}
      {block.urgency === 'Urgent' && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          marginBottom: '14px',
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em',
          color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase',
        }}>
          <Zap size={9} />
          {locale === 'pt' ? 'Pedido urgente' : 'Urgent request'}
        </div>
      )}

      {/* Request headline */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 3.5vw, 28px)',
        fontWeight: 700, color: '#ffffff',
        lineHeight: 1.2, letterSpacing: '-0.02em',
        marginBottom: '10px',
        animation: 'riseIn 0.3s ease both',
      }}>
        {block.query}
      </h2>

      {/* Subtext from matching engine */}
      <p style={{
        fontSize: '14px', color: 'rgba(255,255,255,0.38)',
        marginBottom: '24px', lineHeight: 1.6,
      }}>
        {block.message}
      </p>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {locale === 'pt' ? `${block.pros.length} Profissionais encontrados` : `${block.pros.length} Professionals found`}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Pro cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {block.pros.map((pro, i) => (
          <ProCard key={pro._id} pro={pro} index={i} locale={locale} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner page
// ─────────────────────────────────────────────────────────────────────────────
function ConciergePage() {
  const locale = useLocale() as 'pt' | 'en';
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  const suggestions = SUGGESTIONS[locale] ?? SUGGESTIONS.en;
  const isEmpty = results.length === 0 && !loading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results, loading]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !hasRun.current) {
      hasRun.current = true;
      submitQuery(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const submitQuery = useCallback(async (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim();
    if (!q || loading) return;

    setQuery('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const res = await fetch('/api/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, locale }),
      });
      const data = await res.json();
      setResults(prev => [...prev, {
        query: q,
        message: data.message,
        pros: data.pros ?? [],
        urgency: data.urgency,
      }]);
    } catch {
      setResults(prev => [...prev, {
        query: q,
        message: locale === 'pt'
          ? 'Não foi possível completar a pesquisa. Tenta novamente.'
          : 'Could not complete the search. Please try again.',
        pros: [],
        urgency: 'Normal',
      }]);
    } finally {
      setLoading(false);
    }
  }, [query, locale, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuery();
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: '#121212',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }}>
      {/* ── Top bar ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '52px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#121212',
        flexShrink: 0, zIndex: 10,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          textDecoration: 'none', color: 'rgba(255,255,255,0.40)',
          fontSize: '13px', fontWeight: 500, transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.40)'}
        >
          <ArrowLeft size={14} />
          {locale === 'pt' ? 'Voltar' : 'Back'}
        </Link>

        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px', fontWeight: 800,
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: '-0.01em',
        }}>
          needer
          <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.30)', marginLeft: '6px', fontSize: '13px' }}>
            / {locale === 'pt' ? 'encontrar profissional' : 'find professional'}
          </span>
        </span>

        <div style={{ width: '80px' }} />
      </header>

      {/* ── Scrollable content ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent',
      }}>
        {isEmpty ? (
          /* ── Empty / onboarding state ── */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100%',
            padding: '64px 24px', textAlign: 'center',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 5vw, 48px)',
              fontWeight: 800, color: '#ffffff',
              letterSpacing: '-0.03em', lineHeight: 1.1,
              marginBottom: '14px',
            }}>
              {locale === 'pt' ? 'Precisa de um profissional?' : 'Need a professional?'}
            </h1>
            <p style={{
              fontSize: '15px', color: 'rgba(255,255,255,0.38)',
              lineHeight: 1.7, maxWidth: '440px', marginBottom: '40px',
            }}>
              {locale === 'pt'
                ? 'Descreva o seu problema. Encontramos os melhores profissionais disponíveis para si — rapidamente.'
                : 'Describe your problem. We find the best available professionals for you — fast.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '560px' }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submitQuery(s)}
                  style={{
                    padding: '9px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '8px', color: 'rgba(255,255,255,0.55)',
                    fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Results feed ── */
          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 16px' }}>
            {results.map((block, i) => (
              <ResultBlock key={i} block={block} locale={locale} index={i} />
            ))}

            {/* Loading state */}
            {loading && <ScanningState locale={locale} />}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{
        flexShrink: 0, padding: '16px 24px 28px',
        background: '#121212',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.11)',
            borderRadius: '12px',
            transition: 'border-color 0.2s ease',
          }}>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={e => { setQuery(e.target.value); autoResize(e.target); }}
              onKeyDown={handleKeyDown}
              onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'rgba(255,255,255,0.25)')}
              onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'rgba(255,255,255,0.11)')}
              placeholder={
                locale === 'pt'
                  ? "Ex: 'O candeeiro da casa de banho fez faísca, preciso de eletricista em Lisboa' ou 'Procuro programador React para 2 semanas'…"
                  : "E.g. 'My bathroom lamp sparked, I need an electrician in Lisbon' or 'Looking for a React developer for a 2-week sprint'…"
              }
              disabled={loading}
              rows={2}
              style={{
                width: '100%', padding: '16px 56px 16px 18px',
                fontSize: '14px', fontFamily: 'var(--font-sans)',
                background: 'transparent', border: 'none', outline: 'none',
                color: '#ffffff', resize: 'none', lineHeight: 1.6,
                minHeight: '58px', maxHeight: '160px',
                boxSizing: 'border-box',
                opacity: loading ? 0.45 : 1,
              }}
            />
            <button
              onClick={() => submitQuery()}
              disabled={!query.trim() || loading}
              style={{
                position: 'absolute', right: '10px', bottom: '10px',
                width: '36px', height: '36px',
                background: query.trim() && !loading
                  ? 'rgba(255,255,255,0.90)'
                  : 'rgba(255,255,255,0.07)',
                border: 'none', borderRadius: '8px',
                color: query.trim() && !loading ? '#121212' : 'rgba(255,255,255,0.30)',
                cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Send size={14} />
            </button>
          </div>
          <p style={{
            textAlign: 'center', marginTop: '8px',
            fontSize: '11px', color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.01em',
          }}>
            {locale === 'pt'
              ? 'Enter para pesquisar · Shift+Enter para nova linha'
              : 'Enter to search · Shift+Enter for new line'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.20) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 99px; }
      `}</style>
    </div>
  );
}

export default function ConciergePageWrapper() {
  return (
    <Suspense>
      <ConciergePage />
    </Suspense>
  );
}
