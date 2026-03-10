import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AllMarket — The Reverse Marketplace',
  description: 'Post what you need. Receive proposals from trusted professionals. A demand-driven marketplace for services and products.',
  keywords: ['marketplace', 'services', 'professionals', 'proposals', 'Portugal'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
