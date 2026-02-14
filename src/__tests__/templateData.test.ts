import { describe, it, expect } from 'vitest';
import {
    signatureTemplates,
    getTemplatesByCategory,
    getFreeTemplates,
    getProTemplates,
    getTemplateById,
} from '@/lib/templateData';

describe('Template Data', () => {
    it('should have 8 total templates', () => {
        expect(signatureTemplates).toHaveLength(8);
    });

    it('every template has required fields', () => {
        for (const t of signatureTemplates) {
            expect(t.id).toBeTruthy();
            expect(t.name).toBeTruthy();
            expect(t.description).toBeTruthy();
            expect(['professional', 'casual', 'artistic', 'minimal']).toContain(t.category);
            expect(typeof t.isPro).toBe('boolean');
            expect(t.previewPath).toBeTruthy();
            expect(t.strokeWidth).toBeGreaterThan(0);
            expect(t.style.strokeLinecap).toBeTruthy();
            expect(t.style.strokeLinejoin).toBeTruthy();
        }
    });

    it('template IDs are unique', () => {
        const ids = signatureTemplates.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('getTemplatesByCategory', () => {
    it('returns only professional templates', () => {
        const results = getTemplatesByCategory('professional');
        expect(results.length).toBeGreaterThan(0);
        for (const t of results) {
            expect(t.category).toBe('professional');
        }
    });

    it('returns empty for invalid category', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(getTemplatesByCategory('nonexistent' as any)).toEqual([]);
    });
});

describe('getFreeTemplates', () => {
    it('returns only non-pro templates', () => {
        const free = getFreeTemplates();
        expect(free.length).toBeGreaterThan(0);
        for (const t of free) {
            expect(t.isPro).toBe(false);
        }
    });
});

describe('getProTemplates', () => {
    it('returns only pro templates', () => {
        const pro = getProTemplates();
        expect(pro.length).toBeGreaterThan(0);
        for (const t of pro) {
            expect(t.isPro).toBe(true);
        }
    });

    it('free + pro = all templates', () => {
        const total = getFreeTemplates().length + getProTemplates().length;
        expect(total).toBe(signatureTemplates.length);
    });
});

describe('getTemplateById', () => {
    it('returns the correct template', () => {
        const t = getTemplateById('classic');
        expect(t).toBeDefined();
        expect(t!.name).toBe('Classic');
    });

    it('returns undefined for unknown ID', () => {
        expect(getTemplateById('does-not-exist')).toBeUndefined();
    });
});
