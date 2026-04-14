import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, BarChart3, FileText, MessageSquare, Clock, LogOut, ChevronRight, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function UserPage() {
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState('测试用户');
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    setUserName(tempName);
    setIsEditingName(false);
  };

  // Mock usage stats
  const stats = [
    { label: '总对话数', value: '12', icon: MessageSquare, color: 'text-blue-500' },
    { label: '知识库文档', value: '3', icon: FileText, color: 'text-green-500' },
    { label: '总提问数', value: '48', icon: BarChart3, color: 'text-purple-500' },
    { label: '使用天数', value: '7', icon: Clock, color: 'text-amber-500' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
        <p className="text-muted-foreground">管理您的账户信息和查看使用统计。</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-8 w-48"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') { setIsEditingName(false); setTempName(userName); }
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveName}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{userName}</h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => { setTempName(userName); setIsEditingName(true); }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>2233760838g@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>免费版用户</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div>
        <h2 className="text-lg font-semibold mb-4">使用统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">账户操作</CardTitle>
          <CardDescription>管理您的账户设置。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <span className="text-sm font-medium block">模型与 RAG 设置</span>
                <span className="text-[10px] text-muted-foreground">配置 AI 模型参数和检索设置</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate('/knowledge')}
            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <span className="text-sm font-medium block">知识库管理</span>
                <span className="text-[10px] text-muted-foreground">上传和管理您的文档</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <Separator className="my-2" />

          <button
            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors text-left"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400 block">清除数据并重置</span>
                <span className="text-[10px] text-muted-foreground">清除所有本地存储的设置和数据</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
