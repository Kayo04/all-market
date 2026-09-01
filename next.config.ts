import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Next compiles routes in jest-worker child processes, one per core by
  // default. On this 8-core box that is ~7 node processes competing for
  // whatever RAM is left; when a spawn fails Next retries twice, gives up
  // ("Jest worker encountered 2 child process exceptions"), and then serves
  // an HTML 500 for every route it had not compiled yet. NextAuth's client
  // calls JSON.parse on that HTML without checking the content type, which
  // surfaces as CLIENT_FETCH_ERROR. Capping the pool trades slower cold
  // compiles for a dev server that does not fall over under memory pressure.
  experimental: {
    cpus: 2,
  },
};

export default withNextIntl(nextConfig);
