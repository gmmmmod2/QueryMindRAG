"""
QueryMindRAG Backend - FastAPI Application
Provides: DeepSeek chat proxy, document management, RAG retrieval
"""
import os, uuid, json
from datetime import datetime
from pathlib import Path
from typing import Optional
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# ============ Config ============
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/chat/completions"
UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ============ App ============
app = FastAPI(title="QueryMindRAG API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ============ Embedding Model (lazy load) ============
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        print("Loading text2vec-base-chinese model...")
        _model = SentenceTransformer("shibing624/text2vec-base-chinese")
        print("Model loaded.")
    return _model

def embed_texts(texts: list[str]) -> np.ndarray:
    model = get_embedding_model()
    return model.encode(texts, normalize_embeddings=True)

# ============ In-Memory Vector Store ============
class VectorStore:
    def __init__(self):
        self.documents: list[dict] = []
        self.chunks: list[dict] = []

    def add_document(self, doc_meta: dict, chunk_texts: list[str]):
        self.documents.append(doc_meta)
        if not chunk_texts:
            return
        embeddings = embed_texts(chunk_texts)
        for i, text in enumerate(chunk_texts):
            self.chunks.append({
                "doc_id": doc_meta["id"],
                "doc_name": doc_meta["name"],
                "text": text,
                "embedding": embeddings[i],
            })

    def remove_document(self, doc_id: str):
        self.documents = [d for d in self.documents if d["id"] != doc_id]
        self.chunks = [c for c in self.chunks if c["doc_id"] != doc_id]

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        if not self.chunks:
            return []
        query_emb = embed_texts([query])[0]
        chunk_embs = np.array([c["embedding"] for c in self.chunks])
        scores = chunk_embs @ query_emb
        top_indices = np.argsort(scores)[::-1][:top_k]
        results = []
        for idx in top_indices:
            if scores[idx] < 0.1:
                continue
            c = self.chunks[idx]
            results.append({"text": c["text"], "document_name": c["doc_name"], "score": float(scores[idx])})
        return results

store = VectorStore()

# ============ Document Parsing ============
def parse_document(filepath: Path) -> list[str]:
    ext = filepath.suffix.lower()
    text = ""
    if ext in (".txt", ".md"):
        text = filepath.read_text(encoding="utf-8", errors="ignore")
    elif ext == ".pdf":
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(str(filepath))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            print(f"PDF parse error: {e}")
    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(str(filepath))
            text = "\n".join(p.text for p in doc.paragraphs)
        except Exception as e:
            print(f"DOCX parse error: {e}")
    else:
        text = filepath.read_text(encoding="utf-8", errors="ignore")
    if not text.strip():
        return []
    return split_into_chunks(text)

def split_into_chunks(text: str, chunk_size: int = 512, overlap: int = 64) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunk = text[start:start + chunk_size].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# ============ Request Models ============
class ChatRequest(BaseModel):
    messages: list[dict]
    model: str = "deepseek-chat"
    temperature: float = 0.7
    use_rag: bool = True
    top_k: int = 5

# ============ Routes ============
@app.get("/api/health")
async def health():
    return {"status": "ok", "documents": len(store.documents), "chunks": len(store.chunks)}

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not DEEPSEEK_API_KEY:
        raise HTTPException(500, "DEEPSEEK_API_KEY not configured. Set it in .env file.")
    messages = list(req.messages)
    citations = []
    # RAG retrieval
    if req.use_rag and store.chunks:
        user_query = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_query = msg.get("content", "")
                break
        if user_query:
            results = store.search(user_query, top_k=req.top_k)
            if results:
                context_parts = []
                for i, r in enumerate(results):
                    context_parts.append(f"[{i+1}] (来源: {r['document_name']}, 相关度: {r['score']:.2f})\n{r['text']}")
                    citations.append({"id": i+1, "text": r["text"][:200], "document_name": r["document_name"], "score": r["score"]})
                rag_system = (
                    "你是智询AI助手，一个基于RAG（检索增强生成）架构的智能问答系统。\n"
                    "以下是从知识库中检索到的相关内容，请优先参考这些内容来回答用户的问题。\n"
                    "在回答中使用 [1]、[2] 等标记引用对应的来源。\n"
                    "如果检索内容与问题无关，可以忽略并根据自身知识回答。\n\n"
                    f"--- 检索到的知识库内容 ---\n{chr(10).join(context_parts)}\n--- 结束 ---"
                )
                if messages and messages[0].get("role") == "system":
                    messages[0]["content"] = rag_system
                else:
                    messages.insert(0, {"role": "system", "content": rag_system})
    # Call DeepSeek
    body = {"model": req.model, "messages": messages, "max_tokens": 4096, "stream": False}
    if req.model != "deepseek-reasoner":
        body["temperature"] = req.temperature
    async with httpx.AsyncClient(timeout=300) as client:
        resp = await client.post(DEEPSEEK_BASE_URL, headers={"Content-Type": "application/json", "Authorization": f"Bearer {DEEPSEEK_API_KEY}"}, json=body)
    if resp.status_code != 200:
        raise HTTPException(resp.status_code, f"DeepSeek API error: {resp.text}")
    data = resp.json()
    data["citations"] = citations
    return data

@app.get("/api/documents")
async def list_documents():
    return store.documents

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in (".pdf", ".txt", ".md", ".docx"):
        raise HTTPException(400, f"Unsupported file type: {ext}")
    doc_id = str(uuid.uuid4())[:8]
    save_path = UPLOAD_DIR / f"{doc_id}{ext}"
    content = await file.read()
    save_path.write_bytes(content)
    chunks = parse_document(save_path)
    size_mb = len(content) / (1024 * 1024)
    doc_meta = {
        "id": doc_id, "name": file.filename or "unknown", "type": ext.lstrip("."),
        "uploadDate": datetime.now().strftime("%Y-%m-%d"),
        "status": "ready" if chunks else "failed", "chunks": len(chunks),
        "size": f"{size_mb:.2f} MB" if size_mb >= 0.01 else f"{len(content)/1024:.1f} KB",
    }
    store.add_document(doc_meta, chunks)
    return doc_meta

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    store.remove_document(doc_id)
    for f in UPLOAD_DIR.glob(f"{doc_id}.*"):
        f.unlink(missing_ok=True)
    return {"status": "deleted"}

@app.get("/api/documents/{doc_id}/content")
async def get_document_content(doc_id: str):
    doc_chunks = [c for c in store.chunks if c["doc_id"] == doc_id]
    if not doc_chunks:
        raise HTTPException(404, "Document not found or has no content")
    full_text = "\n\n".join(c["text"] for c in doc_chunks)
    doc_meta = next((d for d in store.documents if d["id"] == doc_id), None)
    return {"id": doc_id, "name": doc_meta["name"] if doc_meta else "unknown", "content": full_text, "chunks": len(doc_chunks)}
