'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LEGAL } from '@/lib/legal';

const LAST_UPDATED = '2026-10-28';

interface Section {
  heading: string;
  body: string[];
  id?: string;
  links?: { href: string; label: string }[];
}

const { operatorName, nif, address, email, minAge, processors } = LEGAL;

const CONTENT: Record<'en' | 'pt', { title: string; intro: string; sections: Section[] }> = {
  en: {
    title: 'Privacy Policy',
    intro: `This policy explains what personal data Needer collects, why, for how long, and what rights you have over it. It applies to clients and professionals alike.`,
    sections: [
      {
        heading: '1. Who is responsible for your data',
        body: [
          `The data controller is ${operatorName}, tax number (NIF) ${nif}, address ${address}. For any privacy question, or to exercise your rights, write to ${email}.`,
        ],
      },
      {
        heading: '2. What we collect',
        body: [
          `Account: name, email, password (stored only in encrypted form, never readable), phone number (optional) and account type.`,
          `What you publish: requests (title, description, category, reference budget, district and town, photos), proposals, messages exchanged with other users, and reviews.`,
          `Professional profile: bio, skills, service category and, when you apply to become a Pro, the business details and documents you submit (for example business name, NIF and website).`,
          `Technical: IP address and browser data in hosting logs, IP address and email in temporary security counters (to block abuse such as repeated login attempts), and the session cookie that keeps you signed in.`,
        ],
      },
      {
        heading: '3. Why we use it, and on what legal basis',
        body: [
          `To provide the service (contract): create your account, publish requests and proposals, let a client and a professional talk, and send emails such as password recovery and notifications of new proposals and messages.`,
          `To keep the platform secure and prevent fraud and abuse (legitimate interest), including the security counters and the review of Pro applications.`,
          `To comply with legal obligations, for example answering authorities or handling reports of illegal content.`,
          `We do not sell your data, we do not use it for advertising, and we have no analytics or tracking tools on the site.`,
        ],
      },
      {
        heading: '4. Who can see your data',
        body: [
          `Requests are public: anyone browsing Needer sees their title, description, category, budget, district and photos. Your name is shown on your requests and proposals, and a professional's public profile (name, photo, bio, category, reviews) is visible to everyone.`,
          `Your email and phone are never shown publicly.`,
          `We use the following service providers, who process data only on our instructions (processors under the GDPR):`,
          ...processors.map((p) => `• ${p.name}: ${p.purposeEN}.`),
        ],
      },
      {
        heading: '5. Transfers outside the EU',
        body: [
          `Some of these providers are US companies and may process data outside the European Economic Area. In that case the transfer is covered by the EU-US Data Privacy Framework or by the European Commission's Standard Contractual Clauses.`,
        ],
      },
      {
        heading: '6. How long we keep it',
        body: [
          `Account: while your account is active. When you delete it, we immediately erase your name, email, phone, photo, bio and professional data; your open requests are closed and pending proposals are withdrawn. Messages and reviews you exchanged with others remain, shown as "Deleted User", because they are part of the other person's history. If you want them erased too, write to ${email}.`,
          `Pro application documents: for as long as the review lasts and, if you are approved, while you are a Pro.`,
          `Security counters: erased automatically at the end of their window (at most 1 hour). Password recovery links: valid for 1 hour and usable only once.`,
          `Hosting logs: for the short period defined by the hosting provider.`,
        ],
      },
      {
        heading: '7. Your rights',
        body: [
          `You have the right to access, correct, erase and export your data, to restrict or object to its processing, and to withdraw any consent you gave. You can edit your profile, download a copy of your data and delete your account in Settings; for anything else, write to ${email}. We answer within one month.`,
          `You also have the right to complain to the Portuguese data protection authority, the CNPD (Comissão Nacional de Proteção de Dados).`,
        ],
        links: [{ href: LEGAL.cnpdUrl, label: 'CNPD' }],
      },
      {
        heading: '8. Cookies',
        id: 'cookies',
        body: [
          `We use only one cookie: the strictly necessary session cookie that keeps you signed in. Because it is essential to the service you asked for, it does not require consent. The browser's local storage also keeps a few preferences (theme, currency and that you have seen the cookie notice). We do not use analytics, advertising or tracking cookies. If that ever changes, we will ask for your consent first.`,
        ],
      },
      {
        heading: '9. Minimum age',
        body: [
          `Needer is for people aged ${minAge} or over. If we learn that an account belongs to someone younger, we delete it.`,
        ],
      },
      {
        heading: '10. Changes to this policy',
        body: [
          `This policy was last updated on ${LAST_UPDATED}. Important changes will be announced on the site or by email.`,
        ],
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    intro: `Esta política explica que dados pessoais o Needer recolhe, para quê, durante quanto tempo, e que direitos tens sobre eles. Aplica-se a clientes e profissionais.`,
    sections: [
      {
        heading: '1. Quem é responsável pelos teus dados',
        body: [
          `O responsável pelo tratamento é ${operatorName}, NIF ${nif}, com morada em ${address}. Para qualquer questão de privacidade, ou para exerceres os teus direitos, escreve para ${email}.`,
        ],
      },
      {
        heading: '2. O que recolhemos',
        body: [
          `Conta: nome, email, palavra-passe (guardada apenas de forma encriptada, nunca legível), telefone (opcional) e tipo de conta.`,
          `O que publicas: pedidos (título, descrição, categoria, orçamento de referência, distrito e localidade, fotos), propostas, mensagens trocadas com outros utilizadores e avaliações.`,
          `Perfil profissional: biografia, competências, categoria de serviço e, quando te candidatas a Pro, os dados da tua atividade e os documentos que enviares (por exemplo nome comercial, NIF e website).`,
          `Dados técnicos: endereço IP e dados do navegador nos registos do alojamento, endereço IP e email em contadores de segurança temporários (para travar abusos, como tentativas repetidas de login), e o cookie de sessão que te mantém com sessão iniciada.`,
        ],
      },
      {
        heading: '3. Para que os usamos e com que fundamento',
        body: [
          `Para prestar o serviço (contrato): criar a tua conta, publicar pedidos e propostas, permitir que cliente e profissional conversem, e enviar emails como a recuperação da palavra-passe e os avisos de novas propostas e mensagens.`,
          `Para manter a plataforma segura e prevenir fraudes e abusos (interesse legítimo), incluindo os contadores de segurança e a análise das candidaturas a Pro.`,
          `Para cumprir obrigações legais, por exemplo responder a autoridades ou tratar denúncias de conteúdo ilegal.`,
          `Não vendemos os teus dados, não os usamos para publicidade e não temos ferramentas de análise ou rastreamento no site.`,
        ],
      },
      {
        heading: '4. Quem vê os teus dados',
        body: [
          `Os pedidos são públicos: qualquer pessoa que visite o Needer vê o título, a descrição, a categoria, o orçamento, o distrito e as fotos. O teu nome aparece nos teus pedidos e propostas, e o perfil público de um profissional (nome, foto, biografia, categoria, avaliações) é visível para todos.`,
          `O teu email e telefone nunca são mostrados publicamente.`,
          `Usamos os seguintes prestadores de serviços, que tratam dados apenas segundo as nossas instruções (subcontratantes, nos termos do RGPD):`,
          ...processors.map((p) => `• ${p.name}: ${p.purposePT}.`),
        ],
      },
      {
        heading: '5. Transferências para fora da UE',
        body: [
          `Alguns destes prestadores são empresas dos EUA e podem tratar dados fora do Espaço Económico Europeu. Nesse caso, a transferência está coberta pelo Quadro de Privacidade de Dados UE-EUA ou pelas Cláusulas Contratuais-Tipo da Comissão Europeia.`,
        ],
      },
      {
        heading: '6. Durante quanto tempo os guardamos',
        body: [
          `Conta: enquanto a tua conta estiver ativa. Quando a eliminas, apagamos de imediato o teu nome, email, telefone, foto, biografia e dados profissionais; os teus pedidos abertos são fechados e as propostas pendentes retiradas. As mensagens e avaliações que trocaste com outras pessoas ficam, associadas a uma conta anónima ("Deleted User"), porque fazem parte do histórico da outra pessoa. Se quiseres que também sejam apagadas, escreve para ${email}.`,
          `Documentos da candidatura a Pro: enquanto durar a análise e, se fores aprovado, enquanto fores Pro.`,
          `Contadores de segurança: apagados automaticamente no fim da sua janela (no máximo 1 hora). Links de recuperação da palavra-passe: válidos durante 1 hora e só podem ser usados uma vez.`,
          `Registos do alojamento: pelo curto período definido pelo prestador de alojamento.`,
        ],
      },
      {
        heading: '7. Os teus direitos',
        body: [
          `Tens direito a aceder, corrigir, apagar e exportar os teus dados, a limitar ou opor-te ao seu tratamento, e a retirar qualquer consentimento que tenhas dado. Podes editar o perfil, descarregar uma cópia dos teus dados e eliminar a conta nas Definições; para o resto, escreve para ${email}. Respondemos no prazo de um mês.`,
          `Tens também o direito de apresentar queixa à CNPD (Comissão Nacional de Proteção de Dados).`,
        ],
        links: [{ href: LEGAL.cnpdUrl, label: 'CNPD' }],
      },
      {
        heading: '8. Cookies',
        id: 'cookies',
        body: [
          `Usamos apenas um cookie: o cookie de sessão, estritamente necessário, que te mantém com sessão iniciada. Por ser essencial ao serviço que pediste, não precisa de consentimento. O armazenamento local do navegador guarda também algumas preferências (tema, moeda e que já viste o aviso de cookies). Não usamos cookies de análise, publicidade ou rastreamento. Se isso mudar, pedimos primeiro o teu consentimento.`,
        ],
      },
      {
        heading: '9. Idade mínima',
        body: [
          `O Needer destina-se a pessoas com ${minAge} anos ou mais. Se soubermos que uma conta pertence a alguém mais novo, eliminamo-la.`,
        ],
      },
      {
        heading: '10. Alterações a esta política',
        body: [
          `Esta política foi atualizada pela última vez em ${LAST_UPDATED}. As alterações importantes serão anunciadas no site ou por email.`,
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
  const rawLocale = useLocale();
  const locale: 'en' | 'pt' = rawLocale === 'pt' ? 'pt' : 'en';
  const content = CONTENT[locale];

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '100px 24px 80px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        {content.title}
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
        {locale === 'pt' ? 'Última atualização' : 'Last updated'}: {LAST_UPDATED}
      </p>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '36px' }}>
        {content.intro}
      </p>

      {content.sections.map((section) => (
        <div key={section.heading} id={section.id} style={{ marginBottom: '28px', scrollMarginTop: '90px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>
            {section.heading}
          </h2>
          {section.body.map((para, i) => (
            <p
              key={i}
              style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}
            >
              {para}
            </p>
          ))}
          {section.links && (
            <p style={{ fontSize: '14px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {section.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  {l.label}
                </a>
              ))}
            </p>
          )}
        </div>
      ))}

      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '40px' }}>
        {locale === 'pt' ? 'Ver também os nossos' : 'See also our'}{' '}
        <Link href="/terms" style={{ color: 'var(--accent)' }}>
          {locale === 'pt' ? 'Termos de Serviço' : 'Terms of Service'}
        </Link>
        .
      </p>
    </div>
  );
}
