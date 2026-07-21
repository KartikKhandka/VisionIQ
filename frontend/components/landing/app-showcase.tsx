"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scan, CheckCircle2, FileText, AlertTriangle, Search, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    id: 0,
    subtitle: "Feature One",
    title: "Point. Scan. Done.",
    description: "No barcodes required. Simply point your camera at any appliance, and the VisionIQ engine analyzes its shape, branding, and features to identify the exact make and model in seconds.",
  },
  {
    id: 1,
    subtitle: "Feature Two",
    title: "Instant Manuals",
    description: "Access the exact PDF manual for your appliance instantly. No more digging through drawers or endless Google searches for obscure model numbers.",
  },
  {
    id: 2,
    subtitle: "Feature Three",
    title: "Error Decoding",
    description: "Is your washer flashing 'E20'? Just type in or scan the error code to instantly see what it means and how to fix it step-by-step.",
  }
];

export function AppShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-cycle tabs
  useEffect(() => {
    const duration = 6000; // 6 seconds per tab
    const interval = 50; // Update progress every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((current) => (current + 1) % FEATURES.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      {/* Tabs */}
      <div className="flex flex-col gap-2">
        {FEATURES.map((feature, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={feature.id}
              onClick={() => handleTabClick(index)}
              className={`relative rounded-md p-6 cursor-pointer transition-all duration-300 overflow-hidden ${
                isActive 
                  ? "bg-brandAccent/5 border border-brandAccent/20" 
                  : "border border-white/5 hover:bg-white/[0.02] opacity-50 hover:opacity-100"
              }`}
            >
              {/* Progress Bar (Only for active tab) */}
              {isActive && (
                <div className="absolute top-0 left-0 h-1 bg-brandAccent/20 w-full">
                  <div 
                    className="h-full bg-brandAccent transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-brandAccent rounded-r-sm" 
                />
              )}

              <div className={`text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5 ${isActive ? "text-brandAccent" : "text-white/30"}`}>
                {feature.subtitle}
              </div>
              <div className={`font-display text-2xl font-black uppercase leading-none ${isActive ? "text-white mb-3" : "text-white/60"}`}>
                {feature.title}
              </div>
              
              <AnimatePresence>
                {isActive && (
                  <motion.p 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-sm text-white/60 leading-relaxed"
                  >
                    {feature.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Phone Mockup */}
      <PhoneMockupContent activeIndex={activeIndex} progress={progress} />
    </div>
  );
}

function PhoneMockupContent({ activeIndex, progress }: { activeIndex: number, progress: number }) {
  // For the scanning animation, we tie its state to the progress of the first tab
  // 0-33%: Idle, 33-66%: Scanning, 66-100%: Identified
  const scanState = activeIndex === 0 
    ? (progress < 30 ? 0 : progress < 70 ? 1 : 2)
    : 0;

  return (
    <div className="relative w-[280px] h-[580px] shrink-0 mx-auto">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Phone Hardware */}
      <div className="relative w-full h-full bg-[#0A0A0A] rounded-[40px] border-[1.5px] border-white/10 p-[14px] shadow-[0_60px_120px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)] z-10 overflow-hidden">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-[#0A0A0A] rounded-b-[18px] z-20 flex items-center justify-center">
          <div className="w-[40px] h-[4px] rounded-full bg-[#1A1A1A]" />
        </div>

        {/* Screen Content */}
        <div className="relative w-full h-full bg-black rounded-[28px] overflow-hidden pt-10 px-4 pb-6 flex flex-col">
          {/* Status Bar */}
          <div className="absolute top-3 left-6 right-6 flex justify-between items-center z-10">
            <span className="font-mono text-[10px] font-semibold text-white/50">9:41</span>
            <div className="w-[16px] h-[8px] border border-white/40 rounded-[2px] relative">
              <div className="absolute inset-[1px] bg-white/70 w-[75%]" />
            </div>
          </div>

          <div className="flex flex-col h-full relative">
            <AnimatePresence mode="wait">
              {activeIndex === 0 && <ScanningScreen key="scan" scanState={scanState} />}
              {activeIndex === 1 && <ManualsScreen key="manuals" />}
              {activeIndex === 2 && <ErrorScreen key="errors" />}
            </AnimatePresence>

            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/20 rounded-full shrink-0 z-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanningScreen({ scanState }: { scanState: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="mb-4">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-brandAccent mb-1">
          AI Appliance Scanner
        </div>
        <div className="font-display text-2xl font-black uppercase text-white leading-tight">
          Point & Scan
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full h-[220px] bg-zinc-900 rounded-xl overflow-hidden border border-white/5 shadow-2xl mb-4 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black" />
        
        {/* Fake Appliance Image */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center opacity-40"
          animate={{ scale: scanState === 1 ? 1.05 : 1 }}
          transition={{ duration: 2 }}
        >
          <div className="w-[80px] h-[120px] bg-zinc-700 rounded-lg flex flex-col items-center pt-2">
            <div className="w-[60px] h-[30px] bg-zinc-600 rounded-t-lg" />
            <div className="w-[50px] h-[70px] bg-zinc-800 rounded-b-xl mt-1" />
          </div>
        </motion.div>

        {/* Viewfinder Corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-brandAccent" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-brandAccent" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-brandAccent" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-brandAccent" />

        {/* Scanning Animation */}
        {scanState === 1 && (
          <div className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-brandAccent to-transparent shadow-[0_0_8px_#06b6d4] animate-scan-line" />
        )}

        {/* Result Badge */}
        {scanState === 2 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-green-500/15 border border-green-500/40 rounded-full px-3 py-1 flex items-center gap-1.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-[9px] font-bold tracking-widest uppercase text-green-500">
              Identified
            </span>
          </motion.div>
        )}
      </div>

      {/* Information Card */}
      <div className="flex-1">
        {scanState === 2 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-brandAccent/30 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm font-bold text-white leading-tight">Breville Barista Express</div>
                <div className="text-[10px] text-white/50 mt-1">98% Match Confidence</div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-[4px] h-[4px] rounded-full bg-brandAccent" />
                <div className="text-xs text-white/70">Manual Available</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[4px] h-[4px] rounded-full bg-brandAccent" />
                <div className="text-xs text-white/70">Requires Cleaning Cycle</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-4 opacity-50"
          >
            <Scan className="w-8 h-8 text-white/30 mb-3" />
            <div className="text-xs text-white/60">Center appliance in frame to identify model and fetch manuals.</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ManualsScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-brandAccent mb-1">
          Library
        </div>
        <div className="font-display text-2xl font-black uppercase text-white leading-tight">
          Manuals
        </div>
      </div>

      <div className="space-y-3">
        {[
          { title: "Breville Barista Express", type: "User Manual", pages: 42 },
          { title: "Dyson V11 Absolute", type: "Quick Start", pages: 12 },
          { title: "LG Washer WM3400CW", type: "Service Guide", pages: 104 }
        ].map((doc, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 items-center"
          >
            <div className="w-10 h-10 rounded-lg bg-brandAccent/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-brandAccent" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{doc.title}</div>
              <div className="text-[10px] text-white/50 flex gap-2 mt-0.5">
                <span>{doc.type}</span>
                <span>•</span>
                <span>{doc.pages} pages</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ErrorScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-brandAccent mb-1">
          Diagnostics
        </div>
        <div className="font-display text-2xl font-black uppercase text-white leading-tight">
          Errors
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/30" />
        </div>
        <input 
          type="text" 
          value="E20" 
          readOnly
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandAccent/50" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <div className="text-sm font-bold text-red-400">Drainage Issue Detected</div>
        </div>
        <p className="text-xs text-white/70 leading-relaxed mb-4">
          The washer is unable to drain water. This is typically caused by a clogged filter or a kinked drain hose.
        </p>
        <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Fix Steps:</div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-white/10 text-[9px] flex items-center justify-center font-bold shrink-0">1</div>
            <div className="text-xs text-white/80">Turn off and unplug washer</div>
          </div>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full bg-white/10 text-[9px] flex items-center justify-center font-bold shrink-0">2</div>
            <div className="text-xs text-white/80">Locate drain filter at bottom right</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
