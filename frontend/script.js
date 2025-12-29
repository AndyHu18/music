/**
 * YouTube Piano Visualizer - Main Script
 * 整合 Tone.js 音訊引擎與鋼琴視覺化
 */

// ========================================
// 全域狀態
// ========================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : '';

let piano = null;
let waterfall = null;  // Canvas 瀑布流渲染器
let sampler = null;
let notesData = null;
let scheduledPart = null;
let isPlaying = false;
let isLoaded = false;
let currentTaskId = null;
let totalPlayedNotes = 0;

// DOM 元素快取
const elements = {
    youtubeUrl: null,
    analyzeBtn: null,
    inputSection: null,
    progressSection: null,
    playerSection: null,
    pianoSection: null,
    progressBar: null,
    progressPercent: null,
    progressTitle: null,
    progressMessage: null,
    trackTitle: null,
    trackInfo: null,
    playBtn: null,
    stopBtn: null,
    seekBar: null,
    currentTime: null,
    totalTime: null,
    volumeBar: null,
    volumeValue: null,
    notesPlayed: null,
    loadingOverlay: null,
    loadingText: null,
    toastContainer: null,
};

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📍[App] 初始化開始');

    // 快取 DOM 元素
    cacheElements();

    // 綁定事件
    bindEvents();

    // 初始化鋼琴鍵盤
    piano = new PianoKeyboard('piano-container');

    // 初始化瀑布流渲染器
    waterfall = new WaterfallRenderer('waterfall-container', {
        pixelsPerSecond: 150,
        noteHeight: 6,
        lookahead: 2,
        noteColors: {
            white: '#4ecdc4',
            black: '#ff6b6b',
            gradient: true
        }
    });

    console.log('📍[App] 初始化完成');
});

/**
 * 快取 DOM 元素
 */
function cacheElements() {
    elements.youtubeUrl = document.getElementById('youtube-url');
    elements.analyzeBtn = document.getElementById('analyze-btn');
    elements.inputSection = document.getElementById('input-section');
    elements.progressSection = document.getElementById('progress-section');
    elements.playerSection = document.getElementById('player-section');
    elements.pianoSection = document.getElementById('piano-section');
    elements.progressBar = document.getElementById('progress-bar');
    elements.progressPercent = document.getElementById('progress-percent');
    elements.progressTitle = document.getElementById('progress-title');
    elements.progressMessage = document.getElementById('progress-message');
    elements.trackTitle = document.getElementById('track-title');
    elements.trackInfo = document.getElementById('track-info');
    elements.playBtn = document.getElementById('play-btn');
    elements.stopBtn = document.getElementById('stop-btn');
    elements.seekBar = document.getElementById('seek-bar');
    elements.currentTime = document.getElementById('current-time');
    elements.totalTime = document.getElementById('total-time');
    elements.volumeBar = document.getElementById('volume-bar');
    elements.volumeValue = document.getElementById('volume-value');
    elements.notesPlayed = document.getElementById('notes-played');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.loadingText = document.getElementById('loading-text');
    elements.toastContainer = document.getElementById('toast-container');
}

/**
 * 綁定事件監聽器
 */
function bindEvents() {
    // 分析按鈕
    elements.analyzeBtn.addEventListener('click', startAnalysis);

    // Enter 鍵提交
    elements.youtubeUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startAnalysis();
    });

    // 播放控制
    elements.playBtn.addEventListener('click', togglePlay);
    elements.stopBtn.addEventListener('click', stopPlayback);

    // 進度條
    elements.seekBar.addEventListener('input', handleSeek);

    // 音量
    elements.volumeBar.addEventListener('input', handleVolume);

    // 🐢 速度控制 (兒童學習友好)
    const speedBar = document.getElementById('speed-bar');
    const speedValue = document.getElementById('speed-value');
    if (speedBar) {
        speedBar.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value) / 100;
            Tone.Transport.bpm.value = 120 * speed; // 基準 BPM 120
            speedValue.textContent = `${speed.toFixed(1)}x`;
            console.log('📍[App] 播放速度:', speed);
        });
    }

    // ========================================
    // 分頁可見性處理（回到頁面時同步視覺）
    // ========================================
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * 處理分頁可見性變化
 * 音樂會在背景繼續播放，但回到頁面時需要同步視覺
 */
function handleVisibilityChange() {
    if (!document.hidden && isPlaying) {
        // 回到頁面時，同步瀑布流視覺
        if (waterfall) {
            waterfall.syncWithTransport(Tone.Transport.seconds);
            waterfall.draw();
        }
        console.log('📍[App] 分頁恢復可見，已同步視覺');
    }
}

// ========================================
// 內建曲目載入
// ========================================

/**
 * 載入內建練習曲
 */
