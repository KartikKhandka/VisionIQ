'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatArea, { Message } from '@/components/chat/ChatArea';
import ChatInput from '@/components/chat/ChatInput';
import { chatApi } from '@/lib/api';

export default function ChatConversationPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadConversation(id as string);
    }
  }, [id]);

  const loadConversation = async (conversationId: string) => {
    try {
      const res = await chatApi.getConversation(conversationId);
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgContent = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    // Add user message optimistically
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsgContent,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // We will make a raw fetch call to stream the response
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/chat/${id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: userMsgContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsgContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantMsgContent += chunk;
        setStreamingMessage(assistantMsgContent);
      }

      // Add final assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMsgContent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage('');

    } catch (error) {
      console.error('Chat error:', error);
      // Optional: show error message in chat
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      <ChatArea 
        messages={messages} 
        isLoading={isLoading} 
        streamingMessage={streamingMessage} 
      />
      <div className="absolute bottom-0 w-full z-10 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent pt-12 pb-2">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
