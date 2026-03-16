'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';

const VIDEOS = [
  '/2239241-hd_1920_1080_24fps.mp4',
  '/3768941-hd_1920_1080_25fps.mp4',
  '/4941457-hd_1920_1080_25fps.mp4',
  '/4974884-hd_1920_1080_25fps.mp4',
  '/5234724-hd_1920_1080_25fps.mp4',
  '/6764455-hd_1920_1080_30fps.mp4',
  '/7989732-hd_1920_1080_25fps.mp4',
];

const CLIP_DURATION = 5000; // 5 seconds per clip

export default function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');

  const cycleVideo = useCallback(() => {
    const incoming = (currentIndex + 1) % VIDEOS.length;
    setNextIndex(incoming);
    setTransitioning(true);

    // Preload the next video
    const nextRef = activeSlot === 'A' ? videoBRef : videoARef;
    if (nextRef.current) {
      nextRef.current.src = VIDEOS[incoming];
      nextRef.current.load();
      nextRef.current.play().catch(() => {});
    }

    setTimeout(() => {
      setActiveSlot(activeSlot === 'A' ? 'B' : 'A');
      setCurrentIndex(incoming);
      setTransitioning(false);
    }, 1000); // crossfade duration
  }, [currentIndex, activeSlot]);

  useEffect(() => {
    const interval = setInterval(cycleVideo, CLIP_DURATION);
    return () => clearInterval(interval);
  }, [cycleVideo]);

  // Start first video
  useEffect(() => {
    if (videoARef.current) {
      videoARef.current.src = VIDEOS[0];
      videoARef.current.load();
      videoARef.current.play().catch(() => {});
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/requests?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section
      className="hero-section-container"
      style={{
        position: 'relative',
        minHeight: '650px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 0',
      }}
    >
      {/* Video Layer A */}
      <video
        ref={videoARef}
        className="hero-video-layer"
        muted
        playsInline
        loop
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: activeSlot === 'A' ? 1 : transitioning ? 0 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: 1,
        }}
      />

      {/* Video Layer B */}
      <video
        ref={videoBRef}
        className="hero-video-layer"
        muted
        playsInline
        loop
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: activeSlot === 'B' ? 1 : transitioning ? 0 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: 1,
        }}
      />

      {/* Dark Overlay */}
      <div
        className="hero-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          maxWidth: '1536px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          {/* Headline */}
          <h1
            className="hero-headline"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: '32px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            {locale === 'pt' ? (
              <>
                Encontra os profissionais perfeitos <br />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>para o teu negócio</span>
              </>
            ) : (
              <>
                Find the perfect professionals <br />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>for your business</span>
              </>
            )}
          </h1>



          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              maxWidth: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              margin: '0 auto 20px',
            }}
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={{
                flex: 1,
                padding: '16px 20px',
                fontSize: '15px',
                fontFamily: 'var(--font-sans)',
                background: '#ffffff',
                border: 'none',
                color: '#111',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '16px 24px',
                background: '#1a1a1a',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search size={20} />
            </button>
          </form>

          {/* Suggestions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}
          >
            <span
              className="hero-suggestion-label"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {locale === 'pt' ? 'Popular:' : 'Popular:'}
            </span>
            {(locale === 'pt'
              ? ['Criação de Websites', 'Remodelações', 'Gestão de Redes Sociais', 'Fotografia']
              : ['Website Development', 'Home Remodeling', 'Social Media Management', 'Photography']
            ).map((sug) => (
              <button
                key={sug}
                className="hero-suggestion-btn"
                onClick={() => {
                  setSearchQuery(sug);
                  router.push(`/requests?q=${encodeURIComponent(sug)}`);
                }}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.8)',
                  borderRadius: 'var(--radius-full)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {sug}
                <ArrowRight size={14} />
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hero-cta-container" style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/requests/new"
              className="hero-cta-btn"
              style={{
                padding: '10px 20px',
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              {t('cta')}
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/auth/register"
              className="hero-cta-btn"
              style={{
                padding: '10px 20px',
                background: '#ffffff',
                color: '#000000',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '14px',
                textDecoration: 'none',
                border: '1px solid #000000',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#000000';
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#ffffff';
                (e.currentTarget as HTMLElement).style.color = '#000000';
              }}
            >
              {t('ctaPro')}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-video-layer { display: none !important; }
          .hero-overlay { display: none !important; }
          .hero-section-container { 
            background: var(--accent-light) !important; 
            minHeight: auto !important;
            padding: 80px 0 !important;
          }
          .hero-headline { 
            color: var(--text-primary) !important; 
            font-size: clamp(32px, 8vw, 40px) !important; 
          }
          .hero-suggestion-label { color: var(--text-secondary) !important; }
          .hero-suggestion-btn { 
            color: var(--text-primary) !important; 
            border-color: var(--border) !important; 
            background: var(--bg-primary) !important;
          }
          .hero-suggestion-btn:hover { background: var(--bg-secondary) !important; }
          .hero-cta-container { flex-direction: column !important; width: 100% !important; margin-top: 16px !important; }
          .hero-cta-btn { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </section>
  );
}
