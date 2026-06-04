export default `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>萌动黑白块 - 脑力手眼协调训练</title>
  <!-- 引入圆润可爱的字体 -->
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #f7e8eb;
      --tile-white: #ffffff;
      --tile-active: rgba(255, 255, 255, 0.5);
      --text-color: #5c4d50;
      --shadow-color: rgba(92, 77, 80, 0.12);
      --font-family: 'Fredoka', -apple-system, sans-serif;
    }

    * {
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      margin: 0;
      padding: 0;
    }

    body {
      background: radial-gradient(circle at center, #fff6f7 0%, #f7e8eb 100%);
      font-family: var(--font-family);
      color: var(--text-color);
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      transition: background 0.5s ease;
    }

    /* 游戏主容器 */
    #game-container {
      position: relative;
      width: 100%;
      max-width: 440px;
      height: 100%;
      max-height: 800px;
      background-color: var(--tile-white);
      box-shadow: 0 24px 64px var(--shadow-color);
      border-radius: 32px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 6px solid #ffffff;
      transition: border-color 0.5s ease, box-shadow 0.5s ease;
    }

    /* Fever 模式下的彩虹光晕 */
    #game-container.fever-mode {
      animation: feverGlow 1.5s infinite alternate;
      border-color: #ffb3c1;
    }

    /* 状态栏 (分数、连击) */
    #hud {
      position: absolute;
      top: 24px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      z-index: 10;
      pointer-events: none;
    }

    .hud-card {
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 12px 20px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(255, 143, 163, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    #score-box {
      font-size: 16px;
      font-weight: 600;
      color: #ff6b8b;
    }

    #score-val {
      font-weight: 700;
      font-size: 26px;
      display: inline-block;
      transition: transform 0.1s ease;
    }

    #combo-box {
      font-size: 14px;
      color: #ff6b8b;
      font-weight: 600;
      transform: scale(0);
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    #combo-box.show {
      transform: scale(1);
    }

    #combo-val {
      color: #ff3366;
      font-weight: 700;
      font-size: 22px;
    }

    #multiplier-val {
      font-size: 12px;
      color: #ff8fa3;
      font-weight: 700;
    }

    /* 棋盘区域 */
    #board-wrapper {
      flex: 1;
      position: relative;
      width: 100%;
      overflow: hidden;
      background-color: #fdfafb;
    }

    #board {
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      display: flex;
      flex-direction: column;
    }

    .row {
      display: flex;
      width: 100%;
      height: 160px; /* 一行高度 */
    }

    .cell {
      flex: 1;
      height: 100%;
      border-right: 1px dashed rgba(255, 143, 163, 0.1);
      border-top: 1px dashed rgba(255, 143, 163, 0.1);
      position: relative;
      cursor: pointer;
      background-color: transparent;
      transition: background-color 0.1s ease;
    }

    .cell:last-child {
      border-right: none;
    }

    /* 黑块样式 (萌化彩色马卡龙块) */
    .cell.black {
      border-radius: 20px;
      margin: 6px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
      border: 3px solid #ffffff;
      transform: scale(1);
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }

    .cell.black:active {
      transform: scale(0.95);
    }

    .cell.clicked {
      background-color: var(--tile-active) !important;
      border: none !important;
      box-shadow: none !important;
      animation: clickPop 0.25s ease-out forwards;
    }

    .cell.error {
      background-color: #ff8787 !important;
      border: 3px solid #ffffff;
      border-radius: 20px;
      margin: 6px;
      animation: shake 0.35s ease-in-out;
    }

    /* 遮罩与弹窗 */
    .screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 248, 249, 0.97);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 100;
      padding: 40px 30px;
      text-align: center;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .screen.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    h1 {
      font-size: 36px;
      color: #ff6b8b;
      margin-bottom: 16px;
      font-weight: 700;
      text-shadow: 0 4px 10px rgba(255, 107, 139, 0.15);
    }

    h2 {
      font-size: 24px;
      color: #ff6b8b;
      margin-bottom: 20px;
    }

    p {
      font-size: 15px;
      color: #8c7a7e;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .btn {
      background: linear-gradient(135deg, #ff8fa3 0%, #ffb3c1 100%);
      color: white;
      border: none;
      padding: 14px 40px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(255, 143, 163, 0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      font-family: var(--font-family);
      margin: 8px 0;
      width: 80%;
      max-width: 280px;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(255, 143, 163, 0.45);
    }

    .btn:active {
      transform: translateY(1px) scale(0.97);
      box-shadow: 0 6px 15px rgba(255, 143, 163, 0.45);
    }

    .btn.btn-secondary {
      background: linear-gradient(135deg, #a8dadc 0%, #b8e2e6 100%);
      box-shadow: 0 10px 25px rgba(168, 218, 220, 0.35);
    }

    .btn.btn-secondary:hover {
      box-shadow: 0 12px 30px rgba(168, 218, 220, 0.45);
    }

    .btn.btn-sm {
      padding: 8px 16px;
      font-size: 14px;
      width: auto;
      margin: 0;
    }

    /* 粒子效果 */
    .particle {
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      animation: particleOut 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      z-index: 5;
    }

    /* Fever 文字提示 */
    #fever-banner {
      position: absolute;
      top: 130px;
      left: 50%;
      transform: translateX(-50%) scale(0);
      background: linear-gradient(135deg, #ff007f, #ff66cc);
      color: white;
      padding: 8px 24px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 20px;
      box-shadow: 0 10px 25px rgba(255, 0, 127, 0.3);
      z-index: 15;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    #fever-banner.active {
      transform: translateX(-50%) scale(1);
      animation: pulse 0.8s infinite alternate;
    }

    /* 排行榜滚动区域 */
    .leaderboard-list {
      width: 100%;
      max-height: 320px;
      overflow-y: auto;
      margin: 15px 0 25px;
      padding-right: 5px;
    }

    .leaderboard-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(92, 77, 80, 0.04);
      border: 1px solid rgba(255, 143, 163, 0.1);
    }

    .leaderboard-item.top-0 { background: #ffe3e8; border-color: #ffb3c1; }
    .leaderboard-item.top-1 { background: #fff0f3; border-color: #ffccd5; }
    .leaderboard-item.top-2 { background: #fffafd; border-color: #ffe5ec; }

    .rank-num {
      font-weight: 700;
      font-size: 18px;
      color: #ff6b8b;
      width: 24px;
    }

    .player-name {
      flex: 1;
      text-align: left;
      margin-left: 12px;
      font-weight: 600;
      color: #5c4d50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-score {
      font-weight: 700;
      font-size: 18px;
      color: #ff6b8b;
    }

    /* 名字输入弹出层 */
    .input-dialog {
      background: rgba(255, 255, 255, 0.98);
      padding: 24px;
      border-radius: 24px;
      border: 3px solid #ffccd5;
      box-shadow: 0 16px 40px rgba(255, 143, 163, 0.25);
      width: 90%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .input-field-wrapper {
      width: 100%;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .input-field {
      flex: 1;
      border: 2px solid #ffd166;
      background: #fffdf9;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 16px;
      font-family: var(--font-family);
      outline: none;
      color: #5c4d50;
      text-align: center;
    }

    .input-field:focus {
      border-color: #ff8fa3;
    }

    .dialog-buttons {
      display: flex;
      gap: 12px;
      width: 100%;
      justify-content: center;
    }

    .dialog-buttons .btn {
      width: auto;
      flex: 1;
      padding: 10px 16px;
      font-size: 15px;
    }

    /* 关键帧动画 */
    @keyframes clickPop {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.88); opacity: 0.8; }
      100% { transform: scale(0.95); opacity: 0; }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-10px); }
      40%, 80% { transform: translateX(10px); }
    }

    @keyframes particleOut {
      0% { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
    }

    @keyframes pulse {
      0% { transform: translateX(-50%) scale(1); }
      100% { transform: translateX(-50%) scale(1.1); }
    }

    @keyframes feverGlow {
      0% { box-shadow: 0 24px 64px rgba(255, 143, 163, 0.2); }
      100% { box-shadow: 0 24px 64px rgba(255, 0, 127, 0.4); }
    }
  </style>
</head>
<body>

  <div id="game-container">
    <!-- HUD 信息显示 -->
    <div id="hud">
      <div id="score-box" class="hud-card">
        <span>得分</span>
        <span id="score-val">0</span>
      </div>
      <div id="combo-box" class="hud-card">
        <div>Combo <span id="combo-val">0</span></div>
        <div id="multiplier-val">x1</div>
      </div>
    </div>

    <!-- Fever 提示 -->
    <div id="fever-banner">FEVER ✨</div>

    <!-- 游戏棋盘区域 -->
    <div id="board-wrapper">
      <div id="board"></div>
    </div>

    <!-- 开始画面 (Splash Screen) -->
    <div id="start-screen" class="screen">
      <h1>🌸 萌动黑白块 🌸</h1>
      <p style="font-size: 15px; margin-bottom: 24px;">
        【玩法介绍】<br>
        1. 仅点击落下的<strong>彩色马卡龙方块</strong>！<br>
        2. 方块会<strong>自动下落</strong>，且速度逐渐变快。<br>
        3. 连续消除<strong>同一种颜色</strong>可以积累 Combo！<br>
        4. 点到不同颜色将重置 Combo。Combo 越高，积分翻倍越多 (最高 x16)！
      </p>
      <button id="start-btn" class="btn">开始游戏</button>
      <button id="view-leaderboard-btn" class="btn btn-secondary">查看排行榜</button>
    </div>

    <!-- 排行榜画面 -->
    <div id="leaderboard-screen" class="screen hidden">
      <h2>🏆 积分排行榜</h2>
      <div class="leaderboard-list" id="leaderboard-list">
        <!-- 排行榜项目 -->
      </div>
      <button id="back-to-start-btn" class="btn btn-secondary">返回主页</button>
    </div>

    <!-- 输入名字保存排行榜弹窗 -->
    <div id="name-input-screen" class="screen hidden" style="background: rgba(0, 0, 0, 0.4); z-index: 110;">
      <div class="input-dialog">
        <h3 style="color: #ff6b8b; font-size: 20px;">🎉 新纪录！</h3>
        <p style="margin-bottom: 8px; font-size: 14px;">恭喜获得 <strong id="new-record-score" style="color: #ff6b8b; font-size: 18px;">0</strong> 分！留下你的名字吧：</p>
        <div class="input-field-wrapper">
          <input type="text" id="player-name-input" class="input-field" placeholder="输入名字 (10字以内)" maxlength="10">
          <button id="name-random-btn" class="btn btn-secondary btn-sm">随机</button>
        </div>
        <div class="dialog-buttons">
          <button id="name-submit-btn" class="btn">保存</button>
          <button id="name-cancel-btn" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 结束画面 -->
    <div id="over-screen" class="screen hidden">
      <h1>游戏结束 🌟</h1>
      <p>
        本次得分: <span id="final-score" style="font-size: 32px; font-weight: 700; color: #ff6b8b; display: block; margin: 10px 0;">0</span>
        最高纪录: <span id="best-score" style="font-weight: 600;">0</span>
      </p>
      <button id="restart-btn" class="btn">再来一局</button>
      <button id="over-view-leaderboard-btn" class="btn btn-secondary">查看排行榜</button>
    </div>
  </div>

  <script>
    // --- Web Audio 声音合成模块 ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new AudioCtx();
      }
    }

    function playTone(freq, duration, type = 'sine', volume = 0.15) {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }

    // 播放消块音效 (Animal Crossing 风格可爱音效，音调随 combo 增加)
    function playTapSound(combo) {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      
      // 第一个可爱啵啵音 (高音)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'triangle';
      const baseFreq = 523.25 + (combo * 32.7); // C5 向上递增
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);
      
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // 第二个回声装饰音 (增加可爱小共鸣)
      setTimeout(() => {
        if (!audioCtx || !state.isPlaying) return;
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * 2, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.05);
      }, 40);
    }

    // 播放方块出现音效 (超轻的可爱小泡泡啵音)
    function playCuteSpawnSound() {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
      
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(now + 0.04);
    }

    // 播放失败音效 (滑音滑下去)
    function playFailSound() {
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(now + 0.3);
    }

    // --- 游戏配置 ---
    const ROW_COUNT = 6; // 比之前多一行，防止顶端空缺
    const COL_COUNT = 4; 
    const ROW_HEIGHT = 160; 

    // 马卡龙色池
    const MACARON_COLORS = [
      '#ff8fa3', // 粉红
      '#8ecae6', // 天蓝
      '#a8dadc', // 薄荷绿
      '#ffd166', // 柔黄
      '#dec9e9', // 薰衣草紫
      '#fbc4ab'  // 水蜜桃
    ];

    const board = document.getElementById('board');
    const scoreVal = document.getElementById('score-val');
    const comboVal = document.getElementById('combo-val');
    const comboBox = document.getElementById('combo-box');
    const multiplierVal = document.getElementById('multiplier-val');
    const startScreen = document.getElementById('start-screen');
    const overScreen = document.getElementById('over-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const nameInputScreen = document.getElementById('name-input-screen');
    
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
    const overViewLeaderboardBtn = document.getElementById('over-view-leaderboard-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');
    
    const finalScore = document.getElementById('final-score');
    const bestScore = document.getElementById('best-score');
    const feverBanner = document.getElementById('fever-banner');
    const gameContainer = document.getElementById('game-container');
    
    const newRecordScore = document.getElementById('new-record-score');
    const playerNameInput = document.getElementById('player-name-input');
    const nameRandomBtn = document.getElementById('name-random-btn');
    const nameSubmitBtn = document.getElementById('name-submit-btn');
    const nameCancelBtn = document.getElementById('name-cancel-btn');
    const leaderboardList = document.getElementById('leaderboard-list');

    let state = {
      score: 0,
      combo: 0,
      rows: [], 
      isPlaying: false,
      isFever: false,
      offsetY: 0,
      speed: 120, // 初始每秒下落像素
      lastTapColor: null,
      animationFrameId: null,
      lastTime: 0
    };

    function initGame() {
      state.score = 0;
      state.combo = 0;
      state.rows = [];
      state.offsetY = 0;
      state.speed = 120;
      state.lastTapColor = null;
      state.isFever = false;
      board.innerHTML = '';
      board.style.transform = 'translateY(0px)';
      scoreVal.textContent = '0';
      comboVal.textContent = '0';
      multiplierVal.textContent = 'x1';
      comboBox.classList.remove('show');
      feverBanner.classList.remove('active');
      gameContainer.classList.remove('fever-mode');
      
      // 生成初始行，最底下两行为空，给玩家反应时间
      for (let i = 0; i < ROW_COUNT; i++) {
        addRow(i < 2);
      }
    }

    // 获取颜色，保证屏幕上至少有两个相同颜色
    function getMacaronColor() {
      const activeColors = [];
      state.rows.forEach(r => {
        if (r.blackIndex !== -1) {
          const cell = r.cells[r.blackIndex];
          if (cell && !cell.clicked) {
            activeColors.push(cell.color);
          }
        }
      });

      const randomColor = MACARON_COLORS[Math.floor(Math.random() * MACARON_COLORS.length)];
      
      // 如果屏幕上有活跃色，但没有任何相同的颜色组合，且活跃色个数大于0，则有一半的概率强制生成已有的某种颜色
      if (activeColors.length > 0) {
        const counts = {};
        let hasDuplicate = false;
        activeColors.forEach(c => {
          counts[c] = (counts[c] || 0) + 1;
          if (counts[c] >= 2) hasDuplicate = true;
        });

        if (!hasDuplicate && Math.random() < 0.8) {
          return activeColors[Math.floor(Math.random() * activeColors.length)];
        }
      }
      return randomColor;
    }

    function addRow(isEmpty = false) {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';
      
      const blackIndex = isEmpty ? -1 : Math.floor(Math.random() * COL_COUNT);
      const cells = [];
      
      // 获取确保有重复颜色的马卡龙色
      const rowColor = isEmpty ? '' : getMacaronColor();

      for (let c = 0; c < COL_COUNT; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        if (c === blackIndex) {
          cellEl.classList.add('black');
          cellEl.style.backgroundColor = rowColor;
        }

        cellEl.addEventListener('mousedown', (e) => handleTap(rowEl, c, cellEl, e));
        cellEl.addEventListener('touchstart', (e) => {
          e.preventDefault(); 
          handleTap(rowEl, c, cellEl, e.touches[0]);
        });

        rowEl.appendChild(cellEl);
        cells.push({ el: cellEl, isBlack: c === blackIndex, clicked: false, color: rowColor });
      }

      if (board.firstChild) {
        board.insertBefore(rowEl, board.firstChild);
      } else {
        board.appendChild(rowEl);
      }

      state.rows.unshift({ el: rowEl, cells, blackIndex });
      
      if (!isEmpty) {
        playCuteSpawnSound();
      }
    }

    function removeLastRow() {
      const lastRow = state.rows.pop();
      if (lastRow) {
        lastRow.el.remove();
      }
    }

    // 计算分数量级倍率
    function getMultiplier(combo) {
      if (combo >= 20) return 16;
      if (combo >= 15) return 8;
      if (combo >= 10) return 4;
      if (combo >= 5) return 2;
      return 1;
    }

    function handleTap(rowEl, colIndex, cellEl, event) {
      if (!state.isPlaying) return;

      const rowIndex = state.rows.findIndex(r => r.el === rowEl);
      
      // 找到当前应该点击的最底部的含彩色块的行
      let targetRowIndex = -1;
      for (let i = state.rows.length - 1; i >= 0; i--) {
        const r = state.rows[i];
        if (r.blackIndex !== -1 && !r.cells[r.blackIndex].clicked) {
          targetRowIndex = i;
          break;
        }
      }

      // 如果没有可点击的黑块
      if (targetRowIndex === -1) return;

      const currentRow = state.rows[rowIndex];
      const targetCell = currentRow.cells[colIndex];

      if (targetCell.isBlack && !targetCell.clicked) {
        // 只能按顺序消除最下面的块
        if (rowIndex !== targetRowIndex) {
          // 点击了非最下方的彩色块，不做惩罚也不响应
          return;
        }

        targetCell.clicked = true;
        cellEl.classList.add('clicked');
        
        // 连击处理
        const blockColor = targetCell.color;
        if (state.lastTapColor === null || state.lastTapColor === blockColor) {
          state.combo++;
        } else {
          state.combo = 1; // 颜色换了，重新开始连击
        }
        state.lastTapColor = blockColor;

        const mult = getMultiplier(state.combo);
        state.score += mult;
        scoreVal.textContent = state.score;
        
        // 更新 Combo UI
        comboVal.textContent = state.combo;
        multiplierVal.textContent = \`x\${mult}\`;
        if (state.combo >= 2) {
          comboBox.classList.add('show');
        } else {
          comboBox.classList.remove('show');
        }

        // Combo 达到 10 以上触发 Fever 模式特效
        if (state.combo >= 10) {
          state.isFever = true;
          feverBanner.classList.add('active');
          gameContainer.classList.add('fever-mode');
        } else {
          state.isFever = false;
          feverBanner.classList.remove('active');
          gameContainer.classList.remove('fever-mode');
        }

        // 播消除音效与粒子
        playTapSound(state.combo);
        createParticles(cellEl, event, blockColor);

      } else if (!targetCell.isBlack) {
        // 点击了白色区域
        cellEl.classList.add('error');
        gameOver();
      }
    }

    function createParticles(cellEl, event, color) {
      const rect = cellEl.getBoundingClientRect();
      const clickX = (event.clientX || (event.touches && event.touches[0].clientX)) - rect.left;
      const clickY = (event.clientY || (event.touches && event.touches[0].clientY)) - rect.top;

      for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.left = \`\${clickX}px\`;
        p.style.top = \`\${clickY}px\`;

        const size = Math.random() * 8 + 6;
        p.style.width = \`\${size}px\`;
        p.style.height = \`\${size}px\`;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 70 + 40;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        p.style.setProperty('--dx', \`\${dx}px\`);
        p.style.setProperty('--dy', \`\${dy}px\`);

        cellEl.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }

    // 游戏循环逻辑：下落
    function gameLoop(time) {
      if (!state.isPlaying) return;
      if (!state.lastTime) state.lastTime = time;
      
      const dt = (time - state.lastTime) / 1000;
      state.lastTime = time;

      // 速度随分数增加逐渐加快
      state.speed = 120 + state.score * 5;
      if (state.isFever) state.speed += 40; // Fever 额外加成

      state.offsetY += state.speed * dt;

      if (state.offsetY >= ROW_HEIGHT) {
        // 检查最后一排（最底下一排）是否包含未消除的彩色块
        const lastRow = state.rows[state.rows.length - 1];
        if (lastRow && lastRow.blackIndex !== -1 && !lastRow.cells[lastRow.blackIndex].clicked) {
          // 彩色块触底，游戏结束
          lastRow.cells[lastRow.blackIndex].el.classList.add('error');
          gameOver();
          return;
        }

        // 滚完一行，重置偏移，并生成新行
        state.offsetY -= ROW_HEIGHT;
        removeLastRow();
        addRow();
      }

      board.style.transform = \`translateY(\${state.offsetY}px)\`;
      state.animationFrameId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
      state.isPlaying = false;
      cancelAnimationFrame(state.animationFrameId);
      playFailSound();

      const savedBest = localStorage.getItem('best_score_taptile') || 0;
      const currentBest = Math.max(savedBest, state.score);
      localStorage.setItem('best_score_taptile', currentBest);

      setTimeout(() => {
        finalScore.textContent = state.score;
        bestScore.textContent = currentBest;
        
        // 弹出输入名字对话框
        newRecordScore.textContent = state.score;
        playerNameInput.value = '';
        nameInputScreen.classList.remove('hidden');
      }, 600);
    }

    // --- 排行榜及名字生成器模块 ---
    const ADJS = ["小", "大", "萌", "软", "甜", "酷", "粉", "蓝", "糖", "乖", "呆", "淘", "胖", "吉", "祥", "乖乖", "萌萌", "皮皮", "乐乐", "闪闪"];
    const NOUNS = ["兔", "猫", "狗", "熊", "雀", "鸭", "鹿", "羊", "猴", "虎", "鱼", "鸟", "狐", "狸", "猪", "马", "牛", "象", "狮", "豹"];
    
    function generateRandomName() {
      const adj = ADJS[Math.floor(Math.random() * ADJS.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(Math.random() * 100);
      return \`\${adj}\${noun}\${num}\`;
    }

    function getLeaderboard() {
      try {
        return JSON.parse(localStorage.getItem('taptile_leaderboard')) || [];
      } catch (e) {
        return [];
      }
    }

    function saveLeaderboard(name, score) {
      let list = getLeaderboard();
      list.push({ name: name || "无名小英雄", score, date: new Date().toLocaleDateString() });
      list.sort((a, b) => b.score - a.score);
      list = list.slice(0, 10); // 只保留前十
      localStorage.setItem('taptile_leaderboard', JSON.stringify(list));
    }

    function showLeaderboardView() {
      const list = getLeaderboard();
      leaderboardList.innerHTML = '';
      if (list.length === 0) {
        leaderboardList.innerHTML = '<div style="color: #8c7a7e; padding: 20px;">暂无记录，快去创造新纪录吧！</div>';
      } else {
        list.forEach((item, index) => {
          const row = document.createElement('div');
          row.className = \`leaderboard-item top-\${index < 3 ? index : 'other'}\`;
          row.innerHTML = \`
            <span class="rank-num">\${index + 1}</span>
            <span class="player-name">\${item.name}</span>
            <span class="player-score">\${item.score} 分</span>
          \`;
          leaderboardList.appendChild(row);
        });
      }
      leaderboardScreen.classList.remove('hidden');
    }

    // --- 事件监听 ---

    startBtn.addEventListener('click', () => {
      initAudio();
      startScreen.classList.add('hidden');
      initGame();
      state.isPlaying = true;
      state.lastTime = performance.now();
      state.animationFrameId = requestAnimationFrame(gameLoop);
    });

    viewLeaderboardBtn.addEventListener('click', () => {
      initAudio();
      showLeaderboardView();
    });

    backToStartBtn.addEventListener('click', () => {
      leaderboardScreen.classList.add('hidden');
    });

    // 随机名字按钮
    nameRandomBtn.addEventListener('click', () => {
      playerNameInput.value = generateRandomName();
    });

    // 保存名字
    nameSubmitBtn.addEventListener('click', () => {
      const name = playerNameInput.value.trim() || generateRandomName();
      saveLeaderboard(name, state.score);
      nameInputScreen.classList.add('hidden');
      overScreen.classList.add('hidden');
      showLeaderboardView();
    });

    // 取消进入排行榜
    nameCancelBtn.addEventListener('click', () => {
      nameInputScreen.classList.add('hidden');
      overScreen.classList.remove('hidden');
    });

    restartBtn.addEventListener('click', () => {
      initAudio();
      overScreen.classList.add('hidden');
      initGame();
      state.isPlaying = true;
      state.lastTime = performance.now();
      state.animationFrameId = requestAnimationFrame(gameLoop);
    });

    overViewLeaderboardBtn.addEventListener('click', () => {
      overScreen.classList.add('hidden');
      showLeaderboardView();
    });
  </script>
</body>
</html>
`;
