/**
 * Signature storage utilities for managing saved signatures
 * Uses localStorage for free tier, with structure ready for cloud backup
 */

export interface SavedSignature {
    id: string;
    name: string;
    dataUrl: string;
    createdAt: string;
    updatedAt: string;
    style?: string;
    thumbnail?: string;
}

const STORAGE_KEY = 'skysign_signatures';
const MAX_FREE_SIGNATURES = 5;

/**
 * Get all saved signatures from localStorage
 */
export function getSignatures(): SavedSignature[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading signatures:', error);
        return [];
    }
}

/**
 * Save a new signature
 */
export function saveSignature(
    dataUrl: string,
    name?: string,
    style?: string,
    planId: string = 'free'
): SavedSignature | { error: string } {
    const signatures = getSignatures();

    // Check free tier limit if not a pro user
    if (planId === 'free' && signatures.length >= MAX_FREE_SIGNATURES) {
        return { error: `Free plan allows ${MAX_FREE_SIGNATURES} signatures. Upgrade to Pro for unlimited.` };
    }

    const id = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newSignature: SavedSignature = {
        id,
        name: name || `Signature ${signatures.length + 1}`,
        dataUrl,
        createdAt: now,
        updatedAt: now,
        style,
    };

    try {
        const updated = [newSignature, ...signatures];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newSignature;
    } catch (error) {
        console.error('Error saving signature:', error);
        return { error: 'Failed to save signature. Storage may be full.' };
    }
}

/**
 * Update an existing signature
 */
export function updateSignature(
    id: string,
    updates: Partial<Pick<SavedSignature, 'name' | 'dataUrl' | 'style'>>
): SavedSignature | null {
    const signatures = getSignatures();
    const index = signatures.findIndex(s => s.id === id);

    if (index === -1) return null;

    signatures[index] = {
        ...signatures[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(signatures));
        return signatures[index];
    } catch (error) {
        console.error('Error updating signature:', error);
        return null;
    }
}

/**
 * Delete a signature by ID
 */
export function deleteSignature(id: string): boolean {
    const signatures = getSignatures();
    const filtered = signatures.filter(s => s.id !== id);

    if (filtered.length === signatures.length) return false;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting signature:', error);
        return false;
    }
}

/**
 * Get signature count
 */
export function getSignatureCount(): number {
    return getSignatures().length;
}

/**
 * Check if user can save more signatures (free tier limit)
 */
export function canSaveMore(planId: string = 'free'): boolean {
    if (planId !== 'free') return true;
    return getSignatures().length < MAX_FREE_SIGNATURES;
}

/**
 * Get remaining signature slots
 */
export function getRemainingSlots(): number {
    return Math.max(0, MAX_FREE_SIGNATURES - getSignatures().length);
}

/**
 * Export signature as downloadable file
 */
export function exportSignature(
    signature: SavedSignature,
    format: 'png' | 'svg' = 'png'
): void {
    const link = document.createElement('a');

    if (format === 'png') {
        link.href = signature.dataUrl;
        link.download = `${signature.name.replace(/\s+/g, '_')}.png`;
    } else if (format === 'svg') {
        // Convert PNG data URL to SVG wrapper
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image xlink:href="${signature.dataUrl}" />
</svg>`;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
        link.download = `${signature.name.replace(/\s+/g, '_')}.svg`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export all signatures as JSON backup
 */
export function exportAllSignatures(): void {
    const signatures = getSignatures();
    const blob = new Blob([JSON.stringify(signatures, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `skysign_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Import signatures from JSON backup
 */
export function importSignatures(jsonString: string, planId: string = 'free'): { success: number; failed: number } {
    try {
        const imported = JSON.parse(jsonString) as SavedSignature[];
        const existing = getSignatures();
        const existingIds = new Set(existing.map(s => s.id));

        let success = 0;
        let failed = 0;

        for (const sig of imported) {
            const canAdd = planId !== 'free' || (existing.length + success < MAX_FREE_SIGNATURES);
            if (!existingIds.has(sig.id) && canAdd) {
                existing.push(sig);
                success++;
            } else {
                failed++;
            }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        return { success, failed };
    } catch {
        return { success: 0, failed: 0 };
    }
}
