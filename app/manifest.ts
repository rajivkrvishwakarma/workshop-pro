import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Workshop Pro',
    short_name: 'Workshop Pro',
    description: 'Management system for your workshop',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0055ff',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      }
    ],
  };
}
