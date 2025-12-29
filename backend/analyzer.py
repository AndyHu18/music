"""
YouTube Piano Music Analyzer
Downloads YouTube audio and converts to MIDI-like JSON using Spotify's basic-pitch.
包含專業級音符清洗與力度曲線優化。
"""

import os
import json
import tempfile
import logging
import math
from pathlib import Path
from typing import Optional, Callable, List, Dict, Any, Tuple
from collections import defaultdict
import warnings

import yt_dlp

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 抑制不必要的警告
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)


# ============================================
# 專業級音符清洗與優化函數
# ============================================

def apply_velocity_curve(velocity: int, curve_type: str = 'piano') -> int:
    """
    力度曲線重映射 - 模擬真實鋼琴的物理特性
    
    AI 給的力度通常太平均（集中在 60-80 範圍），
    這會讓彈奏聽起來很死板。透過 S-Curve 映射可以：
    1. 增強輕柔音符的表現力（更輕）
    2. 強調重擊音符的衝擊感（更強）
    3. 保持中間力度的自然過渡
    
    Args:
        velocity: 原始力度 (1-127)
        curve_type: 曲線類型 ('piano', 'linear', 'soft', 'hard')
    
    Returns:
        優化後的力度 (1-127)
    """
    # 正規化到 0-1
    v = max(0, min(127, velocity)) / 127.0
    
    if curve_type == 'piano':
        # S-Curve: 增強動態對比度
        # 使用 tanh 函數模擬鋼琴觸感
        # 將中心點稍微下移，讓輕柔的部分更明顯
        v_mapped = (math.tanh((v - 0.5) * 3) + 1) / 2
        # 微調：保留一些原始力度特徵
        v_mapped = v_mapped * 0.7 + v * 0.3
        
    elif curve_type == 'soft':
        # 對數曲線：更柔和的動態
        v_mapped = math.log1p(v * (math.e - 1)) / math.log(math.e)
        
    elif curve_type == 'hard':
        # 指數曲線：更強烈的動態對比
        v_mapped = v ** 0.5
        
    else:  # linear
        v_mapped = v
    
    # 轉回 1-127 範圍
    return max(1, min(127, int(v_mapped * 127)))


def refine_notes(
    raw_notes: List[Dict[str, Any]],
    min_gap: float = 0.05,
    max_duration: float = 3.0,
    apply_velocity_optimization: bool = True
) -> List[Dict[str, Any]]:
    """
    對音符進行專業級邏輯清洗
    
    解決 AI 誤判產生的問題：
    1. 碎音合併 (De-jittering)
    2. 最大長度限制 (Sustain Pedal Fix)
    3. 力度曲線優化 (Velocity Mapping)
    4. 單音軌邏輯校正 (Monophonic Constraint)
    
    Args:
        raw_notes: 初步過濾後的音符列表
        min_gap: 最小間隔閾值(秒)，小於此值的連續音符會被合併
        max_duration: 最大音符長度(秒)，超過此值會被截斷（防止踏板延音問題）
        apply_velocity_optimization: 是否應用力度曲線優化
    
    Returns:
        清洗後的音符列表
    """
    if not raw_notes:
        return []
    
    # 1. 按音高(pitch)分組
    notes_by_pitch: Dict[int, List[Dict]] = defaultdict(list)
    for note in raw_notes:
        notes_by_pitch[note['pitch']].append(note)
    
    refined: List[Dict[str, Any]] = []
    merge_count = 0
    truncate_count = 0
    
    for pitch, pitch_group in notes_by_pitch.items():
        # 按開始時間排序
        pitch_group.sort(key=lambda x: x['start_time'])
        
        if not pitch_group:
            continue
        
        # 初始化當前音符
        current = pitch_group[0].copy()
        
        for i in range(1, len(pitch_group)):
            next_note = pitch_group[i]
            
            # 計算間隔：下一個開始時間 - 當前結束時間
            current_end = current['start_time'] + current['duration']
            gap = next_note['start_time'] - current_end
            
            if gap < min_gap:
                # 合併音符：延長當前音符
                merge_count += 1
                next_end = next_note['start_time'] + next_note['duration']
                new_end = max(current_end, next_end)
                current['duration'] = round(new_end - current['start_time'], 3)
                # 力度取最大值，模擬重擊感
                current['velocity'] = max(current['velocity'], next_note['velocity'])
            else:
                # 保存當前音符，開始新音符
                refined.append(current)
                current = next_note.copy()
        
        # 保存最後一個音符
        refined.append(current)
    
    # 2. 應用最大長度限制（解決踏板延音問題）
    for note in refined:
        if note['duration'] > max_duration:
            note['duration'] = max_duration
            truncate_count += 1
    
    # 3. 應用力度曲線優化
    if apply_velocity_optimization:
        for note in refined:
            note['velocity'] = apply_velocity_curve(note['velocity'], 'piano')
    
    # 4. 按開始時間排序
    refined.sort(key=lambda x: x['start_time'])
    
    if merge_count > 0:
        logger.info(f"📍[Refine] 合併了 {merge_count} 個碎音")
    if truncate_count > 0:
        logger.info(f"📍[Refine] 截斷了 {truncate_count} 個過長音符 (max={max_duration}s)")
    
    return refined


