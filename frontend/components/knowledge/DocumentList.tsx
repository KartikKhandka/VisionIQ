import React from 'react';
import { format } from 'date-fns';
import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { knowledgeApi } from '@/lib/api';
import toast from 'react-hot-toast';

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
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm mt-8">
        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
        <p className="text-gray-500 mt-1">Upload a document above to add it to the knowledge base.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800">Indexed Knowledge</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {doc.document_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button 
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete document"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
