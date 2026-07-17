'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import {
  Briefcase, MapPin, FileText, Sparkles, ChevronRight, Check,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { categories } from '@/lib/categories';

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  electricians: ['Wiring', 'Lighting', 'Emergency Repairs', 'Panel Upgrades', 'Smart Home'],
  plumbers: ['Leak Repair', 'Pipe Installation', 'Bathroom Renovation', 'Water Heater', 'Drain Cleaning'],
  painters: ['Interior Painting', 'Exterior Painting', 'Wallpaper', 'Restoration', 'Color Consulting'],
  websites: ['WordPress', 'React', 'E-commerce', 'SEO', 'UI/UX Design'],
  'social-media': ['Content Creation', 'Ads Management', 'Strategy', 'Analytics', 'Community Management'],
  'computer-repair': ['Hardware', 'Software', 'Data Recovery', 'Networking', 'Virus Removal'],
  math: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Exam Prep'],
  english: ['Conversation', 'Business English', 'IELTS/TOEFL', 'Grammar', 'Writing'],
  photographers: ['Weddings', 'Events', 'Portrait', 'Product Photography', 'Drone'],
  'personal-trainers': ['Weight Loss', 'Muscle Building', 'Yoga', 'CrossFit', 'Rehabilitation'],
  accounting: ['Tax Filing', 'Bookkeeping', 'Payroll', 'Audit', 'Financial Planning'],
  logo: ['Brand Identity', 'Typography', 'Illustration', 'Print Design', 'Packaging'],
  mechanic: ['Engine Repair', 'Oil Change', 'Brakes', 'Diagnostics', 'Bodywork'],
  hairdresser: ['Cuts', 'Coloring', 'Styling', 'Treatments', 'Extensions'],
  'house-cleaning': ['Deep Cleaning', 'Regular Service', 'Move-in/out', 'Window Cleaning', 'Ironing'],
};

const DEFAULT_SKILLS = ['Problem Solving', 'Communication', 'Attention to Detail', 'Customer Service', 'Time Management'];

