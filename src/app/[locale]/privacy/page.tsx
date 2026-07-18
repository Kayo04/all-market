'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

const LAST_UPDATED = '2026-07-18';

interface Section {
  heading: string;
  body: string[];
  id?: string;
}

const CONTENT: Record<'en' | 'pt', { title: string; intro: string; sections: Section[] }> = {
  en: {
    title: 'Privacy Policy',
    intro:
      'This policy explains what personal data Needer International Ltd. ("Needer", "we", "us") collects when you use needer.com, why we collect it, and the rights you have over it. It applies to clients and professionals alike.',
    sections: [
      {
        heading: '1. Who is responsible for your data',
        body: [
          'Needer International Ltd. is the data controller for the personal data processed through this website. For any privacy question or to exercise your rights, contact us at privacy@needer.com.',
        ],
      },
      {
        heading: '2. What we collect',
        body: [
          'Account data: name, email address, hashed password, phone number (optional), and account role (client or professional).',
          'Content you provide: request titles and descriptions, category, fixed price/budget, location label, and any photos you upload when posting a request.',
          'Professional data: bio, skills, categories of service, and — if you apply for verification — business name, tax ID, and website.',
          'Interaction data: proposals you send or receive, messages exchanged with other users through the platform, and reviews/ratings.',
          'Technical data: standard web server logs (IP address, browser type, timestamps) generated automatically by hosting infrastructure, and a session cookie that keeps you signed in (see our Cookie Policy below).',
        ],
      },
      {
        heading: '3. Why we process your data',
        body: [
          'To provide the core service: matching your request with professionals, letting professionals submit proposals, and enabling messaging between a client and the professional they choose to work with. This is necessary to perform the contract between you and Needer.',
          'To maintain account security and prevent fraud or abuse (legitimate interest).',
          'To communicate service-related notifications (new proposals, messages, status changes).',
          'Where you have given it, to process optional fields such as your phone number or verification documents (consent — you may withdraw this at any time by removing the field from your profile).',
        ],
      },
      {
        heading: '4. Who sees your data',
        body: [
          'Your name and avatar are visible to other users you interact with (e.g. a professional sees the name of a client whose request they respond to, and vice versa).',
          'Request details you post are visible to all users browsing open requests, since the platform is a reverse marketplace built around public requests.',
          'We do not sell your personal data to third parties, and we do not run advertising or analytics trackers on this site today.',
          'We use MongoDB Atlas to host our database. This is a data processor acting on our instructions, not an independent party with its own use of your data.',
        ],
      },
      {
        heading: '5. International transfers',
        body: [
          'Our hosting and database infrastructure may process data outside the country you are located in, including outside the European Economic Area. Where that happens, we rely on the safeguards required by applicable law (such as Standard Contractual Clauses) offered by our infrastructure providers.',
        ],
      },
      {
        heading: '6. How long we keep your data',
        body: [
          'We keep account data for as long as your account is active. If you delete your account, we remove or anonymize personal data within a reasonable period, except where we are required to retain it for legal, security, or dispute-resolution purposes.',
        ],
      },
      {
        heading: '7. Your rights',
        body: [
          'Under the GDPR, you have the right to access, correct, delete, restrict, or export your personal data, and to object to certain processing. To exercise any of these rights, contact privacy@needer.com. You also have the right to lodge a complaint with your local data protection supervisory authority.',
        ],
      },
      {
        heading: '8. Cookies',
        id: 'cookies',
        body: [
          'We currently use only one cookie category: a strictly necessary session cookie that keeps you signed in. It does not require consent under the ePrivacy rules because it is essential to the service you asked for. We do not currently use analytics, advertising, or tracking cookies. If that changes, we will update this policy and ask for your consent before any non-essential cookie is set.',
        ],
      },
      {
        heading: '9. Children',
        body: [
          'Needer is not directed at, and should not be used by, anyone under 16 years old.',
        ],
      },
      {
        heading: '10. Changes to this policy',
        body: [
          `This policy was last updated on ${LAST_UPDATED}. We will post any future changes on this page.`,
        ],
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    intro:
      'Esta política explica que dados pessoais a Needer International Ltd. ("Needer", "nós") recolhe quando usas o needer.com, porque os recolhemos, e os direitos que tens sobre eles. Aplica-se a clientes e profissionais.',
    sections: [
      {
        heading: '1. Quem é responsável pelos teus dados',
        body: [
          'A Needer International Ltd. é a responsável pelo tratamento dos dados pessoais processados através deste site. Para qualquer questão de privacidade ou para exercer os teus direitos, contacta-nos em privacy@needer.com.',
        ],
      },
      {
        heading: '2. O que recolhemos',
        body: [
          'Dados de conta: nome, email, password encriptada, número de telefone (opcional) e tipo de conta (cliente ou profissional).',
          'Conteúdo que fornece: títulos e descrições de pedidos, categoria, preço fixo/orçamento, localização e quaisquer fotos que carregues ao publicar um pedido.',
          'Dados de profissional: biografia, competências, categorias de serviço e — caso peças verificação — nome da empresa, NIF e website.',
          'Dados de interação: propostas que envias ou recebes, mensagens trocadas com outros utilizadores na plataforma, e avaliações.',
          'Dados técnicos: registos padrão de servidor web (endereço IP, tipo de navegador, data/hora) gerados automaticamente pela infraestrutura de alojamento, e um cookie de sessão que te mantém a sessão iniciada (ver a Política de Cookies abaixo).',
        ],
      },
      {
        heading: '3. Porque tratamos os teus dados',
        body: [
          'Para fornecer o serviço principal: associar o teu pedido a profissionais, permitir que os profissionais enviem propostas, e permitir mensagens entre um cliente e o profissional escolhido. Isto é necessário para executar o contrato entre ti e a Needer.',
          'Para manter a segurança da conta e prevenir fraude ou abuso (interesse legítimo).',
          'Para comunicar notificações relacionadas com o serviço (novas propostas, mensagens, alterações de estado).',
          'Onde nos tenhas dado consentimento, para processar campos opcionais como o teu número de telefone ou documentos de verificação (podes retirar este consentimento a qualquer momento removendo o campo do teu perfil).',
        ],
      },
      {
        heading: '4. Quem vê os teus dados',
        body: [
          'O teu nome e avatar são visíveis a outros utilizadores com quem interages (por exemplo, um profissional vê o nome do cliente cujo pedido respondeu, e vice-versa).',
          'Os detalhes dos pedidos que publicas são visíveis a todos os utilizadores que navegam nos pedidos abertos, já que a plataforma é um mercado inverso construído à volta de pedidos públicos.',
          'Não vendemos os teus dados pessoais a terceiros, e não usamos publicidade ou rastreadores de análise neste site atualmente.',
          'Usamos o MongoDB Atlas para alojar a nossa base de dados. Este é um subcontratante que atua segundo as nossas instruções, não uma entidade independente com uso próprio dos teus dados.',
        ],
      },
      {
        heading: '5. Transferências internacionais',
        body: [
          'A nossa infraestrutura de alojamento e base de dados pode processar dados fora do país onde te encontras, incluindo fora do Espaço Económico Europeu. Nesses casos, recorremos às salvaguardas exigidas pela lei aplicável (como Cláusulas Contratuais-Tipo) oferecidas pelos nossos fornecedores de infraestrutura.',
        ],
      },
      {
        heading: '6. Durante quanto tempo guardamos os teus dados',
        body: [
          'Guardamos os dados da conta enquanto a tua conta estiver ativa. Se apagares a tua conta, removemos ou anonimizamos os dados pessoais num prazo razoável, exceto quando somos obrigados a retê-los por motivos legais, de segurança ou de resolução de litígios.',
        ],
      },
      {
        heading: '7. Os teus direitos',
        body: [
          'Ao abrigo do RGPD, tens o direito de aceder, corrigir, apagar, restringir ou exportar os teus dados pessoais, e de te opores a determinado tratamento. Para exercer qualquer um destes direitos, contacta privacy@needer.com. Tens também o direito de apresentar reclamação junto da tua autoridade de controlo local.',
        ],
      },
      {
        heading: '8. Cookies',
        id: 'cookies',
        body: [
          'Atualmente usamos apenas uma categoria de cookie: um cookie de sessão estritamente necessário que te mantém a sessão iniciada. Não requer consentimento ao abrigo das regras de ePrivacy porque é essencial ao serviço que pediste. Não usamos atualmente cookies de análise, publicidade ou rastreio. Se isso mudar, atualizaremos esta política e pediremos o teu consentimento antes de qualquer cookie não essencial ser definido.',
        ],
      },
      {
        heading: '9. Menores',
        body: [
          'A Needer não se dirige a, nem deve ser usada por, ninguém com menos de 16 anos.',
        ],
      },
      {
        heading: '10. Alterações a esta política',
        body: [
          `Esta política foi atualizada pela última vez em ${LAST_UPDATED}. Publicaremos aqui quaisquer alterações futuras.`,
        ],
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
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
