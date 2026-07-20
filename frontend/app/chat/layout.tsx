'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { chatApi } from '@/lib/api';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = useState<any[]>([]);
  const router = useRouter();

  const fetchConversations = async () => {
    try {
      const response = await chatApi.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleNewChat = async () => {
    try {
      const res = await chatApi.createConversation({ title: 'New Conversation' });
      router.push(`/chat/${res.data.id}`);
      fetchConversations();
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await chatApi.deleteConversation(id);
      fetchConversations();
      // If currently viewing the deleted chat, redirect to /chat
      router.push('/chat');
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="flex h-[calc(100vh-4rem)] bg-[#09090b] overflow-hidden rounded-xl border border-white/10 shadow-xl mt-4 mx-4 mb-4 relative z-10">
          <ChatSidebar
            conversations={conversations}
            onDelete={handleDelete}
            onNewChat={handleNewChat}
          />
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
