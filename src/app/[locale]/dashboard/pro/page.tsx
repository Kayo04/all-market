'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  Zap, MapPin, Euro, Clock, Send, TrendingUp, Target,
  FileEdit, CheckCircle, AlertCircle,
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

interface ProStats {
  totalSent: number;
  accepted: number;
  pending: number;
  acceptanceRate: number;
}

interface UserProfile {
  proCategory?: string;
  bio?: string;
  skills?: string[];
  locationLabel?: string;
}

export default function ProDashboard() {
  const { data: session } = useSession();
  const locale = useLocale();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProStats>({ totalSent: 0, accepted: 0, pending: 0, acceptanceRate: 0 });
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const t = (en: string, pt: string) => locale === 'pt' ? pt : en;

  const userId = (session?.user as { id?: string })?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [statsRes, profileRes, oppsRes] = await Promise.all([
        fetch('/api/proposals/stats'),
        fetch(`/api/users/${userId}`),
        fetch('/api/requests?status=open&limit=20'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.user);
      }
      if (oppsRes.ok) {
        const data = await oppsRes.json();
        setOpportunities(data.requests || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  const getCategoryLabel = (key: string) => {
    const cat = categories.find(c => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return t('just now', 'agora mesmo');
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Filter: show opportunities matching pro's category first
  const sortedOpps = [...opportunities].sort((a, b) => {
    if (!profile?.proCategory) return 0;
    const aMatch = a.subcategory === profile.proCategory || a.category === profile.proCategory ? 1 : 0;
    const bMatch = b.subcategory === profile.proCategory || b.category === profile.proCategory ? 1 : 0;
    return bMatch - aMatch;
  });

  const needsOnboarding = !profile?.proCategory && !profile?.bio;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
          {t('Pro Dashboard', 'Painel Profissional')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {t('Manage your proposals and find new opportunities.', 'Gere as tuas propostas e encontra novas oportunidades.')}
        </p>
      </div>

      {/* Onboarding nudge */}
      {needsOnboarding && (
        <Link href="/dashboard/pro/onboarding" style={{ textDecoration: 'none' }}>
          <Card style={{
            padding: '20px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(29,191,115,0.08), rgba(59,130,246,0.06))',
            border: '1px solid rgba(29,191,115,0.25)',
          }} hover>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <AlertCircle size={24} color="var(--accent)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                  {t('Complete your profile', 'Completa o teu perfil')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {t(
                    'Add your category, skills, and bio to start receiving matching opportunities.',
                    'Adiciona a tua categoria, competências e bio para começar a receber oportunidades.'
                  )}
                </div>
              </div>
              <span style={{ color: 'var(--accent)', fontSize: '20px', fontWeight: 700 }}>→</span>
            </div>
          </Card>
        </Link>
      )}

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {[
          { icon: Send, label: t('Proposals sent', 'Propostas enviadas'), value: stats.totalSent.toString(), color: '#1dbf73' },
          { icon: CheckCircle, label: t('Accepted', 'Aceites'), value: stats.accepted.toString(), color: '#22c55e' },
          { icon: TrendingUp, label: t('Acceptance rate', 'Taxa de aceitação'), value: stats.acceptanceRate > 0 ? `${stats.acceptanceRate}%` : '—', color: '#8b5cf6' },
          { icon: Target, label: t('Active leads', 'Leads ativos'), value: stats.pending.toString(), color: '#f59e0b' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} style={{ padding: '16px', textAlign: 'center' }} hover={false}>
              <Icon size={18} color={stat.color} style={{ margin: '0 auto 6px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Draft Templates Link */}
      <div style={{ marginBottom: '12px' }}>
        <Link href="/dashboard/pro/drafts" style={{ textDecoration: 'none' }}>
          <Card style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileEdit size={18} color="var(--accent)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>
                  {t('Proposal Templates', 'Modelos de Proposta')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t('Save time with reusable templates.', 'Poupa tempo com modelos reutilizáveis.')}
                </div>
              </div>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '18px' }}>→</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Get Verified Card */}
      <div style={{ marginBottom: '24px' }}>
        <Card
          style={{
            padding: '18px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.06))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
          hover={false}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1dbf73, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '18px' }}>✦</span>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                {t('Get Verified', 'Torna-te Verificado')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {t(
                  'The verified badge boosts credibility and gives you priority in results.',
                  'O selo verificado aumenta a credibilidade e dá-te prioridade nos resultados.'
                )}
              </div>
            </div>
            <Link href="/dashboard/pro/verify" style={{ textDecoration: 'none' }}>
              <Button size="sm" style={{ background: 'linear-gradient(135deg, #1dbf73, #10b981)' }}>
                {t('Get Started', 'Começar')}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Opportunities Feed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Zap size={18} color="var(--accent)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
          {t('Recent Opportunities', 'Oportunidades Recentes')}
        </h2>
        {profile?.proCategory && (
          <Badge variant="accent" style={{ fontSize: '10px' }}>
            {t('Matching your profile', 'Compatível com o teu perfil')}
          </Badge>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div style={{
            width: '32px', height: '32px', margin: '0 auto 12px',
            border: '3px solid var(--border)', borderTop: '3px solid var(--accent)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          {t('Loading opportunities...', 'A carregar oportunidades...')}
        </div>
      ) : sortedOpps.length === 0 ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Zap size={40} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
            {t('No opportunities available right now.', 'Sem oportunidades disponíveis de momento.')}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedOpps.map(opp => {
            const isMatch = profile?.proCategory &&
              (opp.subcategory === profile.proCategory || opp.category === profile.proCategory);
            return (
              <Card key={opp._id} style={{
                padding: '18px',
                borderLeft: isMatch ? '3px solid var(--accent)' : undefined,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      {isMatch && (
                        <Badge variant="accent" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {t('Match', 'Match')}
                        </Badge>
                      )}
                      {opp.isFeatured && <Badge variant="warning">⭐</Badge>}
                      <Badge variant="accent">{getCategoryLabel(opp.category)}</Badge>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{opp.title}</h3>
                    <p style={{
                      fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', marginBottom: '8px',
                    }}>
                      {opp.description}
                    </p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Euro size={11} /> {opp.budget}
                      </span>
                      {opp.locationLabel && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={11} /> {opp.locationLabel}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {timeAgo(opp.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Link href={`/requests/${opp._id}`} style={{ textDecoration: 'none' }}>
                    <Button size="sm">{t('Respond', 'Responder')}</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
