'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FAQ = {
  questionEN: string;
  questionPT: string;
  answerEN: string;
  answerPT: string;
};

const faqs: FAQ[] = [
  {
    questionEN: 'How does Needer work?',
    questionPT: 'Como funciona o Needer?',
    answerEN:
      'Simply post what you need — a service or product — and qualified professionals send you proposals. You compare, choose, and connect. No searching, no cold calls.',
    answerPT:
      'Basta publicar o que precisas — um serviço ou produto — e profissionais qualificados enviam-te propostas. Tu comparas, escolhes e conectas. Sem pesquisas, sem chamadas a frio.',
  },
  {
    questionEN: 'Is it free to post a request?',
    questionPT: 'É gratuito publicar um pedido?',
    answerEN:
      'Yes! Posting a need is completely free for clients. You only pay the professional for the work — Needer charges no fees to the client side.',
    answerPT:
      'Sim! Publicar um pedido é totalmente gratuito para os clientes. Só pagas ao profissional pelo trabalho — o Needer não cobra taxas ao cliente.',
  },
  {
    questionEN: 'Who are the professionals on Needer?',
    questionPT: 'Quem são os profissionais no Needer?',
    answerEN:
      'Our professionals are verified experts in their fields — from plumbers and electricians to web developers, designers, tutors, and more. Each professional has a rating and review history.',
    answerPT:
      'Os nossos profissionais são especialistas verificados nas suas áreas — desde canalizadores e eletricistas a programadores web, designers, explicadores e muito mais. Cada profissional tem um histórico de avaliações.',
  },
  {
    questionEN: 'How do I become a professional on Needer?',
    questionPT: 'Como me torno um profissional no Needer?',
    answerEN:
      'Register an account, select the "Professional" role, complete your profile, and submit your verification. Once approved, you can start browsing and responding to requests.',
    answerPT:
      'Cria uma conta, seleciona o papel de "Profissional", completa o teu perfil e submete a tua verificação. Após aprovação, podes começar a navegar e responder a pedidos.',
  },
  {
    questionEN: 'Can I request both services and products?',
    questionPT: 'Posso pedir tanto serviços como produtos?',
    answerEN:
      'Absolutely. Needer supports both — whether you need an electrician to fix your home or want to buy a laptop at the best price, the platform works the same way.',
    answerPT:
      'Com certeza. O Needer suporta ambos — seja para contratar um eletricista ou comprar um portátil ao melhor preço, a plataforma funciona da mesma forma.',
  },
  {
    questionEN: 'Is my personal information safe?',
    questionPT: 'As minhas informações pessoais estão seguras?',
    answerEN:
      'Yes. We take privacy seriously. Your personal details are never shared publicly. Professionals only see what you choose to include in your request.',
    answerPT:
      'Sim. Levamos a privacidade a sério. Os teus dados pessoais nunca são partilhados publicamente. Os profissionais só veem o que escolhes incluir no teu pedido.',
  },
];

export default function FAQ() {
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
      <div
        className="grid-container"
        style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            {locale === 'pt' ? 'Perguntas Frequentes' : 'Frequently Asked Questions'}
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            {locale === 'pt'
              ? 'Tens dúvidas? Encontra as respostas aqui.'
              : 'Got questions? Find your answers here.'}
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                  borderColor: isOpen ? '#003912' : 'var(--border)',
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    background: isOpen ? 'rgba(0,57,18,0.04)' : 'var(--bg-card)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '16px',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      lineHeight: 1.4,
                    }}
                  >
                    {locale === 'pt' ? faq.questionPT : faq.questionEN}
                  </span>
                  <ChevronDown
                    size={20}
                    color={isOpen ? '#003912' : 'var(--text-tertiary)'}
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>

                {/* Answer */}
                <div
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <p
                    style={{
                      padding: '0 24px 20px',
                      fontSize: '15px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {locale === 'pt' ? faq.answerPT : faq.answerEN}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
