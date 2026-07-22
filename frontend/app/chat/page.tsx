'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';



export default function ChatIndexPage() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center bg-transparent h-[calc(100vh-100px)]">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="w-16 h-16 bg-brandAccent/10 text-brandAccent rounded-2xl flex items-center justify-center mx-auto border border-brandAccent/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <SparklesIcon className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase text-white">VisionIQ Engine</h2>
          <p className="text-white/60 text-sm font-medium">
            Select a conversation from the sidebar or start a new chat to ask questions about your knowledge base and scanned objects.
          </p>
        </div>
      </div>
    </>
  );
}
