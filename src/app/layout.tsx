import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/components/layout/ThemeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyDebugger - Developer Toolkit',
  description: 'A comprehensive web-based debugging and developer toolkit application',
  keywords: ['debugging', 'developer tools', 'web development', 'toolkit', 'utilities'],
  authors: [{ name: 'MyDebugger Team' }],
  viewport: 'width=device-width, initial-scale=1',
  colorScheme: 'light dark',
  robots: 'index, follow',
  openGraph: {
    title: 'MyDebugger - Developer Toolkit',
    description: 'A comprehensive web-based debugging and developer toolkit application',
    url: 'https://mydebugger.vercel.app',
    siteName: 'MyDebugger',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyDebugger - Developer Toolkit',
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
