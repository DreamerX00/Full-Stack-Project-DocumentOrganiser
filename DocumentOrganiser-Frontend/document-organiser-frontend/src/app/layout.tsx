import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Document Organiser — Manage Your Documents Effortlessly',
    template: '%s | Document Organiser',
  },
  description:
    'A modern document management platform. Upload, organize, search, and share your files with ease.',
  keywords: ['document management', 'file organizer', 'cloud storage', 'file sharing'],
  authors: [{ name: 'Alpha Documents' }],
  openGraph: {
    type: 'website',
    title: 'Document Organiser',
    description: 'Upload, organize, search, and share your documents with ease.',
    siteName: 'Document Organiser',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Document Organiser',
    description: 'Upload, organize, search, and share your documents with ease.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
