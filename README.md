# YouTube Piano Visualizer 🎹

將 YouTube 純鋼琴音樂轉換為 MIDI 並即時視覺化播放。

![screenshot](https://via.placeholder.com/800x400?text=Piano+Visualizer)

## ✨ 功能特色

- **YouTube 音訊下載**: 使用 yt-dlp 下載高品質音訊
- **AI 音高檢測**: 使用 CREPE (Google 開發) 進行精準音高識別
- **88 鍵視覺化鋼琴**: 即時顯示正在播放的音符
- **高品質音色**: 使用 Salamander Grand Piano 取樣
- **進度控制**: 支援播放、暫停、跳轉
- **響應式設計**: 支援桌面與手機

## 🚀 快速開始

### 需求

- Python 3.11+ (推薦 3.11，3.12 也支援)
- FFmpeg (需加入系統 PATH)
- Node.js (可選，僅開發時需要)

### 安裝 FFmpeg

**Windows:**
```powershell
winget install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### 啟動

**Windows:**
```
雙擊 start.bat
```

**其他系統:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 啟動伺服器
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

打開瀏覽器訪問: http://localhost:8000

## 📁 專案結構

```
youtube-piano-visualizer/
├── backend/
│   ├── main.py          # FastAPI 後端
│   ├── analyzer.py      # 音訊分析 (CREPE + librosa)
│   ├── requirements.txt # Python 依賴
│   ├── venv/            # 虛擬環境
│   └── output/          # 生成的 JSON
├── frontend/
│   ├── index.html       # 主頁面
│   ├── style.css        # 樣式
│   ├── script.js        # Tone.js 邏輯
│   └── piano.js         # 鋼琴視覺化
├── start.bat            # Windows 啟動腳本
└── README.md
```

## 🔧 技術棧

### 後端
- **FastAPI**: 高性能 Python Web 框架
- **yt-dlp**: YouTube 下載器
- **CREPE**: Google 開發的單音音高檢測模型
- **librosa**: 音訊分析庫
- **TensorFlow**: CREPE 的深度學習後端

### 前端
- **Tone.js**: Web Audio 框架
- **@tonejs/piano**: Salamander Grand Piano 取樣
- **Tailwind CSS**: 實用優先的 CSS 框架

## 📝 API 文檔

### POST /api/analyze
分析 YouTube 音訊

```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

### GET /api/status/{task_id}
查詢分析進度

### GET /api/notes/{task_id}
獲取分析結果

## ⚠️ 限制

- 僅支援 10 分鐘以內的影片
- 效果最佳於純鋼琴獨奏
- 首次分析需下載 CREPE 模型 (約 50MB)

## 📄 授權

MIT License

## 🙏 致謝

- [Spotify Basic Pitch](https://github.com/spotify/basic-pitch) - 靈感來源
- [CREPE](https://github.com/marl/crepe) - 音高檢測
- [Tone.js](https://tonejs.github.io/) - Web Audio
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube 下載
