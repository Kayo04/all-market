'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { categorize } from '@/lib/categorize';

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
// Inner page
// ─────────────────────────────────────────────────────────────────────────────
// The concierge never saves anything. It reads the sentence (src/lib/categorize.ts)
// and hands off to /requests/new pre-filled, where the client confirms category,
// price, district and photos. One validated write path: POST /api/requests.
function ConciergePage() {
  const locale = useLocale() as 'pt' | 'en';
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasRun = useRef(false);

  const suggestions = SUGGESTIONS[locale] ?? SUGGESTIONS.en;

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !hasRun.current) {
      hasRun.current = true;
      submitQuery(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const submitQuery = useCallback((overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim().slice(0, 2000);
    if (!q || loading) return;

    setLoading(true);
    const need = categorize(q);
    const params = new URLSearchParams({ q });
    if (need.category) params.set('category', need.category);
    if (need.subcategory) params.set('subcategory', need.subcategory);
    if (need.district) params.set('district', need.district);
    if (need.budget) params.set('budget', String(need.budget));
    params.set('urgency', need.urgency);
    router.push(`/requests/new?${params.toString()}`);
  }, [query, loading, router]);

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
            / {locale === 'pt' ? 'criar pedido' : 'post a request'}
          </span>
        </span>

        <div style={{ width: '80px' }} />
      </header>

      {/* ── Scrollable content ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent',
      }}>
        {/* ── Onboarding state ── */}
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
                ? 'Descreva o que precisa. Preparamos o seu pedido e os profissionais da sua zona enviam-lhe propostas.'
                : 'Describe what you need. We prepare your request and professionals in your area send you proposals.'}
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
              maxLength={2000}
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
              ? 'Enter para continuar · Shift+Enter para nova linha'
              : 'Enter to continue · Shift+Enter for new line'}
          </p>
        </div>
      </div>

      <style>{`
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
