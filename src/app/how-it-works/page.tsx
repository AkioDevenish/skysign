'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import FadeContent from "@/components/reactbits/FadeContent";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden relative selection:bg-stone-900 selection:text-stone-50">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <section id="how-it-works" className="px-8 lg:px-12 relative z-10">
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
                <SpotlightCard className="bg-white rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-50/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                  <div className="flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="text-6xl">👆</span>
                  </div>
                  <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 01</span>
                  <h3 className="text-2xl font-semibold text-stone-900 mb-3">Point</h3>
                  <p className="text-stone-500 leading-relaxed">
                    Hold your index finger up for 1 second to start drawing
                  </p>
                </SpotlightCard>

                <SpotlightCard className="bg-white rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-50/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                  <div className="flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="text-6xl">✊</span>
                  </div>
                  <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 02</span>
                  <h3 className="text-2xl font-semibold text-stone-900 mb-3">Stop</h3>
                  <p className="text-stone-500 leading-relaxed">
                    Make a fist for 1 second to pause or stop drawing
                  </p>
                </SpotlightCard>

                <SpotlightCard className="bg-white rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-50/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
                  <div className="flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="text-6xl">👍</span>
                  </div>
                  <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-3 block">Step 03</span>
                  <h3 className="text-2xl font-semibold text-stone-900 mb-3">Save</h3>
                  <p className="text-stone-500 leading-relaxed">
                    Thumbs up for 1 second to save your signature
                  </p>
                </SpotlightCard>

                <SpotlightCard className="bg-white rounded-3xl p-10 h-full border border-stone-200/60 group hover:bg-stone-50/50 transition-colors" spotlightColor="rgba(0, 0, 0, 0.03)">
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
      </main>
      
      <Footer />
    </div>
  );
}
