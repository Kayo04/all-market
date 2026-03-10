'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, MapPin, Calendar, Star, Tag } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface UserProfile {
  _id: string;
  name: string;
  role: string;
  isVerified: boolean;
  bio?: string;
  skills?: string[];
  avatar?: string;
  location?: { label?: string };
  ratings?: number[];
  createdAt: string;
}

export default function PublicProfilePage() {
  const locale = useLocale();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [id]);

  const avgRating = user?.ratings?.length
    ? (user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {locale === 'pt' ? 'A carregar...' : 'Loading...'}
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {locale === 'pt' ? 'Utilizador não encontrado' : 'User not found'}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 24px 60px' }}>
      <Card variant="glass" hover={false} style={{ padding: '40px', textAlign: 'center' }}>
        {/* Avatar */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            fontSize: '32px',
            fontWeight: 800,
            margin: '0 auto 16px',
            border: user.isVerified ? '3px solid var(--verified)' : '3px solid var(--border)',
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Name & Badges */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 800,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {user.name}
          {user.isVerified && <CheckCircle size={20} color="var(--verified)" />}
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <Badge variant="accent">
            {user.role === 'pro'
              ? locale === 'pt' ? 'Profissional' : 'Professional'
              : locale === 'pt' ? 'Cliente' : 'Client'}
          </Badge>
          {avgRating && (
            <Badge variant="warning">
              <Star size={12} style={{ marginRight: '4px' }} />
              {avgRating} ({user.ratings!.length})
            </Badge>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            {user.bio}
          </p>
        )}

        {/* Info grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            textAlign: 'left',
          }}
        >
          {user.location?.label && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <MapPin size={14} color="var(--accent)" />
              {user.location.label}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <Calendar size={14} color="var(--accent)" />
            {locale === 'pt' ? 'Membro desde' : 'Member since'} {new Date(user.createdAt).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div style={{ marginTop: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Tag size={14} />
              {locale === 'pt' ? 'Competências' : 'Skills'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {user.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
