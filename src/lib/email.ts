// Transactional email (password reset now; proposal/approval notices later).
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
