/**
 * 內建練習曲庫 - 簡單的兒童鋼琴練習曲
 * 每首曲目包含音符資料，可直接載入播放
 */

const BUILT_IN_SONGS = {
    // 小星星 (Twinkle Twinkle Little Star)
    'twinkle': {
        title: '小星星 (Twinkle Twinkle)',
        level: '初級',
        notes: [
            // C C G G A A G - F F E E D D C
            { pitch: 60, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 3.0, duration: 1.0, velocity: 80 },

            { pitch: 65, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 6.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 6.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 7.0, duration: 1.0, velocity: 80 },

            // G G F F E E D
            { pitch: 67, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 11.0, duration: 1.0, velocity: 80 },

            { pitch: 67, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 14.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 14.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 15.0, duration: 1.0, velocity: 80 },

            // C C G G A A G - F F E E D D C
            { pitch: 60, start_time: 16.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 16.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 17.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 17.5, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 18.0, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 18.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 19.0, duration: 1.0, velocity: 80 },

            { pitch: 65, start_time: 20.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 20.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 21.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 21.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 22.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 22.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 23.0, duration: 1.0, velocity: 80 },
        ]
    },

    // 生日快樂 (Happy Birthday)
    'birthday': {
        title: '生日快樂 (Happy Birthday)',
        level: '初級',
        notes: [
            // G G A G C B
            { pitch: 67, start_time: 0.0, duration: 0.3, velocity: 80 },
            { pitch: 67, start_time: 0.4, duration: 0.3, velocity: 80 },
            { pitch: 69, start_time: 0.8, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 1.4, duration: 0.5, velocity: 80 },
            { pitch: 72, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 71, start_time: 2.6, duration: 0.8, velocity: 80 },

            // G G A G D C
            { pitch: 67, start_time: 3.6, duration: 0.3, velocity: 80 },
            { pitch: 67, start_time: 4.0, duration: 0.3, velocity: 80 },
            { pitch: 69, start_time: 4.4, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 74, start_time: 5.6, duration: 0.5, velocity: 80 },
            { pitch: 72, start_time: 6.2, duration: 0.8, velocity: 80 },

            // G G G' E C B A
            { pitch: 67, start_time: 7.2, duration: 0.3, velocity: 80 },
            { pitch: 67, start_time: 7.6, duration: 0.3, velocity: 80 },
            { pitch: 79, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 76, start_time: 8.6, duration: 0.5, velocity: 80 },
            { pitch: 72, start_time: 9.2, duration: 0.5, velocity: 80 },
            { pitch: 71, start_time: 9.8, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 10.4, duration: 0.8, velocity: 80 },

            // F F E C D C
            { pitch: 77, start_time: 11.4, duration: 0.3, velocity: 80 },
            { pitch: 77, start_time: 11.8, duration: 0.3, velocity: 80 },
            { pitch: 76, start_time: 12.2, duration: 0.5, velocity: 80 },
            { pitch: 72, start_time: 12.8, duration: 0.5, velocity: 80 },
            { pitch: 74, start_time: 13.4, duration: 0.5, velocity: 80 },
            { pitch: 72, start_time: 14.0, duration: 1.0, velocity: 80 },
        ]
    },

    // 瑪莉有隻小綿羊 (Mary Had a Little Lamb)
    'mary': {
        title: '瑪莉有隻小綿羊 (Mary Had a Little Lamb)',
        level: '初級',
        notes: [
            // E D C D E E E
            { pitch: 64, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 3.0, duration: 1.0, velocity: 80 },

            // D D D - E G G
            { pitch: 62, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 5.0, duration: 1.0, velocity: 80 },
            { pitch: 64, start_time: 6.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 6.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 7.0, duration: 1.0, velocity: 80 },

            // E D C D E E E
            { pitch: 64, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 11.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 11.5, duration: 0.5, velocity: 80 },

            // D D E D C
            { pitch: 62, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 14.0, duration: 1.5, velocity: 80 },
        ]
    },

    // 歡樂頌 (Ode to Joy)
    'joy': {
        title: '歡樂頌 (Ode to Joy)',
        level: '初級',
        notes: [
            // E E F G G F E D
            { pitch: 64, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 3.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 3.5, duration: 0.5, velocity: 80 },

            // C C D E E D D
            { pitch: 60, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 6.0, duration: 0.75, velocity: 80 },
            { pitch: 62, start_time: 6.75, duration: 0.25, velocity: 80 },
            { pitch: 62, start_time: 7.0, duration: 1.0, velocity: 80 },

            // E E F G G F E D
            { pitch: 64, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 11.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 11.5, duration: 0.5, velocity: 80 },

            // C C D E D C C
            { pitch: 60, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 14.0, duration: 0.75, velocity: 80 },
            { pitch: 60, start_time: 14.75, duration: 0.25, velocity: 80 },
            { pitch: 60, start_time: 15.0, duration: 1.0, velocity: 80 },
        ]
    },

    // 小蜜蜂
    'bee': {
        title: '小蜜蜂',
        level: '初級',
        notes: [
            // G E E - F D D
            { pitch: 67, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 1.0, duration: 1.0, velocity: 80 },
            { pitch: 65, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 3.0, duration: 1.0, velocity: 80 },

            // C D E F G G G
            { pitch: 60, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 5.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 6.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 6.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 7.0, duration: 1.0, velocity: 80 },

            // G E E - F D D
            { pitch: 67, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 9.0, duration: 1.0, velocity: 80 },
            { pitch: 65, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 11.0, duration: 1.0, velocity: 80 },

            // C E G G E
            { pitch: 60, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 14.0, duration: 1.5, velocity: 80 },
        ]
    },

    // 划船歌 (Row Row Row Your Boat)
    'row': {
        title: '划船歌 (Row Your Boat)',
        level: '初級',
        notes: [
            // C C C D E
            { pitch: 60, start_time: 0.0, duration: 0.75, velocity: 80 },
            { pitch: 60, start_time: 0.75, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 1.25, duration: 0.4, velocity: 80 },
            { pitch: 62, start_time: 1.65, duration: 0.35, velocity: 80 },
            { pitch: 64, start_time: 2.0, duration: 0.75, velocity: 80 },

            // E D E F G
            { pitch: 64, start_time: 2.75, duration: 0.4, velocity: 80 },
            { pitch: 62, start_time: 3.15, duration: 0.35, velocity: 80 },
            { pitch: 64, start_time: 3.5, duration: 0.4, velocity: 80 },
            { pitch: 65, start_time: 3.9, duration: 0.35, velocity: 80 },
            { pitch: 67, start_time: 4.25, duration: 1.0, velocity: 80 },

            // C C C G G G E E E C C C
            { pitch: 72, start_time: 5.25, duration: 0.25, velocity: 70 },
            { pitch: 72, start_time: 5.5, duration: 0.25, velocity: 70 },
            { pitch: 72, start_time: 5.75, duration: 0.25, velocity: 70 },
            { pitch: 67, start_time: 6.0, duration: 0.25, velocity: 70 },
            { pitch: 67, start_time: 6.25, duration: 0.25, velocity: 70 },
            { pitch: 67, start_time: 6.5, duration: 0.25, velocity: 70 },
            { pitch: 64, start_time: 6.75, duration: 0.25, velocity: 70 },
            { pitch: 64, start_time: 7.0, duration: 0.25, velocity: 70 },
            { pitch: 64, start_time: 7.25, duration: 0.25, velocity: 70 },
            { pitch: 60, start_time: 7.5, duration: 0.25, velocity: 70 },
            { pitch: 60, start_time: 7.75, duration: 0.25, velocity: 70 },
            { pitch: 60, start_time: 8.0, duration: 0.25, velocity: 70 },

            // G F E D C
            { pitch: 67, start_time: 8.25, duration: 0.4, velocity: 80 },
            { pitch: 65, start_time: 8.65, duration: 0.35, velocity: 80 },
            { pitch: 64, start_time: 9.0, duration: 0.4, velocity: 80 },
            { pitch: 62, start_time: 9.4, duration: 0.35, velocity: 80 },
            { pitch: 60, start_time: 9.75, duration: 1.0, velocity: 80 },
        ]
    },

    // 倫敦鐵橋 (London Bridge)
    'london': {
        title: '倫敦鐵橋 (London Bridge)',
        level: '初級',
        notes: [
            // G A G F E F G
            { pitch: 67, start_time: 0.0, duration: 0.75, velocity: 80 },
            { pitch: 69, start_time: 0.75, duration: 0.25, velocity: 80 },
            { pitch: 67, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 3.0, duration: 1.0, velocity: 80 },

            // D E F - E F G
            { pitch: 62, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 5.0, duration: 1.0, velocity: 80 },
            { pitch: 64, start_time: 6.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 6.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 7.0, duration: 1.0, velocity: 80 },

            // G A G F E F G - D G E C
            { pitch: 67, start_time: 8.0, duration: 0.75, velocity: 80 },
            { pitch: 69, start_time: 8.75, duration: 0.25, velocity: 80 },
            { pitch: 67, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 11.0, duration: 1.0, velocity: 80 },
            { pitch: 62, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 13.5, duration: 1.5, velocity: 80 },
        ]
    },

    // 小毛驢
    'donkey': {
        title: '小毛驢',
        level: '初級',
        notes: [
            // G G E E G G E
            { pitch: 67, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 3.0, duration: 1.0, velocity: 80 },

            // D D E E D
            { pitch: 62, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 6.0, duration: 2.0, velocity: 80 },

            // G G E E G G E
            { pitch: 67, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 11.0, duration: 1.0, velocity: 80 },

            // D D E D C
            { pitch: 62, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 14.0, duration: 2.0, velocity: 80 },
        ]
    },

    // 兩隻老虎
    'tigers': {
        title: '兩隻老虎',
        level: '初級',
        notes: [
            // C D E C C D E C
            { pitch: 60, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 3.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 3.5, duration: 0.5, velocity: 80 },

            // E F G E F G
            { pitch: 64, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 5.0, duration: 1.0, velocity: 80 },
            { pitch: 64, start_time: 6.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 6.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 7.0, duration: 1.0, velocity: 80 },

            // G A G F E C G A G F E C
            { pitch: 67, start_time: 8.0, duration: 0.25, velocity: 80 },
            { pitch: 69, start_time: 8.25, duration: 0.25, velocity: 80 },
            { pitch: 67, start_time: 8.5, duration: 0.25, velocity: 80 },
            { pitch: 65, start_time: 8.75, duration: 0.25, velocity: 80 },
            { pitch: 64, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 10.0, duration: 0.25, velocity: 80 },
            { pitch: 69, start_time: 10.25, duration: 0.25, velocity: 80 },
            { pitch: 67, start_time: 10.5, duration: 0.25, velocity: 80 },
            { pitch: 65, start_time: 10.75, duration: 0.25, velocity: 80 },
            { pitch: 64, start_time: 11.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 11.5, duration: 0.5, velocity: 80 },

            // C G C - C G C
            { pitch: 60, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 55, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 13.0, duration: 1.0, velocity: 80 },
            { pitch: 60, start_time: 14.0, duration: 0.5, velocity: 80 },
            { pitch: 55, start_time: 14.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 15.0, duration: 1.0, velocity: 80 },
        ]
    },

    // 搖籃曲 (簡化版)
    'lullaby': {
        title: '搖籃曲 (Lullaby)',
        level: '初級',
        notes: [
            // C E G E C E G E
            { pitch: 60, start_time: 0.0, duration: 0.75, velocity: 70 },
            { pitch: 64, start_time: 0.75, duration: 0.75, velocity: 70 },
            { pitch: 67, start_time: 1.5, duration: 0.75, velocity: 70 },
            { pitch: 64, start_time: 2.25, duration: 0.75, velocity: 70 },
            { pitch: 60, start_time: 3.0, duration: 0.75, velocity: 70 },
            { pitch: 64, start_time: 3.75, duration: 0.75, velocity: 70 },
            { pitch: 67, start_time: 4.5, duration: 0.75, velocity: 70 },
            { pitch: 64, start_time: 5.25, duration: 0.75, velocity: 70 },

            // A G F E D C
            { pitch: 69, start_time: 6.0, duration: 0.5, velocity: 70 },
            { pitch: 67, start_time: 6.5, duration: 0.5, velocity: 70 },
            { pitch: 65, start_time: 7.0, duration: 0.5, velocity: 70 },
            { pitch: 64, start_time: 7.5, duration: 0.5, velocity: 70 },
            { pitch: 62, start_time: 8.0, duration: 0.5, velocity: 70 },
            { pitch: 60, start_time: 8.5, duration: 1.5, velocity: 70 },
        ]
    },

    // ABC 字母歌 (和小星星旋律一樣)
    'abc': {
        title: 'ABC 字母歌',
        level: '初級',
        notes: [
            // A B C D E F G (CCGGAAG)
            { pitch: 60, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 3.0, duration: 1.0, velocity: 80 },

            // H I J K (FFEE)
            { pitch: 65, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.5, duration: 0.5, velocity: 80 },

            // L M N O P (DDDC)
            { pitch: 62, start_time: 6.0, duration: 0.4, velocity: 80 },
            { pitch: 62, start_time: 6.4, duration: 0.4, velocity: 80 },
            { pitch: 62, start_time: 6.8, duration: 0.4, velocity: 80 },
            { pitch: 60, start_time: 7.2, duration: 0.8, velocity: 80 },
        ]
    },

    // 鈴兒響叮噹 (Jingle Bells 簡化版)
    'jingle': {
        title: '鈴兒響叮噹',
        level: '初級',
        notes: [
            // E E E - E E E - E G C D E
            { pitch: 64, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 1.0, duration: 1.0, velocity: 80 },
            { pitch: 64, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 3.0, duration: 1.0, velocity: 80 },
            { pitch: 64, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 5.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 6.0, duration: 2.0, velocity: 80 },

            // F F F F F E E E E D D E D G
            { pitch: 65, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 11.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 11.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 14.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 14.5, duration: 1.5, velocity: 80 },
        ]
    },

    // 蝴蝶
    'butterfly': {
        title: '蝴蝶',
        level: '初級',
        notes: [
            // G E E - F D D
            { pitch: 67, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 1.0, duration: 1.0, velocity: 80 },
            { pitch: 65, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 3.0, duration: 1.0, velocity: 80 },

            // C D E F G G G
            { pitch: 60, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 65, start_time: 5.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 6.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 6.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 7.0, duration: 1.0, velocity: 80 },

            // G E E - F D D
            { pitch: 67, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 9.0, duration: 1.0, velocity: 80 },
            { pitch: 65, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 11.0, duration: 1.0, velocity: 80 },

            // C E G G C
            { pitch: 60, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 14.0, duration: 2.0, velocity: 80 },
        ]
    },

    // 世上只有媽媽好
    'mama': {
        title: '世上只有媽媽好',
        level: '初級',
        notes: [
            // G E G A G E G
            { pitch: 67, start_time: 0.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 0.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 1.0, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 1.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 2.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 2.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 3.0, duration: 1.0, velocity: 80 },

            // E D C D E
            { pitch: 64, start_time: 4.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 4.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 5.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 5.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 6.0, duration: 2.0, velocity: 80 },

            // G E G A G E G
            { pitch: 67, start_time: 8.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 8.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 9.0, duration: 0.5, velocity: 80 },
            { pitch: 69, start_time: 9.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 10.0, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 10.5, duration: 0.5, velocity: 80 },
            { pitch: 67, start_time: 11.0, duration: 1.0, velocity: 80 },

            // E D E D C
            { pitch: 64, start_time: 12.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 12.5, duration: 0.5, velocity: 80 },
            { pitch: 64, start_time: 13.0, duration: 0.5, velocity: 80 },
            { pitch: 62, start_time: 13.5, duration: 0.5, velocity: 80 },
            { pitch: 60, start_time: 14.0, duration: 2.0, velocity: 80 },
        ]
    }
};

/**
 * 獲取所有內建曲目列表
 */
function getBuiltInSongList() {
    return Object.entries(BUILT_IN_SONGS).map(([key, song]) => ({
        id: key,
        title: song.title,
        level: song.level,
        noteCount: song.notes.length
    }));
}

/**
 * 獲取指定曲目的音符資料
 */
function getBuiltInSong(songId) {
    const song = BUILT_IN_SONGS[songId];
    if (!song) return null;

    const lastNote = song.notes[song.notes.length - 1];
    const totalDuration = lastNote.start_time + lastNote.duration;

    return {
        notes: song.notes,
        metadata: {
            title: song.title,
            note_count: song.notes.length,
            total_duration: totalDuration,
            source: 'built-in'
        }
    };
}
