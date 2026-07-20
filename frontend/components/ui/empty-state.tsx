import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-3xl glass-card p-10 text-center relative overflow-hidden group",
        className
      )}
      {...props}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
      
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] mb-6 group-hover:scale-105 transition-transform duration-500 shadow-sm">
        <Icon className="h-10 w-10 text-indigo-400 group-hover:text-purple-400 transition-colors" strokeWidth={1.5} />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
      </div>
      
      <h3 className="mb-3 text-2xl font-bold tracking-tight text-slate-100 relative z-10">{title}</h3>
      <p className="mb-8 max-w-sm text-base text-slate-400 font-medium relative z-10">
        {description}
      </p>
      
      {action && <div className="relative z-10">{action}</div>}
    </div>
  )
}
