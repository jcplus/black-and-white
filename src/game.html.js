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
      height: 100%;
      top: 0;
      left: 0;
      display: grid;
      grid-template-rows: repeat(5, 1fr);
      grid-template-columns: repeat(4, 1fr);
    }

    .cell {
      position: relative;
      cursor: pointer;
      background-color: transparent;
      transition: background-color 0.1s ease;
      border-right: 1px dashed rgba(255, 143, 163, 0.1);
      border-bottom: 1px dashed rgba(255, 143, 163, 0.1);
    }

    .cell:nth-child(4n) {
      border-right: none;
    }

    .cell:nth-child(n+17) {
      border-bottom: none;
    }

    /* 黑块样式 (萌化彩色马卡龙块) */
    .cell.black::before {
      content: '';
      position: absolute;
      top: 6px;
      left: 6px;
      right: 6px;
      bottom: 6px;
      background-color: var(--tile-color);
      border-radius: 20px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
      border: 3px solid #ffffff;
      transform: scale(1);
      transition: transform 0.1s ease, box-shadow 0.1s ease;
      z-index: 1;
    }

    .cell.black:active::before {
      transform: scale(0.95);
    }

    .cell.clicked::before {
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

    /* GitHub version footer */
    .github-footer {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #bfaab0;
      text-decoration: none;
      transition: color 0.2s ease, transform 0.2s ease;
      cursor: pointer;
      z-index: 10;
    }

    .github-footer:hover {
      color: #ff6b8b;
      transform: translateX(-50%) scale(1.05);
    }

    .github-icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
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
        1. 仅点击画面中随机出现的<strong>彩色马卡龙方块</strong>！<br>
        2. 画面被方块<strong>填满</strong> (20个) 或者<strong>点击到空白位置</strong>，游戏即结束。<br>
        3. 连续消除<strong>同一种颜色</strong>可以积累 Combo！<br>
        4. 点到不同颜色将重置 Combo。Combo 越高，积分翻倍越多 (最高 x16)！
      </p>
      <button id="start-btn" class="btn">开始游戏</button>
      <button id="view-leaderboard-btn" class="btn btn-secondary" style="margin-bottom: 40px;">查看排行榜</button>
      
      <a href="https://github.com/jcplus/black-and-white" target="_blank" rel="noopener noreferrer" class="github-footer">
        <svg class="github-icon" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
        <span>v1.2.10</span>
      </a>
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
      cells: [], // 1D array of 20 elements representing the 5x4 grid
      isPlaying: false,
      isFever: false,
      spawnTimer: 0,
      lastTapColor: null,
      animationFrameId: null,
      lastTime: 0
    };

    function initGame() {
      state.score = 0;
      state.combo = 0;
      state.cells = [];
      state.spawnTimer = 0;
      state.lastTapColor = null;
      state.isFever = false;
      board.innerHTML = '';
      scoreVal.textContent = '0';
      comboVal.textContent = '0';
      multiplierVal.textContent = 'x1';
      comboBox.classList.remove('show');
      feverBanner.classList.remove('active');
      gameContainer.classList.remove('fever-mode');
      
      // Initialize the grid of 20 cells
      for (let i = 0; i < 20; i++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        cellEl.dataset.index = i;
        
        cellEl.addEventListener('mousedown', (e) => handleTap(i, cellEl, e));
        cellEl.addEventListener('touchstart', (e) => {
          e.preventDefault(); 
          handleTap(i, cellEl, e.touches[0]);
        });
        
        board.appendChild(cellEl);
        state.cells.push({
          el: cellEl,
          hasBlock: false,
          color: '',
          spawnId: 0
        });
      }

      // Spawn initial blocks to give the player something to start with
      for (let i = 0; i < 2; i++) {
        spawnBlock();
      }
    }

    // 获取颜色，保证屏幕上至少有两个相同颜色
    function getMacaronColor() {
      const activeColors = state.cells
        .filter(c => c.hasBlock)
        .map(c => c.color);

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

    function spawnBlock() {
      // Find empty cells
      const emptyCells = state.cells.filter(c => !c.hasBlock);
      if (emptyCells.length === 0) {
        // No space to spawn, screen is completely filled
        gameOver();
        return;
      }

      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const blockColor = getMacaronColor();
      
      randomCell.hasBlock = true;
      randomCell.color = blockColor;
      randomCell.spawnId = Date.now() + Math.random(); // unique id
      
      randomCell.el.style.setProperty('--tile-color', blockColor);
      randomCell.el.classList.remove('clicked');
      randomCell.el.classList.add('black');
      
      playCuteSpawnSound();

      // Check if board is now completely filled
      const occupiedCount = state.cells.filter(c => c.hasBlock).length;
      if (occupiedCount >= 20) {
        gameOver();
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

    function handleTap(index, cellEl, event) {
      if (!state.isPlaying) return;

      const targetCell = state.cells[index];

      if (targetCell.hasBlock) {
        const blockColor = targetCell.color;
        targetCell.hasBlock = false;
        
        cellEl.classList.add('clicked');
        
        // Remove active class and variables after animation finishes, but only if a new block hasn't spawned since
        const sid = targetCell.spawnId;
        setTimeout(() => {
          if (!targetCell.hasBlock && targetCell.spawnId === sid) {
            cellEl.classList.remove('black', 'clicked');
            cellEl.style.removeProperty('--tile-color');
          }
        }, 250);

        // 连击处理
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

      } else {
        // 点击了没有方块的区域
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

    // 游戏循环逻辑：随机生成方块
    function gameLoop(time) {
      if (!state.isPlaying) return;
      if (!state.lastTime) state.lastTime = time;
      
      const dt = (time - state.lastTime) / 1000;
      state.lastTime = time;

      // 生成时间随分数增加逐渐缩短
      const currentInterval = Math.max(0.3, 0.9 - state.score * 0.008 - (state.isFever ? 0.15 : 0));

      state.spawnTimer += dt;
      if (state.spawnTimer >= currentInterval) {
        state.spawnTimer -= currentInterval;
        spawnBlock();
      }

      state.animationFrameId = requestAnimationFrame(gameLoop);
    }

    async function gameOver() {
      state.isPlaying = false;
      cancelAnimationFrame(state.animationFrameId);
      playFailSound();

      const savedBest = localStorage.getItem('best_score_taptile') || 0;
      const currentBest = Math.max(savedBest, state.score);
      localStorage.setItem('best_score_taptile', currentBest);

      finalScore.textContent = state.score;
      bestScore.textContent = currentBest;

      // 检查当前分数是否有资格进入全球排行榜
      if (state.score > 0) {
        try {
          const list = await getLeaderboard();
          const isQualifying = list.length < 10 || state.score > list[list.length - 1].score;
          
          if (isQualifying) {
            setTimeout(() => {
              newRecordScore.textContent = state.score;
              playerNameInput.value = '';
              nameInputScreen.classList.remove('hidden');
            }, 600);
            return;
          }
        } catch (e) {
          console.error("Failed to check leaderboard qualifications:", e);
        }
      }

      // 如果未进入排行榜或没有分数，直接显示结束界面
      setTimeout(() => {
        overScreen.classList.remove('hidden');
      }, 600);
    }

    // --- 排行榜及名字生成器模块 ---
    const ADJS = ["小", "大", "萌", "软", "甜", "酷", "粉", "蓝", "糖", "乖", "呆", "淘", "胖", "吉", "祥", "乖乖", "萌萌", "皮皮", "乐乐", "闪闪"];
    const NOUNS = ["兔", "猫", "狗", "熊", "雀", "鸭", "鹿", "羊", "猴", "虎", "鱼", "鸟", "狐", "狸", "猪", "马", "牛", "象", "狮", "豹"];
    
    function generateRandomName() {
      const adj = ADJS[Math.floor(Math.random() * ADJS.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(Math.random() * 100);
      return adj + noun + num;
    }

    // 从全局 API 获取排行榜，若不可用则降级读取本地 localStorage
    async function getLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const list = await response.json();
          // 同步存一份到本地缓存作为降级备份
          localStorage.setItem('taptile_leaderboard_backup', JSON.stringify(list));
          return list;
        } else {
          throw new Error("API not ok");
        }
      } catch (e) {
        console.warn("Could not fetch global leaderboard, falling back to local storage:", e);
        try {
          return JSON.parse(localStorage.getItem('taptile_leaderboard_backup')) || [];
        } catch (localErr) {
          return [];
        }
      }
    }

    async function showLeaderboardView() {
      leaderboardList.innerHTML = '<div style="color: #8c7a7e; padding: 20px;">正在加载全球排行榜...</div>';
      leaderboardScreen.classList.remove('hidden');
      
      const list = await getLeaderboard();
      leaderboardList.innerHTML = '';
      
      if (list.length === 0) {
        leaderboardList.innerHTML = '<div style="color: #8c7a7e; padding: 20px;">暂无记录，快去创造新纪录吧！</div>';
      } else {
        list.forEach((item, index) => {
          const row = document.createElement('div');
          row.className = 'leaderboard-item top-' + (index < 3 ? index : 'other');
          row.innerHTML = '\
            <span class="rank-num">' + (index + 1) + '</span>\
            <span class="player-name">' + item.name + '</span>\
            <span class="player-score">' + item.score + ' 分</span>\
          ';
          leaderboardList.appendChild(row);
        });
      }
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
      startScreen.classList.remove('hidden');
      overScreen.classList.add('hidden');
    });

    // 随机名字按钮
    nameRandomBtn.addEventListener('click', () => {
      playerNameInput.value = generateRandomName();
    });

    // 保存名字到全球排行榜
    nameSubmitBtn.addEventListener('click', async () => {
      const name = playerNameInput.value.trim() || generateRandomName();
      nameSubmitBtn.disabled = true;
      nameSubmitBtn.textContent = "保存中...";

      try {
        const response = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({ name, score: state.score })
        });

        const result = await response.json();

        if (response.ok) {
          nameInputScreen.classList.add('hidden');
          overScreen.classList.add('hidden');
          await showLeaderboardView();
        } else if (response.status === 429) {
          // IP 限流
          alert(result.message || "您今天已提交 10 次记录，请明天再试哦！");
          nameInputScreen.classList.add('hidden');
          overScreen.classList.remove('hidden');
        } else if (response.status === 503) {
          // KV 额度耗尽或不可用
          alert("全球排行榜服务暂时不可用（可能已达到每日免费限额），正在保存至本地！");
          saveLocalLeaderboardFallback(name, state.score);
          nameInputScreen.classList.add('hidden');
          overScreen.classList.add('hidden');
          await showLeaderboardView();
        } else {
          alert(result.message || "保存失败，请稍后重试");
          nameInputScreen.classList.add('hidden');
          overScreen.classList.remove('hidden');
        }
      } catch (e) {
        console.error("Error submitting score:", e);
        alert("网络错误，提交失败，已保存至本地！");
        saveLocalLeaderboardFallback(name, state.score);
        nameInputScreen.classList.add('hidden');
        overScreen.classList.add('hidden');
        await showLeaderboardView();
      } finally {
        nameSubmitBtn.disabled = false;
        nameSubmitBtn.textContent = "保存";
      }
    });

    // 本地排行榜降级保存
    function saveLocalLeaderboardFallback(name, score) {
      try {
        let list = JSON.parse(localStorage.getItem('taptile_leaderboard_backup')) || [];
        list.push({ name, score, date: new Date().toLocaleDateString() });
        list.sort((a, b) => b.score - a.score);
        list = list.slice(0, 10);
        localStorage.setItem('taptile_leaderboard_backup', JSON.stringify(list));
      } catch (e) {
        console.error("Local save fallback failed:", e);
      }
    }

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
