/**
 * Team storage utility for managing team members
 * Uses localStorage to persist team data
 */

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
    joinedAt: string;
    status: 'active' | 'invited' | 'inactive';
}

const TEAM_STORAGE_KEY = 'skysign_team_members';
const MAX_TEAM_MEMBERS = 10;

/**
 * Get all team members
 */
export function getTeamMembers(): TeamMember[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(TEAM_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading team members:', error);
        return [];
    }
}

/**
 * Add a new team member
 */
export function addTeamMember(
    name: string,
    email: string,
    role: TeamMember['role'] = 'member'
): TeamMember | { error: string } {
    const members = getTeamMembers();

    if (members.length >= MAX_TEAM_MEMBERS) {
        return { error: `Team limit reached (${MAX_TEAM_MEMBERS} members). Upgrade for more slots.` };
    }

    // Check if email already exists
    if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
        return { error: 'A member with this email already exists.' };
    }

    const newMember: TeamMember = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        role,
        joinedAt: new Date().toISOString(),
        status: 'invited',
    };

    try {
        const updated = [...members, newMember];
        localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
        return newMember;
    } catch (error) {
        console.error('Error adding team member:', error);
        return { error: 'Failed to add member to storage.' };
    }
}

/**
 * Remove a team member
 */
export function removeTeamMember(id: string): boolean {
    const members = getTeamMembers();
    const filtered = members.filter(m => m.id !== id);

    if (filtered.length === members.length) return false;

    try {
        localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error removing team member:', error);
        return false;
    }
}

/**
 * Update member status or role
 */
export function updateMember(
    id: string,
    updates: Partial<Pick<TeamMember, 'role' | 'status' | 'name'>>
): TeamMember | null {
    const members = getTeamMembers();
    const index = members.findIndex(m => m.id === id);

    if (index === -1) return null;

    members[index] = {
        ...members[index],
        ...updates
    };

    try {
        localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
        return members[index];
    } catch (error) {
        console.error('Error updating member:', error);
        return null;
    }
}

/**
 * Get team count
 */
export function getTeamCount(): number {
    return getTeamMembers().length;
}
