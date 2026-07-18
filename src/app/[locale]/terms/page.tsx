'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

const LAST_UPDATED = '2026-07-18';

interface Section {
  heading: string;
  body: string[];
}

const CONTENT: Record<'en' | 'pt', { title: string; intro: string; sections: Section[] }> = {
  en: {
    title: 'Terms of Service',
    intro:
      'These terms govern your use of needer.com, operated by Needer International Ltd. ("Needer", "we"). By creating an account or using the platform, you agree to them. If you do not agree, please do not use the service.',
    sections: [
      {
        heading: '1. What Needer is',
        body: [
          'Needer is a reverse marketplace: clients describe a need (a service or a product they want to buy), and independent professionals or sellers respond with proposals. Needer is a technology platform that connects the two sides — we are not a party to the agreement a client and a professional ultimately make with each other, and we do not employ, supervise, or guarantee the work of any professional on the platform.',
        ],
      },
      {
        heading: '2. Eligibility and accounts',
        body: [
          'You must be at least 16 years old to create an account. You are responsible for keeping your password confidential and for all activity under your account. Provide accurate information when you register — impersonation or fake listings are prohibited.',
        ],
      },
      {
        heading: '3. Posting a request',
        body: [
          'When you post a request with a fixed price, you are committing to pay that price to the first verified professional who accepts it, as described on the posting form. Needer does not process payment on your behalf today — payment happens directly between you and the professional, outside the platform, unless and until we introduce in-platform payments under separate terms.',
          'You must have a genuine intent to hire when you post a request. Posting fake or bad-faith requests to waste professionals\' time is prohibited and may result in account suspension.',
        ],
      },
      {
        heading: '4. Submitting a proposal (professionals)',
        body: [
          'If you submit a proposal as a professional, you are representing that you can and intend to perform the work at the price you quote. Claims of verification, certification, or business identity you submit to us must be accurate — we may suspend accounts found to have misrepresented these.',
        ],
      },
      {
        heading: '5. Prohibited conduct',
        body: [
          'You may not: use the platform for anything unlawful; harass, threaten, or defraud other users; scrape or bulk-collect data from the platform; attempt to bypass the platform to avoid its terms or safety features in bad faith; or upload content you do not have the rights to (including images).',
        ],
      },
      {
        heading: '6. Content you submit',
        body: [
          'You keep ownership of the text and photos you submit (request descriptions, proposal messages, review comments, uploaded images). By submitting them, you grant Needer a license to display them on the platform to the extent needed to operate the service.',
        ],
      },
      {
        heading: '7. Fees',
        body: [
          'Posting a request and receiving proposals is free for clients today. Certain premium features referenced on the platform (such as sponsored placement or early access to new requests) are not yet purchasable; if and when they become available, they will be governed by additional terms presented at the time of purchase.',
        ],
      },
      {
        heading: '8. Disclaimers and limitation of liability',
        body: [
          'Needer provides the platform "as is." We do not guarantee the quality, safety, legality, or outcome of any service or product exchanged between users, and we are not liable for disputes, damages, or losses arising from interactions between a client and a professional. Use judgment before hiring anyone or making a payment, the same way you would with any marketplace.',
          'To the maximum extent permitted by law, Needer\'s liability for any claim relating to the platform is limited to the amount (if any) you paid to Needer directly in the twelve months before the claim arose.',
        ],
      },
      {
        heading: '9. Suspension and termination',
        body: [
          'We may suspend or terminate an account that violates these terms. You may stop using the service and request account deletion at any time by contacting support@needer.com.',
        ],
      },
      {
        heading: '10. Governing law',
        body: [
          'These terms are governed by the laws of Portugal, without prejudice to any mandatory consumer-protection rights you have under the law of the EU member state where you reside.',
        ],
      },
      {
        heading: '11. Changes to these terms',
        body: [
          `These terms were last updated on ${LAST_UPDATED}. Continued use of the platform after a change means you accept the updated terms.`,
        ],
      },
    ],
  },
  pt: {
    title: 'Termos de Serviço',
    intro:
      'Estes termos regem a tua utilização do needer.com, operado pela Needer International Ltd. ("Needer", "nós"). Ao criar uma conta ou usar a plataforma, aceitas estes termos. Se não concordares, não uses o serviço.',
    sections: [
      {
        heading: '1. O que é a Needer',
        body: [
          'A Needer é um mercado inverso: clientes descrevem uma necessidade (um serviço ou produto que querem comprar), e profissionais ou vendedores independentes respondem com propostas. A Needer é uma plataforma tecnológica que liga as duas partes — não somos parte no acordo que um cliente e um profissional acabam por fazer entre si, e não empregamos, supervisionamos ou garantimos o trabalho de nenhum profissional na plataforma.',
        ],
      },
      {
        heading: '2. Elegibilidade e contas',
        body: [
          'Tens de ter pelo menos 16 anos para criar uma conta. És responsável por manter a tua password confidencial e por toda a atividade na tua conta. Fornece informação exata ao registares-te — personificação ou anúncios falsos são proibidos.',
        ],
      },
      {
        heading: '3. Publicar um pedido',
        body: [
          'Ao publicares um pedido com preço fixo, estás a comprometer-te a pagar esse preço ao primeiro profissional verificado que o aceitar, conforme descrito no formulário de publicação. A Needer não processa pagamentos em teu nome atualmente — o pagamento acontece diretamente entre ti e o profissional, fora da plataforma, a menos e até introduzirmos pagamentos dentro da plataforma sob termos separados.',
          'Tens de ter intenção genuína de contratar ao publicares um pedido. Publicar pedidos falsos ou de má-fé para desperdiçar o tempo de profissionais é proibido e pode resultar na suspensão da conta.',
        ],
      },
      {
        heading: '4. Enviar uma proposta (profissionais)',
        body: [
          'Se enviares uma proposta como profissional, estás a declarar que podes e pretendes realizar o trabalho pelo preço que propuseste. As afirmações de verificação, certificação ou identidade empresarial que nos submetas têm de ser exatas — podemos suspender contas que se verifique terem falseado esta informação.',
        ],
      },
      {
        heading: '5. Conduta proibida',
        body: [
          'Não podes: usar a plataforma para fins ilegais; assediar, ameaçar ou defraudar outros utilizadores; extrair ou recolher dados em massa da plataforma; tentar contornar a plataforma para evitar os seus termos ou funcionalidades de segurança de má-fé; ou carregar conteúdo sobre o qual não tenhas direitos (incluindo imagens).',
        ],
      },
      {
        heading: '6. Conteúdo que submetes',
        body: [
          'Mantens a propriedade do texto e fotos que submetes (descrições de pedidos, mensagens de propostas, comentários de avaliações, imagens carregadas). Ao submeti-los, concedes à Needer uma licença para os exibir na plataforma na medida necessária para operar o serviço.',
        ],
      },
      {
        heading: '7. Taxas',
        body: [
          'Publicar um pedido e receber propostas é gratuito para clientes atualmente. Certas funcionalidades premium referidas na plataforma (como posicionamento patrocinado ou acesso antecipado a novos pedidos) ainda não podem ser compradas; se e quando ficarem disponíveis, serão regidas por termos adicionais apresentados no momento da compra.',
        ],
      },
      {
        heading: '8. Isenções de responsabilidade',
        body: [
          'A Needer fornece a plataforma "tal como está". Não garantimos a qualidade, segurança, legalidade ou resultado de qualquer serviço ou produto trocado entre utilizadores, e não somos responsáveis por litígios, danos ou perdas resultantes de interações entre um cliente e um profissional. Usa bom senso antes de contratar alguém ou fazer um pagamento, tal como farias em qualquer mercado.',
          'Na máxima medida permitida por lei, a responsabilidade da Needer por qualquer reclamação relacionada com a plataforma está limitada ao montante (se algum) que pagaste diretamente à Needer nos doze meses anteriores à reclamação.',
        ],
      },
      {
        heading: '9. Suspensão e encerramento',
        body: [
          'Podemos suspender ou encerrar uma conta que viole estes termos. Podes deixar de usar o serviço e pedir a eliminação da conta a qualquer momento contactando support@needer.com.',
        ],
      },
      {
        heading: '10. Lei aplicável',
        body: [
          'Estes termos são regidos pela lei portuguesa, sem prejuízo de quaisquer direitos de proteção do consumidor de caráter imperativo que tenhas ao abrigo da lei do Estado-Membro da UE onde resides.',
        ],
      },
      {
        heading: '11. Alterações a estes termos',
        body: [
          `Estes termos foram atualizados pela última vez em ${LAST_UPDATED}. A utilização continuada da plataforma após uma alteração significa que aceitas os termos atualizados.`,
        ],
      },
    ],
  },
};

export default function TermsPage() {
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
        <div key={section.heading} style={{ marginBottom: '28px' }}>
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
        {locale === 'pt' ? 'Ver também a nossa' : 'See also our'}{' '}
        <Link href="/privacy" style={{ color: 'var(--accent)' }}>
          {locale === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
        </Link>
        .
      </p>
    </div>
  );
}
