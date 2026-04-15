#!/bin/bash
set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv"
ENV_FILE="$PROJECT_DIR/.env"

echo "=========================================="
echo "  QueryMindRAG Backend Deployment"
echo "=========================================="

echo "[1/6] Installing system dependencies..."
apt update -qq
apt install -y -qq python3 python3-pip python3-venv > /dev/null 2>&1
echo "  Done: $(python3 --version)"

echo "[2/6] Creating Python virtual environment..."
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip -q

echo "[3/6] Installing Python dependencies (may take a few minutes)..."
pip install -r "$BACKEND_DIR/requirements.txt" -q
echo "  Done"

echo "[4/6] Pre-downloading text2vec-base-chinese model..."
python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('shibing624/text2vec-base-chinese'); print('  Model ready')"

echo "[5/6] Setting up environment..."
if [ ! -f "$ENV_FILE" ]; then
    cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
    echo "  Created .env - please edit: nano $ENV_FILE"
else
    echo "  .env already exists"
fi

echo "[6/6] Creating systemd service..."
cat > /etc/systemd/system/querymindrag.service << EOF
[Unit]
Description=QueryMindRAG Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$ENV_FILE
ExecStart=$VENV_DIR/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable querymindrag
echo "  Service created"

echo ""
echo "=========================================="
echo "  Done! Next steps:"
echo "=========================================="
echo "  1. nano $ENV_FILE        # add your DEEPSEEK_API_KEY"
echo "  2. systemctl start querymindrag"
echo "  3. systemctl status querymindrag"
echo "  4. journalctl -u querymindrag -f   # view logs"
echo ""
