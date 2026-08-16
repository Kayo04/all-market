'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, CheckCircle, Zap, Send, ExternalLink } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ResultBlockData {
  query: string;
  message: string;
  urgency: string;
  category?: string;
  tags?: string[];
  city?: string;
  requestId?: string;
  /** The request call itself failed. Distinct from "no requestId because the
   *  visitor isn't signed in" — those need different messages. */
  failed?: boolean;
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
    ? ['A perceber o teu pedido…', 'A escolher a categoria certa…', 'A publicar para os profissionais…']
    : ['Understanding your request…', 'Picking the right category…', 'Publishing it for professionals…'];

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

      {/* Skeleton tag chips — mirrors the "what I understood" block that lands here */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
        {[74, 96, 60, 112].map((w, i) => (
          <div key={i} style={{
            height: '26px', width: `${w}px`, borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            animation: `shimmer 1.6s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result block — query becomes an H2, pros slide in below
// ─────────────────────────────────────────────────────────────────────────────
function ResultBlock({ block, locale, index }: { block: ResultBlockData; locale: string; index: number }) {
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

      {/* What the AI understood — these are the fields pros will search the feed by,
          so showing them is a chance for the client to spot a miscategorisation. */}
      {(block.category || (block.tags && block.tags.length > 0)) && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {locale === 'pt' ? 'O que percebi' : 'What I understood'}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '4px' }}>
            {[block.category, block.city, ...(block.tags ?? [])]
              .filter((t): t is string => Boolean(t))
              .map((tag, i) => (
                <span key={`${tag}-${i}`} style={{
                  padding: '5px 11px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  fontSize: '11px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                }}>
                  {tag}
                </span>
              ))}
          </div>
        </>
      )}

      {/* Confirmation / View Request */}
      {block.requestId && (
        <div style={{
          marginTop: '20px', padding: '18px 20px',
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: '12px',
          animation: 'riseIn 0.35s ease 0.3s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={15} color="#22c55e" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
              {locale === 'pt' ? 'Pedido publicado! Os profissionais estão a ser notificados.' : 'Request posted! Professionals are being notified.'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '14px', lineHeight: 1.6 }}>
            {locale === 'pt'
              ? 'Em média, a primeira proposta chega em ~8 minutos. Serás notificado quando responderam.'
              : 'On average, the first proposal arrives in ~8 minutes. You will be notified when they respond.'}
          </p>
          <Link
            href={`/requests/${block.requestId}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
            }}
          >
            <ExternalLink size={12} />
            {locale === 'pt' ? 'Ver pedido e propostas →' : 'View request & proposals →'}
          </Link>
        </div>
      )}

      {/* Signed out: the AI understood the need but nothing was saved, because
          persistence requires a userId. Say so — silently dropping the request
          leaves the visitor thinking they posted something that doesn't exist. */}
      {!block.requestId && !block.failed && (
        <div style={{
          marginTop: '20px', padding: '18px 20px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '12px',
          animation: 'riseIn 0.35s ease 0.3s both',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '6px' }}>
            {locale === 'pt' ? 'Falta só entrares na conta' : 'One step left — sign in'}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '14px', lineHeight: 1.6 }}>
            {locale === 'pt'
              ? 'Para publicares este pedido e receberes propostas, precisas de ter sessão iniciada. O teu pedido ainda não foi guardado.'
              : 'To post this request and start receiving proposals you need to be signed in. Your request has not been saved yet.'}
          </p>
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(`/${locale}/concierge?q=${encodeURIComponent(block.query)}`)}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
            }}
          >
            {locale === 'pt' ? 'Entrar e publicar →' : 'Sign in & post →'}
          </Link>
        </div>
      )}
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
  const [results, setResults] = useState<ResultBlockData[]>([]);
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
        urgency: data.urgency,
        category: data.subcategory ?? data.category,
        tags: data.tags ?? [],
        city: data.city,
        requestId: data.requestId,
      }]);
    } catch {
      setResults(prev => [...prev, {
        query: q,
        message: locale === 'pt'
          ? 'Não foi possível publicar o pedido. Tenta novamente.'
          : 'Could not post your request. Please try again.',
        urgency: 'Normal',
        failed: true,
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
