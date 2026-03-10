'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Bell, Check, MessageSquare, FileText, Star, X } from 'lucide-react';

interface NotificationItem {
  _id: string;
  type: string;
  content: string;
  readStatus: boolean;
  relatedId?: string;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  new_proposal: FileText,
  proposal_accepted: Check,
  proposal_rejected: X,
  new_message: MessageSquare,
  request_closed: Star,
};

const typeColors: Record<string, string> = {
  new_proposal: '#3b82f6',
  proposal_accepted: '#22c55e',
  proposal_rejected: '#ef4444',
  new_message: '#8b5cf6',
  request_closed: '#f59e0b',
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const locale = useLocale();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silently fail — polling will retry
    }
  };

  // Poll every 30 seconds
  useEffect(() => {
    if (!session) return;

    fetchNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readStatus: true }))
      );
    } catch {
      // Silently fail
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return locale === 'pt' ? 'agora' : 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (!session) return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          background: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--text-tertiary)',
          transition: 'color var(--transition-fast)',
        }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--error)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-primary)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '360px',
            maxHeight: '440px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            zIndex: 1001,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '14px' }}>
              {locale === 'pt' ? 'Notificações' : 'Notifications'}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {locale === 'pt' ? 'Marcar tudo como lido' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 16px',
                  textAlign: 'center',
                  color: 'var(--text-tertiary)',
                  fontSize: '13px',
                }}
              >
                <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                {locale === 'pt' ? 'Sem notificações' : 'No notifications'}
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = typeIcons[notif.type] || Bell;
                const color = typeColors[notif.type] || 'var(--text-secondary)';
                const href = notif.relatedId
                  ? notif.type === 'new_message'
                    ? `/messages/${notif.relatedId}`
                    : `/requests/${notif.relatedId}`
                  : '#';

                return (
                  <Link
                    key={notif._id}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: 'inherit',
                      borderBottom: '1px solid var(--border)',
                      background: notif.readStatus
                        ? 'transparent'
                        : 'var(--accent-light)',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        background: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                          margin: 0,
                          fontWeight: notif.readStatus ? 400 : 600,
                        }}
                      >
                        {notif.content}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    {!notif.readStatus && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          alignSelf: 'center',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
