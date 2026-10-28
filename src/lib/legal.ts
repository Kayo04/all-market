// Who operates Needer — the single source for the legal pages and the footer.
// DL 7/2004 art. 10 requires name, geographic address, contact email and NIF to be
// shown on the site. Values in [brackets] are placeholders the owner still has to
// fill in; they must all be real before public launch.
export const LEGAL = {
    operatorName: '[Nome completo]',
    nif: '[NIF]',
    address: '[Morada]',
    email: '[email de contacto]',
    // Same rule as OLX/Vinted: declared in the Terms, not verified at sign-up.
    minAge: 18,
    // Kept in sync with the actual infrastructure — the Privacy Policy lists these.
    processors: [
        { name: 'MongoDB Atlas', purposeEN: 'database hosting', purposePT: 'alojamento da base de dados' },
        { name: 'Vercel', purposeEN: 'website hosting', purposePT: 'alojamento do site' },
        { name: 'Resend', purposeEN: 'sending service emails', purposePT: 'envio de emails do serviço' },
        { name: 'Uploadthing', purposeEN: 'storing uploaded photos', purposePT: 'armazenamento de fotos carregadas' },
    ],
    complaintsBookUrl: 'https://www.livroreclamacoes.pt',
    cnpdUrl: 'https://www.cnpd.pt',
    ralListUrl: 'https://www.consumidor.gov.pt',
} as const;
