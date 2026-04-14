import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Library, Settings, Plus, Trash2, User } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Conversation } from '@/types';
import { mockApi } from '@/lib/mockApi';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    mockApi.getConversations().then(setConversations);
  }, []);

  const handleNewChat = () => {
    navigate('/chat');
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            智
          </div>
          <span className="text-xl font-bold tracking-tight">智询 RAG</span>
        </div>
        
        <Button 
          className="w-full justify-start gap-2 mb-4" 
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          新对话
        </Button>

        <nav className="space-y-1">
          <NavLink
            to="/chat"
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            <MessageSquare className="h-4 w-4" />
            对话
          </NavLink>
          <NavLink
            to="/knowledge"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            <Library className="h-4 w-4" />
            知识库
          </NavLink>
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            <Settings className="h-4 w-4" />
            设置
          </NavLink>
        </nav>
      </div>

      <Separator className="mx-6 mb-4" />

      <div className="px-6 mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          历史记录
        </span>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="group flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-secondary/50 cursor-pointer transition-colors"
              onClick={() => {
                navigate(`/chat/${conv.id}`);
                onNavigate?.();
              }}
            >
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-medium">{conv.title}</span>
                <span className="text-[10px] text-muted-foreground">{conv.date}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setConversations(prev => prev.filter(c => c.id !== conv.id));
                }}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto px-6 pt-4">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">测试用户</span>
            <span className="text-xs text-muted-foreground truncate">2233760838g@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
