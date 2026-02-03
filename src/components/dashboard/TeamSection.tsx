import { Id } from "../../../convex/_generated/dataModel";
import Link from 'next/link';

interface TeamMember {
    _id: Id<"teamMembers">;
    name: string;
    email: string;
}

interface TeamSectionProps {
    team: TeamMember[];
    isProPlus: boolean;
    isAddingMember: boolean;
    setIsAddingMember: (val: boolean) => void;
    newMember: { name: string; email: string };
    setNewMember: (val: { name: string; email: string }) => void;
    onAddMember: (e: React.FormEvent) => Promise<void>;
    onRemoveMember: (id: string) => Promise<void>;
}

export default function TeamSection({
    team,
    isProPlus,
    isAddingMember,
    setIsAddingMember,
    newMember,
    setNewMember,
    onAddMember,
    onRemoveMember
}: TeamSectionProps) {
    return (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-stone-900">Team Members</h2>
                        {!isProPlus && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-100">Pro Plus</span>
                        )}
                    </div>
                </div>
                {isProPlus && (
                    <button
                        onClick={() => setIsAddingMember(true)}
                        className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-xl hover:bg-stone-800 transition-all shadow-md cursor-pointer"
                    >
                        + Add Member
                    </button>
                )}
            </div>

            {!isProPlus ? (
                <div className="px-6 py-8 text-center bg-stone-50/50">
                    <p className="text-sm text-stone-500 mb-4 max-w-xs mx-auto">
                        Upgrade to Pro Plus to manage your team.
                    </p>
                    <Link
                        href="/#pricing"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-xl"
                    >
                        Upgrade Now
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-stone-100">
                    {isAddingMember && (
                        <div className="p-6 bg-stone-50/50">
                            <form onSubmit={onAddMember} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-1 w-full">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                                        value={newMember.name}
                                        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1 space-y-1 w-full">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                                        value={newMember.email}
                                        onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-xl cursor-pointer">Invite</button>
                            </form>
                        </div>
                    )}
                    {team.map((member) => (
                        <div key={member._id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">{member.name.charAt(0)}</div>
                                <div>
                                    <p className="text-sm font-semibold text-stone-900">{member.name}</p>
                                    <p className="text-xs text-stone-400">{member.email}</p>
                                </div>
                            </div>
                            <button onClick={() => onRemoveMember(member._id)} className="text-stone-400 hover:text-red-500 cursor-pointer">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
