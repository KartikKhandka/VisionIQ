"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Scan, CheckCircle2 } from "lucide-react";

export function PhoneMockup() {
  const [scanState, setScanState] = useState(0);

  useEffect(() => {
    // Sequence: 0=Idle -> 1=Scanning -> 2=Identified -> Loop
    const interval = setInterval(() => {
      setScanState((prev) => (prev + 1) % 3);
    }, 4000); // 4 seconds per state
    return () => clearInterval(interval);
  }, []);

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

          <div className="flex flex-col h-full">
            {/* Header */}
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-brandAccent mb-1">
                AI Appliance Scanner
              </div>
              <div className="font-display text-2xl font-black uppercase text-white leading-tight">
                Point & Scan
              </div>
            </motion.div>

            {/* Camera Viewport */}
            <div className="relative w-full h-[220px] bg-zinc-900 rounded-xl overflow-hidden border border-white/5 shadow-2xl mb-4 shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black" />
              
              {/* Fake Appliance Image (Coffee Maker Silhouette) */}
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

            {/* Home Indicator */}
            <div className="w-[100px] h-[4px] bg-white/20 rounded-full mx-auto mt-auto shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
