import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Knock — Welfare Navigator',
    short_name: 'Knock',
    description: 'Find government welfare schemes, understand the requirements, and take your next step. In your language.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'en-IN',
    dir: 'ltr',
    background_color: '#f7f6f0',
    theme_color: '#173e33',
    categories: ['government', 'productivity', 'utilities'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Find schemes', short_name: 'Schemes', url: '/#opportunities', description: 'See schemes matched to your profile' },
      { name: 'My profile', short_name: 'Profile', url: '/#profile', description: 'Edit your saved details' },
    ],
  };
}