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
        sitemap: 'https://skysign.app/sitemap.xml',
    };
}
