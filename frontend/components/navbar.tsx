"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, MessageSquare, User, Settings, Menu, X, Bell, BookOpen, Search, LogOut, Scan, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "History", href: "/history", icon: History },
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
          ? "bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-white/5"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Go to VisionIQ Home">
              <div className="w-8 h-8 rounded-lg bg-brandAccent/10 border border-brandAccent/30 flex items-center justify-center group-hover:bg-brandAccent/20 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Scan className="w-4 h-4 text-brandAccent" />
              </div>
              <span className="font-display text-lg font-black uppercase tracking-wider text-white hidden sm:block">
                VisionIQ
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 mx-4" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-colors",
                    isActive ? "text-brandAccent" : "text-white/40 hover:text-white"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-brandAccent shadow-[0_0_8px_#06b6d4]"
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-brandAccent transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-brandAccent/50 focus:bg-white/[0.07] rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none transition-all placeholder:text-white/30"
              aria-label="Global Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-9 w-9 rounded-full transition-colors",
                  isNotifOpen ? "bg-white/10 text-brandAccent" : "text-white/40 hover:text-brandAccent hover:bg-white/5"
                )}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-brandAccent shadow-[0_0_5px_#06b6d4]"></span>
              </Button>
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 rounded-xl bg-[#111] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden py-1 z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-white">Notifications</p>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-brandAccent cursor-pointer">Mark read</span>
                    </div>
                    <div className="py-6 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-4 h-4 text-white/30" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">You&apos;re all caught up</p>
                      <p className="text-xs text-white/40">No new notifications right now.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-4 w-px bg-white/10 mx-1" />
            
            <div className="relative" ref={profileRef}>
              <Button 
                variant="ghost" 
                className="rounded-full pl-1.5 pr-4 h-9 border border-white/10 hover:border-brandAccent/30 hover:bg-brandAccent/5 flex items-center gap-2"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brandAccent/20 text-brandAccent font-bold text-[10px]">
                  U
                </div>
                <span className="text-xs font-bold text-white hidden xl:block">User</span>
              </Button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden py-1 z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs font-bold text-white">Signed in as User</p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">user@visioniq.com</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-brandAccent transition-colors uppercase tracking-wider" onClick={() => setIsProfileOpen(false)}>
                        <User className="h-3.5 w-3.5" /> Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-brandAccent transition-colors uppercase tracking-wider" onClick={() => setIsProfileOpen(false)}>
                        <Settings className="h-3.5 w-3.5" /> Settings
                      </Link>
                    </div>
                    <div className="py-1 border-t border-white/5">
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider" onClick={() => logout()}>
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-brandAccent">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/5 rounded-full"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="md:hidden border-b border-white/5 bg-[#0A0A0A]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors",
                      isActive
                        ? "bg-brandAccent/10 text-brandAccent border border-brandAccent/20"
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="h-px bg-white/5 my-4 mx-4" />
              <Link href="/profile" className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold tracking-widest uppercase text-white/40 hover:bg-white/5">
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold tracking-widest uppercase text-white/40 hover:bg-white/5">
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold tracking-widest uppercase text-red-400 hover:bg-red-500/10 text-left mt-2" onClick={() => logout()}>
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
