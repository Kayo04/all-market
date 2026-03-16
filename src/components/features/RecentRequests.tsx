'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { categories } from '@/lib/categories';

interface RequestItem {
  _id: string;
  title: string;
  category: string;
  subcategory: string;
  budget: number;
  locationLabel?: string;
  createdAt: string;
  status: string;
  userId?: { name?: string };
}

export default function RecentRequests() {
  const t = useTranslations('recent');
  const tc = useTranslations('categories');
  const locale = useLocale();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/requests?limit=6&status=open');
        if (res.ok) {
          const data = await res.json();
          setRequests(data.requests || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return locale === 'pt' ? 'agora' : 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  if (loading) {
    return (
      <section style={{ padding: '32px 24px 48px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {t('title')}
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '12px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '140px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-tertiary)',
                animation: 'fadeIn 0.5s ease',
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (requests.length === 0) {
    return (
      <section style={{ padding: '32px 24px 48px', maxWidth: '1280px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          {t('title')}
        </h2>
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '14px',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {t('empty')}
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '32px 24px 48px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </h2>
        <Link
          href="/requests"
          style={{
            color: 'var(--text-primary)',
          }}
        >
          {t('viewAll')}
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '12px',
        }}
      >
        {requests.map((req) => (
          <Link
            key={req._id}
            href={`/requests/${req._id}`}
            style={{
              padding: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'border-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
          >
            {/* Title + Category */}
            <div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {req.title}
              </h3>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                }}
              >
                {getCategoryLabel(req.category)}
              </span>
            </div>

            {/* Meta */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                €{req.budget}
              </span>
              {req.locationLabel && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={11} />
                  {req.locationLabel}
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
                <Clock size={11} />
                {timeAgo(req.createdAt)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
