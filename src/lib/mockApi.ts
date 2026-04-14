import { Document, Conversation, Message, Citation } from '../types';

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

export const mockApi = {
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

  chat: async (question: string, conversationId?: string): Promise<{ answer: string; citations: Citation[]; conversation_id: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          answer: `这是一个关于 "${question}" 的模拟回答。在RAG系统中，我们会首先检索知识库中的相关文档，然后将这些信息喂给大模型。根据您的提问，我找到了以下相关信息 [1]。此外，该技术在工业界已有广泛应用 [2]。`,
          citations: [
            { id: 1, text: `这是关于 "${question}" 的第一条参考信息，来源于您的知识库。`, document_name: '深度学习基础.pdf', score: 0.92 },
            { id: 2, text: `这是关于 "${question}" 的第二条参考信息，展示了RAG的实际应用场景。`, document_name: 'RAG架构指南.md', score: 0.85 },
          ],
          conversation_id: conversationId || 'new_conv_' + Date.now(),
        });
      }, 1500);
    });
  },
};
