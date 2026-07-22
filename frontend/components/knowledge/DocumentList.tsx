import React from 'react';
import { format } from 'date-fns';
import { knowledgeApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { FileText, Trash2, File, Calendar, CheckCircle2 } from 'lucide-react';

export interface KnowledgeDocument {
  id: string;
  title: string;
  document_type: string;
  created_at: string;
}

interface DocumentListProps {
  documents: KnowledgeDocument[];
  onRefresh: () => void;
}

export default function DocumentList({ documents, onRefresh }: DocumentListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document from the knowledge base?')) {
      try {
        await knowledgeApi.deleteDocument(id);
        toast.success('Document deleted from knowledge base');
        onRefresh();
      } catch (error) {
        console.error('Failed to delete document', error);
        toast.error('Failed to delete document');
      }
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
        <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-white/30" />
        </div>
        <h3 className="text-[15px] font-semibold text-white/90">No documents indexed</h3>
        <p className="text-[13px] text-white/40 mt-1 max-w-sm text-center">Upload manuals, guides, or specifications to allow the AI to reference them.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40 w-1/2">Title</th>
              <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40">Status</th>
              <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40">Uploaded</th>
              <th className="pb-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, idx) => (
              <tr key={doc.id} className="group border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-brandAccent shrink-0" />
                    <div>
                      <p className="text-[14px] font-medium text-white/90 truncate max-w-[300px]">{doc.title}</p>
                      <p className="text-[11px] text-white/40 uppercase tracking-wider mt-0.5">{doc.document_type || "PDF Document"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Indexed</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 text-white/50 text-[13px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
