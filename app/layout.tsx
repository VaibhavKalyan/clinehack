import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Knock — opportunity starts with a conversation', description: 'Find government welfare schemes, understand the requirements, and take your next step. In your language.', manifest: '/manifest.webmanifest', icons: { icon: '/icon.svg' } };
export const viewport: Viewport = { themeColor: '#173e33', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }