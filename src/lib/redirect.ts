// Only same-site paths are allowed as post-login/register destinations, so a
// crafted link can't bounce someone to another site after they sign in.
// Browsers treat "//host" and "/\host" as protocol-relative URLs, so both are
// rejected along with anything that isn't a plain absolute path.
export function safeCallbackUrl(url: string | null): string | null {
  if (!url || !url.startsWith('/') || url.startsWith('//') || url.includes('\\')) return null;
  return url;
}
