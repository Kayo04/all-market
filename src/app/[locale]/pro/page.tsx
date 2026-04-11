'use client';

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Phone, MapPin, Briefcase, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { categories } from '@/lib/categories';
import { Link } from '@/i18n/navigation';

export default function BecomeProPage() {
  const { data: session, update } = useSession();
  const locale = useLocale();
  const router = useRouter();

  const user = session?.user as { id?: string; role?: string; name?: string; email?: string } | undefined;
  const isLoggedIn = !!user?.id;
  const isAlreadyPro = user?.role === 'pro';

  // Registration fields (not logged in)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Pro fields (both cases)
  const [proCategory, setProCategory] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const serviceCategories = categories.filter((c) => c.type === 'service');

  // ── Upgrade existing user ─────────────────────────────────────
  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proCategory) {
      setError(locale === 'pt' ? 'Escolhe a tua área profissional' : 'Please choose your professional area');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'pro',
          proCategory,
          bio,
          locationLabel: location,
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        await update({ role: 'pro' });
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/pro'), 1500);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to upgrade');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ── Register new pro account ──────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(locale === 'pt' ? 'As passwords não coincidem' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError(locale === 'pt' ? 'A password deve ter pelo menos 6 caracteres' : 'Password must be at least 6 characters');
      return;
    }
    if (!proCategory) {
      setError(locale === 'pt' ? 'Escolhe a tua área profissional' : 'Please choose your professional area');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, password, role: 'pro',
          locationLabel: location,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      // Update proCategory + bio + skills after registration
      const loginResult = await signIn('credentials', { email, password, redirect: false });
      if (!loginResult?.error) {
        // Update with pro details
        const meRes = await fetch('/api/auth/register', { method: 'GET' }).catch(() => null);
        void meRes; // we'll rely on the session for the id
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/pro'), 1500);
      } else {
        router.push('/auth/login');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ── Already a pro ─────────────────────────────────────────────
  if (isAlreadyPro) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
        <Card hover={false} style={{ maxWidth: '420px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <CheckCircle size={52} color="#003912" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
            {locale === 'pt' ? 'Já és um Profissional!' : "You're already a Professional!"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {locale === 'pt' ? 'Acede ao teu painel de profissional para gerir as tuas propostas.' : 'Head to your pro dashboard to manage your proposals.'}
          </p>
          <Link href="/dashboard/pro" style={{ textDecoration: 'none' }}>
            <Button fullWidth>{locale === 'pt' ? 'Ver painel profissional' : 'View Pro Dashboard'}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
        <Card hover={false} style={{ maxWidth: '420px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <CheckCircle size={52} color="#003912" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
            {locale === 'pt' ? 'Bem-vindo à equipa!' : 'Welcome to the team!'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {locale === 'pt' ? 'A redirecionar para o teu painel...' : 'Redirecting to your dashboard...'}
          </p>
        </Card>
      </div>
    );
  }

  const proFields = (
    <>
      {/* Professional Category */}
      <div>
        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          {locale === 'pt' ? 'Área profissional *' : 'Professional area *'}
        </label>
        <div style={{ position: 'relative' }}>
          <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <select
            value={proCategory}
            onChange={(e) => setProCategory(e.target.value)}
            required
            style={{
              width: '100%', padding: '10px 14px 10px 38px', fontSize: '14px',
              fontFamily: 'var(--font-sans)', backgroundColor: 'var(--bg-input)',
              color: proCategory ? 'var(--text-primary)' : 'var(--text-tertiary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              outline: 'none', cursor: 'pointer', appearance: 'none',
            }}
          >
            <option value="" disabled>{locale === 'pt' ? 'Escolhe a tua área' : 'Choose your area'}</option>
            {serviceCategories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {locale === 'pt' ? cat.labelPT : cat.labelEN}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label={locale === 'pt' ? 'Bio / Sobre ti' : 'Bio / About you'}
        type="text"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder={locale === 'pt' ? 'Ex: Eletricista com 10 anos de experiência...' : 'E.g. Electrician with 10 years experience...'}
        icon={<User size={16} />}
      />

      <Input
        label={locale === 'pt' ? 'Localização' : 'Location'}
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Lisboa, Portugal"
        icon={<MapPin size={16} />}
      />

      <Input
        label={locale === 'pt' ? 'Competências (separadas por vírgula)' : 'Skills (comma-separated)'}
        type="text"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        placeholder={locale === 'pt' ? 'Ex: PHP, WordPress, SEO' : 'E.g. PHP, WordPress, SEO'}
        icon={<Briefcase size={16} />}
      />
    </>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
      <Card variant="default" hover={false} style={{ width: '100%', maxWidth: '460px', padding: '36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(0,57,18,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Briefcase size={24} color="#003912" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {locale === 'pt' ? 'Torna-te Profissional' : 'Become a Professional'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isLoggedIn
              ? (locale === 'pt' ? 'Completa o teu perfil para começar a receber pedidos.' : 'Complete your profile to start receiving requests.')
              : (locale === 'pt' ? 'Cria a tua conta profissional e começa hoje.' : 'Create your professional account and start today.')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', marginBottom: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--error)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* ── Logged in: just pro fields ── */}
        {isLoggedIn ? (
          <form onSubmit={handleUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {proFields}
            <Button type="submit" fullWidth size="md" loading={loading} style={{ marginTop: '4px' }}>
              {locale === 'pt' ? 'Tornar-me Profissional' : 'Become a Professional'}
            </Button>
          </form>
        ) : (
          /* ── Not logged in: full registration + pro fields ── */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label={locale === 'pt' ? 'Nome completo' : 'Full name'} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="João Silva" icon={<User size={16} />} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" icon={<Mail size={16} />} required />
            <Input label={locale === 'pt' ? 'Telemóvel (opcional)' : 'Phone (optional)'} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 900 000 000" icon={<Phone size={16} />} />

            <div style={{ position: 'relative' }}>
              <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={locale === 'pt' ? 'Mín. 6 caracteres' : 'Min. 6 characters'} icon={<Lock size={16} />} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', bottom: '10px', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input label={locale === 'pt' ? 'Confirmar password' : 'Confirm password'} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={16} />} required />

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {locale === 'pt' ? 'Detalhes profissionais' : 'Professional details'}
              </p>
              {proFields}
            </div>

            <Button type="submit" fullWidth size="md" loading={loading} style={{ marginTop: '4px' }}>
              {locale === 'pt' ? 'Criar conta profissional' : 'Create professional account'}
            </Button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {locale === 'pt' ? 'Já tens conta?' : 'Already have an account?'}{' '}
              <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                {locale === 'pt' ? 'Entrar' : 'Sign in'}
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
