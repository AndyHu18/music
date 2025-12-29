# YouTube Piano Visualizer - 任務追蹤

## 專案概述
將 YouTube 純鋼琴音樂轉換為 MIDI 並即時視覺化播放的小工具。

## 技術選型
- **後端**: FastAPI + CREPE + librosa + yt-dlp
- **前端**: Vanilla JS + Tone.js + Tailwind CSS
- **Python**: 3.12 (使用 CREPE 替代 basic-pitch，解決相容性問題)

---

## 階段一：環境與後端分析邏輯 ✅

- [x] 1.1 建立專案目錄結構
- [x] 1.2 建立 Python 虛擬環境 (venv)
- [x] 1.3 安裝後端依賴 (yt-dlp, tensorflow, crepe, librosa, fastapi)
- [x] 1.4 實作 analyzer.py - CREPE 音高檢測 + librosa onset detection
- [x] 1.5 實作 main.py - FastAPI 路由 (POST /api/analyze, GET /api/status, SSE)

## 階段二：前端播放與鋼琴視覺化 ✅

- [x] 2.1 建立 index.html - 響應式深色主題
- [x] 2.2 實作 style.css - 鋼琴鍵視覺效果 + 動畫
- [x] 2.3 實作 piano.js - 88 鍵動態生成 (A0-C8)
- [x] 2.4 實作 script.js - Tone.js 整合
- [x] 2.5 Salamander Grand Piano 音色載入
- [x] 2.6 Tone.Part + Tone.Draw 時間軸同步
- [x] 2.7 播放控制 (播放/暫停/停止/進度跳轉)

## 階段三：全棧整合 ✅

- [x] 3.1 前端 YouTube URL 輸入表單
- [x] 3.2 API 輪詢進度 (SSE fallback)
- [x] 3.3 載入動畫 UI
- [x] 3.4 進度條與音量控制
- [x] 3.5 錯誤處理與 Toast 通知

## 驗證與修復 ✅

- [x] 修復 Tone.js CDN 載入問題 (移除 integrity 驗證)
- [x] 桌面版視覺驗證通過
- [x] 手機版 (375x812) 響應式驗證通過
- [x] 分析流程測試通過 (53 個音符識別成功)
- [x] 播放與視覺化同步測試通過

---

## 已知限制

1. **Python 版本**: basic-pitch 不支援 Python 3.12，改用 CREPE
2. **影片長度**: 限制 10 分鐘內
3. **音訊類型**: 純鋼琴獨奏效果最佳
4. **分析時間**: 30 秒影片約需 1-2 分鐘分析

## 未來擴展

- [ ] VexFlow 五線譜視覺化
- [ ] 本地 MIDI 檔案匯出
- [ ] 多軌道支援 (和弦分離)
- [ ] 速度調整功能

---

*最後更新: 2025-12-30*
