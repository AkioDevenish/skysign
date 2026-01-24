'use client';

import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import BlurText from "@/components/reactbits/BlurText";
import DecryptedText from "@/components/reactbits/DecryptedText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import FadeContent from "@/components/reactbits/FadeContent";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import ESignatureLaws from "@/components/ESignatureLaws";
import TrustSection from "@/components/TrustSection";
import { getAuditStats } from "../lib/auditTrail";

export default function Home() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [signatureCount, setSignatureCount] = useState(0);

  // Load real stats on mount
  useEffect(() => {
    const stats = getAuditStats();
    setSignatureCount(stats.totalCreated);
  }, []);

  // Signature card data for carousel
  const signatureCards = [
    {
      initials: 'AM',
      name: 'Alex Morgan',
      title: 'CEO, TechStart Inc.',
      color: 'from-stone-100 to-stone-200',
      textColor: 'text-stone-700',
      signaturePath: 'M20 50 C 35 20, 55 60, 75 40 S 100 25, 120 45 C 140 65, 160 30, 180 40 S 210 50, 230 35 C 245 25, 260 45, 270 38',
      time: 'Signed just now',
    },
    {
      initials: 'SM',
      name: 'Sarah Mitchell',
      title: 'CFO, Finance Pro',
      color: 'from-amber-100 to-amber-200',
      textColor: 'text-amber-700',
      signaturePath: 'M15 45 Q 35 15, 60 40 T 110 35 C 130 30, 150 50, 175 38 S 210 42, 240 35 C 255 30, 265 45, 275 40',
      time: 'Signed 2 mins ago',
    },
    {
      initials: 'JR',
      name: 'James Rodriguez',
      title: 'Legal Director',
      color: 'from-blue-100 to-blue-200',
      textColor: 'text-blue-700',
      signaturePath: 'M18 42 C 40 20, 65 55, 90 35 S 120 25, 145 45 C 165 60, 190 28, 215 42 S 245 38, 268 35',
      time: 'Signed 5 mins ago',
    },
    {
      initials: 'EC',
      name: 'Emily Chen',
      title: 'Head of Operations',
      color: 'from-emerald-100 to-emerald-200',
      textColor: 'text-emerald-700',
      signaturePath: 'M22 48 Q 45 18, 72 42 T 118 36 C 145 32, 168 52, 195 40 S 230 45, 258 38 C 268 35, 275 42, 278 40',
      time: 'Signed 8 mins ago',
    },
  ];

  // Auto-rotate cards every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % signatureCards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [signatureCards.length]);

  const handleCheckout = async (planId: string, planName: string) => {
    if (planName === 'Free') {
      // Free plan - just go to create
      window.location.href = '/create';
      return;
    }



    setCheckoutLoading(planName);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email: '' }), // Email will come from Clerk user
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // For now, show alert since Payoneer isn't configured yet
        alert('Payment integration coming soon! Please contact support for Pro plan access.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      planId: "free",
      price: "$0",
      period: "forever",
      description: "Perfect for personal use and individuals",
      features: [
        "5 signatures per month",
        "Air Draw & Draw modes",
        "Standard PNG export",
        "AES-256 Encryption",
        "Audit Trail (Basic)",
      ],
      cta: "Get Started",
      highlighted: false,
      comingSoon: false,
    },
    {
      name: "Pro",
      planId: "pro",
      price: "Coming Soon",
      period: "per month",
      description: "For professionals who sign daily",
      features: [
        "Unlimited signatures",
        "Advanced gesture controls",
        "HD PNG, SVG & PDF export",
        "Cloud Backup & Sync",
        "Comprehensive Audit Logs",
        "Priority Email Support",
      ],
      cta: "Coming Soon",
      highlighted: true,
      comingSoon: true,
    },
    {
      name: "Pro Plus",
      planId: "proplus",
      price: "Coming Soon",
      period: "per month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Team management dashboard",
        "API access for automation",
        "Custom Branding",
        "Dedicated Success Manager",
      ],
      cta: "Coming Soon",
      highlighted: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden relative selection:bg-stone-900 selection:text-stone-50">
      {/* Signature Pattern Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url(/signature-pattern.png)`,
          backgroundSize: '500px',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-stone-50/90 backdrop-blur-md z-50 border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-stone-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight text-stone-900">Sky Sign</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">Features</a>
            <a href="#pricing" className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">Pricing</a>
            <a href="#faq" className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">FAQ</a>
            <SignedOut>
              <Link
                href="/sign-up"
                className="px-6 py-2.5 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/10"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/create"
                className="px-6 py-2.5 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/10"
              >
                Create Signature
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: '36px',
                      height: '36px',
                    },
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-8 lg:px-12 relative z-10 overflow-hidden">
        {/* Floating signature samples - decorative background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Sarah Mitchell signature */}
          <div className="absolute top-32 right-[15%] opacity-[0.08] rotate-[-8deg]">
            <svg viewBox="0 0 200 60" className="w-48 h-16" fill="none">
              <path d="M10 35 Q 25 15, 45 35 T 85 30 Q 95 25, 105 32 L 130 28 Q 145 35, 160 30 C 170 28, 180 35, 190 32" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <text x="10" y="55" fontSize="10" fill="#78716c" fontFamily="system-ui">Sarah Mitchell</text>
            </svg>
          </div>
          {/* James Rodriguez signature */}
          <div className="absolute bottom-40 left-[10%] opacity-[0.06] rotate-[5deg]">
            <svg viewBox="0 0 180 60" className="w-44 h-14" fill="none">
              <path d="M5 30 C 20 10, 40 50, 60 25 S 90 40, 110 30 C 130 20, 150 40, 175 28" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
              <text x="5" y="52" fontSize="9" fill="#78716c" fontFamily="system-ui">James Rodriguez</text>
            </svg>
          </div>
          {/* Emily Chen signature */}
          <div className="absolute top-[45%] right-[5%] opacity-[0.05] rotate-[-3deg]">
            <svg viewBox="0 0 160 55" className="w-40 h-14" fill="none">
              <path d="M8 28 Q 30 8, 55 30 T 100 25 C 120 28, 140 20, 155 28" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
              <text x="8" y="48" fontSize="9" fill="#78716c" fontFamily="system-ui">Emily Chen</text>
            </svg>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <FadeContent>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-20">
              {/* Left side - Main content */}
              <div className="lg:max-w-xl">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-stone-100 rounded-full mb-8 border border-stone-200">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-stone-600 font-mono tracking-wide">
                    <DecryptedText
                      text="AR-powered signatures"
                      speed={50}
                      maxIterations={10}
                      characters="ABCD1234!?"
                      className="text-stone-600"
                      parentClassName="inline-block"
                      encryptedClassName="text-stone-400"
                    />
                  </span>
                </div>

                <div className="mb-8">
                  <BlurText
                    text="Sign in the air."
                    delay={150}
                    animateBy="words"
                    direction="top"
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight leading-[1.1]"
                  />
                  <BlurText
                    text="Capture in seconds."
                    delay={150}
                    animateBy="words"
                    direction="bottom"
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-stone-400 tracking-tight leading-[1.1] mt-2"
                  />
                </div>

                <p className="text-lg md:text-xl text-stone-500 max-w-lg mb-10 leading-relaxed">
                  Transform your signature into digital art using just your camera.
                  Point, draw in the air, and save. It&apos;s that simple.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
                  <Link
                    href="/create"
                    className="px-8 py-4 bg-stone-900 text-stone-50 rounded-full font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 hover:shadow-xl hover:shadow-stone-900/25 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Start Signing Free
                  </Link>
                  <a
                    href="#features"
                    className="px-8 py-4 text-stone-600 font-medium hover:text-stone-900 transition-colors"
                  >
                    See how it works →
                  </a>
                </div>

                {/* Sample signatures with names */}
                <div className="flex items-center gap-6 pt-6 border-t border-stone-200">
                  <p className="text-sm text-stone-400">Trusted by professionals:</p>
                  <div className="flex -space-x-2">
                    {['A', 'M', 'J', 'S'].map((initial, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-medium text-stone-600">
                        {initial}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-stone-900 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                      {signatureCount > 0 ? `+${signatureCount}` : '+'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Signature showcase */}
              <div className="lg:w-[500px] relative">
                {/* Main signature card - animated carousel */}
                <div className="relative bg-white rounded-3xl shadow-2xl shadow-stone-900/10 border border-stone-200/80 p-8">
                  {/* Card indicator dots */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {signatureCards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCardIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeCardIndex
                          ? 'bg-stone-900 w-6'
                          : 'bg-stone-300 hover:bg-stone-400'
                          }`}
                      />
                    ))}
                  </div>

                  {/* Animated card content */}
                  {signatureCards.map((card, idx) => (
                    <div
                      key={card.initials}
                      className={`transition-all duration-500 ${idx === activeCardIndex
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4 absolute inset-8 pointer-events-none'
                        }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                            <span className={`text-sm font-semibold ${card.textColor}`}>{card.initials}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">{card.name}</p>
                            <p className="text-xs text-stone-500">{card.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      </div>

                      {/* Signature display */}
                      <div className="bg-stone-50 rounded-2xl p-6 mb-6 border border-stone-100">
                        <svg viewBox="0 0 280 80" className="w-full h-20" fill="none">
                          <path
                            d={card.signaturePath}
                            stroke="#1c1917"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            style={{
                              strokeDasharray: 500,
                              strokeDashoffset: idx === activeCardIndex ? 0 : 500,
                              transition: 'stroke-dashoffset 1.5s ease-in-out',
                            }}
                          />
                          <text x="20" y="72" fontSize="12" fill="#a8a29e" fontFamily="system-ui" fontStyle="italic">{card.name}</text>
                        </svg>
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>{card.time}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          256-bit encrypted
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating signature cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-stone-200/80 p-4 transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-amber-700">SM</span>
                    </div>
                    <span className="text-xs font-medium text-stone-700">Sarah M.</span>
                  </div>
                  <svg viewBox="0 0 100 30" className="w-24 h-8" fill="none">
                    <path d="M5 18 Q 20 5, 35 18 T 65 15 C 80 12, 95 20, 98 16" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>

                <div className="absolute -bottom-2 -left-6 bg-white rounded-2xl shadow-lg border border-stone-200/80 p-4 transform -rotate-2 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-blue-700">JR</span>
                    </div>
                    <span className="text-xs font-medium text-stone-700">James R.</span>
                  </div>
                  <svg viewBox="0 0 100 30" className="w-24 h-8" fill="none">
                    <path d="M5 15 C 25 5, 45 25, 60 12 S 85 18, 98 14" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>

                {/* Legal compliance badge */}
                <div className="absolute -bottom-6 right-8 bg-emerald-50 rounded-xl px-4 py-2 shadow-md border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-xs font-semibold text-emerald-700">ESIGN & eIDAS</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>


      {/* How it works */}
      <section id="features" className="py-32 px-8 lg:px-12 relative z-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeContent>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-20 gap-6">
              <div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4 block">How it works</span>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
                  Three simple gestures
                </h2>
              </div>
              <p className="text-stone-500 max-w-md text-lg">
                No stylus, no touchscreen drawing. Just your hand and a camera.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <SpotlightCard className="bg-stone-50 rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-100/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center mb-8 text-4xl group-hover:scale-105 transition-transform">
                  ☝️
                </div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 01</span>
                <h3 className="text-2xl font-semibold text-stone-900 mb-3">Point</h3>
                <p className="text-stone-500 leading-relaxed">
                  Hold your index finger up for 1 second to start drawing
                </p>
              </SpotlightCard>

              <SpotlightCard className="bg-stone-50 rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-100/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center mb-8 text-4xl group-hover:scale-105 transition-transform">
                  👍
                </div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 02</span>
                <h3 className="text-2xl font-semibold text-stone-900 mb-3">Save</h3>
                <p className="text-stone-500 leading-relaxed">
                  Thumbs up for 1 second to save your signature
                </p>
              </SpotlightCard>

              <SpotlightCard className="bg-stone-50 rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-100/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center mb-8 text-4xl group-hover:scale-105 transition-transform">
                  ✋
                </div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 03</span>
                <h3 className="text-2xl font-semibold text-stone-900 mb-3">Clear</h3>
                <p className="text-stone-500 leading-relaxed">
                  Open palm for 1 second to clear and start over
                </p>
              </SpotlightCard>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8 lg:px-12 relative z-10 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-100/30 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-50/40 rounded-full blur-[100px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <FadeContent>
            {/* Header */}
            <div className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-full text-sm font-medium mb-6 border border-stone-200/60">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Flexible Plans
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight mb-6">
                Transparent pricing for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900">every signer</span>
              </h2>
              <p className="text-stone-500 max-w-lg mx-auto text-lg leading-relaxed">
                Scale as you grow. Start with our generous free tier and upgrade as your needs evolve.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan, idx) => (
                <div
                  key={plan.name}
                  className={`relative group rounded-[2.5rem] p-8 lg:p-10 transition-all duration-500 flex flex-col h-full ${plan.highlighted
                    ? 'bg-stone-900 text-white shadow-2xl shadow-stone-900/20 scale-[1.05] z-20'
                    : 'bg-white/70 backdrop-blur-xl border border-stone-200/60 hover:border-stone-400 hover:shadow-xl hover:shadow-stone-200/50 z-10'
                    }`}
                >
                  {/* Popular Badge */}
                  {plan.highlighted && !plan.comingSoon && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                      <span className="px-6 py-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 text-white text-[10px] tracking-[0.2em] font-bold rounded-full shadow-lg shadow-emerald-500/20 uppercase">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Coming Soon Badge */}
                  {plan.comingSoon && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                      <span className="px-6 py-2 bg-stone-800 text-stone-200 text-[10px] tracking-[0.2em] font-bold rounded-full shadow-lg border border-stone-700 uppercase">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-2xl font-bold tracking-tight ${plan.highlighted ? 'text-white' : 'text-stone-900'}`}>
                        {plan.name}
                      </h3>
                      {plan.highlighted && (
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className={`text-base leading-relaxed ${plan.highlighted ? 'text-stone-400' : 'text-stone-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-10">
                    <div className="flex items-baseline gap-1">
                      <span className={`${plan.comingSoon ? 'text-4xl' : 'text-6xl'} font-bold tracking-tighter ${plan.highlighted ? 'text-white' : 'text-stone-900'}`}>
                        {plan.price}
                      </span>
                      {!plan.comingSoon && (
                        <span className={`text-stone-500 font-medium ${plan.highlighted ? 'text-stone-400' : ''}`}>
                          /{plan.period === 'forever' ? 'forever' : 'mo'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto mb-12">
                    <button
                      onClick={() => handleCheckout(plan.planId, plan.name)}
                      disabled={checkoutLoading === plan.name || plan.comingSoon}
                      className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group/btn ${plan.highlighted
                        ? 'bg-white text-stone-900 hover:bg-stone-50 shadow-xl shadow-white/5'
                        : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/10'
                        }`}
                    >
                      {checkoutLoading === plan.name ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {plan.cta}
                          {!plan.comingSoon && (
                            <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          )}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Features */}
                  <div className={`pt-8 border-t ${plan.highlighted ? 'border-stone-800' : 'border-stone-100'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-6 ${plan.highlighted ? 'text-stone-500' : 'text-stone-400'}`}>
                      What&apos;s included
                    </p>
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm group/item">
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className={plan.highlighted ? 'text-stone-300' : 'text-stone-600'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <p className="text-stone-400 text-sm">
                Secure payment processing by
                <span className="mx-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-700">
                  <svg className="w-4 h-4 text-[#FFCC00]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                  Paddle
                </span>
              </p>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Trust Section */}
      <TrustSection />

      {/* E-Signature Laws Section */}
      <FadeContent>
        <ESignatureLaws />
      </FadeContent>

      {/* FAQ Section */}
      <FadeContent>
        <FAQ />
      </FadeContent>

      {/* Newsletter Section */}
      <FadeContent>
        <Newsletter />
      </FadeContent>

      {/* Footer */}
      <footer className="py-12 px-8 lg:px-12 border-t border-stone-200/60 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-stone-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-stone-700">Sky Sign</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-stone-500">
              <Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-stone-900 transition-colors">Refund</Link>
              <Link href="/support" className="hover:text-stone-900 transition-colors">Support</Link>
            </div>
            <p className="text-sm text-stone-400">
              © 2026 Sky Sign. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
