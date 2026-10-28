'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LEGAL } from '@/lib/legal';

const LAST_UPDATED = '2026-10-28';

interface Section {
  heading: string;
  body: string[];
  links?: { href: string; label: string }[];
}

const { operatorName, nif, address, email, minAge } = LEGAL;

const CONTENT: Record<'en' | 'pt', { title: string; intro: string; sections: Section[] }> = {
  en: {
    title: 'Terms of Service',
    intro: `Needer is operated by ${operatorName}, tax number (NIF) ${nif}, address ${address} ("Needer", "we"). Contact: ${email}. By creating an account or using the platform you accept these terms. If you do not agree, please do not use the service.`,
    sections: [
      {
        heading: '1. What Needer is',
        body: [
          `Needer is a reverse marketplace: clients describe a need (a service, or a product they want to buy) and professionals or sellers reply with proposals. Needer is a technology platform that puts the two sides in contact. We are not a party to the agreement a client and a professional make with each other, and we do not employ, supervise or guarantee the work of any professional.`,
          `Needer does not process payments today. Payment is arranged directly between the client and the professional, outside the platform.`,
        ],
      },
      {
        heading: '2. Who can use Needer',
        body: [
          `You must be at least ${minAge} years old to create an account. By accepting these terms you declare that you are.`,
          `Use one account per person, with accurate information. You are responsible for keeping your password confidential and for what happens in your account. Impersonating someone else is prohibited.`,
        ],
      },
      {
        heading: '3. Posting a request',
        body: [
          `When you post a request you give a reference budget. Professionals answer with proposals, each with its own price, and you are only committed to the proposal you accept, on the terms of that proposal.`,
          `Requests are public. Do not put personal data such as your phone number or full address in the description: share them only with the professional you choose, through messages.`,
          `Post only requests you genuinely intend to follow up on. Fake or bad-faith requests are prohibited and may lead to the account being suspended.`,
        ],
      },
      {
        heading: '4. Professionals (Pro)',
        body: [
          `Becoming a Pro is free and is not automatic: you apply with your professional details and proof of qualification, and our team reviews the application. For regulated activities (for example travel agencies, real estate brokerage or health professions) we may ask for the corresponding licence or registration number.`,
          `Approval means we checked the documents you submitted at that time. It is not a guarantee of the quality of your work.`,
          `When you send a proposal you declare that you can and intend to do the work, or deliver the product, at the price you quote. You are solely responsible for complying with the rules of your activity towards the client, including invoicing, consumer rights and any licence your activity requires. False information about your identity, qualifications or business may lead to suspension.`,
        ],
      },
      {
        heading: '5. Prohibited content and conduct',
        body: [
          `You may not use Needer to: offer or request anything illegal (including weapons, drugs, counterfeit goods, stolen goods or prescription medicines); defraud, harass, threaten or discriminate against other users; publish spam or content you do not have the rights to (including photos); collect data from the platform in bulk; or interfere with how the platform works.`,
        ],
      },
      {
        heading: '6. Reporting illegal content and moderation',
        body: [
          `Anyone can report content they consider illegal or contrary to these terms by writing to ${email}. Please include: the link to the content, why you consider it illegal, your name and email, and a statement that the report is made in good faith. We review reports diligently and tell you what we decided.`,
          `If we remove your content or restrict your account, we tell you why. You can contest the decision by replying to that message or writing to ${email}, and the case will be reviewed again.`,
          `${email} is also Needer's single point of contact for users and for authorities under the EU Digital Services Act. We answer in Portuguese or English.`,
        ],
      },
      {
        heading: '7. Content you submit',
        body: [
          `You keep ownership of the texts and photos you submit. By submitting them you give Needer permission to display them on the platform, to the extent needed to run the service.`,
        ],
      },
      {
        heading: '8. Prices and paid features',
        body: [
          `Posting requests, receiving proposals and applying to become a Pro are free. In the future, Pros may be able to buy optional features that give them more visibility. Their price and conditions will be shown before any purchase, and paid visibility will always be identified as such. Buying a paid feature never means Needer verified that professional any further.`,
        ],
      },
      {
        heading: '9. Liability',
        body: [
          `We work to keep the platform available and secure, but we do not guarantee the quality, safety, legality or outcome of services or products exchanged between users, and we are not responsible for disputes between a client and a professional. Use good judgement before hiring anyone or making a payment.`,
          `Nothing in these terms excludes liability for wilful misconduct or gross negligence, or limits the rights that consumer protection law gives you.`,
        ],
      },
      {
        heading: '10. Suspension and deleting your account',
        body: [
          `We may suspend or close accounts that break these terms, always telling you why. You can delete your account at any time in Settings, or by writing to ${email}.`,
        ],
      },
      {
        heading: '11. Complaints and dispute resolution',
        body: [
          `You can submit a complaint through the Electronic Complaints Book (Livro de Reclamações Eletrónico) or by writing to ${email}.`,
          `In the event of a consumer dispute, you may turn to an Alternative Dispute Resolution (ADR) entity. In Portugal, CNIACC (Centro Nacional de Informação e Arbitragem de Conflitos de Consumo) handles disputes nationwide. More information is available on the Consumer Portal.`,
        ],
        links: [
          { href: LEGAL.complaintsBookUrl, label: 'Livro de Reclamações Eletrónico' },
          { href: 'https://www.cniacc.pt', label: 'CNIACC' },
          { href: LEGAL.ralListUrl, label: 'Portal do Consumidor' },
        ],
      },
      {
        heading: '12. Governing law',
        body: [
          `These terms are governed by Portuguese law, without prejudice to the mandatory consumer protection rules of the EU country where you live.`,
        ],
      },
      {
        heading: '13. Changes to these terms',
        body: [
          `These terms were last updated on ${LAST_UPDATED}. We will give reasonable advance notice of important changes, on the site or by email. Continuing to use Needer after a change takes effect means you accept the updated terms.`,
        ],
      },
    ],
  },
  pt: {
    title: 'Termos de Serviço',
    intro: `O Needer é explorado por ${operatorName}, NIF ${nif}, com morada em ${address} ("Needer", "nós"). Contacto: ${email}. Ao criares uma conta ou usares a plataforma, aceitas estes termos. Se não concordares, não uses o serviço.`,
    sections: [
      {
        heading: '1. O que é o Needer',
        body: [
          `O Needer é um mercado inverso: os clientes descrevem uma necessidade (um serviço, ou um produto que querem comprar) e profissionais ou vendedores respondem com propostas. O Needer é uma plataforma tecnológica que põe as duas partes em contacto. Não somos parte no acordo que o cliente e o profissional fazem entre si, e não empregamos, supervisionamos nem garantimos o trabalho de nenhum profissional.`,
          `O Needer não processa pagamentos atualmente. O pagamento é combinado diretamente entre o cliente e o profissional, fora da plataforma.`,
        ],
      },
      {
        heading: '2. Quem pode usar o Needer',
        body: [
          `Tens de ter pelo menos ${minAge} anos para criar uma conta. Ao aceitares estes termos, declaras que tens.`,
          `Usa uma conta por pessoa, com informação verdadeira. És responsável por manter a tua palavra-passe confidencial e pelo que acontece na tua conta. É proibido fazeres-te passar por outra pessoa.`,
        ],
      },
      {
        heading: '3. Publicar um pedido',
        body: [
          `Ao publicares um pedido, indicas um orçamento de referência. Os profissionais respondem com propostas, cada uma com o seu preço, e só ficas comprometido com a proposta que aceitares, nas condições dessa proposta.`,
          `Os pedidos são públicos. Não ponhas dados pessoais, como o teu telefone ou a morada completa, na descrição: partilha-os só com o profissional que escolheres, pelas mensagens.`,
          `Publica apenas pedidos a que tencionas mesmo dar seguimento. Pedidos falsos ou de má-fé são proibidos e podem levar à suspensão da conta.`,
        ],
      },
      {
        heading: '4. Profissionais (Pro)',
        body: [
          `Ser Pro é gratuito e não é automático: candidatas-te com os teus dados profissionais e comprovativos da tua qualificação, e a nossa equipa analisa a candidatura. Para atividades reguladas (por exemplo agências de viagens, mediação imobiliária ou profissões de saúde) podemos pedir o número da licença ou registo correspondente.`,
          `A aprovação significa que verificámos os documentos que enviaste nessa data. Não é uma garantia da qualidade do teu trabalho.`,
          `Ao enviares uma proposta, declaras que podes e pretendes fazer o trabalho, ou entregar o produto, pelo preço que propões. És o único responsável por cumprir as regras da tua atividade perante o cliente, incluindo faturação, direitos do consumidor e qualquer licença que a tua atividade exija. Informação falsa sobre a tua identidade, qualificações ou empresa pode levar à suspensão.`,
        ],
      },
      {
        heading: '5. Conteúdos e condutas proibidos',
        body: [
          `Não podes usar o Needer para: oferecer ou pedir algo ilegal (incluindo armas, drogas, contrafações, bens roubados ou medicamentos sujeitos a receita); burlar, assediar, ameaçar ou discriminar outros utilizadores; publicar spam ou conteúdos sobre os quais não tens direitos (incluindo fotos); recolher dados da plataforma em massa; ou interferir com o funcionamento da plataforma.`,
        ],
      },
      {
        heading: '6. Denúncias de conteúdo ilegal e moderação',
        body: [
          `Qualquer pessoa pode denunciar conteúdos que considere ilegais ou contrários a estes termos, escrevendo para ${email}. Indica: o link do conteúdo, porque o consideras ilegal, o teu nome e email, e uma declaração de que a denúncia é feita de boa-fé. Analisamos as denúncias com diligência e dizemos-te o que decidimos.`,
          `Se removermos um conteúdo teu ou restringirmos a tua conta, dizemos-te porquê. Podes contestar a decisão respondendo a essa mensagem ou escrevendo para ${email}, e o caso volta a ser analisado.`,
          `O ${email} é também o ponto de contacto único do Needer para utilizadores e autoridades, nos termos do Regulamento dos Serviços Digitais da UE. Respondemos em português ou inglês.`,
        ],
      },
      {
        heading: '7. Conteúdo que submetes',
        body: [
          `Os textos e fotos que submetes continuam a ser teus. Ao submetê-los, autorizas o Needer a mostrá-los na plataforma, na medida necessária para o serviço funcionar.`,
        ],
      },
      {
        heading: '8. Preços e funcionalidades pagas',
        body: [
          `Publicar pedidos, receber propostas e candidatar-te a Pro é gratuito. No futuro, os Pros poderão comprar funcionalidades opcionais que lhes dão mais visibilidade. O preço e as condições serão mostrados antes de qualquer compra, e a visibilidade paga será sempre identificada como tal. Comprar uma funcionalidade paga nunca significa que o Needer verificou mais esse profissional.`,
        ],
      },
      {
        heading: '9. Responsabilidade',
        body: [
          `Trabalhamos para manter a plataforma disponível e segura, mas não garantimos a qualidade, segurança, legalidade ou resultado dos serviços ou produtos trocados entre utilizadores, e não somos responsáveis por litígios entre um cliente e um profissional. Usa bom senso antes de contratar alguém ou fazer um pagamento.`,
          `Nada nestes termos exclui a responsabilidade por dolo ou culpa grave, nem limita os direitos que a lei de defesa do consumidor te dá.`,
        ],
      },
      {
        heading: '10. Suspensão e eliminação da conta',
        body: [
          `Podemos suspender ou encerrar contas que violem estes termos, dizendo-te sempre porquê. Podes eliminar a tua conta a qualquer momento nas Definições, ou escrevendo para ${email}.`,
        ],
      },
      {
        heading: '11. Reclamações e resolução de litígios',
        body: [
          `Podes apresentar uma reclamação no Livro de Reclamações Eletrónico ou escrevendo para ${email}.`,
          `Em caso de litígio de consumo, podes recorrer a uma entidade de Resolução Alternativa de Litígios (RAL). Em Portugal, o CNIACC (Centro Nacional de Informação e Arbitragem de Conflitos de Consumo) trata litígios de âmbito nacional. Mais informações no Portal do Consumidor.`,
        ],
        links: [
          { href: LEGAL.complaintsBookUrl, label: 'Livro de Reclamações Eletrónico' },
          { href: 'https://www.cniacc.pt', label: 'CNIACC' },
          { href: LEGAL.ralListUrl, label: 'Portal do Consumidor' },
        ],
      },
      {
        heading: '12. Lei aplicável',
        body: [
          `Estes termos regem-se pela lei portuguesa, sem prejuízo das normas imperativas de defesa do consumidor do país da UE onde vives.`,
        ],
      },
      {
        heading: '13. Alterações a estes termos',
        body: [
          `Estes termos foram atualizados pela última vez em ${LAST_UPDATED}. Avisamos com antecedência razoável, no site ou por email, as alterações importantes. Continuar a usar o Needer depois de uma alteração entrar em vigor significa que aceitas os termos atualizados.`,
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
        {locale === 'pt' ? 'Ver também a nossa' : 'See also our'}{' '}
        <Link href="/privacy" style={{ color: 'var(--accent)' }}>
          {locale === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
        </Link>
        .
      </p>
    </div>
  );
}
