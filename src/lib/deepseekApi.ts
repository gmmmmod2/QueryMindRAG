import { Document, Conversation, Message, Citation } from '../types';

// ============ Settings Management ============
export interface DeepSeekSettings {
  model: 'deepseek-chat' | 'deepseek-reasoner';
  temperature: number;
  topK: number;
}

const DEFAULT_SETTINGS: DeepSeekSettings = { model: 'deepseek-chat', temperature: 0.7, topK: 5 };

export function getSettings(): DeepSeekSettings {
  try {
    const saved = localStorage.getItem('deepseek-settings');
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<DeepSeekSettings>) {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('deepseek-settings', JSON.stringify(updated));
  return updated;
}

// ============ API Client ============
export const deepseekApi = {
  // --- Documents (real backend) ---
  getDocuments: async (): Promise<Document[]> => {
    try {
      const resp = await fetch('/api/documents');
      if (!resp.ok) return [];
      return resp.json();
    } catch { return []; }
  },

  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch('/api/documents/upload', { method: 'POST', body: formData });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || '上传失败');
    }
    return resp.json();
  },

  deleteDocument: async (id: string): Promise<void> => {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
  },

  getDocumentContent: async (id: string): Promise<{ content: string; name: string; chunks: number }> => {
    const resp = await fetch(`/api/documents/${id}/content`);
    if (!resp.ok) throw new Error('无法获取文档内容');
    return resp.json();
  },

  // --- Conversations (local storage) ---
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const saved = localStorage.getItem('conversations');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  },

  saveConversation: (conv: Conversation) => {
    try {
      const saved = localStorage.getItem('conversations');
      const convs: Conversation[] = saved ? JSON.parse(saved) : [];
      const idx = convs.findIndex(c => c.id === conv.id);
      if (idx >= 0) convs[idx] = conv; else convs.unshift(conv);
      localStorage.setItem('conversations', JSON.stringify(convs.slice(0, 50)));
    } catch {}
  },

  deleteConversation: (id: string) => {
    try {
      const saved = localStorage.getItem('conversations');
      const convs: Conversation[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem('conversations', JSON.stringify(convs.filter(c => c.id !== id)));
    } catch {}
  },

  // --- Chat (real backend with RAG) ---
  chat: async (
    question: string, conversationId?: string, history: Message[] = []
  ): Promise<{ answer: string; reasoning_content?: string; citations: Citation[]; conversation_id: string }> => {
    const settings = getSettings();
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: '你是智询AI助手，一个基于RAG架构的智能问答系统。请根据用户的问题提供准确、有帮助的回答。' },
    ];
    for (const msg of history.slice(-10)) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: 'user', content: question });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model: settings.model, temperature: settings.temperature, use_rag: true, top_k: settings.topK }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API 请求失败 (${response.status})`);
    }
    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice) throw new Error('API 返回了空的响应');
    return {
      answer: choice.message?.content || '抱歉，未能生成回答。',
      reasoning_content: choice.message?.reasoning_content,
      citations: data.citations || [],
      conversation_id: conversationId || 'conv_' + Date.now(),
    };
  },
};
