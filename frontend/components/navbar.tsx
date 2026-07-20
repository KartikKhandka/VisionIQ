"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, Upload, MessageSquare, User, Settings, Menu, X, Bell, BookOpen, Search, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "History", href: "/history", icon: History },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "Chat", href: "/chat", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/history?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass-navbar shadow-lg shadow-black/10"
          : "bg-transparent border-b border-white/[0.04]"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Go to VisionIQ Home">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-glow group-hover:shadow-glow-lg transition-shadow">
                V
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-100 hidden sm:block">VisionIQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 mx-4" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold transition-colors rounded-full",
                    isActive ? "text-indigo-300" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-full -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search scans, chats..." 
              className="w-full glass-input rounded-full py-2 pl-10 pr-4 text-sm font-medium"
              aria-label="Global Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden xl:inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-medium text-slate-500 bg-white/[0.04] border border-white/[0.08] rounded">⌘</kbd>
              <kbd className="hidden xl:inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-medium text-slate-500 bg-white/[0.04] border border-white/[0.08] rounded">K</kbd>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-10 w-10 rounded-full transition-colors",
                  isNotifOpen ? "bg-white/[0.08] text-candyApple" : "text-slate-400 hover:text-candyApple hover:bg-white/[0.04]"
                )}
                aria-label="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-candyApple"></span>
              </Button>
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl glass-card bg-slate-900/95 backdrop-blur-xl shadow-xl overflow-hidden py-1 z-50 origin-top-right border border-white/[0.08]"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Notifications</p>
                      <span className="text-xs text-candyApple font-medium cursor-pointer">Mark all as read</span>
                    </div>
                    <div className="py-6 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-5 h-5 text-muted" />
                      </div>
                      <p className="text-sm font-semibold text-white">You&apos;re all caught up</p>
                      <p className="text-xs text-muted mt-1">No new notifications right now.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-6 w-px bg-white/[0.08] mx-1" />
            
            <div className="relative" ref={profileRef}>
              <Button 
                variant="ghost" 
                className="rounded-full pl-2 pr-4 h-10 border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] flex items-center gap-2"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-label="User menu"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                  U
                </div>
                <span className="text-sm font-semibold text-slate-300 hidden xl:block">User</span>
              </Button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-card bg-slate-900/95 backdrop-blur-xl shadow-xl overflow-hidden py-1 z-50 origin-top-right border border-white/[0.08]"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-slate-200">Signed in as User</p>
                      <p className="text-xs text-slate-500 truncate">user@visioniq.com</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.04] hover:text-indigo-300 transition-colors" role="menuitem" onClick={() => setIsProfileOpen(false)}>
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.04] hover:text-indigo-300 transition-colors" role="menuitem" onClick={() => setIsProfileOpen(false)}>
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </div>
                    <div className="py-1 border-t border-white/[0.06]">
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors" role="menuitem" onClick={() => logout()}>
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-300" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-200 hover:bg-white/[0.04] rounded-full"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/[0.06] bg-slate-900/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold transition-colors",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-300"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="h-px bg-white/[0.06] my-2 mx-4" />
              <Link href="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-slate-400 hover:bg-white/[0.04]">
                <User className="h-5 w-5" /> Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-slate-400 hover:bg-white/[0.04]">
                <Settings className="h-5 w-5" /> Settings
              </Link>
              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-red-400 hover:bg-red-500/10 text-left" onClick={() => logout()}>
                <LogOut className="h-5 w-5" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
