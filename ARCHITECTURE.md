# YouTube 鋼琴視覺化播放器 - 架構文檔

> 最後更新：2025-12-30

## 📁 Project Structure

```
youtube-piano-visualizer/
├── README.md              # 專案說明
├── TASKS.md               # 任務追蹤  
├── start.bat              # 一鍵啟動腳本
├── backend/               # Python FastAPI 後端
│   ├── main.py            # API 路由定義
│   ├── analyzer.py        # YouTube 下載 + AI 音樂轉錄
│   ├── requirements.txt   # Python 依賴
│   └── output/            # 臨時音訊檔案
└── frontend/              # 純靜態前端
    ├── index.html         # 主頁面
    ├── script.js          # 主控邏輯 + Tone.js 播放
    ├── piano.js           # 88 鍵鋼琴渲染器 (彩虹版)
    ├── waterfall.js       # Canvas 瀑布流渲染器
    └── style.css          # Tailwind + 自定義樣式
```

## 🛠 Tech Stack

### Backend (Python 3.11+)
| 套件 | 版本 | 用途 |
|------|------|------|
| FastAPI | >=0.109.0 | Web API 框架 |
| uvicorn | >=0.27.0 | ASGI 伺服器 |
| yt-dlp | >=2024.8.6 | YouTube 音訊下載 |
| basic-pitch | >=0.3.0 | Spotify AI 音樂轉錄 |
| ffmpeg-python | >=0.2.0 | 音訊預處理 |

### Frontend (Vanilla JS)
| 技術 | 用途 |
|------|------|
| Tailwind CSS | 樣式框架 (CDN) |
| Tone.js | 音訊播放 + 合成器 |
| Canvas 2D | 瀑布流視覺化 |

### 系統依賴
- **FFmpeg**：必須安裝並加入 PATH

## ✅ Development Status

| 模組/功能 | 狀態 | 備註 |
|:---|:---:|:---|
| YouTube 音訊下載 | ✅ | yt-dlp, 支援短網址 |
| AI 音樂轉錄 | ✅ | basic-pitch, 自適應閾值 |
| FFmpeg 預處理 | ✅ | 高通濾波強化低音 |
| 和弦泛音過濾 | ✅ | 減少幽靈音符 |
| 音符優化管線 | ✅ | 去抖動 + 力度曲線 + 最大時長 |
| 88 鍵鋼琴渲染 | ✅ | 彩虹顏色系統 |
| 簡譜數字 (1-7) | ✅ | 鍵盤 + 瀑布流 |
| Canvas 瀑布流 | ✅ | 動態對齊鍵盤寬度 |
| 撞擊粒子特效 | ✅ | 星星、愛心、圓形 |
| CSS 撞擊閃光 | ✅ | 光環 + 光點爆炸 |
| Tone.js 播放 | ✅ | 採樣器 + Transport |
| 播放速度控制 | ✅ | 0.25x - 1.5x |
| 進度條拖曳 | ✅ | seek 同步瀑布流 |
| 分頁可見性處理 | ✅ | 背景繼續播放 |
| 預設測試網址 | ✅ | https://youtu.be/tHLz4CttzDE |

## 🔗 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | 健康檢查 |
| POST | `/analyze` | 開始分析 YouTube URL |
| GET | `/progress/{task_id}` | SSE 進度串流 |
| GET | `/result/{task_id}` | 獲取分析結果 |
| GET | `/audio/{task_id}` | 獲取音訊檔案 |

## 🎨 視覺特色

### 彩虹顏色系統
```
C (Do) = 紅    D (Re) = 橙    E (Mi) = 黃綠
F (Fa) = 綠    G (Sol) = 青   A (La) = 藍紫
B (Si) = 粉紅
```

### 兒童友好功能
- 每個鍵顯示簡譜數字 (1-7)
- 音符掉落時顯示數字
- 撞擊時有粒子爆炸特效
- 可調整播放速度學習

## 📝 Known Issues

- 複雜和弦識別仍有少量誤判
- 需要 FFmpeg 系統依賴
- 只支援 10 分鐘內的影片
