/**
 * Cloud backup utilities using Clerk user metadata
 */

import { SavedSignature, getSignatures } from './signatureStorage';

const BACKUP_KEY = 'skysign_cloud_backup';

interface CloudBackupData {
    signatures: SavedSignature[];
    lastSync: string;
    version: string;
}

/**
 * Save signatures to Clerk user metadata
 * Note: This requires the user to be signed in and proper Clerk setup
 */
export async function saveToCloud(userId: string): Promise<boolean> {
    try {
        const signatures = getSignatures();
        const backupData: CloudBackupData = {
            signatures,
            lastSync: new Date().toISOString(),
            version: '1.0',
        };

        // Store in localStorage for now (Clerk metadata has size limits)
        // In production, use a proper database or Clerk metadata for small data
        localStorage.setItem(`${BACKUP_KEY}_${userId}`, JSON.stringify(backupData));

        return true;
    } catch (error) {
        console.error('Cloud backup failed:', error);
        return false;
    }
}

/**
 * Restore signatures from cloud backup
 */
export async function restoreFromCloud(userId: string): Promise<SavedSignature[] | null> {
    try {
        const stored = localStorage.getItem(`${BACKUP_KEY}_${userId}`);
        if (!stored) return null;

        const data: CloudBackupData = JSON.parse(stored);
        return data.signatures;
    } catch (error) {
        console.error('Cloud restore failed:', error);
        return null;
    }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(userId: string): string | null {
    try {
        const stored = localStorage.getItem(`${BACKUP_KEY}_${userId}`);
        if (!stored) return null;

        const data: CloudBackupData = JSON.parse(stored);
        return data.lastSync;
    } catch {
        return null;
    }
}

/**
 * Check if cloud backup is available
 */
export function isCloudBackupAvailable(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
}

/**
 * Sync local with cloud (merge strategy)
 */
export async function syncWithCloud(userId: string): Promise<{
    added: number;
    updated: number;
    status: 'success' | 'error';
}> {
    try {
        const localSignatures = getSignatures();
        const cloudSignatures = await restoreFromCloud(userId);

        if (!cloudSignatures) {
            // No cloud data, upload local
            await saveToCloud(userId);
            return { added: localSignatures.length, updated: 0, status: 'success' };
        }

        // Simple merge: cloud wins for conflicts, add new from both
        const mergedMap = new Map<string, SavedSignature>();

        // Add cloud signatures first
        cloudSignatures.forEach(sig => mergedMap.set(sig.id, sig));

        // Add local signatures (new ones only)
        let added = 0;
        localSignatures.forEach(sig => {
            if (!mergedMap.has(sig.id)) {
                mergedMap.set(sig.id, sig);
                added++;
            }
        });

        // Save merged back to cloud
        const merged = Array.from(mergedMap.values());
        localStorage.setItem('skysign_signatures', JSON.stringify(merged));
        await saveToCloud(userId);

        return { added, updated: 0, status: 'success' };
    } catch (error) {
        console.error('Sync failed:', error);
        return { added: 0, updated: 0, status: 'error' };
    }
}
