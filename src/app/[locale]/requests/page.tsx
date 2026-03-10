'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Search, MapPin, Euro, Clock, Filter } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { categories } from '@/lib/categories';

interface RequestItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: number;
  locationLabel?: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  userId?: { name: string; avatar?: string };
}

export default function BrowseRequestsPage() {
  const t = useTranslations('request');
  const tc = useTranslations('categories');
  const locale = useLocale();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async (category?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'open', limit: '50' });
      if (category) params.set('category', category);

      const res = await fetch(`/api/requests?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(selectedCategory || undefined);
  }, [selectedCategory]);

  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'pt' ? cat.labelPT : cat.labelEN;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return locale === 'pt' ? 'agora' : 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const filtered = searchTerm
    ? requests.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : requests;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '12px',
          }}
        >
          {locale === 'pt' ? 'Pedidos Abertos' : 'Open Requests'}
        </h1>

        {/* Search & Filters */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={locale === 'pt' ? 'Pesquisar pedidos...' : 'Search requests...'}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Filter
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 14px 10px 34px',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                paddingRight: '32px',
              }}
            >
              <option value="">{locale === 'pt' ? 'Todas as categorias' : 'All categories'}</option>
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {locale === 'pt' ? cat.labelPT : cat.labelEN}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          {locale === 'pt' ? 'A carregar...' : 'Loading...'}
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Search size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {tc('title') === 'Explore Categories'
              ? 'No requests found. Be the first to post!'
              : 'Sem pedidos encontrados. Sê o primeiro a publicar!'}
          </p>
          <Link href="/requests/new" style={{ textDecoration: 'none' }}>
            <Button>{t('submit')}</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((req) => (
            <Link
              key={req._id}
              href={`/requests/${req._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card style={{ padding: '20px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {req.isFeatured && <Badge variant="warning">⭐</Badge>}
                  <Badge variant="accent">{getCategoryLabel(req.category)}</Badge>
                  <Badge variant="success">{t(`status${req.status.charAt(0).toUpperCase() + req.status.slice(1).replace('_', '')}` as 'statusOpen')}</Badge>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{req.title}</h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '12px',
                  }}
                >
                  {req.description}
                </p>
                <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Euro size={12} /> {req.budget}
                  </span>
                  {req.locationLabel && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {req.locationLabel}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {timeAgo(req.createdAt)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
