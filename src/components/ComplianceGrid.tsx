'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { complianceData } from '@/lib/complianceData';

export default function ComplianceGrid() {
    const [search, setSearch] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string>('All');

    const filtered = complianceData.filter(item => {
        const matchesSearch = item.country.toLowerCase().includes(search.toLowerCase()) ||
            item.lawName.toLowerCase().includes(search.toLowerCase());
        const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;
        return matchesSearch && matchesRegion;
    });

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                    {['All', 'Americas', 'Europe', 'Asia Pacific', 'Middle East & Africa'].map((region) => (
                        <button
                            key={region}
                            onClick={() => setSelectedRegion(region)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedRegion === region
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search countries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
                    />
                    <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map((item) => (
                        <motion.div
                            layout
                            key={item.country}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{item.flag}</span>
                                    <div>
                                        <h3 className="font-bold text-stone-900">{item.country}</h3>
                                        <p className="text-xs text-stone-400">{item.region}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${item.status === 'Permissive' ? 'bg-emerald-100 text-emerald-700' :
                                    item.status === 'Tiered' ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm font-semibold text-stone-900 mb-1">{item.lawName}</div>
                                <div className="text-xs text-stone-500 font-mono">Enacted: {item.year}</div>
                            </div>

                            <p className="text-stone-600 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-stone-400">No countries found matching &quot;{search}&quot;</p>
                </div>
            )}
        </section>
    );
}
