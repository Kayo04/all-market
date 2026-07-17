'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import {
  CheckCircle, MapPin, Calendar, Star, Tag, Clock,
  Briefcase, Shield, MessageSquare, ArrowLeft, Sparkles,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ReviewData {
  userId?: { _id?: string; name?: string } | string;
  score: number;
  comment?: string;
  createdAt?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  role: string;
  isVerified: boolean;
  bio?: string;
  skills?: string[];
  avatar?: string;
  locationLabel?: string;
  location?: { label?: string };
  proCategory?: string;
  hasSponsoredSpot?: boolean;
  rating?: number;
  ratings?: ReviewData[];
  phone?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock enrichment data for mock pro IDs (demo mode)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ENRICHMENT: Record<string, Partial<UserProfile> & { responseTime: string; jobsCompleted: number }> = {
  'mock-plumb-1': {
    name: 'AquaFix Pro', bio: 'Professional plumbing services with over 12 years of experience. Specialized in emergency repairs, pipe installations, and bathroom renovations. Licensed and insured. Available 24/7 for urgent calls in the Porto metropolitan area.',
    skills: ['Emergency Repairs', 'Pipe Installation', 'Bathroom Renovation', 'Leak Detection', 'Water Heater'],
    locationLabel: 'Porto', proCategory: 'Plumbers', rating: 4.9, isVerified: true, hasSponsoredSpot: true,
    responseTime: '~8 min', jobsCompleted: 247,
    ratings: [
      { userId: 'u1', score: 5, comment: 'Fixed a burst pipe in under an hour at 11PM. Lifesaver!', createdAt: '2026-05-20T10:00:00Z' },
      { userId: 'u2', score: 5, comment: 'Very professional. Clean work, fair price. Highly recommend.', createdAt: '2026-04-15T14:00:00Z' },
      { userId: 'u3', score: 4, comment: 'Good work on my bathroom renovation. Slightly over budget but quality was excellent.', createdAt: '2026-03-10T09:00:00Z' },
    ],
  },
  'mock-plumb-2': {
    name: 'Carlos Canalização', bio: 'Family-run plumbing business in Gaia since 2009. We treat every home like our own. Fair pricing, honest service, and we always clean up after ourselves.',
    skills: ['Residential Plumbing', 'Drain Cleaning', 'Fixture Installation', 'Water Filtration'],
    locationLabel: 'Gaia', proCategory: 'Plumbers', rating: 4.6, isVerified: true,
    responseTime: '~15 min', jobsCompleted: 183,
    ratings: [
      { userId: 'u4', score: 5, comment: 'Carlos came the same day. Fixed the issue and charged exactly what he quoted.', createdAt: '2026-06-01T11:00:00Z' },
      { userId: 'u5', score: 4, comment: 'Solid work. Would call again.', createdAt: '2026-05-10T16:00:00Z' },
    ],
  },
  'mock-elec-1': {
    name: 'Electro Solutions', bio: 'Certified electricians serving Porto and surrounding areas. From residential wiring to commercial installations. 24/7 emergency service. All work guaranteed for 2 years.',
    skills: ['Emergency Electrical', 'Wiring', 'Fuse Box Upgrade', 'Smart Home', 'EV Charger Install'],
    locationLabel: 'Porto', proCategory: 'Electricians', rating: 4.9, isVerified: true, hasSponsoredSpot: true,
    responseTime: '~5 min', jobsCompleted: 312,
    ratings: [
      { userId: 'u6', score: 5, comment: 'Arrived 20 minutes after my call. Sparking socket fixed safely.', createdAt: '2026-06-10T20:00:00Z' },
      { userId: 'u7', score: 5, comment: 'Upgraded our entire fuse box. Clean work, very knowledgeable.', createdAt: '2026-05-25T08:00:00Z' },
    ],
  },
};

// Fallback for any mock pro not explicitly enriched
const DEFAULT_MOCK: { responseTime: string; jobsCompleted: number; bio: string; skills: string[] } = {
  responseTime: '~12 min', jobsCompleted: 85,
  bio: 'Verified professional on the Needer platform. Available for new projects.',
  skills: ['Professional Service'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Stars component
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = i < full ? 1 : i === full ? partial : 0;
        return (
          <div key={i} style={{ position: 'relative', width: size, height: size }}>
            <Star size={size} color="rgba(255,255,255,0.15)" fill="rgba(255,255,255,0.08)" />
            {fill > 0 && (
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${fill * 100}%` }}>
                <Star size={size} color="#facc15" fill="#facc15" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const locale = useLocale() as 'pt' | 'en';
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMock = id.startsWith('mock-');

  useEffect(() => {
    if (isMock) {
      // For mock IDs, build a synthetic profile from enrichment data
      const enrichment = MOCK_ENRICHMENT[id];
      const defaults = DEFAULT_MOCK;
      setUser({
        _id: id,
        name: enrichment?.name ?? id,
        role: 'pro',
        isVerified: enrichment?.isVerified ?? true,
        bio: enrichment?.bio ?? defaults.bio,
        skills: enrichment?.skills ?? defaults.skills,
        locationLabel: enrichment?.locationLabel ?? 'Porto',
        proCategory: enrichment?.proCategory ?? 'Professional',
        hasSponsoredSpot: enrichment?.hasSponsoredSpot ?? false,
        rating: enrichment?.rating ?? 4.5,
        ratings: (enrichment?.ratings ?? []) as ReviewData[],
        createdAt: '2024-03-15T00:00:00Z',
      });
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id, isMock]);

  // Derived data
  const enrichment = isMock ? (MOCK_ENRICHMENT[id] ?? DEFAULT_MOCK) : null;
  const responseTime = enrichment?.responseTime ?? '~12 min';
  const jobsCompleted = enrichment?.jobsCompleted ?? 0;
  const isPro = user?.role === 'pro';
  const avgRating = user?.rating ?? 0;
  const reviewCount = user?.ratings?.length ?? 0;
  const displayLocation = user?.locationLabel || user?.location?.label || '';
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  // ─────────────────────────────────────────────────────────────────────────
  // Loading / not found
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '3px solid var(--accent)', borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {locale === 'pt' ? 'A carregar perfil...' : 'Loading profile...'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 600 }}>
          {locale === 'pt' ? 'Utilizador não encontrado' : 'User not found'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 60px' }}>

      {/* ── Back link ────────────────────────────────────────────────── */}
      <Link
        href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'var(--text-tertiary)', textDecoration: 'none',
          marginBottom: '24px', transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
      >
        <ArrowLeft size={14} />
        {locale === 'pt' ? 'Voltar' : 'Back'}
      </Link>

      {/* ── Hero Card ────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '36px 32px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Sponsored banner */}
        {user.hasSponsoredSpot && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #d4af37, #f0d060, #d4af37)',
          }} />
        )}

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '20px', flexShrink: 0,
            background: user.hasSponsoredSpot
              ? 'linear-gradient(135deg, #d4af37, #a07e1a)'
              : 'linear-gradient(135deg, var(--accent), #004d16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '36px', fontWeight: 800,
            fontFamily: 'var(--font-display)',
            boxShadow: user.hasSponsoredSpot
              ? '0 8px 32px rgba(212,175,55,0.25)'
              : '0 8px 32px rgba(0,80,20,0.2)',
          }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: '24px',
                fontWeight: 800, letterSpacing: '-0.02em', margin: 0,
              }}>
                {user.name}
              </h1>
              {user.isVerified && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '99px',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                  fontSize: '11px', fontWeight: 700, color: '#22c55e',
                }}>
                  <CheckCircle size={11} /> {locale === 'pt' ? 'Verificado' : 'Verified'}
                </div>
              )}
              {user.hasSponsoredSpot && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '99px',
                  background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                  fontSize: '11px', fontWeight: 700, color: '#d4af37',
                }}>
                  <Shield size={11} /> Premium
                </div>
              )}
            </div>

            {/* Category */}
            {user.proCategory && (
              <p style={{
                fontSize: '14px', color: 'var(--text-secondary)',
                textTransform: 'capitalize', marginBottom: '12px',
              }}>
                {user.proCategory.replace(/-/g, ' ')}
                {displayLocation ? ` · ${displayLocation}` : ''}
              </p>
            )}

            {/* Rating row */}
            {isPro && avgRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <StarRating rating={avgRating} size={16} />
                <span style={{ fontSize: '15px', fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  ({reviewCount} {reviewCount === 1 ? (locale === 'pt' ? 'avaliação' : 'review') : (locale === 'pt' ? 'avaliações' : 'reviews')})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────── */}
      {isPro && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          {[
            {
              icon: <Briefcase size={16} />,
              label: locale === 'pt' ? 'Trabalhos concluídos' : 'Jobs completed',
              value: isMock ? jobsCompleted.toString() : '—',
            },
            {
              icon: <Clock size={16} />,
              label: locale === 'pt' ? 'Tempo de resposta' : 'Response time',
              value: isMock ? responseTime : '—',
            },
            {
              icon: <Calendar size={16} />,
              label: locale === 'pt' ? 'Membro desde' : 'Member since',
              value: new Date(user.createdAt).toLocaleDateString(locale, { month: 'short', year: 'numeric' }),
            },
            {
              icon: <MapPin size={16} />,
              label: locale === 'pt' ? 'Localização' : 'Location',
              value: displayLocation || '—',
            },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ color: 'var(--accent)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bio ──────────────────────────────────────────────────────── */}
      {user.bio && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontSize: '14px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)',
            marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <MessageSquare size={14} />
            {locale === 'pt' ? 'Sobre' : 'About'}
          </h2>
          <p style={{
            fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0,
          }}>
            {user.bio}
          </p>
        </div>
      )}

      {/* ── Skills ───────────────────────────────────────────────────── */}
      {user.skills && user.skills.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontSize: '14px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)',
            marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Tag size={14} />
            {locale === 'pt' ? 'Competências' : 'Skills'}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user.skills.map((skill) => (
              <span key={skill} style={{
                padding: '6px 14px',
                background: 'rgba(0,100,30,0.08)',
                border: '1px solid rgba(0,100,30,0.15)',
                borderRadius: '99px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--accent)',
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Reviews ──────────────────────────────────────────────────── */}
      {user.ratings && user.ratings.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontSize: '14px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)',
            marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Star size={14} />
            {locale === 'pt' ? `Avaliações (${reviewCount})` : `Reviews (${reviewCount})`}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {user.ratings.map((review, idx) => {
              const reviewerName = typeof review.userId === 'object' && review.userId?.name
                ? review.userId.name
                : locale === 'pt' ? 'Cliente Needer' : 'Needer Client';
              const dateStr = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
                : '';

              return (
                <div key={idx} style={{
                  padding: '16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: 'var(--accent)',
                      }}>
                        {reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{reviewerName}</div>
                        {dateStr && (
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{dateStr}</div>
                        )}
                      </div>
                    </div>
                    <StarRating rating={review.score} size={12} />
                  </div>
                  {review.comment && (
                    <p style={{
                      fontSize: '14px', color: 'var(--text-secondary)',
                      lineHeight: 1.7, margin: 0,
                    }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      {isPro && (
        <Link
          href="/concierge"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: '100%', padding: '16px',
            background: user.hasSponsoredSpot
              ? 'linear-gradient(135deg, #d4af37, #b8952a)'
              : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: '14px',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 20px rgba(0,80,20,0.25)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,80,20,0.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,80,20,0.25)';
          }}
        >
          <Sparkles size={16} />
          {locale === 'pt' ? 'Enviar Pedido a Este Profissional' : 'Send a Request to This Professional'}
        </Link>
      )}
    </div>
  );
}
