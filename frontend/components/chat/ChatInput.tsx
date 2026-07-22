import React, { useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ input, setInput, onSubmit, isLoading, disabled = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !disabled) {
        // Trigger submit
        onSubmit(e as any);
      }
    }
  };

  return (
    <div className="w-full flex justify-center pb-8 px-4">
      <form 
        onSubmit={onSubmit}
        className="w-full max-w-3xl relative flex items-end gap-2 bg-[#2a2a2b]/60 backdrop-blur-2xl p-2 rounded-3xl border border-white/[0.05] shadow-[0_0_40px_rgba(0,0,0,0.5)] focus-within:border-white/[0.15] focus-within:bg-[#2a2a2b]/80 transition-all duration-300"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-[200px] py-3.5 px-5 text-white placeholder-white/30 text-[15px]"
          rows={1}
          disabled={isLoading || disabled}
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="shrink-0 p-3 rounded-full bg-white text-black font-bold hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 transition-all mb-1 mr-1"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
