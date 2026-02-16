'use client';

import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { openPaddleCheckout } from '@/components/PaddleProvider';
import BlurText from "@/components/reactbits/BlurText";
import DecryptedText from "@/components/reactbits/DecryptedText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import FadeContent from "@/components/reactbits/FadeContent";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import ESignatureLaws from "@/components/ESignatureLaws";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ToastProvider";

import { getAuditStats } from "../lib/auditTrail";

// Premium "Sky Sign" Hand Animation


export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [_signatureCount, setSignatureCount] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();


  // Load real stats and users on mount
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
      router.push('/create');
      return;
    }

    if (!user) {
      router.push('/sign-up');
      return;
    }

    setCheckoutLoading(planName);
    try {
      const result = await openPaddleCheckout({
        customerEmail: user.primaryEmailAddress?.emailAddress,
        clerkUserId: user.id,
        planId,
        billingCycle,
      });
      if (!result.ok) {
        toast(result.error || 'Failed to open checkout. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast('Failed to open checkout. Please try again.', 'error');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const pricingTiers = [
    {
      name: "Free",
      planId: "free",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
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
      monthlyPrice: "$17",
      yearlyPrice: "$170",
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
      cta: "Buy Now",
      highlighted: true,
      comingSoon: false,
    },
    {
      name: "Pro Plus",
      planId: "proplus",
      monthlyPrice: "$39",
      yearlyPrice: "$390",
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
      cta: "Buy Now",
      highlighted: false,
      comingSoon: false,
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
            <span className="text-xl font-semibold tracking-tight text-stone-900">SkySign</span>
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
                className="w-10 h-10 bg-stone-900 text-stone-50 rounded-full flex items-center justify-center hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/10"
                title="Create Signature"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
              <UserButton
                userProfileMode="navigation"
                userProfileUrl="/dashboard"
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
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === activeCardIndex
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
                  Four simple steps
                </h2>
              </div>
              <p className="text-stone-500 max-w-md text-lg">
                No stylus, no touchscreen drawing. Just your hand and a camera.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <SpotlightCard className="bg-stone-50 rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-100/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                <div className="flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="text-6xl">👆</span>
                </div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 01</span>
                <h3 className="text-2xl font-semibold text-stone-900 mb-3">Point</h3>
                <p className="text-stone-500 leading-relaxed">
                  Hold your index finger up for 1 second to start drawing
                </p>
              </SpotlightCard>

              <SpotlightCard className="bg-stone-50 rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-100/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                <div className="flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="text-6xl">✊</span>
                </div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 02</span>
                <h3 className="text-2xl font-semibold text-stone-900 mb-3">Stop</h3>
                <p className="text-stone-500 leading-relaxed">
                  Make a fist for 1 second to pause or stop drawing
                </p>
              </SpotlightCard>

              <SpotlightCard className="bg-stone-50 rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-100/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                <div className="flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="text-6xl">👍</span>
                </div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 03</span>
                <h3 className="text-2xl font-semibold text-stone-900 mb-3">Save</h3>
                <p className="text-stone-500 leading-relaxed">
                  Thumbs up for 1 second to save your signature
                </p>
              </SpotlightCard>

              <SpotlightCard className="bg-stone-50 rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-100/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                <div className="flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="text-6xl">✋</span>
                </div>
                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 04</span>
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

        <div className="max-w-7xl mx-auto">
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
              <p className="text-stone-500 max-w-lg mx-auto text-lg leading-relaxed mb-10">
                Scale as you grow. Start with our generous free tier and upgrade as your needs evolve.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-16">
                <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-stone-900' : 'text-stone-400'}`}>Monthly</span>
                <button
                  onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-14 h-7 bg-stone-200 rounded-full p-1 transition-colors hover:bg-stone-300 cursor-pointer"
                >
                  <motion.div
                    animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-stone-900' : 'text-stone-400'}`}>Yearly</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Save up to 25%</span>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="flex flex-col md:flex-row justify-center gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
              {pricingTiers.map((plan, idx) => (
                <div
                  key={plan.name}
                  className="relative flex flex-col p-8 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 w-full md:w-1/3"
                >
                  {/* Icon */}
                  <div className="mb-6 text-stone-900 h-12 flex items-center">
                    {plan.name === 'Free' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3 .4-3.4 3.3-6 6.8-6 1-.3 2 .2 2.7 1h.2c.6-4.6 4.9-7.9 9.5-7.3 3.8.5 6.8 3.5 7.3 7.3h.2c1 .6 1.8 1.5 2.2 2.5" />
                      </svg>
                    )}
                    {plan.name === 'Pro' && (
                      <div className="relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-stone-300"
                        >
                          <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3 .4-3.4 3.3-6 6.8-6 1-.3 2 .2 2.7 1h.2c.6-4.6 4.9-7.9 9.5-7.3 3.8.5 6.8 3.5 7.3 7.3h.2c1 .6 1.8 1.5 2.2 2.5" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="absolute bottom-0 right-0 text-stone-900 bg-white rounded-full p-0.5"
                        >
                          <path d="m12 19 7-7 3 3-7 7-3-3z" />
                          <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                          <path d="m2 2 7.586 7.586" />
                          <circle cx="11" cy="11" r="2" />
                        </svg>
                      </div>
                    )}
                    {plan.name === 'Pro Plus' && (
                       <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3 .4-3.4 3.3-6 6.8-6 1-.3 2 .2 2.7 1h.2c.6-4.6 4.9-7.9 9.5-7.3 3.8.5 6.8 3.5 7.3 7.3h.2c1 .6 1.8 1.5 2.2 2.5" />
                        <circle cx="12" cy="12" r="3" />
                         <path d="m6 12-2-2" />
                         <path d="m18 12 2-2" />
                         <path d="m12 6-2-2" />
                      </svg>
                    )}
                  </div>

                  {/* Plan Name & Desc */}
                  <div className="mb-4">
                    <h3 className="text-3xl font-serif font-medium text-stone-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-stone-900">
                         {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                    </div>
                     <p className="text-xs text-stone-400 mt-1">
                        {
                            plan.name === 'Free' ? 'Free for everyone' :
                            billingCycle === 'yearly' ? 'Per month, billed annually' : 'Per month, billed monthly'
                        }
                     </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCheckout(plan.planId, plan.name)}
                    disabled={!!checkoutLoading}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 mb-8 cursor-pointer
                      ${plan.highlighted
                        ? 'bg-stone-900 text-white hover:bg-stone-800'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {checkoutLoading === plan.name ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        plan.cta
                    )}
                  </button>

                  {/* Features */}
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-stone-600">
                        <svg className="w-5 h-5 text-stone-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <p className="text-stone-400 text-sm">
                Secure payment processing by
                <span className="mx-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-700">
                  {/* Paddle Brand Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="6" fill="#18181B" />
                    <path d="M12 6L13.4 10.6L18 12L13.4 13.4L12 18L10.6 13.4L6 12L10.6 10.6L12 6Z" fill="#FACC15" />
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
      <Footer />
    </div>
  );
}