async function loadBuiltInSong(songId) {
    console.log('📍[App] 載入內建曲目:', songId);

    // 獲取曲目資料
    const songData = getBuiltInSong(songId);
    if (!songData) {
        showToast('找不到該曲目', 'error');
        return;
    }

    // 顯示載入中
    showToast(`載入中: ${songData.metadata.title}`, 'info');

    // 停止當前播放
    if (isPlaying) {
        stopPlayback();
    }

    // 設定資料
    notesData = songData;

    // 🎹 切換到兒童模式（更大的琴鍵，只顯示 2 個八度）
    switchToKidsMode(true);

    // 顯示播放器和鋼琴區域（不隱藏輸入區，讓歌曲按鈕隨時可選）
    elements.progressSection.classList.add('hidden');
    elements.playerSection.classList.remove('hidden');
    elements.pianoSection.classList.remove('hidden');

    // 更新曲目資訊
    elements.trackTitle.textContent = songData.metadata.title;
    elements.trackInfo.textContent = `${songData.metadata.note_count} 個音符 · ${formatTime(songData.metadata.total_duration)}`;
    elements.totalTime.textContent = formatTime(songData.metadata.total_duration);
    elements.notesPlayed.textContent = `0 / ${songData.metadata.note_count}`;

    // 載入音符到瀑布流渲染器
    if (waterfall && songData.notes) {
        waterfall.resize();
        waterfall.loadNotes(songData.notes);
    }

    // 載入音色
    await loadPianoSampler();

    // 準備播放
    preparePlayback();

    // 自動開始播放
    showToast('開始播放！跟著鋼琴一起學習', 'success');
    setTimeout(() => {
        togglePlay();
    }, 500);
}

/**
 * 切換兒童模式（更大的琴鍵）
 */
function switchToKidsMode(enabled) {
    const pianoContainer = document.getElementById('piano-container');
    const waterfallContainer = document.getElementById('waterfall-container');

    // 添加/移除 kids-mode class
    if (enabled) {
        pianoContainer.classList.add('kids-mode');
        waterfallContainer.classList.add('kids-mode');
    } else {
        pianoContainer.classList.remove('kids-mode');
        waterfallContainer.classList.remove('kids-mode');
    }

    // 清除現有鍵盤
    if (piano) {
        pianoContainer.innerHTML = '';
    }

    // 重新創建鍵盤
    piano = new PianoKeyboard('piano-container', { kidsMode: enabled });

    // 重新創建瀑布流（匹配琴鍵範圍）
    if (waterfall) {
        waterfallContainer.innerHTML = '';
    }

    waterfall = new WaterfallRenderer('waterfall-container', {
        pixelsPerSecond: 150,
        noteHeight: 8, // 兒童模式用更大的音符
        lookahead: 2,
        kidsMode: enabled,
        noteColors: {
            white: '#4ecdc4',
            black: '#ff6b6b',
            gradient: true
        }
    });

    console.log('📍[App] 兒童模式:', enabled ? '開啟' : '關閉');
}

// ========================================
// API 互動
// ========================================

/**
 * 開始分析 YouTube 音訊
 */
async function startAnalysis() {
    const url = elements.youtubeUrl.value.trim();

    if (!url) {
        showToast('請輸入 YouTube 網址', 'error');
        return;
    }

    // 驗證 URL 格式
    if (!isValidYouTubeUrl(url)) {
        showToast('請輸入有效的 YouTube 網址', 'error');
        return;
    }

    // 禁用按鈕
    elements.analyzeBtn.disabled = true;

    // 顯示進度區
    elements.progressSection.classList.remove('hidden');
    updateProgress(0, 'pending', '正在提交任務...');

    try {
        // 發送分析請求
        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`API 錯誤: ${response.status}`);
        }

        const data = await response.json();
        currentTaskId = data.task_id;

        if (data.status === 'completed') {
            // 使用快取結果
            handleAnalysisComplete(data.result);
        } else {
            // 開始輪詢狀態
            pollStatus(data.task_id);
        }

    } catch (error) {
        console.error('📍[App] 分析請求失敗:', error);
        showToast(`分析失敗: ${error.message}`, 'error');
        elements.analyzeBtn.disabled = false;
        elements.progressSection.classList.add('hidden');
    }
}

/**
 * 輪詢任務狀態
 */
async function pollStatus(taskId) {
    const maxAttempts = 120; // 最多等待 2 分鐘
    let attempts = 0;

    const poll = async () => {
        if (attempts >= maxAttempts) {
            showToast('分析超時，請重試', 'error');
            resetUI();
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/status/${taskId}`);
            const data = await response.json();

            updateProgress(data.progress, data.status, data.message);

            if (data.status === 'completed') {
                handleAnalysisComplete(data.result);
            } else if (data.status === 'error') {
                showToast(`分析失敗: ${data.message}`, 'error');
                resetUI();
            } else {
                attempts++;
                setTimeout(poll, 1000);
            }
        } catch (error) {
            console.error('📍[App] 狀態查詢失敗:', error);
            attempts++;
            setTimeout(poll, 2000);
        }
    };

    poll();
}

/**
 * 更新進度顯示
 */
function updateProgress(percent, status, message) {
    elements.progressBar.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${Math.round(percent)}%`;

    const statusMap = {
        'pending': '準備中...',
        'downloading': '下載音訊中',
        'analyzing': '分析音訊中',
        'completed': '分析完成',
        'error': '發生錯誤'
    };

    elements.progressTitle.textContent = statusMap[status] || status;
    elements.progressMessage.textContent = message || '';
}

/**
 * 處理分析完成
 */
async function handleAnalysisComplete(result) {
    console.log('📍[App] 分析完成:', result);

    notesData = result;

    // 隱藏進度，顯示播放器
    elements.progressSection.classList.add('hidden');
    elements.playerSection.classList.remove('hidden');
    elements.pianoSection.classList.remove('hidden');

    // 更新曲目資訊
    const title = result.metadata?.title || '未知曲目';
    const noteCount = result.metadata?.note_count || 0;
    const duration = result.metadata?.total_duration || 0;

    elements.trackTitle.textContent = title;
    elements.trackInfo.textContent = `${noteCount} 個音符 · ${formatTime(duration)}`;
    elements.totalTime.textContent = formatTime(duration);
    elements.notesPlayed.textContent = `0 / ${noteCount}`;

    // 載入音符到瀑布流渲染器
    if (waterfall && result.notes) {
        // 🔑 先同步尺寸（此時鍵盤已渲染完畢）
        waterfall.resize();
        waterfall.loadNotes(result.notes);
    }

    // 載入音色
    await loadPianoSampler();

    // 準備播放
    preparePlayback();

    // 🎵 自動開始播放
    showToast('分析完成！自動開始播放...', 'success');
    elements.analyzeBtn.disabled = false;

    // 延遲一小段時間讓 UI 更新完成後自動播放
    setTimeout(() => {
        togglePlay();
    }, 500);
}

// ========================================
// Tone.js 音訊引擎
// ========================================

/**
 * 載入鋼琴取樣器
 */
async function loadPianoSampler() {
    if (sampler && isLoaded) {
        console.log('📍[Audio] 音色已載入，跳過');
        return;
    }

    elements.loadingOverlay.classList.remove('hidden');
    elements.loadingText.textContent = '載入鋼琴音色中...';

    try {
        // 使用 Tone.Sampler 與 Salamander Grand Piano 取樣
        // 來源: https://github.com/nbrosowsky/tonern.js-instruments
        sampler = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C1: "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                A1: "A1.mp3",
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
                C3: "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                A3: "A3.mp3",
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                A5: "A5.mp3",
                C6: "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                A6: "A6.mp3",
                C7: "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                A7: "A7.mp3",
                C8: "C8.mp3"
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => {
                console.log('📍[Audio] 鋼琴音色載入完成');
                isLoaded = true;
                elements.loadingOverlay.classList.add('hidden');
            }
        }).toDestination();

        // 設定初始音量
        sampler.volume.value = volumeToDb(elements.volumeBar.value / 100);

    } catch (error) {
        console.error('📍[Audio] 音色載入失敗:', error);
        showToast('音色載入失敗，請重新整理頁面', 'error');
        elements.loadingOverlay.classList.add('hidden');
    }
}

/**
 * 準備播放
 */
function preparePlayback() {
    if (!notesData || !notesData.notes) {
        console.error('📍[Audio] 無音符資料');
        return;
    }

    // 清除之前的排程
    if (scheduledPart) {
        scheduledPart.dispose();
    }

    // 建立 Tone.Part
    const events = notesData.notes.map((note, index) => ({
        time: note.start_time,
        pitch: note.pitch,
        duration: note.duration,
        velocity: note.velocity / 127,
        index: index
    }));

    scheduledPart = new Tone.Part((time, event) => {
        // 1. 觸發聲音 (準確的硬體時鐘)
        const noteName = midiToNoteName(event.pitch);
        sampler.triggerAttackRelease(noteName, event.duration, time, event.velocity);

        // 2. 觸發按下視覺 (排程到繪圖幀)
        Tone.Draw.schedule(() => {
            piano.keyDown(event.pitch, event.velocity * 127);
            totalPlayedNotes = event.index + 1;
            updatePlayedNotesDisplay();
            piano.updateCurrentNotes();
        }, time);

        // 3. 觸發放開視覺 (關鍵：在開始時間後的 duration 秒執行)
        // 使用 Draw.schedule 而非 setTimeout，確保與音訊同步
        Tone.Draw.schedule(() => {
            piano.keyUp(event.pitch);
            piano.updateCurrentNotes();
        }, time + event.duration);

    }, events);

    scheduledPart.start(0);

    console.log('📍[Audio] 播放準備完成:', events.length, '個事件');
}