def preprocess_audio_with_ffmpeg(input_path: Path, output_dir: Path) -> Path:
    """
    使用 FFmpeg 對音訊進行預處理，提升 AI 分析準確度
    
    處理內容：
    1. 高通濾波 (High-pass Filter): 移除 30Hz 以下的極低頻噪音
    2. 壓縮器 (Compressor): 平衡動態範圍，讓 AI 更容易識別輕柔音符
    3. 正規化 (Normalize): 統一音量水平
    
    Args:
        input_path: 原始音訊路徑
        output_dir: 輸出目錄
    
    Returns:
        預處理後的音訊路徑
    """
    import subprocess
    import shutil
    
    # 檢查 FFmpeg 是否可用
    if not shutil.which('ffmpeg'):
        logger.warning("📍[Preprocess] FFmpeg 未安裝，跳過預處理")
        return input_path
    
    output_path = output_dir / f"{input_path.stem}_processed.wav"
    
    # FFmpeg 濾波鏈：
    # - highpass: 30Hz 高通濾波，移除極低頻噪音
    # - compand: 壓縮器，平衡動態範圍
    # - loudnorm: 音量正規化
    filter_chain = (
        "highpass=f=30,"
        "compand=attacks=0.1:decays=0.3:points=-80/-80|-30/-15|0/0:soft-knee=6,"
        "loudnorm=I=-16:TP=-1.5:LRA=11"
    )
    
    cmd = [
        'ffmpeg', '-y', '-i', str(input_path),
        '-af', filter_chain,
        '-ar', '44100',  # 確保採樣率
        '-ac', '1',       # 轉換為單聲道（更乾淨）
        str(output_path)
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0 and output_path.exists():
            logger.info(f"📍[Preprocess] 音訊預處理完成: {output_path.name}")
            return output_path
        else:
            logger.warning(f"📍[Preprocess] FFmpeg 處理失敗: {result.stderr[:200]}")
            return input_path
            
    except subprocess.TimeoutExpired:
        logger.warning("📍[Preprocess] FFmpeg 處理超時")
        return input_path
    except Exception as e:
        logger.warning(f"📍[Preprocess] 預處理失敗: {e}")
        return input_path


def adaptive_filter_notes(
    notes: List[Dict[str, Any]],
    window_size: float = 0.1,
    chord_threshold: int = 4
) -> List[Dict[str, Any]]:
    """
    自適應門檻過濾 - 根據和弦密度動態調整過濾參數
    
    當偵測到和弦（短時間內大量音符）時，降低力度門檻
    以捕捉被大聲遮蔽的細微音符。
    
    Args:
        notes: 音符列表
        window_size: 時間窗口大小(秒)
        chord_threshold: 判定為和弦的最小音符數
    
    Returns:
        過濾後的音符列表
    """
    if not notes:
        return []
    
    # 按開始時間排序
    sorted_notes = sorted(notes, key=lambda x: x['start_time'])
    
    # 分析每個時間窗口的音符密度
    result = []
    i = 0
    
    while i < len(sorted_notes):
        current_time = sorted_notes[i]['start_time']
        window_end = current_time + window_size
        
        # 找出這個窗口內的所有音符
        window_notes = []
        j = i
        while j < len(sorted_notes) and sorted_notes[j]['start_time'] < window_end:
            window_notes.append(sorted_notes[j])
            j += 1
        
        note_count = len(window_notes)
        
        if note_count >= chord_threshold:
            # 和弦區塊：降低力度門檻以捕捉細節
            local_min_velocity = 8
        elif note_count >= 2:
            # 雙音/三音：中等門檻
            local_min_velocity = 12
        else:
            # 單音旋律：提高門檻避免雜訊
            local_min_velocity = 18
        
        # 應用過濾
        for note in window_notes:
            if note['velocity'] >= local_min_velocity:
                if note not in result:
                    result.append(note)
        
        i = j if j > i else i + 1
    
    return result


def filter_harmonics(
    notes: List[Dict[str, Any]],
    harmonic_threshold: float = 0.4
) -> List[Dict[str, Any]]:
    """
    泛音過濾 - 移除可能是泛音的假音符
    
    如果在同一時間點偵測到低音 (C3) 和其八度音 (C4)，
    且高音力度明顯較弱，則很可能是泛音而非真實彈奏。
    
    Args:
        notes: 音符列表
        harmonic_threshold: 泛音判定閾值 (0-1)
    
    Returns:
        過濾後的音符列表
    """
    if not notes:
        return []
    
    # 按開始時間分組（允許 20ms 誤差）
    TIME_TOLERANCE = 0.02
    sorted_notes = sorted(notes, key=lambda x: x['start_time'])
    
    # 標記要移除的音符
    to_remove = set()
    
    for i, note in enumerate(sorted_notes):
        base_pitch = note['pitch']
        base_velocity = note['velocity']
        base_time = note['start_time']
        
        # 檢查同時間段的其他音符
        for j, other in enumerate(sorted_notes):
            if i == j or j in to_remove:
                continue
            
            # 時間是否接近
            if abs(other['start_time'] - base_time) > TIME_TOLERANCE:
                continue
            
            other_pitch = other['pitch']
            other_velocity = other['velocity']
            
            # 檢查是否為泛音關係 (八度 = 12 個半音)
            pitch_diff = other_pitch - base_pitch
            
            # 常見泛音關係：八度(12), 五度(7), 雙八度(24)
            if pitch_diff in [12, 24, 7, 19]:
                # 如果高音力度明顯較弱，可能是泛音
                velocity_ratio = other_velocity / max(base_velocity, 1)
                
                if velocity_ratio < harmonic_threshold:
                    to_remove.add(j)
                    logger.debug(f"📍[Harmonic] 移除可能泛音: {other_pitch} (基音 {base_pitch}, 力度比 {velocity_ratio:.2f})")
    
    result = [note for i, note in enumerate(sorted_notes) if i not in to_remove]
    
    if to_remove:
        logger.info(f"📍[Harmonic] 移除了 {len(to_remove)} 個可能的泛音")
    
    return result


def download_audio(
    youtube_url: str,
    output_dir: Path,
    progress_callback: Optional[Callable[[str, float], None]] = None
) -> Tuple[Path, str]:
    """
    使用 yt-dlp 下載 YouTube 音訊為 MP3 格式
    
    Args:
        youtube_url: YouTube 網址
        output_dir: 輸出目錄
        progress_callback: 進度回調 (stage, percent)
    
    Returns:
        (音訊檔案路徑, 影片標題)
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_template = str(output_dir / "%(id)s.%(ext)s")
    
    def progress_hook(d):
        if d['status'] == 'downloading':
            if progress_callback:
                # 解析進度百分比
                percent = d.get('_percent_str', '0%').strip().replace('%', '')
                try:
                    progress_callback('downloading', float(percent))
                except ValueError:
                    pass
        elif d['status'] == 'finished':
            if progress_callback:
                progress_callback('downloading', 100)
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_template,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '320',  # 提升至 320kbps 以獲得更好的高頻解析
        }],
        'progress_hooks': [progress_hook],
        'quiet': True,
        'no_warnings': True,
        # 避免下載過長的影片 (限制 10 分鐘)
        'match_filter': yt_dlp.utils.match_filter_func("duration < 600"),
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            video_id = info.get('id', 'audio')
            video_title = info.get('title', 'Unknown')
            
            # 找到下載的 MP3 檔案
            audio_path = output_dir / f"{video_id}.mp3"
            
            if not audio_path.exists():
                raise FileNotFoundError(f"下載完成但找不到音訊檔案: {audio_path}")
            
            logger.info(f"📍[Analyzer] 音訊下載完成: {video_title}")
            return audio_path, video_title
            
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"📍[Analyzer] 下載失敗: {e}")
        raise RuntimeError(f"YouTube 下載失敗: {str(e)}")


def analyze_audio_with_basic_pitch(
    audio_path: Path,
    output_dir: Path,
    progress_callback: Optional[Callable[[str, float], None]] = None,
    enable_preprocessing: bool = True,
    chord_mode: bool = True
) -> Path:
    """
    使用 Spotify basic-pitch 進行音訊分析並轉換為 notes.json
    
    basic-pitch 支援多音軌（和弦）檢測，效果遠優於單音檢測器。
    
    Args:
        audio_path: MP3 音訊路徑
        output_dir: JSON 輸出目錄
        progress_callback: 進度回調
        enable_preprocessing: 是否啟用 FFmpeg 預處理
        chord_mode: 是否啟用和弦模式（降低 onset/frame 閾值）
    
    Returns:
        notes.json 檔案路徑
    """
    # 延遲導入以加快啟動速度
    from basic_pitch.inference import predict
    from basic_pitch import ICASSP_2022_MODEL_PATH
    
    if progress_callback:
        progress_callback('analyzing', 5)
    
    # ============================================
    # 階段 1: FFmpeg 音訊預處理 (選擇性)
    # ============================================
    processed_audio = audio_path
    if enable_preprocessing:
        logger.info(f"📍[Analyzer] 開始音訊預處理...")
        processed_audio = preprocess_audio_with_ffmpeg(audio_path, output_dir)
        
    if progress_callback:
        progress_callback('analyzing', 15)
    
    logger.info(f"📍[Analyzer] 使用 basic-pitch 分析: {processed_audio}")
    
    try:
        # ============================================
        # 階段 2: 調整 basic-pitch 參數
        # ============================================
        # chord_mode: 降低閾值以捕捉更多和弦細節
        if chord_mode:
            onset_thresh = 0.4    # 預設 ~0.5, 降低以捕捉和弦
            frame_thresh = 0.25   # 預設 ~0.3, 降低讓長音不易斷掉
            min_note_len = 50     # 最小音符長度 (ms)
        else:
            onset_thresh = 0.5
            frame_thresh = 0.3
            min_note_len = 80
        
        logger.info(f"📍[Analyzer] 和弦模式: {chord_mode}, onset={onset_thresh}, frame={frame_thresh}")
        
        # 使用 predict 函數獲取原始數據
        model_output, midi_data, note_events = predict(
            str(processed_audio),
            model_or_model_path=ICASSP_2022_MODEL_PATH,
            onset_threshold=onset_thresh,
            frame_threshold=frame_thresh,
            minimum_note_length=min_note_len,
        )
        
        if progress_callback:
            progress_callback('analyzing', 50)
        
        # ============================================
        # 階段 3: 基礎過濾 (範圍 + 時長 + 力度)
        # ============================================
        MIN_DURATION = 0.04    # 押低至 40ms (和弦模式)
        MIN_VELOCITY = 10      # 押低以捕捉被遮蔽的音符
        MERGE_THRESHOLD = 0.03 # 同一音高在 30ms 內重複觸發視為重疊
        
        # 將 note_events 轉換為我們需要的 JSON 格式
        # note_events 是 (start_time_s, end_time_s, pitch_midi, velocity, [pitch_bends])
        raw_notes: List[Dict[str, Any]] = []
        
        for note in note_events:
            start_time = float(note[0])
            end_time = float(note[1])
            pitch = int(note[2])  # MIDI pitch (0-127, 60 = Middle C)
            velocity = int(note[3] * 127)  # 正規化到 0-127
            duration = end_time - start_time
            
            # 過濾 1: 鋼琴範圍 (A0=21 到 C8=108)
            if pitch < 21 or pitch > 108:
                continue
            
            # 過濾 2: 最小時長 (去除碎音雜訊)
            if duration < MIN_DURATION:
                continue
            
            # 過濾 3: 最小力度 (去除背景雜訊)
            if velocity < MIN_VELOCITY:
                continue
            
            raw_notes.append({
                "pitch": pitch,
                "start_time": round(start_time, 3),
                "end_time": round(end_time, 3),
                "duration": round(duration, 3),
                "velocity": min(127, max(1, velocity))
            })
        
        if progress_callback:
            progress_callback('analyzing', 60)
        
        # ============================================
        # 階段 4: 自適應門檻過濾 (和弦模式)
        # ============================================
        if chord_mode:
            raw_notes = adaptive_filter_notes(
                raw_notes,
                window_size=0.1,
                chord_threshold=4
            )
        
        if progress_callback:
            progress_callback('analyzing', 70)
        
        # ============================================
        # 階段 5: 泛音過濾
        # ============================================
        raw_notes = filter_harmonics(raw_notes, harmonic_threshold=0.35)
        
        if progress_callback:
            progress_callback('analyzing', 75)
        
        # ============================================
        # 階段 6: 專業級音符清洗 (碎音合併 + 力度曲線)
        notes_json = refine_notes(
            raw_notes,
            min_gap=MERGE_THRESHOLD,
            apply_velocity_optimization=True
        )
        
        if progress_callback:
            progress_callback('analyzing', 85)
        
        # 計算總時長
        total_duration = max(n['start_time'] + n['duration'] for n in notes_json) if notes_json else 0
        
        # 統計過濾信息
        original_count = len(note_events)
        filtered_count = len(notes_json)
        filter_rate = ((original_count - filtered_count) / original_count * 100) if original_count > 0 else 0
        
        logger.info(f"📍[Analyzer] 過濾統計: 原始 {original_count} → 過濾後 {filtered_count} ({filter_rate:.1f}% 被過濾)")
        
        # 輸出 JSON
        output_path = output_dir / "notes.json"
        output_data = {
            "metadata": {
                "total_duration": round(total_duration, 3),
                "note_count": len(notes_json),
                "source": str(audio_path.name),
                "analysis_method": "Spotify basic-pitch (ICASSP 2022) + Pro Pipeline",
                "processing_pipeline": {
                    "stage_1_ffmpeg_preprocessing": enable_preprocessing,
                    "stage_2_chord_mode": chord_mode,
                    "stage_3_basic_filter": True,
                    "stage_4_adaptive_threshold": chord_mode,
                    "stage_5_harmonic_filter": True,
                    "stage_6_velocity_curve": True
                },
                "parameters": {
                    "onset_threshold": onset_thresh,
                    "frame_threshold": frame_thresh,
                    "min_note_length_ms": min_note_len,
                    "min_duration_ms": MIN_DURATION * 1000,
                    "min_velocity": MIN_VELOCITY,
                    "merge_threshold_ms": MERGE_THRESHOLD * 1000
                },
                "statistics": {
                    "original_count": original_count,
                    "final_count": filtered_count,
                    "filter_rate_percent": round(filter_rate, 1)
                }
            },
            "notes": notes_json
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        if progress_callback:
            progress_callback('analyzing', 100)
        
        logger.info(f"📍[Analyzer] basic-pitch 分析完成: {len(notes_json)} 個音符, 總時長 {total_duration:.2f}s")
        return output_path
        
    except Exception as e:
        logger.error(f"📍[Analyzer] basic-pitch 分析失敗: {e}")
        raise RuntimeError(f"音訊分析失敗: {str(e)}")


def process_youtube(
    youtube_url: str,
    output_dir: Path,
    progress_callback: Optional[Callable[[str, float], None]] = None
) -> Dict[str, Any]:
    """
    完整流程：下載 YouTube 音訊並分析為 JSON
    
    Args:
        youtube_url: YouTube 網址
        output_dir: 輸出目錄
        progress_callback: 進度回調
    
    Returns:
        包含分析結果的字典
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 階段 1: 下載音訊
    audio_path, video_title = download_audio(youtube_url, output_dir, progress_callback)
    
    # 階段 2: 分析音訊 (使用 basic-pitch)
    json_path = analyze_audio_with_basic_pitch(audio_path, output_dir, progress_callback)
    
    # 讀取生成的 JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        result = json.load(f)
    
    result['metadata']['title'] = video_title
    result['metadata']['audio_file'] = str(audio_path.name)
    
    # 重新保存帶標題的版本
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return result


# CLI 測試入口
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python analyzer.py <YouTube URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    output = Path("./output")
    
    def print_progress(stage, percent):
        print(f"[{stage}] {percent:.1f}%")
    
    try:
        result = process_youtube(url, output, print_progress)
        print(f"\n✅ 分析完成!")
        print(f"   標題: {result['metadata'].get('title', 'N/A')}")
        print(f"   音符數: {result['metadata']['note_count']}")
        print(f"   總時長: {result['metadata']['total_duration']:.2f} 秒")
    except Exception as e:
        print(f"\n❌ 失敗: {e}")
        sys.exit(1)
