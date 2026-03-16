'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const tc = useTranslations('categories');

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '40px 24px 20px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '32px',
          paddingBottom: '32px',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {/* Categories */}
        <div style={{ minWidth: '160px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#404145' }}>
            {t('colCategories')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/requests?category=home-repairs" style={{ fontSize: '14px', color: '#62646a', textDecoration: 'none' }}>{tc('home-repairs')}</Link>
            <Link href="/requests?category=tech-digital" style={{ fontSize: '14px', color: '#62646a', textDecoration: 'none' }}>{tc('tech-digital')}</Link>
            <Link href="/requests?category=tutoring" style={{ fontSize: '14px', color: '#62646a', textDecoration: 'none' }}>{tc('tutoring')}</Link>
            <Link href="/requests?category=events" style={{ fontSize: '14px', color: '#62646a', textDecoration: 'none' }}>{tc('events')}</Link>
            <Link href="/requests?category=wellness" style={{ fontSize: '14px', color: '#62646a', textDecoration: 'none' }}>{tc('wellness')}</Link>
            <Link href="/requests?category=equipment" style={{ fontSize: '14px', color: '#62646a', textDecoration: 'none' }}>{tc('equipment')}</Link>
          </div>
        </div>

        {/* For Clients */}
        <div style={{ minWidth: '160px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#404145' }}>
            {t('colClients')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('clientLinks.howItWorks')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('clientLinks.success')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('clientLinks.quality')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('clientLinks.trust')}</span>
          </div>
        </div>

        {/* For Professionals */}
        <div style={{ minWidth: '160px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#404145' }}>
            {t('colPros')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/auth/register" style={{ fontSize: '14px', color: '#62646a', textDecoration: 'none' }}>{t('proLinks.becomePro')}</Link>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('proLinks.neederPro')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('proLinks.community')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('proLinks.resources')}</span>
          </div>
        </div>

        {/* Company */}
        <div style={{ minWidth: '160px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#404145' }}>
            {t('colCompany')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('companyLinks.about')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('companyLinks.news')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('companyLinks.careers')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('companyLinks.partners')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('companyLinks.investors')}</span>
          </div>
        </div>

        {/* Support */}
        <div style={{ minWidth: '160px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#404145' }}>
            {t('colSupport')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('supportLinks.help')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('supportLinks.contact')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('supportLinks.terms')}</span>
            <span style={{ fontSize: '14px', color: '#62646a', cursor: 'pointer' }}>{t('supportLinks.privacy')}</span>
          </div>
        </div>
      </div>

      {/* Copyright & Brand Row */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '24px',
              letterSpacing: '-0.02em',
              color: '#404145',
            }}
          >
            <span>needer</span>
          </div>
          <span style={{ fontSize: '14px', color: '#b5b6ba' }}>
            © {new Date().getFullYear()} Needer International Ltd.
          </span>
        </div>
        
        {/* Socials / Extra */}
        <div style={{ fontSize: '13px', color: '#b5b6ba' }}>
          {t('rights')}
        </div>
      </div>
    </footer>
  );
}
