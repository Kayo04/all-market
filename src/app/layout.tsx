import type { Metadata } from 'next';
import './globals.css';

const TITLE = 'NEEDER — The Reverse Marketplace';
const DESCRIPTION = 'Post what you need. Receive proposals from trusted professionals. A demand-driven marketplace for services and products.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['marketplace', 'services', 'professionals', 'proposals', 'Portugal'],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Needer',
    type: 'website',
    // No dedicated share image yet — add one (1200x630) and an `images` entry
    // here before any real link-sharing push.
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
