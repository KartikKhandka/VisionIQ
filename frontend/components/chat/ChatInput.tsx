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
    <div className="bg-transparent p-4 w-full flex justify-center pb-8">
      <form 
        onSubmit={onSubmit}
        className="w-full max-w-4xl relative flex items-end gap-3 vision-card p-2 !rounded-2xl border-white/10 focus-within:border-brandAccent/50 focus-within:ring-1 focus-within:ring-brandAccent/50 transition-shadow"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the scanned object or knowledge base..."
          className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-[200px] py-2 px-3 text-white placeholder-muted"
          rows={1}
          disabled={isLoading || disabled}
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="shrink-0 p-2.5 rounded-xl bg-brandAccent text-white hover:bg-[#cc0600] disabled:bg-white/5 disabled:text-muted transition-colors mb-0.5"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
        
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs text-gray-400">
            Press Enter to send, Shift+Enter for new line. AI can make mistakes.
          </span>
        </div>
      </form>
    </div>
  );
}
