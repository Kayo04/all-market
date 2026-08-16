import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
    // `localePrefix: 'always'` means every real page carries a /pt or /en prefix,
    // so the bare root is the only path where a locale has to be *chosen*.
    //
    // Left to next-intl, that choice comes from the browser's Accept-Language
    // header — which sends anyone on an English-configured device to /en even
    // though defaultLocale is 'pt'. Needer is Portuguese-first, so the default
    // has to be pt regardless of how the visitor's browser is set up.
    //
    // A visitor who picked a language in Settings has a NEXT_LOCALE cookie
    // (written by next-intl when they switch), and that explicit choice still
    // wins here — otherwise changing the language wouldn't survive a visit to
    // the homepage.
    if (request.nextUrl.pathname === '/') {
        const chosen = request.cookies.get('NEXT_LOCALE')?.value;
        const locale = chosen && (routing.locales as readonly string[]).includes(chosen)
            ? chosen
            : routing.defaultLocale;

        return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for API routes, static files, etc.
    matcher: ['/', '/(pt|en)/:path*'],
};
