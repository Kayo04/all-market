'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, Users, LineChart, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function NeederPro() {
  const t = useTranslations('proSection');

  return (
    <section style={{ background: '#f0f4f2', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '64px' }}>
        
        {/* Top Header */}
        <div style={{ maxWidth: '700px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#404145' }}>
              needer
            </span>
            <span style={{ fontSize: '24px', fontWeight: 400, fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>
              pro.
            </span>
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '48px', 
            fontWeight: 700, 
            lineHeight: 1.1, 
            letterSpacing: '-0.03em',
            color: '#404145',
            marginBottom: '40px'
          }}>
            {t('title').split('premium')[0]}
            <span style={{ color: '#1dbf73' }}>premium</span> 
            {t('title').split('premium')[1] || t('title').split('pt/premium')[1]} {/* Fallback just in case */}
          </h2>
        </div>

        {/* Content Split */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center' }}>
          
          {/* Features Grid */}
          <div style={{ 
            flex: '1 1 500px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '32px' 
          }}>
            {/* Feature 1 */}
            <div>
              <div style={{ marginBottom: '12px', color: '#1dbf73' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#404145', marginBottom: '8px' }}>
                {t('feat1.title')}
              </h3>
              <p style={{ fontSize: '15px', color: '#62646a', lineHeight: 1.5 }}>
                {t('feat1.desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <div style={{ marginBottom: '12px', color: '#1dbf73' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#404145', marginBottom: '8px' }}>
                {t('feat2.title')}
              </h3>
              <p style={{ fontSize: '15px', color: '#62646a', lineHeight: 1.5 }}>
                {t('feat2.desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <div style={{ marginBottom: '12px', color: '#1dbf73' }}>
                <LineChart size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#404145', marginBottom: '8px' }}>
                {t('feat3.title')}
              </h3>
              <p style={{ fontSize: '15px', color: '#62646a', lineHeight: 1.5 }}>
                {t('feat3.desc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div>
              <div style={{ marginBottom: '12px', color: '#1dbf73' }}>
                <CreditCard size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#404145', marginBottom: '8px' }}>
                {t('feat4.title')}
              </h3>
              <p style={{ fontSize: '15px', color: '#62646a', lineHeight: 1.5 }}>
                {t('feat4.desc')}
              </p>
            </div>

            <div style={{ marginTop: '16px', gridColumn: '1 / -1' }}>
              <Link
                href="/pro/apply"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#404145',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#000000';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#404145';
                }}
              >
                {t('apply')}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Abstract Visual Presentation */}
          <div style={{ 
            flex: '1 1 400px', 
            position: 'relative',
            minHeight: '400px',
            background: 'linear-gradient(135deg, #1dbf73 0%, #0a8e50 100%)',
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Mock Dashboard UI Overlay */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              right: '-20px',
              bottom: '-20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '-10px -10px 30px rgba(0,0,0,0.1)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Header Mock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e4e5e7', paddingBottom: '16px' }}>
                <div style={{ width: '120px', height: '16px', background: '#f0f4f2', borderRadius: '4px' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', background: '#f0f4f2', borderRadius: '50%' }}></div>
                  <div style={{ width: '24px', height: '24px', background: '#f0f4f2', borderRadius: '50%' }}></div>
                </div>
              </div>

              {/* Chart Mock */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, height: '120px', background: '#f9f9f9', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', bottom: 0 }}>
                    <path d="M0,40 L0,20 Q25,30 50,10 T100,5 L100,40 Z" fill="#e8f8f2" />
                    <path d="M0,20 Q25,30 50,10 T100,5" fill="none" stroke="#1dbf73" strokeWidth="2" />
                  </svg>
                </div>
                <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '36px', background: '#f9f9f9', borderRadius: '4px' }}></div>
                  <div style={{ height: '36px', background: '#e8f8f2', borderRadius: '4px', borderLeft: '3px solid #1dbf73' }}></div>
                  <div style={{ height: '36px', background: '#f9f9f9', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Progress Mock */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '40px',
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                zIndex: 10
              }}>
                <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1dbf73" strokeWidth="4" strokeDasharray="92, 100" />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                    92%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#404145' }}>Project Status</div>
                  <div style={{ fontSize: '12px', color: '#62646a' }}>4 steps out of 5</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
