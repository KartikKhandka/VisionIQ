import { api } from '@/services/api';

export const chatApi = {
  createConversation: (data: { title?: string; scan_id?: string; metadata_?: any }) => 
    api.post('/chat/conversations', data),
    
  getConversations: () => 
    api.get('/chat/conversations'),
    
  getConversation: (id: string) => 
    api.get(`/chat/${id}`),
    
  updateConversation: (id: string, data: { title?: string; metadata_?: any }) => 
    api.patch(`/chat/${id}`, data),
    
  deleteConversation: (id: string) => 
    api.delete(`/chat/${id}`),
};

export const knowledgeApi = {
  uploadDocument: (data: FormData) => 
    api.post('/knowledge/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
  getDocuments: () => 
    api.get('/knowledge'),
    
  getDocument: (id: string) => 
    api.get(`/knowledge/${id}`),
    
  deleteDocument: (id: string) => 
    api.delete(`/knowledge/${id}`),
};