/**
 * 切換播放
 */
async function togglePlay() {
    if (!isLoaded) {
        showToast('音色尚未載入完成', 'info');
        return;
    }

    // 確保 AudioContext 已啟動 (需要用戶互動)
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('📍[Audio] AudioContext 已啟動');
    }

    if (isPlaying) {
        // 暫停
        Tone.Transport.pause();
        if (waterfall) waterfall.pause();
        isPlaying = false;
        updatePlayButton(false);
    } else {
        // 播放
        if (Tone.Transport.state === 'stopped') {
            Tone.Transport.start();
        } else {
            Tone.Transport.start();
        }
        if (waterfall) waterfall.start(Tone.Transport.seconds);
        isPlaying = true;
        updatePlayButton(true);
        startTimeUpdate();
    }
}

/**
 * 停止播放
 */
function stopPlayback() {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    isPlaying = false;
    totalPlayedNotes = 0;

    piano.allKeysUp();
    if (waterfall) waterfall.stop();
    updatePlayButton(false);
    updateTimeDisplay(0);
    updatePlayedNotesDisplay();
    elements.seekBar.value = 0;
}

/**
 * 處理進度拖曳
 */
function handleSeek(e) {
    if (!notesData) return;

    const percent = parseFloat(e.target.value);
    const duration = notesData.metadata?.total_duration || 0;
    const newTime = (percent / 100) * duration;

    Tone.Transport.seconds = newTime;
    if (waterfall) waterfall.seek(newTime);
    updateTimeDisplay(newTime);

    // 釋放所有鍵
    piano.allKeysUp();
}

/**
 * 處理音量調整
 */
function handleVolume(e) {
    const value = parseFloat(e.target.value);
    elements.volumeValue.textContent = `${Math.round(value)}%`;

    if (sampler) {
        sampler.volume.value = volumeToDb(value / 100);
    }
}

// ========================================
// 時間更新迴圈
// ========================================

/**
 * 開始時間更新
 */
function startTimeUpdate() {
    const update = () => {
        if (!isPlaying) return;

        const currentSeconds = Tone.Transport.seconds;
        const totalDuration = notesData?.metadata?.total_duration || 0;

        updateTimeDisplay(currentSeconds);

        // 同步瀑布流渲染器
        if (waterfall) {
            waterfall.syncWithTransport(currentSeconds);
            waterfall.draw();
        }

        // 更新進度條
        const percent = totalDuration > 0 ? (currentSeconds / totalDuration) * 100 : 0;
        elements.seekBar.value = Math.min(100, percent);

        // 檢查是否播放完畢
        if (currentSeconds >= totalDuration) {
            stopPlayback();
            return;
        }

        requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
}

/**
 * 更新時間顯示
 */
function updateTimeDisplay(seconds) {
    elements.currentTime.textContent = formatTime(seconds);
}

/**
 * 更新已播放音符顯示
 */
function updatePlayedNotesDisplay() {
    const total = notesData?.metadata?.note_count || 0;
    elements.notesPlayed.textContent = `${totalPlayedNotes} / ${total}`;
}

/**
 * 更新播放按鈕圖示
 */
function updatePlayButton(playing) {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    if (playing) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

// ========================================
// 工具函數
// ========================================

/**
 * 驗證 YouTube URL
 */
function isValidYouTubeUrl(url) {
    const patterns = [
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/
    ];
    return patterns.some(p => p.test(url));
}

/**
 * MIDI pitch 轉音符名稱
 */
function midiToNoteName(pitch) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(pitch / 12) - 1;
    const note = noteNames[pitch % 12];
    return `${note}${octave}`;
}

/**
 * 百分比音量轉 dB
 */
function volumeToDb(percent) {
    if (percent <= 0) return -Infinity;
    return 20 * Math.log10(percent);
}

/**
 * 格式化時間 (秒 -> m:ss)
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 重置 UI
 */
function resetUI() {
    elements.analyzeBtn.disabled = false;
    elements.progressSection.classList.add('hidden');
}

/**
 * 顯示 Toast 通知
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    // 3 秒後移除
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 鋼琴點擊回調 (測試音)
 */
window.onPianoKeyClick = async (pitch) => {
    if (!isLoaded || !sampler) {
        await loadPianoSampler();
    }

    if (Tone.context.state !== 'running') {
        await Tone.start();
    }

    const noteName = midiToNoteName(pitch);
    sampler.triggerAttackRelease(noteName, "4n");

    piano.keyDown(pitch, 100);
    setTimeout(() => {
        piano.keyUp(pitch);
        piano.updateCurrentNotes();
    }, 300);
    piano.updateCurrentNotes();
};
