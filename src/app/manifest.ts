import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SkySign',
    short_name: 'SkySign',
    description: 'Sign documents in the air with hand tracking.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#1c1917',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
