import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, Clock, AlertCircle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { motion, AnimatePresence } from 'motion/react';

export function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    mockApi.getDocuments().then(setDocuments);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    let interval: ReturnType<typeof setInterval> | null = null;

    // Simulate progress
    interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          if (interval) clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      const newDoc = await mockApi.uploadDocument(file);
      setDocuments(prev => [newDoc, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      if (interval) clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }

    // Reset the input so the same file can be re-uploaded
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    await mockApi.deleteDocument(id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">知识库</h1>
          <p className="text-muted-foreground">管理您的文档，为 AI 提供背景知识。</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">上传新文档</h3>
          <p className="text-sm text-muted-foreground mb-6">
            支持 PDF, TXT, MD, DOCX 格式 (最大 20MB)
          </p>
          
          <div className="w-full max-w-xs">
            {isUploading ? (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">正在处理文档... {uploadProgress}%</p>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Button variant="default" className="w-full pointer-events-none">
                  选择文件
                </Button>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.txt,.md,.docx" 
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">所有文档 ({filteredDocs.length})</h2>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="py-20 text-center border rounded-xl bg-muted/10">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">未找到相关文档</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="group hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <CardTitle className="text-sm font-bold truncate mb-1">
                        {doc.name}
                      </CardTitle>
                      <CardDescription className="text-[10px] flex items-center gap-2 mb-4">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                      </CardDescription>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {doc.status === 'ready' ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-[10px] h-5">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              已就绪
                            </Badge>
                          ) : doc.status === 'processing' ? (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none text-[10px] h-5">
                              <Clock className="h-3 w-3 mr-1 animate-spin" />
                              处理中
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none text-[10px] h-5">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              失败
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {doc.chunks} 个分块
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
