import React from 'react';
import { AuthorizedImage } from '@/components/ui/AuthorizedImage';
import { Clock, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const ScanCard = ({ scan }: { scan: any }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    }
  };

  const formattedDate = scan.uploaded_at 
    ? new Date(scan.uploaded_at).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown Date';

  return (
    <div className="group relative flex flex-col sm:flex-row glass-card-hover overflow-hidden">
      {/* Thumbnail */}
      <div className="w-full sm:w-48 h-48 sm:h-auto bg-white/[0.02] relative flex-shrink-0">
        <AuthorizedImage 
          src={`/scans/${scan.id}/thumbnail?size=sm`}
          alt={scan.original_filename}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-slate-200 truncate pr-4">
              {scan.original_filename}
            </h3>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 whitespace-nowrap ${getStatusColor(scan.status)}`}>
              {getStatusIcon(scan.status)}
              <span className="capitalize">{scan.status}</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-slate-500 space-x-4 mb-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              {formattedDate}
            </div>
            {scan.file_size && (
              <div>{(scan.file_size / (1024 * 1024)).toFixed(1)} MB</div>
            )}
          </div>
          
          {scan.tags && scan.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {scan.tags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="chip-default">
                  #{tag}
                </span>
              ))}
              {scan.tags.length > 3 && (
                <span className="chip-default">
                  +{scan.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <Link 
          href={`/dashboard/scan/${scan.id}`}
          className="absolute inset-0 z-10"
        >
          <span className="sr-only">View Details</span>
        </Link>
        
        <div className="mt-4 flex items-center justify-end text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
          View Analysis <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  );
};
