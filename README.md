# QueryMindRAG - 智询 RAG

基于 RAG（检索增强生成）架构的智能问答系统。

## 架构

```
Nginx (80)
├── /        → 前端 (React + Vite)
└── /api/*   → 后端 (FastAPI :8000)
                ├── /api/chat         → DeepSeek + RAG 检索
                ├── /api/documents/*  → 文档管理
                └── text2vec-base-chinese (本地 Embedding)
```

## 目录

```
├── backend/            Python 后端
│   ├── main.py         FastAPI 主文件
│   └── requirements.txt
├── src/                React 前端
├── scripts/
│   ├── deploy.sh       首次部署
│   └── update.sh       更新重启
├── .env.example        环境变量模板
└── package.json        前端依赖
```

## 部署

```bash
bash scripts/deploy.sh       # 安装后端环境
nano .env                     # 填入 DEEPSEEK_API_KEY
systemctl start querymindrag  # 启动后端
npm install && npm run build  # 构建前端
```

## 服务管理

```bash
# 启动/停止/重启
systemctl start querymindrag
systemctl stop querymindrag
systemctl restart querymindrag

# 查看日志
journalctl -u querymindrag -f

# Nginx
systemctl start/stop/reload nginx

# 代码更新后一键重启
bash scripts/update.sh
```
