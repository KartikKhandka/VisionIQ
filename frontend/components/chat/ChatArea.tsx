import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Copy, Check, ChevronDown, BookOpen, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessage: string;
}


const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-lg overflow-hidden my-6 shadow-soft border border-gray-200">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100/50 border-b border-gray-200">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy code'}
          </button>
        </div>
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="!m-0 !rounded-none !bg-[#1E1E1E]"
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code {...props} className="bg-white/10 px-1.5 py-0.5 rounded-md text-brandAccent font-mono text-sm border border-white/10">
      {children}
    </code>
  );
};

export default function ChatArea({ messages, isLoading, streamingMessage }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessageContent = (fullContent: string) => {
    let content = fullContent;
    let citations = null;


    if (fullContent.includes('---CITATIONS---')) {
      const parts = fullContent.split('---CITATIONS---');
      content = parts[0];
      try {
        if (parts[1].trim()) {
          citations = JSON.parse(parts[1].trim());
        }
      } catch (e) {

      }
    }
    
    if (fullContent.includes('[System:')) {
      const match = fullContent.match(/\[System:\s*(.*?)\]/);
        if (match) {
          return (
            <div className="bg-orange-950/40 border border-orange-900/50 p-4 rounded-xl flex items-start gap-3 w-full my-2 shadow-lg backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-orange-300 leading-relaxed">{match[1]}</span>
            </div>
          );
        }
      }

      return (
        <div className="w-full">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              a: ({ node, ...props }) => <a {...props} className="text-brandAccent hover:text-[#cc0600] underline decoration-brandAccent/30 hover:decoration-brandAccent/60 transition-colors" target="_blank" rel="noopener noreferrer" />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6 rounded-lg border border-white/10 shadow-sm">
                  <table {...props} className="min-w-full divide-y divide-white/10 text-sm" />
                </div>
              ),
              th: ({ node, ...props }) => <th {...props} className="bg-white/5 px-4 py-3 text-left font-semibold text-white" />,
              td: ({ node, ...props }) => <td {...props} className="px-4 py-3 border-t border-white/5 text-gray-300" />,
              blockquote: ({ node, ...props }) => (
                <blockquote {...props} className="border-l-4 border-brandAccent/30 pl-4 py-1 my-4 italic text-gray-400 bg-brandAccent/5 rounded-r-lg" />
              )
            }}
          >
            {content}
          </ReactMarkdown>

          {citations && citations.length > 0 && (
            <div className="mt-8 pt-4 border-t border-white/10 w-full space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brandAccent" />
                Sources
              </h4>
              <div className="flex flex-col gap-3">
                {citations.map((c: any) => (
                  <details key={c.id} className="group border border-white/10 rounded-xl bg-black/20 overflow-hidden">
                    <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200">{c.title}</span>
                        <span className="text-xs text-gray-500">Page {c.page}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.score > 0.8 ? 'bg-green-50 text-green-700 border-green-200' :
                            c.score > 0.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-red-50 text-red-700 border-red-200'
                          }`}>
                          {(c.score * 100).toFixed(0)}% Match
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                      </div>
                    </summary>
                    <div className="p-4 border-t border-white/5 bg-black/40">
                      <p className="text-sm text-gray-400 leading-relaxed font-serif whitespace-pre-wrap">{c.text}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex-1 overflow-y-auto bg-transparent flex flex-col items-center pb-32 scroll-smooth">
        <div className="w-full max-w-4xl flex flex-col space-y-6 p-4 py-8">
          {messages.length === 0 && !streamingMessage && !isLoading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6"
            >
              <div className="w-20 h-20 bg-brandAccent/10 rounded-[20px] flex items-center justify-center border border-brandAccent/20">
                <Sparkles className="w-10 h-10 text-brandAccent" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Welcome to VisionIQ</h2>
                <p className="text-muted max-w-md mx-auto">
                  Upload an image or document, and ask me anything about its contents or your knowledge base.
                </p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 sm:gap-6 py-6 group w-full border-b border-transparent hover:border-white/[0.02]`}
                >
                  {msg.role !== 'user' && (
                    <div className="shrink-0 pt-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-brandAccent">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  <div className={`flex-1 min-w-0 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`prose prose-invert max-w-none w-full ${msg.role === 'user' ? 'text-white' : 'text-gray-300'}`}>
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        renderMessageContent(msg.content)
                      )}
                    </div>

                    {/* Footer metadata & actions */}
                    <div className={`flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex-row`}>
                      {msg.role !== 'user' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1.5 p-1.5 rounded-md text-xs font-medium text-muted hover:text-white hover:bg-white/5 transition-all"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="shrink-0 pt-1 hidden md:block">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Streaming Message */}
              {streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 sm:gap-6 py-6 w-full"
                >
                  <div className="shrink-0 pt-1">
                    <div className="w-8 h-8 flex items-center justify-center text-brandAccent">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 prose prose-invert max-w-none text-gray-300">
                    {renderMessageContent(streamingMessage)}
                    <span className="inline-block w-2 h-4 ml-1 bg-brandAccent animate-pulse align-middle rounded-sm"></span>
                  </div>
                </motion.div>
              )}

              {/* Loading Indicator (before stream starts) */}
              {isLoading && !streamingMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 sm:gap-6 py-6 w-full"
                >
                  <div className="shrink-0 pt-1">
                    <div className="w-8 h-8 flex items-center justify-center text-brandAccent">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <div className="w-1.5 h-1.5 bg-brandAccent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-brandAccent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-brandAccent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={bottomRef} className="h-10" />
        </div>
      </div>
    );
  }
