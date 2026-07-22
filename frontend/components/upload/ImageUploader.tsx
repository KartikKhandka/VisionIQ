import React, { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, FileImage, Loader2, CheckCircle2, Image as ImageIcon, Search, Type, Database, Sparkles } from 'lucide-react';
import { useUploadScan } from '@/hooks/useScans';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PIPELINE_STAGES = [
  { id: 'uploading', label: 'Uploading...', icon: Upload },
  { id: 'reading', label: 'Reading image...', icon: FileImage },
  { id: 'vision', label: 'Running Vision AI...', icon: Sparkles },
  { id: 'ocr', label: 'Extracting OCR...', icon: Type },
  { id: 'manuals', label: 'Finding manuals...', icon: Database },
  { id: 'assistant', label: 'Preparing AI Assistant...', icon: Search },
  { id: 'done', label: 'Done.', icon: CheckCircle2 },
];

export const ImageUploader = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mutate: uploadScan, isPending, error, isSuccess } = useUploadScan();
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      setCurrentStage(0);
      interval = setInterval(() => {
        setCurrentStage((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPending]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP formats are supported.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadScan(selectedFile);
    }
  };

  return (
    <div className="w-full mx-auto py-4">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative flex flex-col items-center justify-center w-full min-h-[500px] border border-dashed rounded-3xl transition-all duration-300 ${
              dragActive 
                ? 'border-brandAccent bg-brandAccent/[0.03] shadow-[0_0_50px_rgba(6,182,212,0.1)] scale-[1.01]' 
                : 'border-white/[0.1] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.2]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleChange}
              accept="image/jpeg,image/png,image/webp"
            />
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${dragActive ? 'bg-brandAccent/10 text-brandAccent' : 'bg-white/[0.04] text-slate-500'}`}>
              <Upload className={`w-10 h-10 ${dragActive ? 'animate-bounce' : ''}`} />
            </div>
            <h3 className="text-2xl font-bold text-slate-200 mb-2">Drag & drop your image here</h3>
            <p className="text-slate-500 mb-6">or click to browse from your computer</p>
            
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] rounded-full border border-white/[0.06]"><ImageIcon className="w-3.5 h-3.5" /> JPEG, PNG, WEBP</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] rounded-full border border-white/[0.06]"><Database className="w-3.5 h-3.5" /> Up to 10MB</span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Preview */}
              <div className="relative w-full h-[350px] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] group">
                {previewUrl && (
                  <Image unoptimized src={previewUrl} alt="Preview" fill className="object-contain" />
                )}
                {!isPending && !isSuccess && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={clearSelection}
                      className="p-2 bg-slate-900/80 backdrop-blur shadow-md hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-slate-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Actions & Pipeline */}
              <div className="flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-200 truncate pr-4">{selectedFile.name}</h3>
                  <p className="text-slate-500 font-medium mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>

                {!isPending && !isSuccess ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-brandAccent/10 border border-brandAccent/20 rounded-2xl">
                      <div className="flex gap-3">
                        <Sparkles className="w-5 h-5 text-brandAccent shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-brandAccent mb-1">Ready for AI Analysis</h4>
                          <p className="text-sm text-brandAccent/80 leading-relaxed">VisionIQ will analyze this image using Gemini Vision to detect objects, extract text, and build a semantic summary.</p>
                        </div>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-300 font-medium">
                        {error.message || 'An error occurred during upload.'}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 rounded-xl h-12 border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                        onClick={clearSelection}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="lg"
                        className="flex-1 rounded-xl h-12 bg-brandAccent hover:bg-brandAccent-light text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-0.5"
                        onClick={handleUpload}
                      >
                        Start Analysis
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 bg-white/[0.02] rounded-2xl p-6 border border-white/[0.06]">
                    <h4 className="font-bold text-slate-200 mb-6">Processing Pipeline</h4>
                    <div className="space-y-5 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/[0.06] before:to-transparent">
                      {PIPELINE_STAGES.map((stage, idx) => {
                        const isCompleted = isSuccess || idx < currentStage;
                        const isCurrent = !isSuccess && idx === currentStage;
                        const Icon = stage.icon;

                        return (
                          <div key={stage.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-[#111] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-300 overflow-hidden">
                              {isCompleted ? (
                                <div className="w-full h-full bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircle2 className="w-5 h-5" /></div>
                              ) : isCurrent ? (
                                <div className="w-full h-full bg-brandAccent/20 flex items-center justify-center text-brandAccent"><Loader2 className="w-4 h-4 animate-spin" /></div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40"><Icon className="w-4 h-4" /></div>
                              )}
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] px-4 py-3 rounded-xl border transition-all duration-300 ${
                              isCompleted ? 'bg-green-500/5 border-green-500/20' :
                              isCurrent ? 'bg-brandAccent/10 border-brandAccent/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' :
                              'bg-white/[0.02] border-transparent opacity-60'
                            }`}>
                              <p className={`font-bold text-xs uppercase tracking-widest ${
                                isCompleted ? 'text-green-400' :
                                isCurrent ? 'text-brandAccent' :
                                'text-white/40'
                              }`}>{stage.label}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
