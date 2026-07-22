"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, MessageSquare, User, Settings, LogOut, Scan, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "History", href: "/history", icon: History },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "Chat", href: "/chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-6 h-[calc(100vh-48px)] ml-6 shrink-0 z-40 flex flex-col justify-between vision-card !bg-black/40 border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-[24px] overflow-visible"
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-brandAccent transition-colors z-50 shadow-md"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <div className="flex flex-col h-full relative z-10">
        {/* Header / Logo */}
        <div className="p-6 pb-2">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Go to Landing Page">
            <div className="w-10 h-10 rounded-xl bg-brandAccent/10 border border-brandAccent/30 flex items-center justify-center shrink-0 group-hover:bg-brandAccent/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]">
              <Scan className="w-5 h-5 text-brandAccent" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="font-display text-xl font-black uppercase tracking-widest text-white">
                    VisionIQ
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex items-center group"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brandAccent/10 border border-brandAccent/20 rounded-xl shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={cn(
                  "relative z-10 flex items-center gap-4 px-4 py-3.5 w-full rounded-xl transition-colors",
                  isActive ? "text-brandAccent" : "text-white/40 hover:text-white hover:bg-white/5"
                )}>
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]")} />
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-xs font-bold tracking-widest uppercase overflow-hidden whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer / User Area */}
        <div className="p-4 space-y-2 border-t border-white/5">
          <Link
            href="/settings"
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors group"
          >
            <Settings className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-45" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xs font-bold tracking-widest uppercase overflow-hidden whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-colors group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xs font-bold tracking-widest uppercase overflow-hidden whitespace-nowrap"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className="mt-4 flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-brandAccent/20 flex items-center justify-center shrink-0 text-brandAccent font-bold text-sm">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap flex-1"
                >
                  <p className="text-xs font-bold text-white truncate">{user?.full_name || "User"}</p>
                  <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
