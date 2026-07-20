'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import KnowledgeUploader from '@/components/knowledge/KnowledgeUploader';
import DocumentList, { KnowledgeDocument } from '@/components/knowledge/DocumentList';
import { knowledgeApi } from '@/lib/api';
import { Database, Library, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await knowledgeApi.getDocuments();
      setDocuments(res.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-20">
        <div className="p-8 max-w-6xl mx-auto w-full space-y-10 mt-4">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Library className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold tracking-wider uppercase text-indigo-400">Library</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">Knowledge Base</h1>
              <p className="text-slate-500 mt-2 text-lg font-medium max-w-2xl">
                Upload manuals, specifications, and guides. VisionIQ will use these documents to answer your questions accurately.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 glass-card">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-slate-300">{documents.length} Docs Indexed</span>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] rounded-xl shadow-sm h-10">
                  Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="w-full h-px bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="glass-card-hover p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-200">Add Documents</h2>
                    <p className="text-sm text-slate-500">Supported: PDF, TXT, MD</p>
                  </div>
                </div>
                <KnowledgeUploader onUploadSuccess={fetchDocuments} />
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                  <Database className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10 text-slate-200">How it works</h3>
                <p className="text-slate-400 text-sm leading-relaxed relative z-10 mb-4">
                  When you upload a document, we break it down into semantic chunks and store them in our vector database. 
                  When you chat about an image, the AI will search these documents to provide accurate, cited answers.
                </p>
              </div>
            </motion.div>

            {/* Right Column: List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-7"
            >
              <div className="glass-card p-6 min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-200">Indexed Documents</h2>
                  <div className="text-sm font-medium text-slate-500 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
                    {isLoading ? 'Loading...' : `${documents.length} items`}
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Syncing library...</p>
                  </div>
                ) : (
                  <DocumentList documents={documents} onRefresh={fetchDocuments} />
                )}
              </div>
            </motion.div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
