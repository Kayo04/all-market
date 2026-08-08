import { notFound } from 'next/navigation';

// Catch-all for any path under a valid locale that doesn't match a real route.
// Without this, Next.js can't resolve which layout tree an unmatched deep path
// belongs to and falls back to the root 404 — which has no <html>/<body> (those
// live in [locale]/layout.tsx) and crashes instead of rendering our styled
// [locale]/not-found.tsx.
export default function CatchAll() {
    notFound();
}
