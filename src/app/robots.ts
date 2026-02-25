import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/create/', '/docs/'],
            },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://skysign-app.vercel.app'}/sitemap.xml`,
    };
}
