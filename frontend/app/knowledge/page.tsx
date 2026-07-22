'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceLayout } from '@/components/workspace-layout';
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
    <WorkspaceLayout>
      <div className="max-w-[1200px] mx-auto w-full px-6 py-12 space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Library className="w-4 h-4 text-brandAccent" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-brandAccent">Workspace</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Knowledge Base</h1>
            <p className="text-white/50 text-sm max-w-2xl font-medium leading-relaxed">
              Upload manuals, specifications, and guides. VisionIQ will automatically chunk, index, and use these documents to answer your questions accurately.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
              <Database className="w-3.5 h-3.5 text-brandAccent" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">{documents.length} Indexed</span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08] hover:text-white rounded-xl shadow-sm h-10">
                Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="w-full h-px bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          {/* Uploader Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brandAccent/10 flex items-center justify-center border border-brandAccent/20">
                <FileText className="w-4 h-4 text-brandAccent" />
              </div>
              <h2 className="text-lg font-semibold text-white">Add Document</h2>
            </div>
            <KnowledgeUploader onUploadSuccess={fetchDocuments} />
          </section>

          {/* List Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">Document Library</h2>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  {isLoading ? 'Syncing...' : `${documents.length} items`}
                </span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <div className="w-8 h-8 border-2 border-brandAccent/20 border-t-brandAccent rounded-full animate-spin"></div>
                <p className="text-white/50 font-medium text-sm animate-pulse">Syncing library...</p>
              </div>
            ) : (
              <DocumentList documents={documents} onRefresh={fetchDocuments} />
            )}
          </section>
        </motion.div>
      </div>
    </WorkspaceLayout>
  );
}
