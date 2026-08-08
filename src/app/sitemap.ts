import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

// Static marketing/legal routes only — /requests/[id], dashboards, etc. are
// behind auth or ephemeral, so they don't belong in a public sitemap.
const STATIC_PATHS = ['', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://needer.com';

    return routing.locales.flatMap((locale) =>
        STATIC_PATHS.map((path) => ({
            url: `${baseUrl}/${locale}${path}`,
            lastModified: new Date(),
        }))
    );
}
