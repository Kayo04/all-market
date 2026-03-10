'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

interface MessageItem {
  _id: string;
  senderId: { _id: string; name: string };
  receiverId: { _id: string; name: string };
  content: string;
  readAt: string | null;
  createdAt: string;
}

export default function ChatThreadPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const userId = (session?.user as { id: string })?.id;

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?requestId=${requestId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, requestId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find the other person in the conversation
  const otherUser = messages.length > 0
    ? messages[0].senderId._id === userId
      ? messages[0].receiverId
      : messages[0].senderId
    : null;

  const handleSend = async () => {
    if (!newMessage.trim() || !otherUser) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: otherUser._id,
          requestId,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageItem[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = new Date(msg.createdAt).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '100px 24px 60px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link
          href="/messages"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
        </Link>
        {otherUser && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
              {otherUser.name}
            </h1>
            <Link
              href={`/requests/${requestId}`}
              style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}
            >
              {locale === 'pt' ? 'Ver pedido →' : 'View request →'}
            </Link>
          </div>
        )}
      </div>

      {/* Messages */}
      <Card
        variant="glass"
        hover={false}
        style={{
          flex: 1,
          padding: '16px',
          marginBottom: '16px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 320px)',
          minHeight: '300px',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            {locale === 'pt' ? 'A carregar...' : 'Loading...'}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
            {locale === 'pt' ? 'Sem mensagens nesta conversa.' : 'No messages in this conversation.'}
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div
                style={{
                  textAlign: 'center',
                  margin: '16px 0',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    background: 'var(--bg-card)',
                    padding: '4px 12px',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {formatDate(group.messages[0].createdAt)}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((msg) => {
                const isMine = msg.senderId._id === userId;

                return (
                  <div
                    key={msg._id}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: isMine
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        background: isMine
                          ? 'var(--accent)'
                          : 'var(--bg-tertiary)',
                        color: isMine ? 'white' : 'var(--text-primary)',
                      }}
                    >
                      <p style={{ fontSize: '14px', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </p>
                      <div
                        style={{
                          fontSize: '10px',
                          marginTop: '4px',
                          textAlign: 'right',
                          opacity: 0.7,
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={locale === 'pt' ? 'Escreve uma mensagem...' : 'Type a message...'}
          rows={1}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            outline: 'none',
            resize: 'none',
            minHeight: '44px',
            maxHeight: '120px',
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          loading={sending}
          style={{ minWidth: '44px', height: '44px', padding: '0 14px' }}
          icon={<Send size={16} />}
        >
          {' '}
        </Button>
      </div>
    </div>
  );
}
