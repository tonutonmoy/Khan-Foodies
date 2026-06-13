import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Khan Foodies — Premium Organic Foods',
    short_name: 'Khan Foodies',
    description:
      'Premium organic mango, honey & gourmet foods — cash on delivery across Bangladesh.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fef8f2',
    theme_color: '#1a234d',
    lang: 'bn',
    dir: 'ltr',
    categories: ['food', 'shopping'],
    icons: [
      {
        src: '/khan-foodies-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/khan-foodies-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
