'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useSession, signOut } from 'next-auth/react';
import { Sun, Moon, Menu, X, Globe, MessageSquare, Search } from 'lucide-react';
import NotificationBell from '@/components/layout/NotificationBell';
import PreferencesModal from '@/components/layout/PreferencesModal';
import { useCurrency } from '@/context/CurrencyContext';

export default function Navbar() {
  const t = useTranslations('nav');
  const th = useTranslations('hero');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [showPrefs, setShowPrefs] = useState(false);
  const { currency } = useCurrency();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = pathname === '/';
  const showSearch = !isHomePage || scrollY > 300;


  const switchLocale = () => {
    const next = locale === 'pt' ? 'en' : 'pt';
    router.replace(pathname, { locale: next });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/requests?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isLoggedIn = !!session?.user;

  return (
    <>
      <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav
        style={{
          maxWidth: 'var(--grid-max)',
          margin: '0 auto',
          padding: '0 var(--grid-px)',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '28px',
            color: '#404145',
            letterSpacing: '-0.02em',
            flexShrink: 0,
            marginRight: 'auto',
          }}
        >
          <span>needer</span>
        </Link>

        {/* Search Bar (desktop) — big white input + black flush button */}
        <form
          onSubmit={handleSearch}
          style={{
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            alignItems: 'stretch',
            borderRadius: '8px',
            border: '1px solid #d0d0d0',
            overflow: 'hidden',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: showSearch ? 1 : 0,
            pointerEvents: showSearch ? 'auto' : 'none',
            transform: showSearch ? 'translateY(0)' : 'translateY(10px)',
          }}
          className="desktop-search"
        >
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'pt' ? 'O que procuras?' : 'What do you need?'}
            style={{
              flex: 1,
              padding: '8px 14px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              background: '#ffffff',
              border: 'none',
              color: 'var(--text-primary)',
              outline: 'none',
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0 18px',
              background: '#111111',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Search size={16} />
          </button>
        </form>

        {/* Right Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="desktop-nav"
        >
          {/* Language/Currency Toggle */}
          <button
            onClick={() => setShowPrefs(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
            title="Language & Currency"
          >
            <Globe size={13} />
            {locale.toUpperCase()} · {currency}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
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
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Auth Area */}
          {isLoggedIn ? (
            <>
              <NotificationBell />
              <Link
                href="/messages"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'var(--text-tertiary)',
                  transition: 'color var(--transition-fast)',
                }}
                title={locale === 'pt' ? 'Mensagens' : 'Messages'}
              >
                <MessageSquare size={15} />
              </Link>
              <Link
                href="/dashboard"
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'white',
                  background: 'var(--accent)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'background var(--transition-fast)',
                  marginLeft: '4px',
                }}
              >
                {t('dashboard')}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              {/* Become a Professional */}
              <Link
                href="/auth/register?role=pro"
                style={{
                  padding: '6px 10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {locale === 'pt' ? 'Tornar-me Profissional' : 'Become a Professional'}
              </Link>

              <Link
                href="/auth/login"
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {t('login')}
              </Link>
              <Link
                href="/auth/register"
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#000000',
                  background: '#ffffff',
                  border: '1px solid #000000',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#000000';
                  (e.currentTarget as HTMLElement).style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#ffffff';
                  (e.currentTarget as HTMLElement).style.color = '#000000';
                }}
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            marginLeft: 'auto',
          }}
          className="mobile-menu-btn"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          style={{
            padding: '16px 24px 24px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="mobile-menu"
        >
          {/* Mobile Search */}
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={th('searchPlaceholder')}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
                background: 'var(--bg-input)',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                margin: '4px',
                padding: '8px 14px',
                background: 'var(--primary)',
                border: 'none',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <Search size={16} />
            </button>
          </form>

          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            style={{ textDecoration: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', padding: '8px 0' }}
          >
            {t('home')}
          </Link>
          <Link
            href="/requests"
            onClick={() => setIsMenuOpen(false)}
            style={{ textDecoration: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', padding: '8px 0' }}
          >
            {t('requests')}
          </Link>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={switchLocale}
              style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            >
              <Globe size={13} style={{ marginRight: '4px' }} />
              {locale.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>

          {isLoggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ padding: '8px 14px', background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}>
                {t('dashboard')}
              </Link>
              <button onClick={() => { signOut({ callbackUrl: '/' }); setIsMenuOpen(false); }} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                {t('logout')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/auth/register?role=pro" onClick={() => setIsMenuOpen(false)} style={{ padding: '8px 14px', background: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
                {locale === 'pt' ? 'Tornar-me Profissional' : 'Become a Professional'}
              </Link>
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} style={{ padding: '8px 14px', textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}>
                {t('login')}
              </Link>
              <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} style={{ padding: '8px 14px', background: '#ffffff', color: '#000000', border: '1px solid #000000', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, textAlign: 'center', transition: 'all 0.2s ease' }}>
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-search { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
      <div style={{ height: '56px', flexShrink: 0 }} />
      {showPrefs && <PreferencesModal onClose={() => setShowPrefs(false)} />}
    </>
  );
}
