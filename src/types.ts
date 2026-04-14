export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'docx';
  uploadDate: string;
  status: 'processing' | 'ready' | 'failed';
  chunks: number;
  size: string;
}

export interface Citation {
  id: number;
  text: string;
  document_name: string;
  score: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  reasoning_content?: string; // DeepSeek reasoner thinking process
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export interface AppSettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  chunkSize: number;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
}
