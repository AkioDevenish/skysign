/**
 * API Key utility for generating and managing access keys
 */

export interface ApiKey {
    id: string;
    key: string;
    name: string;
    createdAt: string;
    lastUsedAt?: string;
    status: 'active' | 'revoked';
}

const API_KEY_STORAGE_KEY = 'skysign_api_keys';

/**
 * Generate a random API key
 */
function generateSecureKey(): string {
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
    }
    const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    return `sk_${hex}`;
}

/**
 * Get all API keys
 */
export function getApiKeys(): ApiKey[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Create a new API key
 */
export function createApiKey(name: string): ApiKey {
    const keys = getApiKeys();
    const newKey: ApiKey = {
        id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        key: generateSecureKey(),
        name,
        createdAt: new Date().toISOString(),
        status: 'active',
    };

    try {
        const updated = [...keys, newKey];
        localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(updated));
        return newKey;
    } catch (e) {
        console.error('Failed to save API key:', e);
        return newKey; // Still return it, even if persistence fails
    }
}

/**
 * Revoke an API key
 */
export function revokeApiKey(id: string): boolean {
    const keys = getApiKeys();
    const index = keys.findIndex(k => k.id === id);

    if (index === -1) return false;

    keys[index].status = 'revoked';

    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(keys));
        return true;
    } catch {
        return false;
    }
}

/**
 * Delete an API key record
 */
export function deleteApiKey(id: string): boolean {
    const keys = getApiKeys();
    const filtered = keys.filter(k => k.id !== id);

    if (filtered.length === keys.length) return false;

    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch {
        return false;
    }
}
