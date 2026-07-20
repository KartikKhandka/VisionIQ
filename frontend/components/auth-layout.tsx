import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"

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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Dynamic ambient core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "w-full max-w-[420px] overflow-hidden glass-panel p-8 sm:p-10 relative z-10 rounded-[24px] border-t-white/10 border-l-white/10 shadow-2xl shadow-black/80",
          className
        )}
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-candyApple to-candyApple-dark text-white shadow-[0_8px_32px_rgba(255,8,0,0.3)] border border-red-500/30">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
          <p className="text-muted text-[15px] max-w-[280px] mx-auto">{subtitle}</p>
        </div>
        {children}
      </motion.div>

      {/* Footer text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-muted-2 text-[13px] font-medium tracking-wide">
          POWERED BY <span className="text-muted font-bold ml-1">VISIONIQ AI</span>
        </p>
      </div>
    </div>
  )
}
