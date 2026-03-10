'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { User, MapPin, Tag, Save, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skills: '',
    locationLabel: '',
  });

  const userId = (session?.user as { id: string })?.id;
  const role = (session?.user as { role: string })?.role;
  const isVerified = (session?.user as { isVerified: boolean })?.isVerified;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    async function loadProfile() {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          setForm({
            name: u.name || '',
            bio: u.bio || '',
            skills: (u.skills || []).join(', '),
            locationLabel: u.location?.label || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [session, status, userId, router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          locationLabel: form.locationLabel,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '120px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {locale === 'pt' ? 'A carregar...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 24px 60px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        {locale === 'pt' ? 'O Meu Perfil' : 'My Profile'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {locale === 'pt' ? 'Gere as tuas informações pessoais' : 'Manage your personal information'}
      </p>

      {/* Role & Verification Status */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <Badge variant="accent">{role === 'pro' ? (locale === 'pt' ? 'Profissional' : 'Professional') : (locale === 'pt' ? 'Cliente' : 'Client')}</Badge>
        {isVerified && (
          <Badge variant="success">
            <CheckCircle size={12} style={{ marginRight: '4px' }} />
            {locale === 'pt' ? 'Verificado' : 'Verified'}
          </Badge>
        )}
      </div>

      <Card variant="glass" hover={false} style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Avatar placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                fontSize: '24px',
                fontWeight: 800,
              }}
            >
              {form.name.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{form.name || '—'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{(session?.user as { email?: string })?.email}</div>
            </div>
          </div>

          <Input
            label={locale === 'pt' ? 'Nome' : 'Name'}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={<User size={16} />}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {locale === 'pt' ? 'Bio' : 'Bio'}
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder={locale === 'pt' ? 'Conta-nos sobre ti...' : 'Tell us about yourself...'}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {role === 'pro' && (
            <Input
              label={locale === 'pt' ? 'Competências (separadas por vírgula)' : 'Skills (comma-separated)'}
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="Plumbing, Electrical, HVAC"
              icon={<Tag size={16} />}
            />
          )}

          <Input
            label={locale === 'pt' ? 'Localização' : 'Location'}
            value={form.locationLabel}
            onChange={(e) => setForm({ ...form, locationLabel: e.target.value })}
            placeholder="Lisboa, Portugal"
            icon={<MapPin size={16} />}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>
              {locale === 'pt' ? 'Guardar' : 'Save'}
            </Button>
            {saved && (
              <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} />
                {locale === 'pt' ? 'Guardado!' : 'Saved!'}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
