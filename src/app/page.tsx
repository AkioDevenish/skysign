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

import { getAuditStats } from "../lib/auditTrail";

// Premium "Sky Sign" Hand Animation


export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [_signatureCount, setSignatureCount] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [liveUsers, setLiveUsers] = useState<{ id: string; imageUrl: string; firstName: string | null }[]>([]);
  const [userCount, setUserCount] = useState(0);

  // Load real stats and users on mount
  useEffect(() => {
    const stats = getAuditStats();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignatureCount(stats.totalCreated);
    
    // Use demo user data
    // Use demo user data with random face avatars
    setLiveUsers([
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64', firstName: 'Claire' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64', firstName: 'Carlos' },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64', firstName: 'Aisha' },
      { id: '4', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64', firstName: 'Jordan' },
    ]);
    setUserCount(128);
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
      await openPaddleCheckout({
        customerEmail: user.primaryEmailAddress?.emailAddress,
        clerkUserId: user.id,
        planId,
        billingCycle,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to open checkout. Please try again.');
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
      monthlyPrice: "$12",
      yearlyPrice: "$108",
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
      cta: "Get Started",
      highlighted: true,
      comingSoon: false,
    },
    {
      name: "Pro Plus",
      planId: "proplus",
      monthlyPrice: "$39.99",
      yearlyPrice: "$359",
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
      cta: "Get Started",
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

                {/* Live users display */}
                <div className="flex items-center gap-6 pt-6 border-t border-stone-200">
                  <p className="text-sm text-stone-400">Trusted by professionals:</p>
                  <div className="flex -space-x-2">
                    {liveUsers.slice(0, 4).map((user) => (
                      <div key={user.id} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-stone-200 overflow-hidden relative group">
                        {user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.firstName || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-stone-600">
                            {user.firstName?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                    ))}
                    {userCount > 4 && (
                      <div className="w-8 h-8 rounded-full bg-stone-900 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                        +{userCount - 4}
                      </div>
                    )}
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
              <p className="text-stone-500 max-w-lg mx-auto text-lg leading-relaxed mb-10">
                Scale as you grow. Start with our generous free tier and upgrade as your needs evolve.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-16">
                <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-stone-900' : 'text-stone-400'}`}>Monthly</span>
                <button
                  onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-14 h-7 bg-stone-200 rounded-full p-1 transition-colors hover:bg-stone-300"
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
            {/* Pricing Cards */}
            <div className="flex flex-col md:flex-row justify-center gap-6 lg:gap-8 items-stretch">
              {pricingTiers.map((plan, idx) => (
                <div
                  key={plan.name}
                  className={`relative group rounded-[2.5rem] p-8 lg:p-10 transition-all duration-500 flex flex-col flex-1 ${plan.highlighted
                    ? 'bg-white shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20 scale-[1.02] lg:scale-[1.05] z-20'
                    : 'bg-white/60 backdrop-blur-xl border border-stone-200/60 hover:border-stone-400 hover:shadow-xl hover:shadow-stone-200/30 z-10'
                    }`}
                >
                  {/* Highlight Glow for Pro */}
                  {plan.highlighted && (
                    <div className="absolute -inset-[1px] rounded-[2.5rem] bg-gradient-to-b from-emerald-500/20 to-transparent opacity-50 pointer-events-none" />
                  )}

                  {/* Popular Badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                      <span className="px-5 py-1.5 bg-stone-900 text-white text-[10px] tracking-widest font-bold rounded-full shadow-lg border border-stone-700 uppercase">
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-8 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold tracking-tight text-stone-900">
                        {plan.name}
                      </h3>
                      {plan.highlighted && !plan.comingSoon && (
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-base leading-relaxed text-stone-500">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl lg:text-6xl font-bold tracking-tighter text-stone-900">
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                      <span className="text-stone-500 font-medium">
                        /{plan.period === 'forever' ? 'forever' : billingCycle === 'yearly' && plan.name !== 'Free' ? 'yr' : 'mo'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && plan.name !== 'Free' && (
                      <p className="text-[10px] text-stone-400 font-medium mt-1 uppercase tracking-wider">
                        Billed annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto mb-12">
                    <button
                      onClick={() => handleCheckout(plan.planId, plan.name)}
                      disabled={checkoutLoading === plan.name || plan.comingSoon}
                      className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer group/btn 
                        ${plan.comingSoon
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : plan.highlighted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
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
                  <div className="pt-8 border-t border-stone-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-stone-400">
                      What&apos;s included
                    </p>
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm group/item">
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-600">
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
