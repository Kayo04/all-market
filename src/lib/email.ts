// Transactional email: password reset, notification emails, Pro application notices.
// Sent through Resend's HTTP API with plain fetch — no SDK dependency. Without
// RESEND_API_KEY (local development) the email is printed to the server console
// instead, so flows like "forgot password" can be tested without an account.

interface Email {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export async function sendEmail({ to, subject, html, text }: Email): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'Needer <onboarding@resend.dev>';

    if (!apiKey) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n[email:dev] To: ${to}\n[email:dev] Subject: ${subject}\n${text}\n`);
            return true;
        }
        console.error('sendEmail: RESEND_API_KEY is not set — email not sent');
        return false;
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to, subject, html, text }),
        });
        if (!res.ok) {
            console.error('sendEmail: Resend responded', res.status, await res.text().catch(() => ''));
            return false;
        }
        return true;
    } catch (err) {
        console.error('sendEmail failed:', err);
        return false;
    }
}

// Absolute links in emails must come from configuration, never from the request's
// Host header — otherwise an attacker could get us to email a link to their domain.
export function appUrl(path: string): string {
    const base = (process.env.NEXTAUTH_URL || 'http://localhost:3100').replace(/\/+$/, '');
    return `${base}${path}`;
}

export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

// The one layout every notice email uses: greeting, a few paragraphs, one button,
// optional small print. `paragraphs` are plain text and get escaped here.
export function noticeEmail(opts: {
    pt: boolean;
    name: string;
    paragraphs: string[];
    link: string;
    cta: string;
    footer?: string;
}): { html: string; text: string } {
    const { pt, name, paragraphs, link, cta, footer } = opts;
    const hi = pt ? `Olá ${name},` : `Hi ${name},`;
    const sign = pt ? 'Equipa Needer' : 'The Needer team';
    const text = [hi, ...paragraphs, `${cta}: ${link}`, ...(footer ? [footer] : []), sign].join('\n\n');
    const html =
        `<p>${escapeHtml(hi)}</p>` +
        paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('') +
        `<p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#2f9e5c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(cta)}</a></p>` +
        (footer ? `<p style="color:#666;font-size:13px">${escapeHtml(footer)}</p>` : '') +
        `<p>${sign}</p>`;
    return { html, text };
}
