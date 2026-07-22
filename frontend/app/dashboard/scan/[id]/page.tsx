"use client";

import { useScan, useDeleteScan } from "@/hooks/useScans";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Trash2, Clock, CheckCircle2, Image as ImageIcon, Box, Type, Tag, Sparkles, Copy, Check, Maximize2, X, AlertTriangle, ShieldAlert, Leaf, Wrench, HelpCircle, BookOpen, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthorizedImage } from "@/components/ui/AuthorizedImage";
import { chatApi } from "@/lib/api";
import { api } from "@/services/api";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";


function parseApplianceTags(tags: string[] | null) {
  const result = {
    pureTags: [] as string[],
    sceneSummary: "",
    brands: "",
    colors: "",
    applianceType: "",
    model: "",
    serial: "",
    components: [] as string[],
    warnings: [] as string[],
    energyRatings: [] as string[],
    suggestedQuestions: [] as string[],
    healthSummary: "",
  };
  if (!tags) return result;

  tags.forEach((tag: string) => {
    if (tag.startsWith("Scene Summary: ")) result.sceneSummary = tag.replace("Scene Summary: ", "");
    else if (tag.startsWith("Brands: ")) result.brands = tag.replace("Brands: ", "");
    else if (tag.startsWith("Colors: ")) result.colors = tag.replace("Colors: ", "");
    else if (tag.startsWith("Appliance Type: ")) result.applianceType = tag.replace("Appliance Type: ", "");
    else if (tag.startsWith("Model: ")) result.model = tag.replace("Model: ", "");
    else if (tag.startsWith("Serial: ")) result.serial = tag.replace("Serial: ", "");
    else if (tag.startsWith("Component: ")) result.components.push(tag.replace("Component: ", ""));
    else if (tag.startsWith("Warning: ")) result.warnings.push(tag.replace("Warning: ", ""));
    else if (tag.startsWith("Energy Rating: ")) result.energyRatings.push(tag.replace("Energy Rating: ", ""));
    else if (tag.startsWith("Suggested Question: ")) result.suggestedQuestions.push(tag.replace("Suggested Question: ", ""));
    else if (tag.startsWith("Health Summary: ")) result.healthSummary = tag.replace("Health Summary: ", "");
    else result.pureTags.push(tag);
  });
  return result;
}


function ProfileCard({ icon: Icon, iconColor, iconBg, title, children, className = "" }: {
  icon: any; iconColor: string; iconBg: string; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`vision-card p-8 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center border border-white/[0.05]`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="h3 text-white">{title}</h3>
      </div>
      <div className="h-[1px] w-full bg-white/10 mb-6" />
      {children}
    </div>
  );
}


