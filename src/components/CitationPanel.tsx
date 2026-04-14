import { Citation } from '@/types';
import { X, FileText, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

interface CitationPanelProps {
  citation: Citation | null;
  onClose: () => void;
}

export function CitationPanel({ citation, onClose }: CitationPanelProps) {
  return (
    <AnimatePresence>
      {citation && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-full md:w-96 bg-background border-l shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              引用详情
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  来源文档
                </span>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{citation.document_name}</span>
                    <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                      相关度: {(citation.score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  原文片段
                </span>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm leading-relaxed italic text-foreground/80">
                  "{citation.text}"
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                查看完整文档
              </Button>
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
