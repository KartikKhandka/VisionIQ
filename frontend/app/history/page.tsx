"use client";

import { useScans } from "@/hooks/useScans";
import { ScanCard } from "@/components/dashboard/ScanCard";
import { Loader2, Scan, Clock, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function HistoryContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const { data: scans, isLoading, error } = useScans(0, 100);

  const filteredScans = scans?.filter((scan: any) => {
    if (!query) return true;
    const matchName = scan.original_filename?.toLowerCase().includes(query);
    const matchTags = scan.tags?.some((tag: string) => tag.toLowerCase().includes(query));
    return matchName || matchTags;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-candyApple" />
            <span className="text-sm font-bold tracking-wider uppercase text-candyApple">Archive</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Scan History</h1>
          <p className="text-muted mt-2 text-lg font-medium max-w-2xl">
            View, search, and manage all your previously analyzed images and conversations.
          </p>
        </div>
        
        {scans && scans.length > 0 && (
          <Link href="/dashboard">
            <Button className="bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.06] rounded-xl shadow-sm">
              New Scan <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </motion.div>

      <div className="w-full h-px bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent"></div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-candyApple" />
          <p className="text-muted font-medium animate-pulse">Loading your history...</p>
        </div>
      ) : error ? (
        <div className="bg-candyApple/10 border border-candyApple/20 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-candyApple/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-candyApple mb-2">Failed to load history</h3>
          <p className="text-candyApple/80 mb-6">There was a problem fetching your previous scans. Please try again.</p>
          <Button variant="outline" className="border-candyApple/20 text-candyApple hover:bg-candyApple/10" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : filteredScans && filteredScans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredScans.map((scan: any, i: number) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <ScanCard scan={scan} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="max-w-xl mx-auto mt-12">
          <EmptyState 
            icon={Scan} 
            title={query ? "No search results" : "No scan history"} 
            description={query ? `No scans found matching "${query}".` : "You haven't uploaded any images yet. Head over to the dashboard to analyze your first image and start building your history."} 
            className="min-h-[400px] vision-card bg-black/40"
            action={
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-8 btn--primary mt-4">
                  Go to Dashboard
                </Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-candyApple" />
        <p className="text-muted font-medium animate-pulse">Loading...</p>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}
