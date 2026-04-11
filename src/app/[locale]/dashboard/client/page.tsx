'use client';

import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { FileText, MessageSquare, Plus, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';

interface RequestItem {
  _id: string;
  title: string;
  category: string;
  status: string;
  budget: number;
  createdAt: string;
  proposalCount?: number;
}

export default function ClientDashboard() {
  const { data: session } = useSession();
  const t = useTranslations('dashboard.client');
  const locale = useLocale();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyRequests() {
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
    }
    if (session) fetchMyRequests();
  }, [session]);

  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
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
        <Link href="/requests/new" style={{ textDecoration: 'none' }}>
          <Button icon={<Plus size={16} />}>
            Post Request
          </Button>
        </Link>
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      ) : requests.length === 0 ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FileText size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {t('noRequests')}
          </p>
          <Link href="/requests/new" style={{ textDecoration: 'none' }}>
            <Button icon={<Plus size={16} />}>Post Your First Request</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((req) => (
            <Link
              key={req._id}
              href={`/requests/${req._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card style={{ padding: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{req.title}</h3>
                      <Badge variant={getStatusVariant(req.status) as 'success' | 'warning' | 'default'}>
                        {req.status}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>{getCategoryLabel(req.category)}</span>
                      <span>€{req.budget}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={12} />
                        {req.proposalCount || 0} {t('proposalsReceived')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} color="var(--text-tertiary)" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Become a Professional nudge */}
      <Card
        variant="glass"
        hover={false}
        style={{
          marginTop: '40px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          borderLeft: '4px solid #003912',
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            {locale === 'pt' ? 'Oferece os teus serviços?' : 'Do you offer services?'}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'Torna-te um Profissional e começa a receber pedidos de clientes.'
              : 'Become a Professional and start receiving requests from clients.'}
          </p>
        </div>
        <Link href="/pro" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Button style={{ background: '#003912', color: '#fff', border: 'none' }}>
            {locale === 'pt' ? 'Tornar-me Profissional' : 'Become a Professional'}
          </Button>
        </Link>
      </Card>
    </div>
  );
}