export default function ProOnboardingPage() {
  const { data: session } = useSession();
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const serviceCategories = categories.filter(c => c.type === 'service');
  const activeCategory = serviceCategories.find(c => c.key === selectedCategory);
  const suggestedSkills = SKILL_SUGGESTIONS[selectedSubcategory] || DEFAULT_SKILLS;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleFinish = async () => {
    if (!session?.user) return;
    const userId = (session.user as { id: string }).id;

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${userId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proCategory: selectedSubcategory || selectedCategory,
          skills: selectedSkills,
          bio,
          locationLabel,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/pro');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (locale === 'pt' ? 'Não foi possível guardar o teu perfil. Tenta novamente.' : 'Could not save your profile. Please try again.'));
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(locale === 'pt' ? 'Não foi possível guardar o teu perfil. Tenta novamente.' : 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const t = (en: string, pt: string) => locale === 'pt' ? pt : en;

  const canProceed = () => {
    if (step === 1) return selectedSubcategory !== '';
    if (step === 2) return selectedSkills.length >= 1;
    if (step === 3) return bio.trim().length >= 10 && locationLabel.trim() !== '';
    return false;
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
        {[1, 2, 3].map(s => (
          <div
            key={s}
            style={{
              flex: 1, height: '4px', borderRadius: '4px',
              background: s <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Step 1: Choose Category */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Briefcase size={20} color="var(--accent)" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, margin: 0 }}>
                {t('What do you do?', 'O que fazes?')}
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t('Choose the category that best describes your work.', 'Escolhe a categoria que melhor descreve o teu trabalho.')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {serviceCategories.map(cat => {
              const isOpen = selectedCategory === cat.key;
              return (
                <div key={cat.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(isOpen ? '' : cat.key);
                      if (!isOpen) setSelectedSubcategory('');
                    }}
                    style={{
                      width: '100%', padding: '14px 16px',
                      background: isOpen ? 'rgba(29,191,115,0.06)' : 'var(--bg-card)',
                      border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: isOpen ? '12px 12px 0 0' : '12px',
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {locale === 'pt' ? cat.labelPT : cat.labelEN}
                    </span>
                    <ChevronRight
                      size={16}
                      color="var(--text-tertiary)"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}
                    />
                  </button>

                  {isOpen && (
                    <div style={{
                      border: '1px solid var(--accent)', borderTop: 'none',
                      borderRadius: '0 0 12px 12px', padding: '8px',
                      background: 'var(--bg-card)',
                    }}>
                      {cat.subcategories.map(sub => {
                        const isSelected = selectedSubcategory === sub.key;
                        return (
                          <button
                            key={sub.key}
                            type="button"
                            onClick={() => setSelectedSubcategory(sub.key)}
                            style={{
                              width: '100%', padding: '10px 14px',
                              background: isSelected ? 'rgba(29,191,115,0.1)' : 'transparent',
                              border: 'none', borderRadius: '8px',
                              cursor: 'pointer', textAlign: 'left',
                              fontFamily: 'var(--font-sans)',
                              display: 'flex', alignItems: 'center', gap: '8px',
                              transition: 'background 0.1s ease',
                            }}
                          >
                            {isSelected && <Check size={14} color="var(--accent)" />}
                            <span style={{
                              fontSize: '13px', fontWeight: isSelected ? 700 : 400,
                              color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                            }}>
                              {locale === 'pt' ? sub.labelPT : sub.labelEN}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Skills */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Sparkles size={20} color="var(--accent)" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, margin: 0 }}>
                {t('Your skills', 'As tuas competências')}
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t(
                `Select the skills that apply to you as ${locale === 'pt' ? '' : 'a '}${activeCategory ? (locale === 'pt' ? activeCategory.labelPT : activeCategory.labelEN) : ''}.`,
                `Seleciona as competências que se aplicam a ti como ${activeCategory?.labelPT || ''}.`
              )}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {suggestedSkills.map(skill => {
              const isActive = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '8px 16px', borderRadius: '99px',
                    border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    background: isActive ? 'rgba(29,191,115,0.1)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isActive && '✓ '}{skill}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {t(
              `${selectedSkills.length} selected — pick at least 1`,
              `${selectedSkills.length} selecionadas — escolhe pelo menos 1`
            )}
          </p>
        </div>
      )}

      {/* Step 3: Bio & Location */}
      {step === 3 && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileText size={20} color="var(--accent)" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, margin: 0 }}>
                {t('About you', 'Sobre ti')}
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t(
                'Write a short bio and tell clients where you operate.',
                'Escreve uma breve descrição e diz aos clientes onde trabalhas.'
              )}
            </p>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              {t('Professional bio', 'Descrição profissional')}
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={t(
                'Tell clients about your experience, specialties, and what makes you different...',
                'Conta aos clientes sobre a tua experiência, especialidades e o que te diferencia...'
              )}
              rows={4}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px', resize: 'vertical',
                fontSize: '14px', color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.6, boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {t(`${bio.length} characters — minimum 10`, `${bio.length} caracteres — mínimo 10`)}
            </p>
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {t('Where do you work?', 'Onde trabalhas?')}
            </label>
            <input
              type="text"
              value={locationLabel}
              onChange={e => setLocationLabel(e.target.value)}
              placeholder={t('e.g. Porto, Lisbon, Braga...', 'ex. Porto, Lisboa, Braga...')}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '14px', color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '10px 14px', marginTop: '20px', borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#dc2626', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            style={{
              padding: '12px 24px', borderRadius: '10px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            {t('Back', 'Voltar')}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else handleFinish();
          }}
          disabled={!canProceed() || saving}
          style={{
            flex: 1, padding: '12px 24px', borderRadius: '10px',
            border: 'none',
            background: canProceed() ? 'var(--accent)' : 'var(--border)',
            color: canProceed() ? '#fff' : 'var(--text-tertiary)',
            fontSize: '14px', fontWeight: 700,
            cursor: canProceed() && !saving ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-sans)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          {step === 3
            ? (saving ? t('Saving...', 'A guardar...') : t('Finish setup', 'Concluir configuração'))
            : t('Continue', 'Continuar')
          }
          {step < 3 && <ChevronRight size={16} />}
        </button>
      </div>

      {/* Summary preview on step 3 */}
      {step === 3 && selectedSkills.length > 0 && (
        <Card style={{ marginTop: '24px', padding: '16px' }} hover={false}>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('Profile preview', 'Pré-visualização do perfil')}
          </p>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            {activeCategory ? (locale === 'pt' ? activeCategory.labelPT : activeCategory.labelEN) : ''} — {selectedSubcategory.replace(/-/g, ' ')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            {selectedSkills.map(s => (
              <span key={s} style={{
                padding: '2px 8px', borderRadius: '6px',
                background: 'rgba(29,191,115,0.1)', color: 'var(--accent)',
                fontSize: '11px', fontWeight: 600,
              }}>
                {s}
              </span>
            ))}
          </div>
          {locationLabel && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={11} /> {locationLabel}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
