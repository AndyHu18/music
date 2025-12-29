"""
YouTube Piano Visualizer - FastAPI Backend
提供 YouTube 音訊下載、分析和結果查詢 API
"""

import os
import json
import asyncio
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from pydantic import BaseModel, HttpUrl

# 內部模組 - 支援本地開發和 Docker 部署
try:
    from backend.analyzer import process_youtube  # Docker 環境
except ImportError:
    from analyzer import process_youtube  # 本地開發

# 配置
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 任務狀態追蹤
task_status = {}


class AnalyzeRequest(BaseModel):
    """分析請求模型"""
    url: str  # YouTube URL


class TaskStatus(BaseModel):
    """任務狀態模型"""
    task_id: str
    status: str  # pending, downloading, analyzing, completed, error
    progress: float  # 0-100
    message: Optional[str] = None
    result: Optional[dict] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """應用程式生命週期管理"""
    print("📍[Server] 啟動中...")
    yield
    print("📍[Server] 關閉中...")


# 建立 FastAPI 應用
app = FastAPI(
    title="YouTube Piano Visualizer API",
    description="將 YouTube 鋼琴音樂轉換為可視化 JSON 資料",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 設定 - 允許前端跨域請求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發環境允許所有來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def run_analysis(task_id: str, youtube_url: str):
    """
    在背景執行音訊分析
    """
    def update_progress(stage: str, percent: float):
        """更新任務進度"""
        status_map = {
            'downloading': ('downloading', percent * 0.4),  # 0-40%
            'analyzing': ('analyzing', 40 + percent * 0.6)  # 40-100%
        }
        status, overall = status_map.get(stage, (stage, percent))
        task_status[task_id] = {
            'status': status,
            'progress': overall,
            'message': f'{stage}: {percent:.0f}%'
        }
    
    try:
        task_status[task_id] = {
            'status': 'pending',
            'progress': 0,
            'message': '準備中...'
        }
        
        result = process_youtube(
            youtube_url,
            OUTPUT_DIR,
            progress_callback=update_progress
        )
        
        task_status[task_id] = {
            'status': 'completed',
            'progress': 100,
            'message': '分析完成',
            'result': result
        }
        
    except Exception as e:
        task_status[task_id] = {
            'status': 'error',
            'progress': 0,
            'message': str(e),
            'result': None
        }


@app.post("/api/analyze", response_model=TaskStatus)
async def start_analysis(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    啟動 YouTube 音訊分析任務
    
    傳入 YouTube URL，返回任務 ID 用於查詢進度
    """
    import hashlib
    
    # 生成任務 ID
    task_id = hashlib.md5(request.url.encode()).hexdigest()[:12]
    
    # 檢查是否已有相同任務
    if task_id in task_status:
        existing = task_status[task_id]
        if existing.get('status') == 'completed':
            return TaskStatus(
                task_id=task_id,
                status=existing['status'],
                progress=existing['progress'],
                message="使用快取結果",
                result=existing.get('result')
            )
        elif existing.get('status') in ['pending', 'downloading', 'analyzing']:
            return TaskStatus(
                task_id=task_id,
                status=existing['status'],
                progress=existing['progress'],
                message=existing.get('message', '處理中...')
            )
    
    # 添加背景任務
    background_tasks.add_task(run_analysis, task_id, request.url)
    
    return TaskStatus(
        task_id=task_id,
        status='pending',
        progress=0,
        message='任務已提交'
    )


@app.get("/api/status/{task_id}", response_model=TaskStatus)
async def get_status(task_id: str):
    """
    查詢分析任務狀態
    """
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    status = task_status[task_id]
    return TaskStatus(
        task_id=task_id,
        status=status.get('status', 'unknown'),
        progress=status.get('progress', 0),
        message=status.get('message'),
        result=status.get('result')
    )


@app.get("/api/status/{task_id}/stream")
async def stream_status(task_id: str):
    """
    SSE 串流任務狀態 (Server-Sent Events)
    """
    async def event_generator():
        while True:
            if task_id not in task_status:
                yield f"data: {json.dumps({'error': '任務不存在'})}\n\n"
                break
            
            status = task_status[task_id]
            yield f"data: {json.dumps(status)}\n\n"
            
            if status.get('status') in ['completed', 'error']:
                break
            
            await asyncio.sleep(0.5)  # 每 500ms 更新一次
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.get("/api/notes/{task_id}")
async def get_notes(task_id: str):
    """
    獲取分析完成的 notes.json
    """
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    status = task_status[task_id]
    if status.get('status') != 'completed':
        raise HTTPException(status_code=400, detail="任務尚未完成")
    
    return JSONResponse(content=status.get('result'))


@app.get("/health")
async def health_check():
    """健康檢查端點"""
    return {"status": "ok", "service": "youtube-piano-visualizer"}


# 靜態檔案服務 (前端)
# 支援本地開發和 Docker 部署兩種路徑
frontend_paths = [
    Path(__file__).parent.parent / "frontend",  # 本地開發
    Path("/app/frontend"),  # Docker 部署
]

for frontend_path in frontend_paths:
    if frontend_path.exists():
        print(f"📍[Server] 前端目錄: {frontend_path}")
        app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
        break


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
