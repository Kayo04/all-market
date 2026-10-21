'use client';

import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';

// Invitation to apply as a pro, shown only to clients on their own pages
// (profile, client dashboard). Being a pro is free but never instant: /pro
// explains the application, which an admin reviews.
export default function BecomeProCard({ style }: { style?: React.CSSProperties }) {
  const { data: session } = useSession();
  const locale = useLocale();
  const pt = locale === 'pt';

  if ((session?.user as { role?: string } | undefined)?.role !== 'client') return null;

  return (
    <Card
      variant="glass"
      hover={false}
      style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', ...style }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Briefcase size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
            {pt ? 'És profissional?' : 'Are you a professional?'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {pt
              ? 'Candidata-te a Pro, é gratuito. Depois de confirmarmos os teus dados, podes responder a pedidos.'
              : 'Apply to become a Pro, it’s free. Once we confirm your details, you can answer requests.'}
          </div>
        </div>
      </div>
      <Link
        href="/pro"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff',
          fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
        }}
      >
        {pt ? 'Tornar-me Pro' : 'Become a Pro'}
        <ArrowRight size={14} />
      </Link>
    </Card>
  );
}
