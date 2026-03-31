import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: {
    default: 'DocOrganiser - Collaborative Document Intelligence',
    template: '%s | Document Organiser',
  },
  description:
    'A premium collaborative document workspace for teams, knowledge, governance, and elegant file operations.',
  keywords: [
    'document management',
    'collaborative workspace',
    'file organizer',
    'knowledge hub',
    'team collaboration',
  ],
  authors: [{ name: 'DocOrganiser' }],
  openGraph: {
    type: 'website',
    title: 'Document Organiser',
    description: 'A futuristic workspace for documents, collaboration, search, and control.',
    siteName: 'Document Organiser',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Document Organiser',
    description: 'A futuristic workspace for documents, collaboration, search, and control.',
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
        <meta name="theme-color" content="#07111f" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
