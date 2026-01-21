'use client';

import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import BlurText from "@/components/reactbits/BlurText";
import DecryptedText from "@/components/reactbits/DecryptedText";
import TiltedCard from "@/components/reactbits/TiltedCard";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import FadeContent from "@/components/reactbits/FadeContent";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string, planName: string) => {
    if (planName === 'Free') {
      // Free plan - just go to create
      window.location.href = '/create';
      return;
    }

    if (planName === 'Team') {
      // Team plan - go to support/contact
      window.location.href = '/support';
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
      description: "Perfect for trying out Sky Sign",
      features: [
        "5 signatures per month",
        "Basic gesture controls",
        "Standard export (PNG)",
        "Community support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      planId: "pro",
      price: "$9",
      period: "per month",
      description: "For professionals who sign daily",
      features: [
        "Unlimited signatures",
        "Advanced gesture controls",
        "HD export (PNG, SVG, PDF)",
        "Priority support",
        "Custom signature styles",
        "Cloud backup",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Team",
      planId: "team",
      price: "$29",
      period: "per month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Team management",
        "API access",
        "Audit logs",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      highlighted: false,
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
              <SignInButton mode="modal">
                <button className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="px-6 py-2.5 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/10"
              >
                Try Free
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
      <section className="pt-40 pb-32 px-8 lg:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <FadeContent>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-16">
              {/* Left side - Main content */}
              <div className="lg:max-w-2xl">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-stone-100 rounded-full mb-10 border border-stone-200">
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

                <p className="text-lg md:text-xl text-stone-500 max-w-xl mb-12 leading-relaxed">
                  Transform your signature into digital art using just your camera.
                  Point, draw in the air, and save. It&apos;s that simple.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link
                    href="/create"
                    className="px-8 py-4 bg-stone-900 text-stone-50 rounded-full font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 hover:shadow-xl hover:shadow-stone-900/25 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Start Signing Free
                  </Link>
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
      <section id="pricing" className="py-32 px-8 lg:px-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <FadeContent>
            <div className="text-center mb-20">
              <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4 block">Pricing</span>
              <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6">
                Simple, transparent pricing
              </h2>
              <p className="text-stone-500 max-w-xl mx-auto text-lg">
                Start free, upgrade when you need more. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan) => (
                <div key={plan.name} className="h-full">
                  <TiltedCard
                    containerHeight="100%"
                    containerWidth="100%"
                    rotateAmplitude={4}
                    scaleOnHover={1.02}
                    showTooltip={false}
                    displayOverlayContent={false}
                    className="h-full"
                  >
                    <div
                      className={`relative p-8 lg:p-10 rounded-3xl h-full transition-all cursor-pointer border ${plan.highlighted
                        ? "bg-stone-900 text-stone-50 border-stone-900 shadow-2xl shadow-stone-900/20"
                        : "bg-white text-stone-900 border-stone-200/80 hover:border-stone-300"
                        } ${selectedPlan === plan.name ? "ring-2 ring-stone-900 ring-offset-2" : ""}`}
                      onClick={() => setSelectedPlan(plan.name)}
                    >
                      {plan.highlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <span className="px-5 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="mb-8">
                        <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? "text-stone-50" : "text-stone-900"}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-sm ${plan.highlighted ? "text-stone-400" : "text-stone-500"}`}>
                          {plan.description}
                        </p>
                      </div>

                      <div className="mb-8">
                        <span className={`text-5xl font-bold ${plan.highlighted ? "text-stone-50" : "text-stone-900"}`}>
                          {plan.price}
                        </span>
                        <span className={`text-sm ml-2 ${plan.highlighted ? "text-stone-400" : "text-stone-500"}`}>
                          {plan.period}
                        </span>
                      </div>

                      <ul className="space-y-4 mb-10">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <svg
                              className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-emerald-400" : "text-emerald-600"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className={`text-sm ${plan.highlighted ? "text-stone-300" : "text-stone-600"}`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckout(plan.planId, plan.name);
                        }}
                        disabled={checkoutLoading === plan.name}
                        className={`w-full py-4 rounded-full font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed ${plan.highlighted
                          ? "bg-stone-50 text-stone-900 hover:bg-white"
                          : "bg-stone-900 text-stone-50 hover:bg-stone-800"
                          }`}
                      >
                        {checkoutLoading === plan.name ? 'Processing...' : plan.cta}
                      </button>
                    </div>
                  </TiltedCard>
                </div>
              ))}
            </div>
          </FadeContent>
        </div>
      </section>

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
