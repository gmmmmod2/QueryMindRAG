import { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Key, Cpu, Sliders, Database, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { getSettings, saveSettings, type DeepSeekSettings } from '@/lib/deepseekApi';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<DeepSeekSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  const handleModelChange = (model: DeepSeekSettings['model']) => {
    setSettings(prev => ({ ...prev, model }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground">配置您的 AI 模型和系统偏好。</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">通用</TabsTrigger>
          <TabsTrigger value="model">模型参数</TabsTrigger>
          <TabsTrigger value="rag">RAG 配置</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                界面设置
              </CardTitle>
              <CardDescription>管理语言和外观偏好。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>深色模式</Label>
                  <p className="text-xs text-muted-foreground">切换界面的明暗主题。</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>系统语言</Label>
                  <p className="text-xs text-muted-foreground">选择界面显示的语言。</p>
                </div>
                <Button variant="outline" size="sm">简体中文</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-4 w-4" />
                API 密钥
              </CardTitle>
              <CardDescription>DeepSeek API 密钥通过 Vercel 环境变量配置，无需在此处填写。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground">
                  API 密钥已通过服务端环境变量 <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">DEEPSEEK_API_KEY</code> 安全配置。
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  如需更改，请前往 Vercel 项目设置 → Environment Variables 进行修改。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                模型选择
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>当前模型</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={settings.model === 'deepseek-chat' ? 'secondary' : 'outline'}
                    className={`h-auto py-4 flex flex-col items-start ${settings.model === 'deepseek-chat' ? 'border-2 border-primary' : ''}`}
                    onClick={() => handleModelChange('deepseek-chat')}
                  >
                    <span className="font-bold">DeepSeek Chat</span>
                    <span className="text-[10px] opacity-70">快速响应，适合日常对话</span>
                  </Button>
                  <Button
                    variant={settings.model === 'deepseek-reasoner' ? 'secondary' : 'outline'}
                    className={`h-auto py-4 flex flex-col items-start ${settings.model === 'deepseek-reasoner' ? 'border-2 border-primary' : ''}`}
                    onClick={() => handleModelChange('deepseek-reasoner')}
                  >
                    <span className="font-bold">DeepSeek Reasoner</span>
                    <span className="text-[10px] opacity-70">深度思考，适合复杂推理</span>
                  </Button>
                </div>
                {settings.model === 'deepseek-reasoner' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ 思考模式响应时间较长，但推理质量更高。Temperature 参数在此模式下不生效。
                  </p>
                )}
              </div>
              <Separator />
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      Temperature (温度)
                    </Label>
                    <span className="text-sm font-mono">{settings.temperature}</span>
                  </div>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={(val) => setSettings(prev => ({ ...prev, temperature: val[0] }))}
                    max={1}
                    min={0}
                    step={0.1}
                    disabled={settings.model === 'deepseek-reasoner'}
                  />
                  <p className="text-xs text-muted-foreground">
                    控制回答的随机性。较低的值更确定，较高的值更具创意。
                    {settings.model === 'deepseek-reasoner' && ' （思考模式下此参数不可用）'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-4 w-4" />
                检索配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Top-K 检索数量</Label>
                  <span className="text-sm font-mono">{settings.topK}</span>
                </div>
                <Slider
                  value={[settings.topK]}
                  onValueChange={(val) => setSettings(prev => ({ ...prev, topK: val[0] }))}
                  min={1}
                  max={10}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  每次提问时从知识库中检索的相关片段数量。
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <Label>分块策略 (Chunk Size)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">512 tokens</Button>
                  <Button variant="secondary" size="sm">1024 tokens</Button>
                  <Button variant="outline" size="sm">2048 tokens</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button className="gap-2 px-8" onClick={handleSave}>
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              已保存
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存所有更改
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
