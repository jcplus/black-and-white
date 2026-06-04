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
      padding: 12px 24px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(255, 143, 163, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    #score-box {
      font-size: 22px;
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
      font-size: 18px;
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
      transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
      background: rgba(255, 248, 249, 0.96);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 100;
      padding: 40px 30px;
      text-align: center;
      transition: opacity 0.3s ease;
    }

    .screen.hidden {
      opacity: 0;
      pointer-events: none;
    }

    h1 {
      font-size: 38px;
      color: #ff6b8b;
      margin-bottom: 16px;
      font-weight: 700;
      text-shadow: 0 4px 10px rgba(255, 107, 139, 0.15);
    }

    p {
      font-size: 16px;
      color: #8c7a7e;
      margin-bottom: 36px;
      line-height: 1.8;
    }

    .btn {
      background: linear-gradient(135deg, #ff8fa3 0%, #ffb3c1 100%);
      color: white;
      border: none;
      padding: 16px 48px;
      font-size: 20px;
      font-weight: 600;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(255, 143, 163, 0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      font-family: var(--font-family);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(255, 143, 163, 0.45);
    }

    .btn:active {
      transform: translateY(1px) scale(0.97);
      box-shadow: 0 6px 15px rgba(255, 143, 163, 0.45);
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
      top: 100px;
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
        得分: <span id="score-val">0</span>
      </div>
      <div id="combo-box" class="hud-card">
        Combo <span id="combo-val">0</span>
      </div>
    </div>

    <!-- Fever 提示 -->
    <div id="fever-banner">FEVER ✨</div>

    <!-- 游戏棋盘区域 -->
    <div id="board-wrapper">
      <div id="board"></div>
    </div>

    <!-- 开始画面 -->
    <div id="start-screen" class="screen">
      <h1>🌸 萌动黑白块 🌸</h1>
      <p style="font-size: 15px;">
        只点击彩色的马卡龙方块，不要点白色的区域。<br>
        点击正确后，方块才会下移。<br>
        连续快速击中会触发 <strong>Fever 狂暴模式</strong>！
      </p>
      <button id="start-btn" class="btn">开始游戏</button>
    </div>

    <!-- 结束画面 -->
    <div id="over-screen" class="screen hidden">
      <h1>游戏结束 🌟</h1>
      <p>
        本次得分: <span id="final-score" style="font-size: 32px; font-weight: 700; color: #ff6b8b; display: block; margin: 10px 0;">0</span>
        最高纪录: <span id="best-score" style="font-weight: 600;">0</span>
      </p>
      <button id="restart-btn" class="btn">再来一局</button>
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

    // 播放敲击音效 (大调音阶)
    function playTapSound(score, isFever) {
      const baseFreq = isFever ? 329.63 : 261.63; // Fever 模式使用 E4，普通模式使用 C4
      const scale = [0, 2, 4, 5, 7, 9, 11, 12]; // 大调音阶
      const noteIndex = score % scale.length;
      const octave = Math.floor(score / scale.length);
      const freq = baseFreq * Math.pow(2, (scale[noteIndex] + octave * 12) / 12);
      
      playTone(freq, isFever ? 0.18 : 0.15, 'triangle', isFever ? 0.2 : 0.15);
      
      // Fever 模式下追加微弱琶音
      if (isFever && score % 3 === 0) {
        setTimeout(() => playTone(freq * 1.5, 0.1, 'sine', 0.08), 50);
      }
    }

    // 播放失败音效
    function playFailSound() {
      playTone(150, 0.12, 'sawtooth', 0.2);
      setTimeout(() => playTone(110, 0.25, 'sawtooth', 0.2), 120);
    }

    // --- 游戏配置 ---
    const ROW_COUNT = 5; 
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
    const startScreen = document.getElementById('start-screen');
    const overScreen = document.getElementById('over-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const finalScore = document.getElementById('final-score');
    const bestScore = document.getElementById('best-score');
    const feverBanner = document.getElementById('fever-banner');
    const gameContainer = document.getElementById('game-container');

    let state = {
      score: 0,
      combo: 0,
      rows: [], 
      isPlaying: false,
      lastTapTime: 0,
      isFever: false,
    };

    function initGame() {
      state.score = 0;
      state.combo = 0;
      state.rows = [];
      state.lastTapTime = Date.now();
      state.isFever = false;
      board.innerHTML = '';
      board.style.transform = 'translateY(0px)';
      scoreVal.textContent = '0';
      comboBox.classList.remove('show');
      feverBanner.classList.remove('active');
      gameContainer.classList.remove('fever-mode');
      
      // 生成初始行，第一行（最底下）为空
      for (let i = 0; i < ROW_COUNT; i++) {
        addRow(i === 0);
      }
    }

    function addRow(isEmpty = false) {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';
      
      const blackIndex = isEmpty ? -1 : Math.floor(Math.random() * COL_COUNT);
      const cells = [];
      const randomColor = MACARON_COLORS[Math.floor(Math.random() * MACARON_COLORS.length)];

      for (let c = 0; c < COL_COUNT; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        if (c === blackIndex) {
          cellEl.classList.add('black');
          cellEl.style.backgroundColor = randomColor;
        }

        cellEl.addEventListener('mousedown', (e) => handleTap(rowEl, c, cellEl, e));
        cellEl.addEventListener('touchstart', (e) => {
          e.preventDefault(); 
          handleTap(rowEl, c, cellEl, e.touches[0]);
        });

        rowEl.appendChild(cellEl);
        cells.push({ el: cellEl, isBlack: c === blackIndex, clicked: false, color: randomColor });
      }

      if (board.firstChild) {
        board.insertBefore(rowEl, board.firstChild);
      } else {
        board.appendChild(rowEl);
      }

      state.rows.unshift({ el: rowEl, cells, blackIndex });
    }

    function removeLastRow() {
      const lastRow = state.rows.pop();
      if (lastRow) {
        lastRow.el.remove();
      }
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

      if (rowIndex !== targetRowIndex) {
        return; // 点击了非最下方的行，不做惩罚以提升流畅度，但也无法点击
      }

      const currentRow = state.rows[rowIndex];
      const targetCell = currentRow.cells[colIndex];

      if (targetCell.isBlack && !targetCell.clicked) {
        targetCell.clicked = true;
        cellEl.classList.add('clicked');
        
        const now = Date.now();
        const interval = now - state.lastTapTime;
        state.lastTapTime = now;

        // 根据速度动态调整动画，越快越平滑
        const duration = Math.max(40, Math.min(180, interval));
        board.style.transition = \`transform \${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)\`;

        state.score++;
        scoreVal.textContent = state.score;
        
        // 缩放得分HUD卡片动效
        const scoreBox = document.getElementById('score-val');
        scoreBox.style.transform = 'scale(1.2)';
        setTimeout(() => scoreBox.style.transform = 'scale(1)', 100);
        
        if (interval < 350) { 
          state.combo++;
          comboVal.textContent = state.combo;
          comboBox.classList.add('show');
          
          // Combo达到10触发Fever
          if (state.combo >= 10 && !state.isFever) {
            state.isFever = true;
            feverBanner.classList.add('active');
            gameContainer.classList.add('fever-mode');
            playTone(523.25, 0.3, 'sine', 0.15); // fever 开启提示音
          }
        } else {
          state.combo = 0;
          state.isFever = false;
          comboBox.classList.remove('show');
          feverBanner.classList.remove('active');
          gameContainer.classList.remove('fever-mode');
        }

        playTapSound(state.score, state.isFever);
        createParticles(cellEl, event, targetCell.color);

        board.style.transform = \`translateY(\${ROW_HEIGHT}px)\`;

        setTimeout(() => {
          board.style.transition = 'none';
          board.style.transform = 'translateY(0px)';
          removeLastRow();
          addRow();
        }, duration);

      } else if (!targetCell.isBlack) {
        cellEl.classList.add('error');
        gameOver();
      }
    }

    function createParticles(cellEl, event, color) {
      const rect = cellEl.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

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

    function gameOver() {
      state.isPlaying = false;
      playFailSound();

      const savedBest = localStorage.getItem('best_score_taptile') || 0;
      const currentBest = Math.max(savedBest, state.score);
      localStorage.setItem('best_score_taptile', currentBest);

      setTimeout(() => {
        finalScore.textContent = state.score;
        bestScore.textContent = currentBest;
        overScreen.classList.remove('hidden');
      }, 500);
    }

    startBtn.addEventListener('click', () => {
      initAudio();
      startScreen.classList.add('hidden');
      initGame();
      state.isPlaying = true;
    });

    restartBtn.addEventListener('click', () => {
      initAudio();
      overScreen.classList.add('hidden');
      initGame();
      state.isPlaying = true;
    });
  </script>
</body>
</html>
`;
