import type { Metadata, Viewport } from 'next';
import './globals.css';
import SwRegister from './sw-register';

export const metadata: Metadata = {
  title: 'Knock — opportunity starts with a conversation',
  description: 'Find government welfare schemes, understand the requirements, and take your next step. In your language.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Knock' },
};
export const viewport: Viewport = { themeColor: '#173e33', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}