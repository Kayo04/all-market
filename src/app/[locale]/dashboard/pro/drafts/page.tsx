'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, FileText, Save, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Draft {
  _id: string;
  title: string;
  message: string;
  defaultPrice?: number;
  category?: string;
}

export default function DraftsPage() {
  const { data: session } = useSession();
  const t = useTranslations('drafts');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', message: '', defaultPrice: '' });

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts');
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
      }
    } catch (err) {
      console.error('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchDrafts();
  }, [session]);

  const handleSave = async () => {
    if (!form.title || !form.message) return;

    try {
      if (editingId) {
        await fetch('/api/drafts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            title: form.title,
            message: form.message,
            defaultPrice: form.defaultPrice ? parseFloat(form.defaultPrice) : undefined,
          }),
        });
      } else {
        await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            message: form.message,
            defaultPrice: form.defaultPrice ? parseFloat(form.defaultPrice) : undefined,
          }),
        });
      }

      setForm({ title: '', message: '', defaultPrice: '' });
      setShowForm(false);
      setEditingId(null);
      fetchDrafts();
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  const handleEdit = (draft: Draft) => {
    setForm({
      title: draft.title,
      message: draft.message,
      defaultPrice: draft.defaultPrice?.toString() || '',
    });
    setEditingId(draft._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/drafts?id=${id}`, { method: 'DELETE' });
      fetchDrafts();
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '100px 24px 60px' }}>
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
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            setForm({ title: '', message: '', defaultPrice: '' });
            setEditingId(null);
            setShowForm(true);
          }}
        >
          {t('newDraft')}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card variant="glass" hover={false} style={{ marginBottom: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label={t('draftTitle')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('draftTitlePlaceholder')}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {t('draftMessage')}
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
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
            <Input
              label={t('defaultPrice')}
              type="number"
              value={form.defaultPrice}
              onChange={(e) => setForm({ ...form, defaultPrice: e.target.value })}
              placeholder="350"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={handleSave} icon={<Save size={14} />}>
                {t('save')}
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }} icon={<X size={14} />}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Drafts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      ) : drafts.length === 0 && !showForm ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FileText size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{t('noDrafts')}</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {drafts.map((draft) => (
            <Card key={draft._id} style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{draft.title}</h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {draft.message}
                  </p>
                  {draft.defaultPrice && (
                    <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      €{draft.defaultPrice}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleEdit(draft)}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(draft._id)}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--error)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
