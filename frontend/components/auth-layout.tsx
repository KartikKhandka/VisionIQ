import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import Image from "next/image"

export function AuthLayout({
  children,
  title,
  subtitle,
  className
}: {
  children: React.ReactNode
  title: string
  subtitle: string
  className?: string
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#0A0A0A] selection:bg-brandAccent/30 selection:text-brandAccent">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1)_0%,transparent_60%)] z-0 pointer-events-none" />
      
      {/* Dynamic ambient core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brandAccent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "w-full max-w-[420px] overflow-hidden bg-white/5 backdrop-blur-xl p-8 sm:p-10 relative z-10 rounded-[24px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]",
          className
        )}
      >
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="mx-auto mb-8 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-brandAccent/30 bg-brandAccent/10 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-brandAccent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
            <Eye className="w-10 h-10 text-brandAccent group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="font-display text-[clamp(28px,4vw,36px)] font-black uppercase leading-[0.95] tracking-tight text-white mb-2">{title}</h1>
          <p className="text-white/60 text-sm max-w-[280px] mx-auto">{subtitle}</p>
        </div>
        {children}
      </motion.div>

      {/* Footer text */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
          POWERED BY <span className="text-brandAccent ml-1">VISIONIQ AI</span>
        </p>
      </div>
    </div>
  )
}
