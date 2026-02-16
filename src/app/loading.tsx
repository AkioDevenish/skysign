export default function Loading() {
    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-stone-200 rounded-full" />
                    <div className="absolute top-0 left-0 w-12 h-12 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-stone-400 font-medium tracking-wide">Loading...</p>
            </div>
        </div>
    );
}
