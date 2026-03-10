'use client';

import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import {
  Zap,
  MapPin,
  Euro,
  Clock,
  Send,
  TrendingUp,
  Target,
  FileEdit,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';

interface OpportunityItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: number;
  locationLabel?: string;
  createdAt: string;
  isFeatured: boolean;
}

export default function ProDashboard() {
  const { data: session } = useSession();
  const t = useTranslations('dashboard.pro');
  const locale = useLocale();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const res = await fetch('/api/requests?status=open&limit=20');
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data.requests || []);
        }
      } catch (err) {
        console.error('Error loading opportunities:', err);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchOpportunities();
  }, [session]);

  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return locale === 'pt' ? 'agora mesmo' : 'just now';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '4px',
          }}
        >
          {t('title')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t('subtitle')}</p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        {[
          { icon: Send, label: t('proposalsSent'), value: '0', color: '#3b82f6' },
          { icon: TrendingUp, label: t('acceptanceRate'), value: '—', color: '#22c55e' },
          { icon: Target, label: t('activeLeads'), value: '0', color: '#f59e0b' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} style={{ padding: '18px', textAlign: 'center' }} hover={false}>
              <Icon size={20} color={stat.color} style={{ margin: '0 auto 8px' }} />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 800,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Draft Templates Link */}
      <div style={{ marginBottom: '12px' }}>
        <Link href="/dashboard/pro/drafts" style={{ textDecoration: 'none' }}>
          <Card style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileEdit size={20} color="var(--accent)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{t('drafts')}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {t('manageDrafts')}
                </div>
              </div>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '20px' }}>→</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Get Verified Card */}
      <div style={{ marginBottom: '24px' }}>
        <Card
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(168, 85, 247, 0.08))',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}
          hover={false}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '20px' }}>✦</span>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                {locale === 'pt' ? 'Torna-te Verificado' : 'Get Verified'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {locale === 'pt'
                  ? 'O selo verificado aumenta a tua credibilidade e dá-te prioridade nos resultados.'
                  : 'The verified badge boosts your credibility and gives you priority in results.'}
              </div>
            </div>
            <Link href="/dashboard/pro/verify" style={{ textDecoration: 'none' }}>
              <Button size="sm" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                {locale === 'pt' ? 'Começar' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Opportunities Feed */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '16px',
        }}
      >
        <Zap size={18} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
        {locale === 'pt' ? 'Oportunidades Recentes' : 'Recent Opportunities'}
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      ) : opportunities.length === 0 ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Zap size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            {t('noOpportunities')}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {opportunities.map((opp) => (
            <Card key={opp._id} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {opp.isFeatured && <Badge variant="warning">⭐ Featured</Badge>}
                    <Badge variant="accent">{getCategoryLabel(opp.category)}</Badge>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{opp.title}</h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '10px',
                    }}
                  >
                    {opp.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Euro size={12} /> {opp.budget}
                    </span>
                    {opp.locationLabel && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {opp.locationLabel}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {timeAgo(opp.createdAt)}
                    </span>
                  </div>
                </div>
                <Link href={`/requests/${opp._id}`} style={{ textDecoration: 'none' }}>
                  <Button size="sm">{t('respond')}</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
