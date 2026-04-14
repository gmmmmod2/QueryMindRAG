import { useState } from 'react';
import { Moon, Sun, Globe, Key, Cpu, Sliders, Database, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState('sk-••••••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);
  const [temperature, setTemperature] = useState([0.7]);
  const [topK, setTopK] = useState([5]);

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
              <CardDescription>配置您的 Gemini API 访问权限。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={() => setShowKey(!showKey)}>
                    {showKey ? "隐藏" : "显示"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  密钥将安全地存储在您的浏览器本地存储中。
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
                  <Button variant="secondary" className="h-auto py-4 flex flex-col items-start border-2 border-primary">
                    <span className="font-bold">Gemini 1.5 Pro</span>
                    <span className="text-[10px] opacity-70">最强大的性能</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-start">
                    <span className="font-bold">Gemini 1.5 Flash</span>
                    <span className="text-[10px] opacity-70">极速响应</span>
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      Temperature (温度)
                    </Label>
                    <span className="text-sm font-mono">{temperature[0]}</span>
                  </div>
                  <Slider
                    value={temperature}
                    onValueChange={(val) => setTemperature(val as number[])}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    控制回答的随机性。较低的值更确定，较高的值更具创意。
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
                  <span className="text-sm font-mono">{topK[0]}</span>
                </div>
                <Slider
                  value={topK}
                  onValueChange={(val) => setTopK(val as number[])}
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
        <Button className="gap-2 px-8">
          <Save className="h-4 w-4" />
          保存所有更改
        </Button>
      </div>
    </div>
  );
}
