# Railway 部署指南

## 部署架構
- **平台**: Railway (railway.app)
- **構建方式**: Dockerfile
- **容器**: Python 3.11 + FFmpeg

## 重要配置文件

### 1. Dockerfile
```dockerfile
# 使用固定端口，不依賴環境變數
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. railway.toml
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
# ⚠️ 不要設定 startCommand，讓 Dockerfile CMD 生效
```

## ⚠️ 常見陷阱

### 1. $PORT 變數問題
- Railway 會設定 `PORT` 環境變數
- 但 Dockerfile exec form `CMD [...]` 不會展開 shell 變數
- **解決方案**: 使用固定端口 8000，或使用 `CMD ["sh", "-c", "..."]`

### 2. startCommand 覆蓋問題
- `railway.toml` 的 `startCommand` 會覆蓋 Dockerfile 的 CMD
- 如果兩者都設定，只有 `startCommand` 會生效
- **解決方案**: 只選擇一種方式

### 3. Python 模組路徑
- 本地開發: `from analyzer import ...`
- Docker 部署: `from backend.analyzer import ...`
- **解決方案**: 使用 try/except 雙重導入

## 部署步驟

1. 推送代碼到 GitHub
2. Railway 自動偵測並部署
3. 在 Settings → Networking → Generate Domain 獲取網址

## 公開網址
https://[你的服務名].railway.app
