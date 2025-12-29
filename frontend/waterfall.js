/**
 * Piano Waterfall Renderer
 * 兒童友好版 - 彩虹顏色 + 超級特效
 * 精確對齊 88 鍵鋼琴鍵盤 (A0-C8)
 */

class WaterfallRenderer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('📍[Waterfall] 找不到容器:', containerId);
            return;
        }

        // 配置選項
        this.options = {
            pixelsPerSecond: options.pixelsPerSecond || 150,
            noteHeight: options.noteHeight || 6,
            lookahead: options.lookahead || 2,
            backgroundColor: options.backgroundColor || '#1a1a2e',
            ...options
        };

        // 狀態
        this.notes = [];
        this.isRunning = false;
        this.currentTime = 0;
        this.animationId = null;

        // 鋼琴鍵映射
        this.minPitch = 21;
        this.maxPitch = 108;
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // 🌈 彩虹顏色系統 - 與 piano.js 一致
        this.rainbowColors = {
            0: '#FF6B6B',   // C - 紅
            1: '#FF8E72',   // C# - 橙紅
            2: '#FFA94D',   // D - 橙
            3: '#FFD43B',   // D# - 金黃
            4: '#A9E34B',   // E - 黃綠
            5: '#51CF66',   // F - 綠
            6: '#20C997',   // F# - 青綠
            7: '#22B8CF',   // G - 青
            8: '#339AF0',   // G# - 藍
            9: '#5C7CFA',   // A - 藍紫
            10: '#845EF7',  // A# - 紫
            11: '#E64980'   // B - 粉紅
        };

        // 簡譜映射
        this.solfegeMap = {
            0: '1', 1: '1', 2: '2', 3: '2', 4: '3',
            5: '4', 6: '4', 7: '5', 8: '5', 9: '6', 10: '6', 11: '7'
        };

        // 預計算鍵盤佈局
        this.keyLayout = this.calculateKeyLayout();

        this.init();
    }

    /**
     * 獲取彩虹顏色
     */
    getRainbowColor(pitch) {
        return this.rainbowColors[pitch % 12] || '#f39c12';
    }

    /**
     * 獲取簡譜數字
     */
    getSolfegeNumber(pitch) {
        return this.solfegeMap[pitch % 12] || '?';
    }

    /**
     * 計算鍵盤佈局 - 與 piano.js 完全一致
     * 關鍵：白鍵依序排列，黑鍵疊在白鍵上方
     */
    calculateKeyLayout() {
        const layout = {};
        let whiteKeyIndex = 0;

        for (let pitch = this.minPitch; pitch <= this.maxPitch; pitch++) {
            const noteIndex = pitch % 12;
            const noteName = this.noteNames[noteIndex];
            const isBlack = [1, 3, 6, 8, 10].includes(noteIndex); // C#, D#, F#, G#, A#

            if (isBlack) {
                // 黑鍵位於前一個白鍵的右邊緣
                layout[pitch] = {
                    isBlack: true,
                    whiteKeyIndex: whiteKeyIndex, // 對應的白鍵索引
                    position: 'overlap' // 疊在白鍵上
                };
            } else {
                layout[pitch] = {
                    isBlack: false,
                    whiteKeyIndex: whiteKeyIndex,
                    position: 'main'
                };
                whiteKeyIndex++;
            }
        }

        this.totalWhiteKeys = whiteKeyIndex; // 52 個白鍵
        return layout;
    }

    /**
     * 獲取白鍵寬度 - 與 piano.js 同步
     */
    getWhiteKeyWidth() {
        if (window.innerWidth >= 1024) return 36;
        if (window.innerWidth >= 768) return 30;
        return 24;
    }

    /**
     * 初始化 Canvas
     */
    init() {
        // 創建 Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'waterfall-canvas';
        this.ctx = this.canvas.getContext('2d');

        // 設定尺寸
        this.resize();
        this.container.appendChild(this.canvas);

        // 監聽視窗大小變化
        window.addEventListener('resize', () => this.resize());

        console.log('📍[Waterfall] Canvas 初始化完成，白鍵數:', this.totalWhiteKeys);
    }

    /**
     * 調整 Canvas 大小 - 與鋼琴鍵盤精確對齊
     * 動態獲取實際渲染的鍵盤寬度
     */
    resize() {
        const rect = this.container.getBoundingClientRect();

        // 🔑 動態獲取實際渲染的鋼琴鍵盤寬度
        const pianoKeyboard = document.querySelector('.piano-keyboard');
        const firstWhiteKey = document.querySelector('.piano-key:not(.black)');

        if (pianoKeyboard && firstWhiteKey) {
            // 使用實際渲染的白鍵寬度
            this.whiteKeyWidth = firstWhiteKey.offsetWidth;
            const keyboardWidth = pianoKeyboard.offsetWidth;

            // Canvas 寬度 = 實際鍵盤寬度
            this.canvas.width = keyboardWidth;
            this.canvas.height = rect.height || 256;

            // 無偏移
            this.offsetX = 0;

            console.log('📍[Waterfall] 對齊鍵盤: 寬度=', keyboardWidth, '白鍵=', this.whiteKeyWidth);
        } else {
            // 後備方案：使用固定值
            this.whiteKeyWidth = this.getWhiteKeyWidth();
            const keyboardWidth = this.totalWhiteKeys * this.whiteKeyWidth;
            this.canvas.width = keyboardWidth;
            this.canvas.height = rect.height || 256;
            this.offsetX = 0;
        }

        // 重繪
        if (this.notes.length > 0) {
            this.draw();
        }
    }

    /**
     * 載入音符資料
     * @param {Array} notes - 音符陣列 [{pitch, start_time, duration, velocity}]
     */
    loadNotes(notes) {
        this.notes = notes.map(note => ({
            ...note,
            isBlack: this.isBlackKey(note.pitch)
        }));
        console.log('📍[Waterfall] 載入', this.notes.length, '個音符');
        this.draw();
    }

    /**
     * 檢查是否為黑鍵
     */
    isBlackKey(pitch) {
        const noteIndex = pitch % 12;
        return [1, 3, 6, 8, 10].includes(noteIndex); // C#, D#, F#, G#, A#
    }

    /**
     * 計算音符的 X 座標 - 精確對齊鍵盤
     * 必須與 CSS 中的鋼琴鍵盤位置完全一致
     */
    getNoteX(pitch) {
        const layout = this.keyLayout[pitch];
        if (!layout) return 0;

        const whiteKeyWidth = this.whiteKeyWidth;
        // 黑鍵寬度與 CSS 一致：16px/20px/24px 對應 24px/30px/36px
        const blackKeyWidth = this.getBlackKeyWidth();

        if (layout.isBlack) {
            // 黑鍵：位於白鍵邊界，向左偏移半個黑鍵寬度（與 CSS margin-left 一致）
            return this.offsetX + (layout.whiteKeyIndex * whiteKeyWidth) - (blackKeyWidth / 2);
        } else {
            // 白鍵：直接按索引計算
            return this.offsetX + (layout.whiteKeyIndex * whiteKeyWidth);
        }
    }

    /**
     * 獲取黑鍵寬度 - 動態獲取實際渲染寬度
     */
    getBlackKeyWidth() {
        const firstBlackKey = document.querySelector('.piano-key.black');
        if (firstBlackKey) {
            return firstBlackKey.offsetWidth;
        }
        // 後備：使用比例計算
        return this.whiteKeyWidth * 0.65;
    }

    /**
     * 計算音符的寬度 - 與鍵盤寬度完全一致
     */
    getNoteWidth(pitch) {
        const layout = this.keyLayout[pitch];
        if (!layout) return this.whiteKeyWidth;

        if (layout.isBlack) {
            return this.getBlackKeyWidth(); // 黑鍵寬度（與 CSS 一致）
        } else {
            return this.whiteKeyWidth; // 白鍵寬度（完整寬度）
        }
    }

    /**
     * 開始播放動畫
     */
    start(startTime = 0) {
        this.currentTime = startTime;
        this.isRunning = true;
        console.log('📍[Waterfall] 開始播放');
    }

    /**
     * 暫停動畫
     */
    pause() {
        this.isRunning = false;
        console.log('📍[Waterfall] 已暫停');
    }

    /**
     * 停止動畫
     */
    stop() {
        this.pause();
        this.currentTime = 0;
        this.draw();
        console.log('📍[Waterfall] 已停止');
    }

    /**
     * 跳轉到指定時間
     */
    seek(time) {
        this.currentTime = time;
        this.draw();
    }

    /**
     * 同步 Tone.js 播放時間
     */
    syncWithTransport(transportTime) {
        this.currentTime = transportTime;
    }

    /**
     * 繪製畫面
     */
    draw() {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        const { pixelsPerSecond, lookahead, noteColors, backgroundColor } = this.options;

        // 清空畫布
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // 繪製垂直導引線（每個八度的 C）
        this.drawGuideLines();

        // 計算可見時間範圍
        const visibleDuration = height / pixelsPerSecond;
        const startVisibleTime = this.currentTime - 0.1;
        const endVisibleTime = this.currentTime + visibleDuration + lookahead;

        // 繪製音符（先繪製白鍵音符，再繪製黑鍵音符，確保黑鍵在上層）
        const whiteNotes = [];
        const blackNotes = [];

        for (const note of this.notes) {
            const noteEnd = note.start_time + note.duration;
            if (noteEnd < startVisibleTime || note.start_time > endVisibleTime) {
                continue;
            }
            if (note.isBlack) {
                blackNotes.push(note);
            } else {
                whiteNotes.push(note);
            }
        }

        // 先繪製白鍵音符
        for (const note of whiteNotes) {
            this.drawNote(note);
        }

        // 再繪製黑鍵音符（覆蓋在上面）
        for (const note of blackNotes) {
            this.drawNote(note);
        }

        // 繪製當前時間線
        this.drawTimeline();
    }

    /**
     * 繪製垂直導引線
     */
    drawGuideLines() {
        const ctx = this.ctx;
        const { height } = this.canvas;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;

        // 畫每個白鍵的分隔線
        for (let i = 0; i <= this.totalWhiteKeys; i++) {
            const x = this.offsetX + i * this.whiteKeyWidth;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // 畫八度標記（較亮的線）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        for (let pitch = this.minPitch; pitch <= this.maxPitch; pitch++) {
            if (pitch % 12 === 0) { // C 音
                const layout = this.keyLayout[pitch];
                if (layout) {
                    const x = this.offsetX + layout.whiteKeyIndex * this.whiteKeyWidth;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * 繪製單個音符
     */
    drawNote(note) {
        const ctx = this.ctx;
        const { pixelsPerSecond, noteHeight } = this.options;
        const { height } = this.canvas;

        // 計算位置
        const x = this.getNoteX(note.pitch);
        const noteWidth = this.getNoteWidth(note.pitch);

        // Y 座標：音符從下往上滾動
        const timeUntilNote = note.start_time - this.currentTime;
        const y = height - (timeUntilNote * pixelsPerSecond);
        const noteRenderHeight = Math.max(noteHeight, note.duration * pixelsPerSecond);

        // 跳過螢幕外的音符
        if (y + noteRenderHeight < 0 || y > height + noteRenderHeight) return;

        // 根據力度計算透明度
        const alpha = 0.85 + (note.velocity / 127) * 0.15;

        // 🌈 使用彩虹顏色
        const baseColor = this.getRainbowColor(note.pitch);

        // 繪製音符 - 漸變效果
        const gradient = ctx.createLinearGradient(x, y - noteRenderHeight, x, y);
        gradient.addColorStop(0, this.hexToRgba(baseColor, alpha * 0.7));
        gradient.addColorStop(0.5, this.hexToRgba(baseColor, alpha));
        gradient.addColorStop(1, this.hexToRgba(baseColor, alpha * 0.9));
        ctx.fillStyle = gradient;

        // 圓角矩形 - 直接使用 x 和 noteWidth，不再偏移
        this.roundRect(ctx, x, y - noteRenderHeight, noteWidth, noteRenderHeight, 4);
        ctx.fill();

        // 音符邊框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // ============================================
        // 繪製簡譜數字 (1-7 對應 Do-Si)
        // ============================================
        const solfege = this.getSolfegeNumber(note.pitch);
        const fontSize = Math.min(noteWidth * 0.55, 14);

        if (noteRenderHeight >= fontSize * 0.8) {
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 數字位置在音符中央
            const textY = y - noteRenderHeight / 2;
            const textX = x + noteWidth / 2;

            // 文字陰影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.fillText(solfege, textX, textY);
            ctx.shadowBlur = 0;
        }

        // ============================================
        // 撞擊特效 (音符開始播放的瞬間)
        // ============================================
        const isPlaying = note.start_time <= this.currentTime &&
            note.start_time + note.duration > this.currentTime;

        // 剛開始播放的 0.15 秒內顯示撞擊特效
        const timeSinceStart = this.currentTime - note.start_time;
        const isImpact = timeSinceStart >= 0 && timeSinceStart < 0.15;

        if (isImpact) {
            this.drawImpactEffect(x + noteWidth / 2, height, baseColor, timeSinceStart);
        }

        // 正在播放的音符加高光
        if (isPlaying) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            this.roundRect(ctx, x, y - noteRenderHeight, noteWidth, noteRenderHeight, 4);
            ctx.stroke();

            // 發光效果
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    /**
     * 獲取簡譜數字 (1-7)
     * C=1, D=2, E=3, F=4, G=5, A=6, B=7
     * 黑鍵使用最接近的白鍵數字
     */
    getSolfegeNumber(pitch) {
        const noteIndex = pitch % 12;
        // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
        // 1, 1#, 2, 2#, 3, 4, 4#, 5, 5#, 6, 6#, 7
        const solfegeMap = {
            0: '1',   // C
            1: '1',   // C# → 顯示 1 (或可改為 #1)
            2: '2',   // D
            3: '2',   // D#
            4: '3',   // E
            5: '4',   // F
            6: '4',   // F#
            7: '5',   // G
            8: '5',   // G#
            9: '6',   // A
            10: '6',  // A#
            11: '7'   // B
        };
        return solfegeMap[noteIndex] || '?';
    }

    /**
     * 繪製撞擊特效 - 向上擴散的光粒子
     */
    drawImpactEffect(x, y, color, timeSinceStart) {
        const ctx = this.ctx;
        const progress = timeSinceStart / 0.15; // 0 到 1

        // 中央閃光
        const flashSize = 30 * (1 - progress);
        const flashAlpha = 0.8 * (1 - progress);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, flashSize);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        gradient.addColorStop(0.3, this.hexToRgba(color, flashAlpha * 0.8));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, flashSize, 0, Math.PI * 2);
        ctx.fill();

        // 向上飛濺的粒子
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI / 4) + (Math.PI / 2) * (i / (particleCount - 1)); // 45° 到 135°
            const distance = 20 + progress * 40;
            const px = x + Math.cos(angle) * distance * (0.5 + Math.random() * 0.5);
            const py = y - Math.sin(angle) * distance;
            const particleSize = 3 * (1 - progress);
            const particleAlpha = 0.6 * (1 - progress);

            ctx.fillStyle = this.hexToRgba(color, particleAlpha);
            ctx.beginPath();
            ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 繪製當前時間線
     */
    drawTimeline() {
        const ctx = this.ctx;
        const { width, height } = this.canvas;

        const y = height - 2;

        // 發光時間線
        ctx.shadowColor = 'rgba(78, 205, 196, 0.8)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.offsetX, y);
        ctx.lineTo(this.offsetX + this.totalWhiteKeys * this.whiteKeyWidth, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    /**
     * 繪製圓角矩形
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * 十六進位顏色轉 RGBA
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * 銷毀
     */
    destroy() {
        this.pause();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this.resize);
        console.log('📍[Waterfall] 已銷毀');
    }
}

// 全域導出
window.WaterfallRenderer = WaterfallRenderer;
