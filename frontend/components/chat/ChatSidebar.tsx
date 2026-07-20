import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusIcon, ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({ conversations, onDelete, onNewChat }: ChatSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-black/40 border-r border-white/10 flex flex-col h-full text-white relative z-10 backdrop-blur-md">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="btn--primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="text-center text-muted-2 text-sm mt-8 font-medium">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between px-3 py-3 rounded-xl transition-all border ${
                pathname === `/chat/${conv.id}`
                  ? 'bg-white/10 border-white/10 text-white shadow-sm'
                  : 'border-transparent text-muted hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Link href={`/chat/${conv.id}`} className="flex-1 flex items-center gap-3 overflow-hidden">
                <ChatBubbleLeftIcon className="w-5 h-5 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">{conv.title}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
              
              <button
                onClick={() => onDelete(conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
