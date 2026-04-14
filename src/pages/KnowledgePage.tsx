import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, Clock, AlertCircle, Search, Filter, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document } from '@/types';
import { deepseekApi } from '@/lib/deepseekApi';
import { pinyinMatch } from '@/lib/pinyin';
import { motion, AnimatePresence } from 'motion/react';

// Mock document content for preview
const MOCK_CONTENT: Record<string, string> = {
  '1': `# 深度学习基础

## 第一章：神经网络概述

深度学习是机器学习的一个分支，它通过多层神经网络来学习数据的层次化表示。

### 1.1 感知机模型
感知机是最简单的神经网络结构，由输入层和输出层组成。它可以解决线性可分问题。

### 1.2 多层感知机 (MLP)
多层感知机在感知机的基础上添加了隐藏层，使其能够处理非线性问题。通过反向传播算法进行训练。

### 1.3 激活函数
常用的激活函数包括：
- **ReLU**: f(x) = max(0, x)，计算效率高
- **Sigmoid**: f(x) = 1/(1+e^(-x))，输出范围 (0,1)
- **Tanh**: f(x) = (e^x - e^(-x))/(e^x + e^(-x))

## 第二章：卷积神经网络

卷积神经网络 (CNN) 特别适合处理图像数据，通过卷积操作提取局部特征...`,

  '2': `# RAG 架构指南

## 什么是 RAG？

RAG（Retrieval-Augmented Generation，检索增强生成）是一种将信息检索与生成式 AI 相结合的技术架构。

## 核心组件

### 1. 文档处理管线
- 文档加载与解析
- 文本分块 (Chunking)
- 向量化 (Embedding)
- 存储到向量数据库

### 2. 检索器 (Retriever)
检索器负责从海量文档中快速定位与问题最相关的知识块。常用的检索方式包括：
- 语义检索：基于向量相似度
- 关键词检索：基于 BM25 等算法
- 混合检索：结合两种方式

### 3. 生成器 (Generator)
生成器通过将检索到的上下文与原始问题结合，生成更准确的回答。

## 最佳实践
- 选择合适的分块大小 (512-1024 tokens)
- 使用重排序 (Reranking) 提升检索质量
- 实施上下文压缩减少噪声`,

  '3': `# 2024 大模型技术报告

**状态：处理中...**

此文档正在处理中，内容解析完成后将在此显示。

预计包含以下章节：
- 大模型发展趋势
- 主流模型对比
- 训练技术演进
- 推理优化方案
- 行业应用案例`,
};

export function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  useEffect(() => {
    deepseekApi.getDocuments().then(setDocuments);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    let interval: ReturnType<typeof setInterval> | null = null;
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
      const newDoc = await deepseekApi.uploadDocument(file);
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
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    await deepseekApi.deleteDocument(id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // Pinyin-enabled search
  const filteredDocs = documents.filter(doc =>
    pinyinMatch(doc.name, searchQuery)
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
              placeholder="搜索文档（支持拼音）..."
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
                  <Card
                    className="group hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* Document Preview Panel */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm truncate">{previewDoc.name}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {previewDoc.size} • {previewDoc.uploadDate} • {previewDoc.chunks} 个分块
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {(MOCK_CONTENT[previewDoc.id] || '暂无可预览的内容。此文档的内容将在处理完成后显示。')
                    .split('\n')
                    .map((line, i) => {
                      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-6 mb-2">{line.slice(3)}</h2>;
                      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
                      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>;
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-sm">{line.slice(2, -2)}</p>;
                      if (line.trim() === '') return <div key={i} className="h-2" />;
                      return <p key={i} className="text-sm leading-relaxed text-foreground/80">{line}</p>;
                    })}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t flex justify-end">
                <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                  关闭
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
