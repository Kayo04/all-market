'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  FileText, MessageSquare, ChevronRight, Sparkles,
  CheckCircle, Clock, CircleDot, Inbox,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { categories } from '@/lib/categories';

interface RequestItem {
  _id: string;
  title: string;
  category: string;
  subcategory?: string;
  status: string;
  budget: number;
  locationLabel?: string;
  createdAt: string;
  proposalCount?: number;
  acceptedByProId?: { name?: string } | string;
}

export default function ClientDashboard() {
  const { data: session } = useSession();
  const locale = useLocale();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (en: string, pt: string) => locale === 'pt' ? pt : en;

  const fetchMyRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests?mine=1');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchMyRequests();
  }, [session, fetchMyRequests]);

  const getCategoryLabel = (key: string) => {
    const cat = categories.find(c => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return {
          label: t('Open', 'Aberto'),
          variant: 'success' as const,
          icon: CircleDot,
          color: '#22c55e',
        };
      case 'accepted':
        return {
          label: t('In Progress', 'Em Progresso'),
          variant: 'warning' as const,
          icon: Clock,
          color: '#f59e0b',
        };
      case 'closed':
        return {
          label: t('Completed', 'Concluído'),
          variant: 'default' as const,
          icon: CheckCircle,
          color: '#6b7280',
        };
      default:
        return {
          label: status,
          variant: 'default' as const,
          icon: CircleDot,
          color: '#6b7280',
        };
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return t('just now', 'agora');
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  // Stats
  const totalRequests = requests.length;
  const openCount = requests.filter(r => r.status === 'open').length;
  const activeCount = requests.filter(r => r.status === 'accepted').length;
  const completedCount = requests.filter(r => r.status === 'closed').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            {t('My Requests', 'Os Meus Pedidos')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {t('Track your service requests and proposals.', 'Acompanha os teus pedidos e propostas.')}
          </p>
        </div>
        <Link href="/concierge" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', border: 'none', borderRadius: '10px',
            background: 'var(--accent)', color: '#fff',
            fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>
            <Sparkles size={14} />
            {t('New Request', 'Novo Pedido')}
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      {totalRequests > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px', marginBottom: '24px',
        }}>
          {[
            { label: t('Total', 'Total'), value: totalRequests, color: '#3b82f6', icon: FileText },
            { label: t('Open', 'Abertos'), value: openCount, color: '#22c55e', icon: CircleDot },
            { label: t('In Progress', 'Em Progresso'), value: activeCount, color: '#f59e0b', icon: Clock },
            { label: t('Completed', 'Concluídos'), value: completedCount, color: '#6b7280', icon: CheckCircle },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} style={{ padding: '14px', textAlign: 'center' }} hover={false}>
                <Icon size={16} color={stat.color} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{stat.label}</div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div style={{
            width: '32px', height: '32px', margin: '0 auto 12px',
            border: '3px solid var(--border)', borderTop: '3px solid var(--accent)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          {t('Loading...', 'A carregar...')}
        </div>
      ) : requests.length === 0 ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Inbox size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            {t('No requests yet', 'Sem pedidos ainda')}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t(
              'Describe what you need and our AI will find the best professionals for you.',
              'Descreve o que precisas e a nossa IA vai encontrar os melhores profissionais para ti.'
            )}
          </p>
          <Link href="/concierge" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', border: 'none', borderRadius: '10px',
              background: 'var(--accent)', color: '#fff',
              fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>
              <Sparkles size={14} />
              {t('Find a Professional', 'Encontrar um Profissional')}
            </button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {requests.map(req => {
            const statusConfig = getStatusConfig(req.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Link
                key={req._id}
                href={`/requests/${req._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card style={{
                  padding: '18px',
                  borderLeft: req.status === 'accepted' ? '3px solid #f59e0b' :
                             req.status === 'open' ? '3px solid #22c55e' : undefined,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: '14px', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{req.title}</h3>
                        <Badge variant={statusConfig.variant}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <StatusIcon size={10} />
                            {statusConfig.label}
                          </span>
                        </Badge>
                      </div>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span>{getCategoryLabel(req.category)}</span>
                        {req.budget > 0 && <span>€{req.budget}</span>}
                        {req.locationLabel && <span>{req.locationLabel}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={10} /> {timeAgo(req.createdAt)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MessageSquare size={10} /> {req.proposalCount || 0} {t('proposals', 'propostas')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--text-tertiary)" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Become a Professional nudge */}
      <Card
        variant="glass"
        hover={false}
        style={{
          marginTop: '36px', padding: '22px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap',
          borderLeft: '3px solid var(--accent)',
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
            {t('Do you offer services?', 'Ofereces serviços?')}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {t(
              'Become a Professional and start receiving requests from clients.',
              'Torna-te Profissional e começa a receber pedidos de clientes.'
            )}
          </p>
        </div>
        <Link href="/pro" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <button style={{
            padding: '10px 20px', borderRadius: '10px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>
            {t('Become a Professional', 'Tornar-me Profissional')}
          </button>
        </Link>
      </Card>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
