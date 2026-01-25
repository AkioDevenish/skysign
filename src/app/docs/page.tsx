'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-stone-200/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-colors">
                            <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-stone-600">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-stone-900">API Reference v1.0</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar navigation */}
                    <div className="hidden lg:block space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Getting Started</h3>
                            <ul className="space-y-2">
                                <li><a href="#authentication" className="text-stone-600 hover:text-stone-900 text-sm">Authentication</a></li>
                                <li><a href="#errors" className="text-stone-600 hover:text-stone-900 text-sm">Errors</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Signatures</h3>
                            <ul className="space-y-2">
                                <li><a href="#list-signatures" className="text-stone-600 hover:text-stone-900 text-sm">List all signatures</a></li>
                                <li><a href="#create-signature" className="text-stone-600 hover:text-stone-900 text-sm">Create a signature</a></li>
                                <li><a href="#get-signature" className="text-stone-600 hover:text-stone-900 text-sm">Retrieve a signature</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-16">
                        {/* Introduction */}
                        <section>
                            <h1 className="text-4xl font-bold text-stone-900 mb-6">API Documentation</h1>
                            <p className="text-lg text-stone-600 leading-relaxed max-w-3xl">
                                Welcome to the Sky Sign API. This API allows you to programmatically manage signatures,
                                integrate signing flows into your own applications, and retrieve signed documents.
                            </p>
                        </section>

                        {/* Authentication */}
                        <section id="authentication" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">Authentication</h2>
                            <p className="text-stone-600 mb-6">
                                The Sky Sign API uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard.
                            </p>

                            <div className="bg-stone-900 rounded-2xl p-6 shadow-xl mb-6">
                                <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-4">
                                    <span className="text-stone-400 text-xs font-mono">Terminal</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                </div>
                                <code className="text-sm font-mono text-emerald-400">
                                    <span className="text-purple-400">curl</span> https://api.skysign.dev/v1/signatures \<br />
                                    &nbsp;&nbsp;<span className="text-stone-400">-H</span> <span className="text-yellow-300">&quot;Authorization: Bearer sk_live_...&quot;</span>
                                </code>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                                <div className="text-amber-600 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <p className="text-sm text-amber-800">
                                    Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, etc.
                                </p>
                            </div>
                        </section>

                        {/* List Signatures */}
                        <section id="list-signatures" className="scroll-mt-24">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold font-mono">GET</span>
                                <h2 className="text-2xl font-bold text-stone-900">/v1/signatures</h2>
                            </div>
                            <p className="text-stone-600 mb-6">
                                Returns a list of your signatures. The signatures are returned sorted by creation date, with the most recently created signatures appearing first.
                            </p>

                            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Response</h3>
                            <div className="bg-stone-900 rounded-2xl p-6 shadow-xl overflow-x-auto">
                                <code className="text-sm font-mono text-stone-300">
                                    {`{
  "data": [
    {
      "id": "sig_123456789",
      "object": "signature",
      "name": "Contract Signature",
      "created": 1678901234,
      "image_url": "https://skysign.dev/s/sig_123.png"
    },
    ...
  ],
  "has_more": false
}`}
                                </code>
                            </div>
                        </section>

                        {/* Create Signature */}
                        <section id="create-signature" className="scroll-mt-24">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold font-mono">POST</span>
                                <h2 className="text-2xl font-bold text-stone-900">/v1/signatures</h2>
                            </div>
                            <p className="text-stone-600 mb-6">
                                Create a new signature by providing a Base64 encoded image string or a reference URL.
                            </p>

                            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Parameters</h3>
                            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-8">
                                <table className="w-full text-left">
                                    <thead className="bg-stone-50 border-b border-stone-200">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Param</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        <tr>
                                            <td className="px-6 py-4 font-mono text-sm text-stone-900">name</td>
                                            <td className="px-6 py-4 text-sm text-stone-500">string</td>
                                            <td className="px-6 py-4 text-sm text-stone-600">A name for the signature.</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-mono text-sm text-stone-900">image_data</td>
                                            <td className="px-6 py-4 text-sm text-stone-500">string</td>
                                            <td className="px-6 py-4 text-sm text-stone-600">Base64 encoded image data (PNG).</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-stone-900 rounded-2xl p-6 shadow-xl">
                                <code className="text-sm font-mono text-emerald-400">
                                    <span className="text-purple-400">curl</span> -X POST https://api.skysign.dev/v1/signatures \<br />
                                    &nbsp;&nbsp;<span className="text-stone-400">-H</span> <span className="text-yellow-300">&quot;Authorization: Bearer sk_live_...&quot;</span> \<br />
                                    &nbsp;&nbsp;<span className="text-stone-400">-d</span> name=&quot;My New Signature&quot; \<br />
                                    &nbsp;&nbsp;<span className="text-stone-400">-d</span> image_data=&quot;iVBORw0KGgoAAAANSUhEUgAA...&quot;
                                </code>
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}
