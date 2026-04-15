#!/bin/bash
set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "=== QueryMindRAG Update ==="

echo "[1/3] Rebuilding frontend..."
cd "$PROJECT_DIR" && npm install --silent && npm run build
echo "  Done"

echo "[2/3] Updating backend..."
source "$PROJECT_DIR/backend/.venv/bin/activate"
pip install -r "$PROJECT_DIR/backend/requirements.txt" -q
echo "  Done"

echo "[3/3] Restarting..."
systemctl restart querymindrag
systemctl reload nginx
echo "  Done"

echo ""
echo "Check: curl http://localhost:8000/api/health"
