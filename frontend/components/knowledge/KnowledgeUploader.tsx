import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { knowledgeApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, UploadCloud, FileText } from 'lucide-react';

interface KnowledgeUploaderProps {
  onUploadSuccess: () => void;
}

export default function KnowledgeUploader({ onUploadSuccess }: KnowledgeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadPromise = knowledgeApi.uploadDocument(formData);
      
      await toast.promise(uploadPromise, {
        loading: 'Processing document & generating embeddings...',
        success: 'Document indexed successfully!',
        error: (err) => err.response?.data?.detail || 'Failed to upload document',
      });
      
      onUploadSuccess();
    } catch (err: any) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-brandAccent bg-brandAccent/5 scale-[1.01]' : 'border-white/[0.1] hover:border-brandAccent/50 hover:bg-white/[0.02]'
        } ${isUploading ? 'opacity-50 cursor-not-allowed bg-white/[0.01]' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${
          isDragActive ? 'bg-brandAccent/10 text-brandAccent' : 'bg-white/[0.05] text-white/50'
        }`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-brandAccent" />
          ) : (
            <UploadCloud className={`w-6 h-6 ${isDragActive ? 'animate-bounce' : ''}`} />
          )}
        </div>
        
        {isUploading ? (
          <div>
            <p className="text-white font-semibold">Indexing Document</p>
            <p className="text-white/40 text-xs mt-1">Extracting text and building vector embeddings...</p>
          </div>
        ) : isDragActive ? (
          <div>
            <p className="text-brandAccent font-semibold">Drop the document here</p>
            <p className="text-brandAccent/60 text-xs mt-1">Release to start uploading</p>
          </div>
        ) : (
          <div>
            <p className="text-white font-semibold">Drag & drop a document</p>
            <p className="text-white/40 text-xs mt-1 mb-4">or click to browse files</p>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.05] text-white/60 rounded text-[10px] font-bold uppercase tracking-wider">PDF</span>
              <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.05] text-white/60 rounded text-[10px] font-bold uppercase tracking-wider">TXT</span>
              <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.05] text-white/60 rounded text-[10px] font-bold uppercase tracking-wider">MD</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
