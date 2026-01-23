/**
 * Audit Trail - Logging signature actions for compliance
 */

export interface AuditEntry {
    id: string;
    action: 'created' | 'exported' | 'deleted' | 'signed' | 'viewed' | 'shared';
    signatureId?: string;
    signatureName?: string;
    timestamp: string;
    userAgent: string;
    ipHash?: string;
    metadata?: Record<string, unknown>;
}

const AUDIT_KEY = 'skysign_audit_trail';
const MAX_ENTRIES = 1000;

/**
 * Add entry to audit trail
 */
export function logAuditEntry(
    action: AuditEntry['action'],
    signatureId?: string,
    signatureName?: string,
    metadata?: Record<string, unknown>
): AuditEntry {
    const entry: AuditEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        signatureId,
        signatureName,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        metadata,
    };

    const entries = getAuditTrail();
    entries.unshift(entry);
    const trimmed = entries.slice(0, MAX_ENTRIES);

    try {
        localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error('Failed to save audit entry:', e);
    }

    return entry;
}

/**
 * Get all audit entries
 */
export function getAuditTrail(): AuditEntry[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(AUDIT_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Get audit entries for a specific signature
 */
export function getAuditForSignature(signatureId: string): AuditEntry[] {
    return getAuditTrail().filter(e => e.signatureId === signatureId);
}

/**
 * Export audit trail as JSON
 */
export function exportAuditTrail(): string {
    return JSON.stringify({
        exportDate: new Date().toISOString(),
        entries: getAuditTrail(),
    }, null, 2);
}

/**
 * Clear audit trail
 */
export function clearAuditTrail(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUDIT_KEY);
    }
}

/**
 * Get statistics from audit trail
 */
export function getAuditStats(): {
    totalCreated: number;
    totalExported: number;
    totalSigned: number;
    last30Days: number;
} {
    const entries = getAuditTrail();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
        totalCreated: entries.filter(e => e.action === 'created').length,
        totalExported: entries.filter(e => e.action === 'exported').length,
        totalSigned: entries.filter(e => e.action === 'signed').length,
        last30Days: entries.filter(e => new Date(e.timestamp) > thirtyDaysAgo).length,
    };
}
