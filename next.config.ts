import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

// CSP without nonces (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
// 'unsafe-inline' scripts are still allowed — Next's inline bootstrap needs them
// unless every page is rendered dynamically with a nonce — so this mainly blocks
// third-party scripts/frames, plugins and form/base hijacking. External origins:
// Google Fonts (globals.css) and Uploadthing images (utfs.io / *.ufs.sh — the only
// image hosts the API accepts, see isUploadthingUrl). Uploads go through
// /api/upload on our own server, so the browser never talks to Uploadthing.
const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' blob: data: https://utfs.io https://*.ufs.sh",
    "media-src 'self'",
    `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    // Browsers ignore HSTS over plain http, so this is inert on localhost. (No
    // upgrade-insecure-requests in the CSP: Vercel already redirects to https, and
    // it would break `npm run start` over plain http locally.)
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }];
    },
};

export default withNextIntl(nextConfig);
