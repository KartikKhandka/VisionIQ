"use client";

import { WorkspaceLayout } from "@/components/workspace-layout";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { motion } from "framer-motion";

export default function UploadStudioPage() {
  return (
    <WorkspaceLayout>
      <div className="flex flex-col min-h-[calc(100vh-120px)] items-center justify-center -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-brandAccent/10 border border-brandAccent/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-brandAccent animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-brandAccent">
              Vision Engine V2 Ready
            </span>
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-black uppercase leading-[0.9] tracking-tight text-white mb-4">
            Upload <span className="text-brandAccent">Studio.</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Drag and drop high-resolution appliance images. Our vision engine will identify the make, model, components, and find the corresponding manuals.
          </p>
        </motion.div>

        <div className="w-full max-w-6xl mx-auto">
          <ImageUploader />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
