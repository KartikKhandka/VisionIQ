"use client";
import { useEffect, useState } from "react";
import { useScans } from "@/hooks/useScans";
import { useAuth } from "@/hooks/useAuth";
import { knowledgeApi } from "@/lib/api";
import { ScanCard } from "@/components/dashboard/ScanCard";
import { Loader2, Zap, MessageSquare, BookOpen, Clock, ArrowRight, Upload, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: scans, isLoading, error } = useScans(0, 100);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await knowledgeApi.getDocuments();
        setDocCount(res.data?.length || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDocs();
  }, []);

  const totalScans = scans?.length || 0;
  const coveragePercent = totalScans > 0 ? Math.min(Math.round((docCount / totalScans) * 100), 100) : 0;


  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-start pt-8"
      >
        <div className="inline-flex items-center gap-2 bg-brandAccent/10 border border-brandAccent/20 rounded-md px-3 py-1 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brandAccent" />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-brandAccent">
            AI Appliance Copilot Active
          </span>
        </div>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] font-black uppercase leading-[0.95] tracking-tight text-white mb-4">
          Welcome back, <br/>
          <span className="text-brandAccent">{user?.full_name?.split(' ')[0] || "User"}.</span>
        </h1>
        <p className="text-white/50 text-base max-w-xl leading-relaxed">
          Your AI workspace is ready. Upload a new appliance image, continue a recent conversation, or explore your indexed knowledge base.
        </p>
      </motion.div>

      {/* Quick Actions (Cursor-like command items) */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link href="/upload" className="group flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-brandAccent/30 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-brandAccent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5 text-brandAccent" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">New Scan</h3>
          <p className="text-xs text-white/40 leading-relaxed">Upload an image to identify an appliance instantly.</p>
        </Link>
        <Link href="/chat" className="group flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-brandAccent/30 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5 text-white/80" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Ask AI</h3>
          <p className="text-xs text-white/40 leading-relaxed">Start a new conversation with the VisionIQ Engine.</p>
        </Link>
        <Link href="/knowledge" className="group flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-brandAccent/30 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5 text-white/80" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Knowledge</h3>
          <p className="text-xs text-white/40 leading-relaxed">Manage manuals and indexed workspace documents.</p>
        </Link>
      </motion.div>

      {/* Two Column Layout for Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
        {/* Left Column: Recent Scans */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Recent Scans</h2>
            <Link href="/history" className="text-xs font-bold text-brandAccent hover:text-brandAccent-light uppercase tracking-widest transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brandAccent" />
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm font-medium">Failed to load scans.</div>
          ) : scans && scans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {scans.slice(0, 4).map((scan: any, i: number) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                >
                  <ScanCard scan={scan} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-left border border-dashed border-white/10 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2">No scans yet</h3>
              <p className="text-xs text-white/40 mb-4 max-w-sm">You haven&apos;t analyzed any appliances yet. Head over to the Upload Studio to get started.</p>
              <Link href="/upload" className="inline-flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                Upload Image
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Activity / Health */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 border-b border-white/[0.05] pb-4">Workspace Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Knowledge Coverage</span>
                <span className="text-sm font-bold text-brandAccent">{docCount} Docs</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brandAccent rounded-full shadow-[0_0_10px_#06b6d4] transition-all duration-1000" 
                  style={{ width: `${coveragePercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/40">{coveragePercent}% of your scanned appliances have linked manuals.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 border-b border-white/[0.05] pb-4">Recent Activity</h2>
            <div className="space-y-4">
              {scans && scans.length > 0 ? (
                scans.slice(0, 3).map((scan: any) => (
                  <div key={scan.id} className="flex gap-4">
                    <div className="mt-1">
                      <div className={`w-2 h-2 rounded-full ${scan.status === 'completed' ? 'bg-brandAccent/50' : scan.status === 'failed' ? 'bg-red-500/50' : 'bg-white/20'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">
                        Analyzed <span className="font-bold text-white">{scan.detected_brand_id || scan.original_filename || 'Appliance'}</span>
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {new Date(scan.created_at).toLocaleDateString()} at {new Date(scan.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/40">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
