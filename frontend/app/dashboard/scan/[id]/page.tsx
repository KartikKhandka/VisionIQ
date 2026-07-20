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

// ── Tag Parser Utility ──────────────────────────────
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

// ── Card component ──────────────────────────────────
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

// ── Main Page ───────────────────────────────────────
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

  const parsed = useMemo(() => parseApplianceTags(scan?.tags), [scan?.tags]);

  // ── Manual Matching ───────────────────────────────
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
        // Knowledge fetch failed silently
      }
    };

    fetchAndMatch();
  }, [scan, parsed.brands, parsed.model, parsed.applianceType, scan?.detected_model_number]);

  // ── Handlers ──────────────────────────────────────
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

  // ── Loading / Error States ────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-candyApple" />
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

  return (
    <div className="space-y-8 pb-20 relative">
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
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
      >
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/[0.04] rounded-full transition-colors group border border-transparent hover:border-white/[0.08]">
            <ArrowLeft className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
          </Link>
          <div>
            <h1 className="h1 truncate max-w-sm sm:max-w-lg text-[32px] sm:text-[40px]">
              {parsed.applianceType || scan.original_filename}
            </h1>
            <div className="flex items-center text-muted text-sm mt-2 space-x-4 font-medium">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {new Date(scan.uploaded_at).toLocaleString()}
              </span>
              <span className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-1.5" />
                {(scan.file_size / (1024 * 1024)).toFixed(2)} MB
              </span>
              {parsed.brands && (
                <span className="flex items-center font-bold text-candyApple uppercase tracking-wide text-xs">
                  {parsed.brands}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${scan.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : scan.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-candyApple/10 text-candyApple border-candyApple/20'}`}>
            {scan.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {scan.status === 'processing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span className="capitalize">{scan.status}</span>
          </div>
          <Button 
            className="gap-2" 
            onClick={() => handleAskAI()}
            disabled={isStartingChat || !isCompleted}
          >
            {isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Ask AI Expert
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>

      {/* ── Error Banner ─────────────────────────── */}
      {scan.status === "failed" && scan.error_message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="vision-card !bg-red-950/40 border-red-900/50 !p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 mt-1 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-400 mb-1">Scan Failed</p>
              <p className="text-red-300/80">
                {scan.error_message?.includes("429") || scan.error_message?.includes("RESOURCE_EXHAUSTED") 
                  ? "We are currently experiencing high traffic and our AI quota has been temporarily exceeded. Please try your scan again in a few moments."
                  : "We encountered an unexpected issue while analyzing your image. Please try again or contact support if the problem persists."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Health Summary Banner ────────────────── */}
      {isCompleted && parsed.healthSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="vision-card !bg-candyApple/5 border-candyApple/20 !p-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-candyApple/20 flex items-center justify-center border border-candyApple/30">
              <CheckCircle2 className="w-6 h-6 text-candyApple" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-white mb-1">Appliance Health Assessment</h2>
              <p className="text-[15px] text-muted">{parsed.healthSummary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Suggested Questions Chips ────────────── */}
      {isCompleted && parsed.suggestedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="space-y-4"
        >
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Suggested Questions
          </h4>
          <div className="flex flex-wrap gap-3">
            {parsed.suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAI(q)}
                disabled={isStartingChat}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-1.5 pr-4 pl-1.5 transition-all hover:-translate-y-0.5 text-white"
              >
                <span className="w-6 h-6 rounded-full bg-candyApple/20 text-candyApple flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                <span className="text-[13px] font-medium">{q}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Matched Manuals ──────────────────────── */}
      {matchedManuals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="glass-panel p-6 rounded-[20px]"
        >
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-5 h-5 text-candyApple" />
            <h3 className="h3 !text-[18px]">Matched Manual{matchedManuals.length > 1 ? "s" : ""}</h3>
          </div>
          <div className="space-y-3">
            {matchedManuals.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] hover:border-candyApple/30 transition-colors">
                <div>
                  <p className="text-[15px] font-semibold text-white truncate max-w-xs">{doc.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {doc.brand && <span className="text-[10px] font-bold uppercase tracking-wider text-muted-2 border border-white/10 px-2 py-0.5 rounded">{doc.brand}</span>}
                    <span className="text-xs text-muted-2 font-medium">{doc.document_type}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Matched</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* ── Left Column (Image & Summary) ─────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="lg:col-span-7 space-y-8"
        >
          {/* Image Viewer */}
          <div className="vision-card overflow-hidden relative w-full h-[500px] group !p-2">
            <AuthorizedImage 
              src={`/scans/${scan.id}/thumbnail?size=md`} 
              alt="Scan Preview" 
              fill
              className="object-contain bg-black/40 rounded-[12px]"
            />
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="bg-[#09090b]/80 backdrop-blur-md shadow-lg border-white/[0.12] text-white hover:bg-[#09090b]" onClick={() => setIsFullscreen(true)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Appliance Identification Card */}
          <ProfileCard icon={Zap} iconColor="text-candyApple" iconBg="bg-candyApple/10" title="Detected Appliance">
            {isProcessing ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/[0.04] rounded w-3/4"></div>
                <div className="h-4 bg-white/[0.04] rounded w-1/2"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Type</p>
                  <p className="text-lg font-semibold text-white">{parsed.applianceType || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Brand</p>
                  <p className="text-lg font-semibold text-white">{parsed.brands || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Model</p>
                  <p className="text-lg font-bold text-candyApple font-mono bg-candyApple/5 inline-block px-2 py-1 rounded border border-candyApple/10">{parsed.model || scan.detected_model_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Serial</p>
                  <p className="text-lg font-bold text-slate-300 font-mono">{parsed.serial || "—"}</p>
                </div>
              </div>
            )}
          </ProfileCard>

          {/* AI Summary Card */}
          <ProfileCard icon={Sparkles} iconColor="text-purple-400" iconBg="bg-purple-500/10" title="AI Summary">
            {isProcessing ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/[0.04] rounded w-3/4"></div>
                <div className="h-4 bg-white/[0.04] rounded w-1/2"></div>
              </div>
            ) : parsed.sceneSummary ? (
              <div className="space-y-6">
                <p className="text-muted leading-relaxed font-medium text-[16px]">{parsed.sceneSummary}</p>
                {parsed.colors && (
                  <div className="pt-6 border-t border-border-2">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Dominant Colors</p>
                    <p className="font-semibold text-white capitalize">{parsed.colors}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted italic">No summary generated.</p>
            )}
          </ProfileCard>
        </motion.div>

        {/* ── Right Column (Data Cards) ──────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="lg:col-span-5 space-y-8"
        >
          {/* Components Card */}
          {parsed.components.length > 0 && (
            <ProfileCard icon={Wrench} iconColor="text-amber-400" iconBg="bg-amber-500/10" title="Detected Components">
              <div className="flex flex-wrap gap-2">
                {parsed.components.map((comp, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[13px] text-white">
                    {comp}
                  </span>
                ))}
              </div>
            </ProfileCard>
          )}

          {/* Objects Card */}
          <ProfileCard icon={Box} iconColor="text-blue-400" iconBg="bg-blue-500/10" title="Detected Objects">
            {isProcessing ? (
              <div className="animate-pulse space-y-4">
                {[1,2].map(i => <div key={i} className="h-12 bg-white/[0.04] rounded-xl"></div>)}
              </div>
            ) : scan.detected_objects && scan.detected_objects.length > 0 ? (
              <div className="space-y-3">
                {scan.detected_objects.map((obj: any, idx: number) => {
                  const percent = Math.round(obj.confidence * 100);
                  return (
                    <div key={idx} className="bg-white/[0.02] border border-border rounded-[14px] p-3.5 flex justify-between items-center hover:bg-white/[0.04] transition-colors hover:border-border-2">
                      <span className="font-semibold text-white">{obj.label}</span>
                      <span className={`px-2 py-1 rounded text-[11px] font-bold ${percent > 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-candyApple/10 text-candyApple border border-candyApple/20'}`}>
                        {percent}% Match
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted italic text-[15px]">No objects detected.</p>
            )}
          </ProfileCard>

          {/* Warning Labels Card */}
          {parsed.warnings.length > 0 && (
            <ProfileCard icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-500/10" title="Warning Labels">
              <div className="space-y-3">
                {parsed.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-red-950/30 border border-red-900/50 rounded-[14px] p-4">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <span className="text-[15px] font-medium text-red-200/90">{warning}</span>
                  </div>
                ))}
              </div>
            </ProfileCard>
          )}

          {/* Energy Labels Card */}
          {parsed.energyRatings.length > 0 && (
            <ProfileCard icon={Leaf} iconColor="text-green-400" iconBg="bg-green-500/10" title="Energy Information">
              <div className="flex flex-wrap gap-2">
                {parsed.energyRatings.map((rating, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[13px] font-medium">
                    {rating}
                  </span>
                ))}
              </div>
            </ProfileCard>
          )}

          {/* OCR Card */}
          <ProfileCard icon={Type} iconColor="text-slate-400" iconBg="bg-slate-500/10" title="Extracted Text (OCR)">
            <div className="flex justify-end -mt-6 mb-4">
              {scan.ocr_raw_text && (
                <Button variant="ghost" size="sm" onClick={handleCopyOcr} className="h-8 px-3">
                  {copiedOcr ? <Check className="w-3.5 h-3.5 mr-1.5 text-candyApple" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedOcr ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
            {isProcessing ? (
              <div className="animate-pulse h-24 bg-white/[0.04] rounded-[14px]"></div>
            ) : scan.ocr_raw_text ? (
              <div>
                <div className="bg-[#09090b]/50 inset-0 shadow-inner border border-border-2 rounded-[14px] p-5 max-h-[250px] overflow-y-auto">
                  <p className="text-[14px] font-mono text-muted whitespace-pre-wrap leading-relaxed">{scan.ocr_raw_text}</p>
                </div>
                <p className="text-xs font-bold text-muted-2 mt-3 text-right uppercase tracking-wider">
                  {scan.ocr_raw_text.length} characters
                </p>
              </div>
            ) : (
              <p className="text-muted italic text-[15px]">No text extracted.</p>
            )}
          </ProfileCard>

          {/* Tags Card */}
          <ProfileCard icon={Tag} iconColor="text-amber-400" iconBg="bg-amber-500/10" title="Generated Tags">
            {isProcessing ? (
              <div className="flex gap-2 flex-wrap animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-8 w-20 bg-white/[0.04] rounded-full"></div>)}
              </div>
            ) : parsed.pureTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {parsed.pureTags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[13px] text-white">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted italic text-[15px]">No generic tags generated.</p>
            )}
          </ProfileCard>
        </motion.div>
      </div>
    </div>
  );
}
