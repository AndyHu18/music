/**
 * Piano Keyboard Renderer
 * 兒童友好版 - 彩虹顏色 + 超級特效
 */

class PianoKeyboard {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.keys = new Map();
        this.activeKeys = new Set();
        this.particles = []; // 粒子效果陣列

        // 兒童模式：只顯示 2 個八度 (C4-B5)，琴鍵更大
        this.kidsMode = options.kidsMode || false;

        if (this.kidsMode) {
            this.minPitch = 60; // C4
            this.maxPitch = 83; // B5
        } else {
            this.minPitch = 21;
            this.maxPitch = 108;
        }

        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        // 簡譜映射
        this.solfegeMap = {
            0: '1', 1: '1', 2: '2', 3: '2', 4: '3',
            5: '4', 6: '4', 7: '5', 8: '5', 9: '6', 10: '6', 11: '7'
        };

        // 🌈 彩虹顏色系統 - 每個音符一個顏色
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

        // Do Re Mi 中文
        this.solfegeNames = {
            0: 'Do', 2: 'Re', 4: 'Mi', 5: 'Fa', 7: 'Sol', 9: 'La', 11: 'Si'
        };

        this.init();
        this.initParticleCanvas();
    }

    getSolfege(pitch) {
        return this.solfegeMap[pitch % 12] || '?';
    }

    getRainbowColor(pitch) {
        return this.rainbowColors[pitch % 12] || '#f39c12';
    }

    init() {
        if (!this.container) return;

        const keyboard = document.createElement('div');
        keyboard.className = 'piano-keyboard';

        // 🎹 兒童模式：添加 class 讓鍵盤更大
        if (this.kidsMode) {
            keyboard.classList.add('kids-mode');
        }

        for (let pitch = this.minPitch; pitch <= this.maxPitch; pitch++) {
            const noteIndex = pitch % 12;
            const octave = Math.floor(pitch / 12) - 1;
            const noteName = this.noteNames[noteIndex];
            const isBlackKey = noteName.includes('#');
            const color = this.getRainbowColor(pitch);

            const key = document.createElement('div');
            key.className = `piano-key ${isBlackKey ? 'black' : ''}`;
            key.dataset.pitch = pitch;
            key.dataset.note = `${noteName}${octave}`;
            key.dataset.color = color;

            // 撞擊面
            const impactZone = document.createElement('div');
            impactZone.className = 'impact-zone';
            key.appendChild(impactZone);

            // 簡譜數字
            const solfegeLabel = document.createElement('span');
            solfegeLabel.className = 'solfege-label';
            solfegeLabel.textContent = this.getSolfege(pitch);
            key.appendChild(solfegeLabel);

            // C 標籤
            if (!isBlackKey && noteName === 'C') {
                const cLabel = document.createElement('span');
                cLabel.className = 'note-label';
                cLabel.textContent = `C${octave}`;
                key.appendChild(cLabel);
            }

            key.addEventListener('click', () => this.onKeyClick(pitch));
            this.keys.set(pitch, key);

            if (!isBlackKey) keyboard.appendChild(key);
        }

        this.positionBlackKeys(keyboard);
        this.container.appendChild(keyboard);
        console.log('📍[Piano] 彩虹鍵盤初始化完成');
    }

    /**
     * 初始化粒子效果 Canvas
     */
    initParticleCanvas() {
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.className = 'particle-canvas';
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
        `;
        this.container.style.position = 'relative';
        this.container.appendChild(this.particleCanvas);
        this.particleCtx = this.particleCanvas.getContext('2d');

        // 調整 canvas 大小
        this.resizeParticleCanvas();
        window.addEventListener('resize', () => this.resizeParticleCanvas());

        // 開始動畫循環
        this.animateParticles();
    }

    resizeParticleCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.particleCanvas.width = rect.width;
        this.particleCanvas.height = rect.height;
    }

    positionBlackKeys(keyboard) {
        let whiteKeyIndex = 0;

        // 計算白鍵總數
        let totalWhiteKeys = 0;
        for (let p = this.minPitch; p <= this.maxPitch; p++) {
            if (!this.noteNames[p % 12].includes('#')) totalWhiteKeys++;
        }

        for (let pitch = this.minPitch; pitch <= this.maxPitch; pitch++) {
            const noteName = this.noteNames[pitch % 12];
            const isBlackKey = noteName.includes('#');

            if (isBlackKey) {
                const key = this.keys.get(pitch);

                if (this.kidsMode) {
                    // 兒童模式：使用百分比定位
                    const percent = (whiteKeyIndex / totalWhiteKeys) * 100;
                    key.style.left = `${percent}%`;
                } else {
                    // 普通模式：使用固定像素
                    const whiteKeyWidth = this.getWhiteKeyWidth();
                    key.style.left = `${whiteKeyIndex * whiteKeyWidth}px`;
                }
                keyboard.appendChild(key);
            } else {
                whiteKeyIndex++;
            }
        }
    }

    getWhiteKeyWidth() {
        if (window.innerWidth >= 1024) return 36;
        if (window.innerWidth >= 768) return 30;
        return 24;
    }

    /**
     * 按下鍵 - 帶超級特效
     */
    keyDown(pitch, velocity = 100) {
        const key = this.keys.get(pitch);
        if (key && !this.activeKeys.has(pitch)) {
            const color = this.getRainbowColor(pitch);

            key.classList.add('active');
            this.activeKeys.add(pitch);

            // 設定彩虹顏色
            key.style.setProperty('--active-color', color);
            key.style.background = `linear-gradient(180deg, ${color} 0%, ${this.darkenColor(color, 20)} 100%)`;
            key.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}80, inset 0 2px 10px rgba(255,255,255,0.5)`;

            // 🎆 超級撞擊特效
            this.triggerSuperImpact(key, pitch, velocity);

            // 粒子爆炸
            this.createParticleExplosion(key, color, velocity);
        }
    }

    /**
     * 超級撞擊特效
     */
    triggerSuperImpact(key, pitch, velocity) {
        const impactZone = key.querySelector('.impact-zone');
        if (!impactZone) return;

        const color = this.getRainbowColor(pitch);

        // 移除舊特效
        impactZone.classList.remove('impact-flash', 'super-impact');
        void impactZone.offsetWidth;

        // 添加超級特效
        impactZone.classList.add('super-impact');
        impactZone.style.setProperty('--impact-color', color);

        // 創建多個光環
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createRipple(key, color, i * 0.1);
            }, i * 50);
        }

        setTimeout(() => {
            impactZone.classList.remove('super-impact');
        }, 400);
    }

    /**
     * 創建漣漪效果
     */
    createRipple(key, color, delay) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 3px solid ${color};
            animation: ripple-expand 0.5s ease-out ${delay}s forwards;
            pointer-events: none;
            z-index: 10;
        `;
        key.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * 粒子爆炸效果 - 星星、愛心、音符
     */
    createParticleExplosion(key, color, velocity) {
        const rect = key.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.top - containerRect.top + 5;

        // 粒子數量根據力度
        const count = Math.floor(8 + (velocity / 127) * 12);

        for (let i = 0; i < count; i++) {
            const type = ['star', 'circle', 'heart'][Math.floor(Math.random() * 3)];
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 10 - 5,
                size: Math.random() * 8 + 4,
                color,
                alpha: 1,
                type,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 20,
                gravity: 0.3
            });
        }
    }

    /**
     * 動畫粒子
     */
    animateParticles() {
        const ctx = this.particleCtx;
        ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // 更新物理
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            p.rotation += p.rotationSpeed;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // 繪製粒子
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;

            if (p.type === 'star') {
                this.drawStar(ctx, 0, 0, p.size, 5);
            } else if (p.type === 'heart') {
                this.drawHeart(ctx, 0, 0, p.size);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // 發光效果
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();

            ctx.restore();
        }

        requestAnimationFrame(() => this.animateParticles());
    }

    drawStar(ctx, x, y, size, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? size : size / 2;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
            else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
    }

    drawHeart(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y + size / 4);
        ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
        ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
        ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
        ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
        ctx.fill();
    }

    darkenColor(hex, percent) {
        const num = parseInt(hex.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    keyUp(pitch) {
        const key = this.keys.get(pitch);
        if (key && this.activeKeys.has(pitch)) {
            key.classList.remove('active');
            key.style.background = '';
            key.style.boxShadow = '';
            this.activeKeys.delete(pitch);
        }
    }

    allKeysUp() {
        this.activeKeys.forEach(pitch => this.keyUp(pitch));
    }

    onKeyClick(pitch) {
        if (typeof window.onPianoKeyClick === 'function') {
            window.onPianoKeyClick(pitch);
        }
    }

    getPitchName(pitch) {
        const noteIndex = pitch % 12;
        const octave = Math.floor(pitch / 12) - 1;
        return `${this.noteNames[noteIndex]}${octave}`;
    }

    updateCurrentNotes() {
        const notesDisplay = document.getElementById('current-notes');
        if (notesDisplay) {
            if (this.activeKeys.size === 0) {
                notesDisplay.textContent = '-';
            } else {
                notesDisplay.textContent = Array.from(this.activeKeys)
                    .map(p => this.getPitchName(p)).join(' ');
            }
        }
    }
}

window.PianoKeyboard = PianoKeyboard;
