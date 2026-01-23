/**
 * Signature template data and styles
 * Pre-made signature patterns users can customize
 */

export interface SignatureTemplate {
    id: string;
    name: string;
    description: string;
    category: 'professional' | 'casual' | 'artistic' | 'minimal';
    isPro: boolean;
    previewPath: string; // SVG path for preview
    strokeWidth: number;
    style: {
        strokeLinecap: 'round' | 'square' | 'butt';
        strokeLinejoin: 'round' | 'miter' | 'bevel';
    };
}

export const signatureTemplates: SignatureTemplate[] = [
    {
        id: 'classic',
        name: 'Classic',
        description: 'Clean, professional cursive style',
        category: 'professional',
        isPro: false,
        previewPath: 'M20 50 C 35 20, 55 60, 75 40 S 100 25, 120 45 C 140 65, 160 30, 180 40 S 210 50, 230 35 C 245 25, 260 45, 270 38',
        strokeWidth: 2.5,
        style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        },
    },
    {
        id: 'bold',
        name: 'Bold',
        description: 'Thick strokes for a confident look',
        category: 'professional',
        isPro: false,
        previewPath: 'M15 45 C 40 15, 70 55, 100 35 S 140 20, 175 45 C 200 60, 230 30, 265 40',
        strokeWidth: 4,
        style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        },
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple, thin lines for a modern feel',
        category: 'minimal',
        isPro: false,
        previewPath: 'M25 40 L 80 40 C 100 40, 120 30, 140 40 L 200 40 C 220 40, 240 50, 260 40',
        strokeWidth: 1.5,
        style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        },
    },
    {
        id: 'artistic',
        name: 'Artistic',
        description: 'Flowing curves with flourishes',
        category: 'artistic',
        isPro: true,
        previewPath: 'M10 55 Q 30 10, 60 45 T 100 35 Q 130 25, 150 50 C 170 70, 200 20, 230 45 Q 250 60, 275 35',
        strokeWidth: 2,
        style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        },
    },
    {
        id: 'executive',
        name: 'Executive',
        description: 'Sophisticated professional style',
        category: 'professional',
        isPro: true,
        previewPath: 'M20 50 C 45 25, 65 55, 90 40 S 120 30, 145 45 C 165 55, 185 35, 210 42 S 245 38, 270 45',
        strokeWidth: 2.5,
        style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'miter',
        },
    },
    {
        id: 'casual',
        name: 'Casual',
        description: 'Relaxed, friendly style',
        category: 'casual',
        isPro: false,
        previewPath: 'M25 45 C 50 30, 75 60, 100 42 S 130 35, 155 48 C 175 55, 200 40, 230 45 S 255 50, 270 42',
        strokeWidth: 2,
        style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        },
    },
    {
        id: 'angular',
        name: 'Angular',
        description: 'Sharp, geometric lines',
        category: 'minimal',
        isPro: true,
        previewPath: 'M20 50 L 60 25 L 100 55 L 140 30 L 180 50 L 220 28 L 265 48',
        strokeWidth: 2,
        style: {
            strokeLinecap: 'square',
            strokeLinejoin: 'miter',
        },
    },
    {
        id: 'calligraphy',
        name: 'Calligraphy',
        description: 'Elegant calligraphic strokes',
        category: 'artistic',
        isPro: true,
        previewPath: 'M15 55 Q 35 15, 65 48 T 115 38 Q 145 28, 175 52 C 200 68, 225 22, 255 48 Q 270 58, 280 42',
        strokeWidth: 3,
        style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
        },
    },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: SignatureTemplate['category']): SignatureTemplate[] {
    return signatureTemplates.filter(t => t.category === category);
}

/**
 * Get free templates only
 */
export function getFreeTemplates(): SignatureTemplate[] {
    return signatureTemplates.filter(t => !t.isPro);
}

/**
 * Get pro templates only
 */
export function getProTemplates(): SignatureTemplate[] {
    return signatureTemplates.filter(t => t.isPro);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): SignatureTemplate | undefined {
    return signatureTemplates.find(t => t.id === id);
}
