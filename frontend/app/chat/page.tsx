'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function ChatIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-transparent h-full">
      <div className="text-center space-y-4 max-w-md p-6">
        <div className="w-16 h-16 bg-candyApple/10 text-candyApple rounded-2xl flex items-center justify-center mx-auto border border-candyApple/20">
          <SparklesIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Welcome to VisionIQ AI Chat</h2>
        <p className="text-muted">
          Select a conversation from the sidebar or start a new chat to ask questions about your knowledge base and scanned objects.
        </p>
      </div>
    </div>
  );
}
