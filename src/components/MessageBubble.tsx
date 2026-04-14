import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Citation } from '@/types';
import { cn } from '@/lib/utils';
import { Copy, RotateCcw, User, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface MessageBubbleProps {
  message: Message;
  onCitationClick: (citation: Citation) => void;
  onRegenerate?: () => void;
}

export function MessageBubble({ message, onCitationClick, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const renderContent = (children: React.ReactNode): React.ReactNode => {
    // Recursively process children to replace [1], [2] with clickable components
    if (typeof children === 'string') {
      const parts = children.split(/(\[\d+\])/g);
      return parts.map((part, i) => {
        const match = part.match(/\[(\d+)\]/);
        if (match && message.citations) {
          const id = parseInt(match[1]);
          const citation = message.citations.find(c => c.id === id);
          if (citation) {
            return (
              <button
                key={i}
                onClick={() => onCitationClick(citation)}
                className="inline-flex items-center justify-center w-5 h-5 ml-1 text-[10px] font-bold bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {id}
              </button>
            );
          }
        }
        return part;
      });
    }
    if (Array.isArray(children)) {
      return children.map((child, i) => (
        <React.Fragment key={i}>{renderContent(child)}</React.Fragment>
      ));
    }
    return children;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-4 py-8 px-4 md:px-8",
        isUser ? "bg-background" : "bg-muted/30"
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
            <User className="h-5 w-5 text-secondary-foreground" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">
            {isUser ? "您" : "智询 AI"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {message.timestamp}
          </span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{renderContent(children)}</p>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigator.clipboard.writeText(message.content)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {onRegenerate && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRegenerate}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
