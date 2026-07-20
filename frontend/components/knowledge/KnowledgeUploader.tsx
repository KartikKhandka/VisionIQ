import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { knowledgeApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

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
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-indigo-500 bg-indigo-50/50 shadow-soft scale-[1.02]' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
          isDragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400'
        }`}>
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          ) : (
            <DocumentArrowUpIcon className={`w-8 h-8 ${isDragActive ? 'animate-bounce' : ''}`} />
          )}
        </div>
        
        {isUploading ? (
          <div>
            <p className="text-gray-900 font-bold text-lg">Indexing Document</p>
            <p className="text-gray-500 text-sm mt-1">Extracting text and building vector embeddings...</p>
          </div>
        ) : isDragActive ? (
          <div>
            <p className="text-indigo-600 font-bold text-lg">Drop the document here</p>
            <p className="text-indigo-400 text-sm mt-1">Release to start uploading</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-900 font-bold text-lg">Drag & drop a document here</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">or click to select file</p>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">PDF</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">TXT</span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">MD</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