export default function ScanResultPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const { data: scan, isLoading, error } = useScan(scanId);
  const { mutate: deleteScan, isPending: isDeleting } = useDeleteScan();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [matchedManuals, setMatchedManuals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRetrying, setIsRetrying] = useState(false);

  const parsed = useMemo(() => parseApplianceTags(scan?.tags), [scan?.tags]);


  useEffect(() => {
    if (!scan || scan.status !== "completed") return;

    const fetchAndMatch = async () => {
      try {
        const res = await api.get("/knowledge");
        const docs = res.data || [];

        const matches = docs.filter((doc: any) => {
          const docTitle = (doc.title || "").toLowerCase();
          const docBrand = (doc.brand || "").toLowerCase();

          let score = 0;
          if (parsed.brands && docBrand && parsed.brands.toLowerCase().includes(docBrand)) score += 2;
          if (parsed.brands && docTitle.includes(parsed.brands.toLowerCase())) score += 2;
          if (parsed.model && docTitle.includes(parsed.model.toLowerCase())) score += 3;
          if (parsed.applianceType && docTitle.includes(parsed.applianceType.toLowerCase())) score += 1;
          if (scan.detected_model_number && docTitle.includes(scan.detected_model_number.toLowerCase())) score += 3;

          return score >= 2;
        });

        setMatchedManuals(matches);
      } catch {

      }
    };

    fetchAndMatch();
  }, [scan, parsed.brands, parsed.model, parsed.applianceType, scan?.detected_model_number]);


  const handleAskAI = async (initialQuestion?: string) => {
    if (!scan) return;
    setIsStartingChat(true);
    try {
      const res = await chatApi.createConversation({
        scan_id: scan.id,
        title: scan.original_filename || "New Chat",
        metadata_: {
          detected_objects: scan.detected_objects,
          tags: scan.tags,
          brand: parsed.brands || scan.detected_brand_id,
          model: parsed.model || scan.detected_model_number,
          appliance_type: parsed.applianceType,
          ocr_text: scan.ocr_raw_text
        }
      });
      const chatId = res.data.id;

      if (initialQuestion) {
        const token = localStorage.getItem("access_token");
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/${chatId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ content: initialQuestion }),
        });
      }

      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error("Failed to start chat", err);
      setIsStartingChat(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this scan?")) {
      deleteScan(scanId, {
        onSuccess: () => router.push("/dashboard"),
      });
    }
  };

  const handleCopyOcr = () => {
    if (scan?.ocr_raw_text) {
      navigator.clipboard.writeText(scan.ocr_raw_text);
      setCopiedOcr(true);
      setTimeout(() => setCopiedOcr(false), 2000);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/scans/${scanId}/retry`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      console.error("Retry failed", err);
    } finally {
      setIsRetrying(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brandAccent" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col space-y-4">
        <div className="text-xl text-red-400 font-semibold">Failed to load scan.</div>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const isCompleted = scan.status === "completed";
  const isProcessing = scan.status === "processing";
  const isNeedsRetry = scan.status === "needs_retry";

  const getErrorStyle = (msg: string = "") => {
    const lmsg = msg.toLowerCase();
    if (lmsg.includes("limit") || lmsg.includes("quota")) return { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-950/40", border: "border-orange-900/50" };
    if (lmsg.includes("network") || lmsg.includes("connection")) return { icon: Zap, color: "text-blue-400", bg: "bg-blue-950/40", border: "border-blue-900/50" };
    if (lmsg.includes("time") || lmsg.includes("unavailable")) return { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-950/40", border: "border-yellow-900/50" };
    return { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-950/40", border: "border-red-900/50" };
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1800px] mx-auto pt-4">
      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#09090b]/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <Button
              variant="ghost"
              className="absolute top-6 right-6 text-white hover:bg-white/10"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="relative w-full max-w-7xl h-full max-h-[90vh]">
              <AuthorizedImage
                src={`/scans/${scan.id}/thumbnail?size=lg`}
                alt="Fullscreen Preview"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 border-b border-white/[0.05] pb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors border border-transparent hover:border-white/[0.08]">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold text-brandAccent uppercase tracking-[0.2em]">Scan Report</span>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${isCompleted ? 'bg-green-500/10 text-green-400' : isNeedsRetry ? 'bg-orange-500/10 text-orange-400' : 'bg-brandAccent/10 text-brandAccent'}`}>
                {isNeedsRetry ? "Analysis Delayed" : scan.status}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate max-w-sm sm:max-w-lg">
              {parsed.applianceType || scan.original_filename}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-white/40 font-medium mr-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {new Date(scan.uploaded_at).toLocaleString()}
          </span>
          {isCompleted && (
            <Button
              variant="outline"
              className="h-10 px-4 border-white/[0.08] hover:bg-white/[0.04]"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Analyze Again
            </Button>
          )}
          {isNeedsRetry && (
            <Button
              variant="outline"
              className="h-10 px-4 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Retry
            </Button>
          )}
          <Button
            className="bg-brandAccent hover:bg-brandAccent-light text-black font-bold h-10 px-5 gap-2"
            onClick={() => handleAskAI()}
            disabled={isStartingChat || !isCompleted}
          >
            {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Ask AI
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-white/[0.08] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isNeedsRetry && (
        (() => {
          const style = getErrorStyle(scan.error_message);
          const Icon = style.icon;
          return (
            <div className={`${style.bg} border ${style.border} p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg backdrop-blur-sm`}>
              <div className="flex items-start sm:items-center gap-4">
                <div className={`p-3 rounded-xl bg-black/20`}>
                  <Icon className={`w-6 h-6 ${style.color}`} />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${style.color}`}>Analysis Delayed</h3>
                  <p className="text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
                    {scan.error_message || "The AI engine was unable to process this image due to a temporary service interruption. Please try again in a few minutes."}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-white/10 hover:bg-white/20 text-white font-bold whitespace-nowrap h-11 px-6 rounded-xl border border-white/10"
              >
                {isRetrying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Retry
              </Button>
            </div>
          );
        })()
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-8 h-[calc(100vh-200px)]">

        {/* Left Column (Image Inspector) */}
        <div className="lg:col-span-1 xl:col-span-5 flex flex-col gap-4 h-full">
          <div className="flex-1 relative bg-black/40 border border-white/[0.05] rounded-2xl overflow-hidden group">
            <AuthorizedImage
              src={`/scans/${scan.id}/thumbnail?size=lg`}
              alt="Scan Preview"
              fill
              className="object-contain"
            />
            {/* Overlay Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20" onClick={() => setIsFullscreen(true)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            {/* Status Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 text-brandAccent animate-spin mb-4" />
                <p className="text-sm font-bold tracking-widest text-brandAccent uppercase">Analyzing Image</p>
              </div>
            )}
          </div>

          {/* Quick Stats bar below image */}
          <div className="grid grid-cols-3 gap-4 h-24">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col items-center justify-center p-4">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Brand</span>
              <span className="text-sm font-bold text-white truncate w-full text-center">{parsed.brands || "Unknown"}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col items-center justify-center p-4">
              <span className="text-[10px] text-brandAccent font-bold uppercase tracking-widest mb-1">Model</span>
              <span className="text-sm font-bold text-brandAccent truncate w-full text-center font-mono">{parsed.model || scan.detected_model_number || "Unknown"}</span>
            </div>
            <div className={`border rounded-xl flex flex-col items-center justify-center p-4 ${isCompleted ? 'bg-brandAccent/5 border-brandAccent/20' : isNeedsRetry ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isCompleted ? 'text-brandAccent/70' : isNeedsRetry ? 'text-orange-400/70' : 'text-white/40'}`}>Status</span>
              <span className={`text-sm font-bold uppercase ${isCompleted ? 'text-brandAccent' : isNeedsRetry ? 'text-orange-400' : 'text-white/80'}`}>{isNeedsRetry ? "Needs Analysis" : scan.status}</span>
            </div>
          </div>
        </div>

        {/* Right Column (Data Tabs) */}
        <div className="lg:col-span-1 xl:col-span-7 flex flex-col h-full bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-white/[0.05] p-2 gap-2 hide-scrollbar">
            {[
              { id: "overview", label: "Overview", icon: Sparkles },
              { id: "ocr", label: "OCR", icon: Type },
              { id: "components", label: "Components", icon: Wrench },
              { id: "warnings", label: "Warnings", icon: AlertTriangle },
              { id: "manuals", label: "Manuals", icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-brandAccent" : ""}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brandAccent mb-4">AI Assessment</h3>
                      <p className="text-white/80 text-[15px] leading-relaxed">
                        {parsed.healthSummary || parsed.sceneSummary || "No summary generated. Try asking the AI for more details."}
                      </p>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Detected Objects</h3>
                      {scan.detected_objects && scan.detected_objects.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {scan.detected_objects.map((obj: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                              <span className="text-sm font-semibold text-white/90">{obj.label}</span>
                              <span className="text-xs font-bold text-white/30">{Math.round(obj.confidence * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-white/40 italic">No objects detected.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* OCR TAB */}
                {activeTab === "ocr" && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Raw Text Extraction</h3>
                      {scan.ocr_raw_text && (
                        <Button variant="ghost" size="sm" onClick={handleCopyOcr} className="h-8">
                          {copiedOcr ? <Check className="w-3.5 h-3.5 mr-2 text-brandAccent" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                          {copiedOcr ? "Copied" : "Copy"}
                        </Button>
                      )}
                    </div>
                    {scan.ocr_raw_text ? (
                      <div className="flex-1 bg-black/40 border border-white/[0.05] rounded-xl p-6 overflow-y-auto">
                        <p className="text-[13px] font-mono text-white/70 whitespace-pre-wrap leading-relaxed">{scan.ocr_raw_text}</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-white/30 text-sm font-medium">
                        No text found in this image.
                      </div>
                    )}
                  </div>
                )}

                {/* COMPONENTS TAB */}
                {activeTab === "components" && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-4">Identified Parts</h3>
                    {parsed.components.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {parsed.components.map((comp, idx) => (
                          <div key={idx} className="p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl flex items-center gap-4">
                            <Wrench className="w-4 h-4 text-amber-500/50" />
                            <span className="text-sm font-medium text-white/90">{comp}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-white/40 text-sm">No specific components identified.</div>
                    )}
                  </div>
                )}

                {/* WARNINGS TAB */}
                {activeTab === "warnings" && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-4">Safety & Warnings</h3>
                    {parsed.warnings.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {parsed.warnings.map((warning, idx) => (
                          <div key={idx} className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-4">
                            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-red-200/90 leading-relaxed">{warning}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-white/40 text-sm">No safety warnings detected.</div>
                    )}
                  </div>
                )}

                {/* MANUALS TAB */}
                {activeTab === "manuals" && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">Matched Documentation</h3>
                    {matchedManuals.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {matchedManuals.map((doc: any) => (
                          <div key={doc.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-brandAccent transition-colors">{doc.title}</p>
                                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{doc.brand} • {doc.document_type}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">View</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center">
                        <BookOpen className="w-8 h-8 text-white/20 mb-3" />
                        <p className="text-white/60 font-medium text-sm">No manuals matched this appliance.</p>
                        <Link href="/knowledge" className="mt-4 text-xs font-bold text-brandAccent uppercase tracking-widest hover:underline">Upload Manual</Link>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
