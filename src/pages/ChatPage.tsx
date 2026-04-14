import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '@/components/MessageBubble';
import { CitationPanel } from '@/components/CitationPanel';
import { Message, Citation } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { motion } from 'motion/react';

export function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      mockApi.getConversations().then(convs => {
        const conv = convs.find(c => c.id === id);
        if (conv) setMessages(conv.messages);
      });
    } else {
      setMessages([]);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await mockApi.chat(userMessage.content, id);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "什么是RAG架构？",
    "如何提高检索的准确性？",
    "向量数据库的作用是什么？",
    "Gemini Pro和Flash有什么区别？"
  ];

  return (
    <div className="flex flex-col h-full relative">
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">您好，我是智询 AI</h1>
            <p className="text-muted-foreground max-w-md mb-12">
              基于您的知识库，我可以为您提供准确的问答服务。请在下方输入您的问题。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(q)}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-all text-left group"
                >
                  <span className="text-sm font-medium">{q}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                onCitationClick={setActiveCitation} 
              />
            ))}
            {isLoading && (
              <div className="flex w-full gap-4 py-8 px-4 md:px-8 bg-muted/30">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary-foreground animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">智询 AI</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end gap-2 p-2 rounded-2xl border bg-card shadow-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                // Auto-resize textarea
                const target = e.target;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入您的问题..."
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-2 px-3 text-sm max-h-32"
            />
            <Button 
              size="icon" 
              className="rounded-xl h-10 w-10 shrink-0" 
              disabled={!inputValue.trim() || isLoading}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Enter 发送，Shift + Enter 换行 • 基于您的知识库生成
          </p>
        </div>
      </div>

      <CitationPanel 
        citation={activeCitation} 
        onClose={() => setActiveCitation(null)} 
      />
    </div>
  );
}
