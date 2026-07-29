"use client";

import { useScans } from "@/hooks/useScans";
import { ScanCard } from "@/components/dashboard/ScanCard";
import { Loader2, Scan, Clock, ArrowRight, LayoutGrid, List as ListIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function HistoryContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const { data: scans, isLoading, error } = useScans(0, 20);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredScans = scans?.filter((scan: any) => {
    if (!query) return true;
    const matchName = scan.original_filename?.toLowerCase().includes(query);
    const matchTags = scan.tags?.some((tag: string) => tag.toLowerCase().includes(query));
    return matchName || matchTags;
  });

  return (
    <div className="max-w-[1200px] mx-auto w-full px-6 py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-brandAccent" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-brandAccent">Archive</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Scan History</h1>
          <p className="text-white/50 text-sm max-w-2xl font-medium leading-relaxed">
            View, search, and manage all your previously analyzed images and conversations.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
            <Scan className="w-3.5 h-3.5 text-white/50" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">{scans?.length || 0} Total Scans</span>
          </div>
          <Link href="/upload">
            <Button variant="outline" className="bg-white text-black font-bold hover:bg-white/90 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] h-10">
              New Scan <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="w-full h-px bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent"></div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-brandAccent" />
          <p className="text-white/50 font-medium animate-pulse text-sm">Loading your history...</p>
        </div>
      ) : error ? (
        <div className="bg-brandAccent/10 border border-brandAccent/20 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-brandAccent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-brandAccent mb-2">Failed to load history</h3>
          <p className="text-brandAccent/80 mb-6 text-sm">There was a problem fetching your previous scans. Please try again.</p>
          <Button variant="outline" className="border-brandAccent/20 text-brandAccent hover:bg-brandAccent/10" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : filteredScans && filteredScans.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-full mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40">Scan details</th>
                    <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40">Status</th>
                    <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40">Tags</th>
                    <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map((scan: any, i: number) => {
                    const isCompleted = scan.status === "completed";
                    const isProcessing = scan.status === "processing";
                    const isFailed = scan.status === "failed";
                    const applianceType = scan.parsed_data?.applianceType || scan.original_filename;
                    const tags = scan.tags || scan.parsed_data?.pureTags || [];

                    return (
                      <tr key={scan.id} className="group border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors relative">
                        <td className="py-4 px-4 w-[40%]">
                          <Link href={`/dashboard/scan/${scan.id}`} className="absolute inset-0 z-0"></Link>
                          <div className="flex items-center gap-4 relative z-10 pointer-events-none">
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-white/[0.02] border border-white/[0.05]">
                              {scan.thumbnail_url || isCompleted ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={`/scans/${scan.id}/thumbnail`} alt="Preview" className="w-full h-full object-cover" />
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Scan className="w-4 h-4 text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[14px] font-medium text-white/90 truncate flex items-center gap-2 group-hover:text-brandAccent transition-colors">
                                {applianceType}
                              </p>
                              <p className="text-[11px] text-white/40 mt-0.5 font-mono truncate">{scan.id.split('-')[0]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 relative z-10 pointer-events-none">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border w-fit ${isCompleted ? 'bg-green-500/10 border-green-500/20' :
                              isFailed ? 'bg-red-500/10 border-red-500/20' :
                                'bg-brandAccent/10 border-brandAccent/20'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-400' :
                                isFailed ? 'bg-red-400' :
                                  'bg-brandAccent animate-pulse'
                              }`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-green-400' :
                                isFailed ? 'text-red-400' :
                                  'text-brandAccent'
                              }`}>
                              {scan.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 relative z-10 pointer-events-none">
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {tags.slice(0, 2).map((tag: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded border border-white/[0.05] bg-white/[0.02] text-[10px] text-white/50 truncate max-w-[80px]">
                                {tag}
                              </span>
                            ))}
                            {tags.length > 2 && (
                              <span className="px-2 py-0.5 rounded border border-white/[0.05] bg-white/[0.02] text-[10px] text-white/50">
                                +{tags.length - 2}
                              </span>
                            )}
                            {tags.length === 0 && <span className="text-white/20 text-xs">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 relative z-10 pointer-events-none">
                          <p className="text-[13px] text-white/50">
                            {new Date(scan.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-xl mx-auto mt-12">
          <EmptyState
            icon={Scan}
            title={query ? "No search results" : "No scan history"}
            description={query ? `No scans found matching "${query}".` : "You haven't uploaded any images yet."}
            className="min-h-[300px] border border-dashed border-white/10 bg-white/[0.01]"
            action={
              <Link href="/upload">
                <Button size="lg" className="rounded-xl px-8 bg-white text-black hover:bg-white/90 mt-4">
                  Go to Upload Studio
                </Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}

import { WorkspaceLayout } from "@/components/workspace-layout";

export default function HistoryPage() {
  return (
    <WorkspaceLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-brandAccent" />
          <p className="text-muted font-medium animate-pulse">Loading...</p>
        </div>
      }>
        <HistoryContent />
      </Suspense>
    </WorkspaceLayout>
  );
}
