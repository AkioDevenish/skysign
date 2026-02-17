'use client';

import { motion } from "framer-motion";
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeContent from "@/components/reactbits/FadeContent";
import { Hand, ThumbsUp, Camera, Zap, ScanFace, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function HowItWorks() {
  // Custom Grab/Fist icon since it's not exported in the available lucide version
  const ClosedFistIcon = ({ className, strokeWidth = 1.5 }: { className?: string, strokeWidth?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M14 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M22 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M22 11v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L6 14" />
    </svg>
  );

  const IndexFingerIcon = ({ className, strokeWidth = 1.5 }: { className?: string, strokeWidth?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M14 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 11V3a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M22 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M22 11v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L6 14" />
    </svg>
  );

  const steps = [
    {
      id: "01",
      title: "Point to Draw",
      description: "Extend your index finger to start drawing. specific landmark tracking follows your fingertip with precision.",
      icon: IndexFingerIcon,
      gesture: "Index Finger Up",
      color: "bg-blue-500",
      tip: "Keep your movement smooth for the best curves."
    },
    {
      id: "02",
      title: "Pause or Stop",
      description: "Need to lift the 'pen'? simply make a fist. The tracking stops, allowing you to reposition your hand without drawing a line.",
      icon: ClosedFistIcon,
      gesture: "Closed Fist",
      color: "bg-amber-500",
      tip: "Perfect for crossing t's or dotting i's."
    },
    {
      id: "03",
      title: "Save Signature",
      description: "Happy with your signature? Flash a thumbs-up to instantly save it. It will be converted to a high-quality vector path.",
      icon: ThumbsUp,
      gesture: "Thumbs Up",
      color: "bg-blue-600",
      tip: "Hold the gesture for about 1 second."
    },
    {
      id: "04",
      title: "Clear & Retry",
      description: "Want to start over? Show an open palm to clear the canvas instantly. No buttons to click, just natural movement.",
      icon: Hand,
      gesture: "Open Palm",
      color: "bg-red-500",
      tip: "The fastest way to iterate until perfection."
    }
  ];

  const techFeatures = [
    {
      icon: Camera,
      title: "Computer Vision",
      desc: "Uses your device's camera to track hand landmarks in real-time."
    },
    {
      icon: ScanFace,
      title: "Gesture Recognition",
      desc: "Instantaneously identifies hand states (Paper, Rock, Pointing)."
    },
    {
      icon: Zap,
      title: "Vector Smoothing",
      desc: "Raw tracking data is smoothed into beautiful, spline-based curves."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden selection:bg-stone-900 selection:text-stone-50 font-sans">
      <Navbar />

      <main className="pt-32 pb-20">
        
        {/* Hero Section */}
        <section className="px-8 lg:px-12 mb-32 relative">
           {/* Abstract Background */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-stone-100 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4 opacity-60" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4 opacity-60" />

          <div className="max-w-4xl mx-auto text-center">
            <FadeContent>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-200 shadow-sm mb-8">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-stone-600 tracking-wide uppercase">The Technology</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-stone-900">
                Master the Art of <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-blue-800 to-stone-900">Air Signing</span>
              </h1>
              
              <p className="text-xl text-stone-500 leading-relaxed max-w-2xl mx-auto mb-12">
                No stylus required. SkySign uses advanced computer vision to turn your hand into a digital pen. Here&apos;s exactly how it works.
              </p>
            </FadeContent>
          </div>
        </section>

        {/* Tech Stack Grid */}
        <section className="px-8 lg:px-12 mb-40">
           <div className="max-w-6xl mx-auto">
             <div className="grid md:grid-cols-3 gap-8">
               {techFeatures.map((feature, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
                 >
                   <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 text-stone-900">
                     <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                   </div>
                   <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                   <p className="text-stone-500 leading-relaxed text-sm">{feature.desc}</p>
                 </motion.div>
               ))}
             </div>
           </div>
        </section>

        {/* The Steps - Vertical Layout */}
        <section className="px-8 lg:px-12 mb-40">
          <div className="max-w-5xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Gesture Language</h2>
              <p className="text-stone-500">Four simple gestures control your entire experience.</p>
            </div>

            <div className="space-y-24 relative">
              {/* Connecting Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 -z-10 hidden md:block" />

              {steps.map((step, idx) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`flex flex-col md:flex-row gap-12 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Visual Side */}
                  <div className="flex-1 w-full">
                     <div className={`aspect-video rounded-3xl overflow-hidden relative group bg-stone-100 border border-stone-200 flex items-center justify-center`}
                        style={{
                          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                          backgroundSize: '24px 24px'
                        }}
                     >
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-100/50 to-transparent" />
                        
                        {/* Icon Container with Glow */}
                        <div className="relative">
                           <div className={`absolute inset-0 ${step.color} blur-[60px] opacity-20`} />
                           <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                              <step.icon className={`w-10 h-10 ${step.color.replace('bg-', 'text-')}`} strokeWidth={1.5} />
                           </div>
                        </div>

                        {/* Gesture Label Badge */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-stone-200/50 shadow-sm text-xs font-semibold uppercase tracking-wider text-stone-500">
                          {step.gesture}
                        </div>
                     </div>
                  </div>

                  {/* Text Side */}
                  <div className="flex-1 relative">
                    {/* Step Number Badge */}
                    <div className="absolute -top-12 left-0 md:static md:mb-6">
                       <span className="text-6xl font-bold text-stone-300 font-serif leading-none select-none">
                         {step.id}
                       </span>
                    </div>

                    <h3 className="text-3xl font-bold mb-4 text-stone-900">{step.title}</h3>
                    <p className="text-lg text-stone-500 leading-relaxed mb-8">
                      {step.description}
                    </p>

                    <div className="flex items-start gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                       <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-3 h-3 text-blue-600" />
                       </div>
                       <div>
                         <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Pro Tip</span>
                         <p className="text-sm text-stone-600 font-medium">{step.tip}</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-8 lg:px-12">
           <div className="max-w-4xl mx-auto">
             <div className="bg-stone-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stone-700/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Ready to define your <br/> digital signature?
                  </h2>
                  <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto">
                    Join thousands of professionals who have switched to the most intuitive way to sign documents. No hardware needed.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                      href="/create" 
                      className="px-8 py-4 bg-white text-stone-900 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center gap-2"
                    >
                      Start Signing Free <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
             </div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
