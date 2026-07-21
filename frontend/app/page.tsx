"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Marquee } from "@/components/landing/marquee";
import { AppShowcase } from "@/components/landing/app-showcase";
import { Scan, Zap, BookOpen, Clock, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] overflow-hidden selection:bg-brandAccent/30 selection:text-brandAccent">
      
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-md bg-brandAccent/10 border border-brandAccent/30 flex items-center justify-center group-hover:bg-brandAccent/20 transition-colors">
            <Scan className="w-3.5 h-3.5 text-brandAccent" />
          </div>
          <span className="font-display text-base font-black uppercase tracking-wider text-white">
            VisionIQ
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-xs font-bold tracking-widest uppercase text-white/40 hover:text-brandAccent transition-colors">Features</Link>
          <Link href="#showcase" className="text-xs font-bold tracking-widest uppercase text-white/40 hover:text-brandAccent transition-colors">Showcase</Link>
          <Link href="#philosophy" className="text-xs font-bold tracking-widest uppercase text-white/40 hover:text-brandAccent transition-colors">Philosophy</Link>
        </div>
        <Link 
          href="/register" 
          className="bg-brandAccent hover:bg-brandAccent-light text-black text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 transition-all"
        >
          Get Started
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15)_0%,transparent_60%)] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 bg-brandAccent/10 border border-brandAccent/20 rounded-md px-3.5 py-1.5 mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-brandAccent animate-pulse-glow" />
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-brandAccent">
              VisionIQ 2.0 Engine Live
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-display text-[clamp(44px,7vw,84px)] font-black uppercase leading-[0.95] tracking-tight text-white mb-6"
          >
            Most appliances are<br/>too complex.<br/>
            <span className="text-brandAccent">We make them simple.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-[clamp(15px,1.5vw,18px)] line-height-[1.75] text-white/60 max-w-2xl mx-auto mb-12"
          >
            Stop hunting for physical manuals. Point your camera, let the AI identify your device, and instantly access maintenance guides, troubleshooting steps, and exact part numbers. <strong>The ultimate digital toolkit for your home.</strong>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/register" 
              className="bg-brandAccent text-black text-sm font-bold tracking-[0.08em] uppercase px-10 py-4 rounded-full shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.55)] hover:scale-105 transition-all w-full sm:w-auto"
            >
              Start Scanning
            </Link>
            <Link 
              href="#showcase" 
              className="bg-transparent border border-white/10 text-white/60 text-sm font-bold tracking-[0.08em] uppercase px-10 py-4 rounded-full hover:border-white/40 hover:text-white transition-all w-full sm:w-auto"
            >
              See It Work
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee items={["AI Identification", "Instant Manuals", "Smart Diagnostics", "Error Code Decoder", "Part Sourcing", "Maintenance Tracking"]} />

      {/* ── APP SHOWCASE ── */}
      <section id="showcase" className="relative py-32 px-6 bg-[#070707] border-y border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-[1px] bg-brandAccent" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-brandAccent">The Engine</span>
              <div className="w-6 h-[1px] bg-brandAccent" />
            </div>
            <h2 className="font-display text-[clamp(40px,5vw,64px)] font-black uppercase leading-[0.92] text-white">
              An App That<br/>
              <span className="text-brandAccent">Does The Thinking.</span>
            </h2>
          </div>

          <AppShowcase />
        </div>
      </section>

      {/* ── PHILOSOPHY / FEATURES GRID ── */}
      <section id="features" className="py-32 px-6 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-[2px] bg-white/5 border border-white/5 rounded-lg overflow-hidden p-[2px]">
            {/* Card 1 */}
            <div className="bg-[#111111] p-10 relative overflow-hidden group hover:bg-[#141414] transition-colors border border-transparent hover:border-brandAccent/20">
              <div className="text-ghost text-[80px] font-black absolute top-[-10px] right-4 leading-none transition-transform group-hover:-translate-y-2">01</div>
              <div className="w-12 h-12 bg-brandAccent/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-5 h-5 text-brandAccent" />
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-white leading-[1.1] mb-3">Instant Recognition</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Powered by state-of-the-art vision models, VisionIQ recognizes thousands of household appliances, tools, and electronics instantly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#111111] p-10 relative overflow-hidden group hover:bg-[#141414] transition-colors border border-transparent hover:border-brandAccent/20">
              <div className="text-ghost text-[80px] font-black absolute top-[-10px] right-4 leading-none transition-transform group-hover:-translate-y-2">02</div>
              <div className="w-12 h-12 bg-brandAccent/10 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-5 h-5 text-brandAccent" />
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-white leading-[1.1] mb-3">Contextual Guides</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Get more than just a PDF. The AI extracts the exact troubleshooting steps or maintenance routines you need, right when you need them.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#111111] p-10 relative overflow-hidden group hover:bg-[#141414] transition-colors border border-transparent hover:border-brandAccent/20">
              <div className="text-ghost text-[80px] font-black absolute top-[-10px] right-4 leading-none transition-transform group-hover:-translate-y-2">03</div>
              <div className="w-12 h-12 bg-brandAccent/10 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-5 h-5 text-brandAccent" />
              </div>
              <h3 className="font-display text-2xl font-black uppercase text-white leading-[1.1] mb-3">Save Time</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                No more digging through dusty drawers or endless Google searches for a specific model number. Your digital home manual is always ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full">
        <div className="relative bg-[linear-gradient(135deg,rgba(6,182,212,0.08)_0%,rgba(6,182,212,0.02)_100%)] border border-brandAccent/20 rounded-xl p-12 md:p-20 text-center shadow-[0_0_100px_rgba(6,182,212,0.06)] overflow-hidden group">
          <div className="absolute inset-0 bg-brandAccent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h2 className="relative z-10 font-display text-[clamp(32px,4vw,56px)] font-black uppercase leading-tight text-white mb-6">
            Stop Guessing.<br/>
            <span className="text-brandAccent">Start Scanning.</span>
          </h2>
          <p className="relative z-10 text-white/60 text-sm md:text-base max-w-md mx-auto mb-10">
            Join the beta and be among the first to experience the future of appliance management.
          </p>
          <Link 
            href="/register" 
            className="relative z-10 inline-flex items-center gap-3 bg-brandAccent text-black text-sm font-bold tracking-[0.08em] uppercase px-12 py-5 rounded-full shadow-[0_0_60px_rgba(6,182,212,0.45)] hover:scale-105 hover:bg-brandAccent-light transition-all"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-white/30" />
          <span className="font-display text-sm font-black uppercase text-white/30">VisionIQ</span>
        </div>
        <div className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} VisionIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

