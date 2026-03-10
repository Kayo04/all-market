'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { MessageSquare, Clock, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Conversation {
  _id: { _id: string; title: string; category: string } | null;
  lastMessage: {
    content: string;
    senderId: { _id: string; name: string } | null;
    receiverId: { _id: string; name: string } | null;
    createdAt: string;
  };
  unreadCount: number;
}

export default function InboxPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    async function fetchConversations() {
      try {
        const res = await fetch('/api/messages?conversations=1');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [session, status, router]);

  const userId = (session?.user as { id: string })?.id;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return locale === 'pt' ? 'agora' : 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getOtherUser = (conv: Conversation) => {
    const last = conv.lastMessage;
    if (last.senderId?._id === userId) return last.receiverId;
    return last.senderId;
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '100px 24px 60px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        {locale === 'pt' ? 'Mensagens' : 'Messages'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {locale === 'pt'
          ? 'As tuas conversas com clientes e profissionais'
          : 'Your conversations with clients and professionals'}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          {locale === 'pt' ? 'A carregar...' : 'Loading...'}
        </div>
      ) : conversations.length === 0 ? (
        <Card variant="glass" hover={false} style={{ textAlign: 'center', padding: '60px 24px' }}>
          <MessageSquare size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'Sem mensagens ainda. As conversas aparecem aqui quando começares a comunicar.'
              : 'No messages yet. Conversations will appear here when you start communicating.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conversations.map((conv) => {
            const otherUser = getOtherUser(conv);
            const requestTitle = conv._id?.title || 'Request';
            const requestIdStr = conv._id?._id || '';

            return (
              <Link
                key={requestIdStr}
                href={`/messages/${requestIdStr}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card
                  style={{
                    padding: '16px 20px',
                    background: conv.unreadCount > 0 ? 'var(--accent-light)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        fontWeight: 700,
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {otherUser?.name?.charAt(0) || '?'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>
                          {otherUser?.name || 'User'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {timeAgo(conv.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500, marginBottom: '4px' }}>
                        {requestTitle}
                      </div>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {conv.lastMessage.content}
                      </p>
                    </div>

                    {/* Unread badge + arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {conv.unreadCount > 0 && (
                        <Badge variant="accent">{conv.unreadCount}</Badge>
                      )}
                      <ChevronRight size={16} color="var(--text-tertiary)" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
