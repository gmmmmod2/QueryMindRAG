import { Document, Conversation, Message, Citation } from '../types';

// ============ Settings Management ============

export interface DeepSeekSettings {
  model: 'deepseek-chat' | 'deepseek-reasoner';
  temperature: number;
  topK: number;
}

const DEFAULT_SETTINGS: DeepSeekSettings = {
  model: 'deepseek-chat',
  temperature: 0.7,
  topK: 5,
};

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

// ============ Mock Data (kept for documents & history) ============

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: '深度学习基础.pdf',
    type: 'pdf',
    uploadDate: '2024-03-10',
    status: 'ready',
    chunks: 124,
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'RAG架构指南.md',
    type: 'md',
    uploadDate: '2024-03-12',
    status: 'ready',
    chunks: 45,
    size: '12 KB',
  },
  {
    id: '3',
    name: '2024大模型技术报告.docx',
    type: 'docx',
    uploadDate: '2024-03-15',
    status: 'processing',
    chunks: 0,
    size: '1.1 MB',
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    title: '关于RAG架构的咨询',
    date: '2024-03-15',
    messages: [
      {
        id: 'msg_1',
        role: 'user',
        content: '什么是RAG架构？它的核心组件有哪些？',
        timestamp: '10:30',
      },
      {
        id: 'msg_2',
        role: 'assistant',
        content: 'RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合了信息检索和生成式AI的技术架构。它的核心组件通常包括：\n\n1. **向量数据库**：存储文档的向量表示。\n2. **检索器**：根据用户查询从数据库中寻找相关片段 [1]。\n3. **生成器**：通常是大语言模型，利用检索到的信息生成回答 [2]。\n\n这种架构能有效减少模型的幻觉问题。',
        timestamp: '10:31',
        citations: [
          { id: 1, text: '检索器负责从海量文档中快速定位与问题最相关的知识块。', document_name: 'RAG架构指南.md', score: 0.95 },
          { id: 2, text: '生成器通过将检索到的上下文与原始问题结合，生成更准确的回答。', document_name: 'RAG架构指南.md', score: 0.88 },
        ],
      },
    ],
  },
];

// ============ API ============

export const deepseekApi = {
  getDocuments: async (): Promise<Document[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_DOCUMENTS), 500));
  },

  uploadDocument: async (file: File): Promise<Document> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const validTypes = ['pdf', 'txt', 'md', 'docx'] as const;
        const fileType = validTypes.includes(ext as any) ? (ext as Document['type']) : 'txt';
        const newDoc: Document = {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          type: fileType,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'processing',
          chunks: 0,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        };
        resolve(newDoc);
      }, 2000);
    });
  },

  deleteDocument: async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  getConversations: async (): Promise<Conversation[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CONVERSATIONS), 500));
  },

  chat: async (
    question: string,
    conversationId?: string,
    history: Message[] = []
  ): Promise<{ answer: string; reasoning_content?: string; citations: Citation[]; conversation_id: string }> => {
    const settings = getSettings();

    // Build messages array with history
    const messages: { role: string; content: string }[] = [
      {
        role: 'system',
        content: '你是智询AI助手，一个基于RAG（检索增强生成）架构的智能问答系统。请根据用户的问题提供准确、有帮助的回答。如果你不确定答案，请诚实地说明。',
      },
    ];

    // Add conversation history (last 10 messages to keep within context limits)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current question
    messages.push({ role: 'user', content: question });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: settings.model,
          temperature: settings.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API 请求失败 (${response.status})`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice) {
        throw new Error('API 返回了空的响应');
      }

      const answer = choice.message?.content || '抱歉，未能生成回答。';
      const reasoning_content = choice.message?.reasoning_content;

      return {
        answer,
        reasoning_content,
        citations: [],
        conversation_id: conversationId || 'conv_' + Date.now(),
      };
    } catch (error: any) {
      // If the API call fails, throw the error so the UI can handle it
      throw new Error(error.message || '请求 DeepSeek API 时发生错误');
    }
  },
};
