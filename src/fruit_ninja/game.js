// Authentic Fruit Ninja Arcade Experience - 100% Offline Vision Game
// Hand Tracking + Mouse Fallback, Authentic UI, Watermelon Start Screen, 5 Strikes, Katana Trail

class FruitNinjaGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.video = document.getElementById('webcam-video');
    this.camDot = document.getElementById('cam-dot');
    this.camStatus = document.getElementById('cam-status');

    // Game States: 'MENU', 'PLAYING', 'GAME_OVER', 'PAUSED'
    this.gameState = 'MENU';

    // Scores & Records
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('fn_best_score') || '0', 10);
    this.strikes = 0; // Current strike count
    this.maxStrikes = 5; // 5 lives for classic modes, 10 lives for Emotional Damage
    this.wasHandDetected = false;

    // Pre-warm audio synthesizer so first swipe has 0ms latency
    if (typeof SoundFX !== 'undefined') {
      try { SoundFX.init(); } catch (e) {}
    }

    // Entities
    this.fruits = [];
    this.slicedHalves = [];
    this.particles = [];
    this.sparks = [];
    this.splatDecals = [];
    this.floatingTexts = [];
    this.bladeTrail = []; // [{x, y, time}]

    // Menu Interactive Watermelon & Mode Selection
    this.menuRingAngle = 0;
    this.menuWatermelonAngle = 0;
    this.menuWatermelon = { x: 0, y: 0, radius: 70 };
    this.currentDifficulty = 'medium'; // 'easy', 'medium', 'hard'

    this.modeFruits = [
      {
        id: 'easy',
        name: 'EASY',
        nameEn: 'EASY',
        badge: 'CASUAL • NO BOMBS',
        fruitType: 'apple',
        imgKey: 'apple',
        color: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.85)',
        splashKey: 'splashRed',
        x: 0,
        y: 0,
        radius: 52,
        size: 95
      },
      {
        id: 'medium',
        name: 'MEDIUM',
        nameEn: 'MEDIUM',
        badge: 'CLASSIC • FEW BOMBS',
        fruitType: 'orange',
        imgKey: 'orange',
        color: '#f97316',
        glowColor: 'rgba(249, 115, 22, 0.85)',
        splashKey: 'splashOrange',
        x: 0,
        y: 0,
        radius: 52,
        size: 95
      },
      {
        id: 'hard',
        name: 'HARD',
        nameEn: 'HARD',
        badge: 'FAST • WITH BOMBS',
        fruitType: 'banana',
        imgKey: 'banana',
        color: '#eab308',
        glowColor: 'rgba(234, 179, 8, 0.85)',
        splashKey: 'splashYellow',
        x: 0,
        y: 0,
        radius: 52,
        size: 95
      },
      {
        id: 'emotional_damage',
        name: 'EMOTIONAL DAMAGE',
        nameEn: 'EMOTIONAL DAMAGE',
        badge: 'TOTAL CHAOS • 10 LIVES!',
        fruitType: 'watermelon',
        imgKey: 'sandia',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.95)',
        splashKey: 'splashRed',
        x: 0,
        y: 0,
        radius: 56,
        size: 102
      }
    ];

    // 4 Slicing Mode Choices on Game Over Screen
    this.gameOverFruits = [
      {
        id: 'easy',
        name: 'EASY',
        badge: 'CASUAL • NO BOMBS',
        fruitType: 'apple',
        imgKey: 'apple',
        color: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.85)',
        splashKey: 'splashRed',
        x: 0,
        y: 0,
        radius: 46,
        size: 82
      },
      {
        id: 'medium',
        name: 'MEDIUM',
        badge: 'CLASSIC • FEW BOMBS',
        fruitType: 'orange',
        imgKey: 'orange',
        color: '#f97316',
        glowColor: 'rgba(249, 115, 22, 0.85)',
        splashKey: 'splashOrange',
        x: 0,
        y: 0,
        radius: 46,
        size: 82
      },
      {
        id: 'hard',
        name: 'HARD',
        badge: 'FAST • WITH BOMBS',
        fruitType: 'banana',
        imgKey: 'banana',
        color: '#eab308',
        glowColor: 'rgba(234, 179, 8, 0.85)',
        splashKey: 'splashYellow',
        x: 0,
        y: 0,
        radius: 46,
        size: 82
      },
      {
        id: 'emotional_damage',
        name: 'EMOTIONAL DAMAGE',
        badge: 'TOTAL CHAOS • 10 LIVES!',
        fruitType: 'watermelon',
        imgKey: 'sandia',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.95)',
        splashKey: 'splashRed',
        x: 0,
        y: 0,
        radius: 50,
        size: 90
      }
    ];

    // Slicing & Combo Tracker
    this.handPos = { x: -100, y: -100 };
    this.isHandActive = false;
    this.lastSliceTime = 0;
    this.currentStrokeSlices = []; // fruits sliced in the active stroke
    this.screenShake = 0;
    this.whiteFlashAlpha = 0;

    // Spawning & Timers
    this.lastFrameTime = performance.now();
    this.fruitSpawnTimer = 0;
    this.nextSpawnInterval = 1400;

    // Screen Transition & Slicing Grace Period Cooldowns
    this.modeSelectEnterTime = 0;
    this.modeSelectCooldown = 700;
    this.gameOverEnterTime = 0;
    this.gameOverCooldown = 750;

    // Pause button coordinates
    this.pauseBtn = { x: 36, y: 0, width: 48, height: 48 };

    window.fruitGame = this;

    this.initAssets();
    this.initCanvas();
    this.initEvents();
    this.initVision();
    this.loop();
  }

  initAssets() {
    this.images = {};
    const imgList = {
      bgWood: 'assets/images/background.jpg',
      bgStart: 'assets/images/start_bg_2.jpg',
      bgSelectMode: 'assets/images/select_mode_page_2.png',
      bgDojo: 'assets/images/dojo_bg.png',
      logo: 'assets/images/logo.png',
      newGameRing: 'assets/images/new-game.png',
      gameOver: 'assets/images/game-over.png',
      // Strikes
      x: 'assets/images/x.png',
      xf: 'assets/images/xf.png',
      xx: 'assets/images/xx.png',
      xxf: 'assets/images/xxf.png',
      xxx: 'assets/images/xxx.png',
      xxxf: 'assets/images/xxxf.png',
      // Splats
      splashRed: 'assets/images/splash_red.png',
      splashOrange: 'assets/images/splash_orange.png',
      splashYellow: 'assets/images/splash_yellow.png',
      // Fruits
      sandia: 'assets/images/fruit/sandia.png',
      sandia_1: 'assets/images/fruit/sandia-1.png',
      sandia_2: 'assets/images/fruit/sandia-2.png',
      watermelon: 'assets/images/fruit/sandia.png',
      watermelon_1: 'assets/images/fruit/sandia-1.png',
      watermelon_2: 'assets/images/fruit/sandia-2.png',
      apple: 'assets/images/fruit/apple.png',
      apple_1: 'assets/images/fruit/apple-1.png',
      apple_2: 'assets/images/fruit/apple-2.png',
      banana: 'assets/images/fruit/banana.png',
      banana_1: 'assets/images/fruit/banana-1.png',
      banana_2: 'assets/images/fruit/banana-2.png',
      orange: 'assets/images/fruit/orange.png',
      orange_1: 'assets/images/fruit/orange-1.png',
      orange_2: 'assets/images/fruit/orange-2.png',
      pineapple: 'assets/images/fruit/pineapple.png',
      pineapple_1: 'assets/images/fruit/pineapple-1.png',
      pineapple_2: 'assets/images/fruit/pineapple-2.png',
      peach: 'assets/images/fruit/peach.png',
      peach_1: 'assets/images/fruit/peach-1.png',
      peach_2: 'assets/images/fruit/peach-2.png',
      coconut: 'assets/images/fruit/basaha.png',
      coconut_1: 'assets/images/fruit/basaha-1.png',
      coconut_2: 'assets/images/fruit/basaha-2.png',
      bomb: 'assets/images/fruit/boom.png'
    };

    for (const [key, src] of Object.entries(imgList)) {
      const img = new Image();
      img.src = src;
      this.images[key] = img;
    }

    // Audio Clips
    this.sounds = {};
    const sndList = {
      start: 'assets/sounds/start.mp3',
      throw: 'assets/sounds/throw.mp3',
      splatter: 'assets/sounds/splatter.mp3',
      boom: 'assets/sounds/boom.mp3',
      over: 'assets/sounds/over.mp3',
      menu: 'assets/sounds/menu.mp3'
    };

    for (const [key, src] of Object.entries(sndList)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      this.sounds[key] = audio;
    }
  }

  playSound(key) {
    try {
      const s = this.sounds[key];
      if (s) {
        s.currentTime = 0;
        s.play().catch(() => {});
      }
    } catch (e) {
      if (typeof SoundFX !== 'undefined') {
        if (key === 'splatter') SoundFX.playSplat();
        else if (key === 'boom') SoundFX.playBoom();
        else SoundFX.playSwish();
      }
    }
  }

  initCanvas() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.menuWatermelon.x = this.canvas.width * 0.545;
      this.menuWatermelon.y = this.canvas.height * 0.54;
      this.pauseBtn.y = this.canvas.height - 68;

      if (this.modeFruits) {
        const W = this.canvas.width;
        const H = this.canvas.height;
        if (this.modeFruits.length >= 4) {
          this.modeFruits[0].x = W * 0.20;
          this.modeFruits[0].y = H * 0.55;
          this.modeFruits[1].x = W * 0.40;
          this.modeFruits[1].y = H * 0.55;
          this.modeFruits[2].x = W * 0.60;
          this.modeFruits[2].y = H * 0.55;
          this.modeFruits[3].x = W * 0.80;
          this.modeFruits[3].y = H * 0.55;
        } else {
          this.modeFruits[0].x = W * 0.30;
          this.modeFruits[0].y = H * 0.55;
          this.modeFruits[1].x = W * 0.50;
          this.modeFruits[1].y = H * 0.55;
          this.modeFruits[2].x = W * 0.70;
          this.modeFruits[2].y = H * 0.55;
        }
      }

      if (this.gameOverFruits && this.gameOverFruits.length >= 4) {
        const W = this.canvas.width;
        const H = this.canvas.height;
        this.gameOverFruits[0].x = W * 0.18;
        this.gameOverFruits[0].y = H * 0.65;
        this.gameOverFruits[1].x = W * 0.39;
        this.gameOverFruits[1].y = H * 0.65;
        this.gameOverFruits[2].x = W * 0.61;
        this.gameOverFruits[2].y = H * 0.65;
        this.gameOverFruits[3].x = W * 0.82;
        this.gameOverFruits[3].y = H * 0.65;
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  initEvents() {
    // Mouse fallback support
    let isMouseDown = false;
    window.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      this.checkPauseClick(e.clientX, e.clientY);
      this.addBladePoint(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => { isMouseDown = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.isHandActive || isMouseDown) {
        this.addBladePoint(e.clientX, e.clientY);
      }
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.addBladePoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // ESC key immediately quits the game
      if (e.key === 'Escape') {
        if (window.electronAPI && window.electronAPI.quit) {
          window.electronAPI.quit();
        } else if (window.ipcRenderer) {
          window.ipcRenderer.send('app:quit');
        } else if (typeof require !== 'undefined') {
          try {
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('app:quit');
          } catch (err) {
            window.close();
          }
        } else {
          window.close();
        }
      }

      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        this.startGame(this.currentDifficulty || 'medium');
      }

      if (e.key === 'Backspace' || e.key === 'b' || e.key === 'B') {
        if (this.gameState === 'SELECT_MODE' || this.gameState === 'GAME_OVER') {
          this.gameState = 'MENU';
        }
      }

      if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        this.togglePause();
      }
    });
  }

  checkPauseClick(x, y) {
    if (this.gameState === 'PLAYING') {
      const b = this.pauseBtn;
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        this.togglePause();
      }
    }
  }

  togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
    } else if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      this.lastFrameTime = performance.now();
    }
  }

  async initVision() {
    try {
      this.tracker = new HandTracker({
        videoElement: this.video,
        mediapipePath: '../shared/libs/mediapipe/',
        autoPump: false
      });

      this.tracker.onResultsCallback = (res) => {
        const isDetected = !!(res && res.handDetected);

        // State change guard: only modify DOM when hand presence actually toggles (avoids layout thrashing)
        if (this.wasHandDetected !== isDetected) {
          this.wasHandDetected = isDetected;
          this.isHandActive = isDetected;

          if (isDetected) {
            this.camDot.classList.add('active');
            this.camStatus.textContent = 'Hand Active 🟢';
            // Reset blade trail when a hand enters view so no streak slices across screen
            this.bladeTrail = [];
          } else {
            this.camDot.classList.remove('active');
            this.camStatus.textContent = 'Wave hand to play...';
          }
        }

        if (isDetected && res.indexTip) {
          // Track tip
          const tipPt = this.tracker.toCanvasCoords(res.indexTip.x, res.indexTip.y, this.canvas.width, this.canvas.height);
          this.addBladePoint(tipPt.x, tipPt.y);

          if (res.indexVelocity > 360 && performance.now() - this.lastSliceTime > 240) {
            if (typeof SoundFX !== 'undefined') SoundFX.playSwish();
          }
        }
      };

      await this.tracker.start();
    } catch (err) {
      console.warn('[FruitNinja] Camera start note:', err);
      this.camStatus.textContent = 'Mouse Mode Active';
    }
  }

  addBladePoint(x, y) {
    const now = performance.now();
    this.handPos = { x, y };

    // Append to blade trail
    this.bladeTrail.push({ x, y, time: now });
    if (this.bladeTrail.length > 24) {
      this.bladeTrail.shift();
    }

    // Check blade slicing collision against active entities
    if (this.bladeTrail.length >= 2) {
      const p1 = this.bladeTrail[this.bladeTrail.length - 2];
      const p2 = this.bladeTrail[this.bladeTrail.length - 1];

      // Slicing velocity threshold (at least 8px movement)
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (dist > 8) {
        if (this.gameState === 'MENU') {
          this.checkMenuWatermelonSlice(p1, p2);
        } else if (this.gameState === 'SELECT_MODE') {
          this.checkModeFruitSlices(p1, p2);
        } else if (this.gameState === 'GAME_OVER') {
          this.checkGameOverFruitSlices(p1, p2);
        } else if (this.gameState === 'PLAYING') {
          this.checkFruitSlices(p1, p2);
        }
      }
    }
  }

  checkMenuWatermelonSlice(p1, p2) {
    const m = this.menuWatermelon;
    if (this.lineIntersectsCircle(p1, p2, m.x, m.y, m.radius)) {
      this.playSound('start');
      this.playSound('splatter');

      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      this.spawnFruitHalves('watermelon', m.x, m.y, angle, 120);
      this.spawnJuiceSplatter(m.x, m.y, '#ef4444', 'splashRed');

      this.screenShake = 16;
      this.bladeTrail = []; // Clear blade trail immediately so old stroke doesn't carry over
      this.modeSelectEnterTime = performance.now();
      this.modeSelectCooldown = 700; // 700ms grace period for smooth bounce-in
      this.playSound('throw');
      this.gameState = 'SELECT_MODE';
    }
  }

  checkModeFruitSlices(p1, p2) {
    // Slicing grace period: prevent accidental slice from previous screen swipe
    const now = performance.now();
    if (now - (this.modeSelectEnterTime || 0) < (this.modeSelectCooldown || 700)) {
      return;
    }

    const cutAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    for (const mf of this.modeFruits) {
      if (this.lineIntersectsCircle(p1, p2, mf.x, mf.y, mf.radius)) {
        this.playSound('start');
        this.playSound('splatter');

        this.currentDifficulty = mf.id;
        this.startGame(mf.id);
        this.spawnFruitHalves(mf.fruitType, mf.x, mf.y, cutAngle, mf.size);
        this.spawnJuiceSplatter(mf.x, mf.y, mf.color, mf.splashKey);
        this.screenShake = 18;
        break;
      }
    }
  }

  checkGameOverFruitSlices(p1, p2) {
    // Slicing grace period: prevent accidental slice from dying gameplay swipe
    const now = performance.now();
    if (now - (this.gameOverEnterTime || 0) < (this.gameOverCooldown || 750)) {
      return;
    }

    const cutAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    for (const gf of this.gameOverFruits) {
      if (this.lineIntersectsCircle(p1, p2, gf.x, gf.y, gf.radius)) {
        this.playSound('start');
        this.playSound('splatter');

        this.currentDifficulty = gf.id;
        this.startGame(gf.id);
        this.spawnFruitHalves(gf.fruitType, gf.x, gf.y, cutAngle, gf.size);
        this.spawnJuiceSplatter(gf.x, gf.y, gf.color, gf.splashKey);
        this.screenShake = 18;
        break;
      }
    }
  }

  startGame(difficulty = 'medium') {
    this.currentDifficulty = difficulty;
    this.maxStrikes = (difficulty === 'emotional_damage') ? 10 : 5;
    this.gameState = 'PLAYING';
    this.score = 0;
    this.strikes = 0;
    this.fruits = [];
    this.slicedHalves = [];
    this.particles = [];
    this.sparks = [];
    this.floatingTexts = [];
    this.fruitSpawnTimer = 0;

    if (difficulty === 'easy') {
      this.nextSpawnInterval = 950;
    } else if (difficulty === 'hard') {
      this.nextSpawnInterval = 520;
    } else if (difficulty === 'emotional_damage') {
      this.nextSpawnInterval = 420;
    } else {
      this.nextSpawnInterval = 750;
    }
    this.lastFrameTime = performance.now();

    const modeLabels = {
      easy: 'EASY MODE 🟢',
      medium: 'MEDIUM MODE 🟠',
      hard: 'HARD MODE ⚡',
      emotional_damage: 'EMOTIONAL DAMAGE! 💀'
    };
    const bannerColor = difficulty === 'emotional_damage' ? '#ef4444' : '#facc15';
    this.spawnFloatingScore(modeLabels[difficulty] || 'GO!', this.canvas.width / 2, this.canvas.height * 0.40, bannerColor);
  }

  checkFruitSlices(p1, p2) {
    const now = performance.now();
    const cutAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let slicedInThisStep = 0;

    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const f = this.fruits[i];
      if (f.sliced) continue;

      if (this.lineIntersectsCircle(p1, p2, f.x, f.y, f.radius)) {
        f.sliced = true;
        this.fruits.splice(i, 1);

        if (f.type === 'bomb') {
          // BOMB DETONATION!
          this.triggerBombExplosion(f.x, f.y);
          return;
        }

        // Fruit sliced successfully
        slicedInThisStep++;
        this.score += f.points;
        if (this.score > this.bestScore) {
          this.bestScore = this.score;
          localStorage.setItem('fn_best_score', this.bestScore.toString());
        }

        this.playSound('splatter');
        this.spawnFruitHalves(f.type, f.x, f.y, cutAngle, f.size);
        this.spawnJuiceSplatter(f.x, f.y, f.juiceColor, f.splashKey);
        this.spawnFloatingScore(`+${f.points}`, f.x, f.y, '#ffe259');

        this.currentStrokeSlices.push({ time: now, type: f.type });
      }
    }

    // Multi-fruit combo evaluation (slices within 240ms of active stroke)
    if (slicedInThisStep > 0) {
      this.lastSliceTime = now;
      clearTimeout(this.comboCheckTimeout);
      this.comboCheckTimeout = setTimeout(() => {
        this.evaluateCombo();
      }, 200);
    }
  }

  evaluateCombo() {
    const count = this.currentStrokeSlices.length;
    if (count >= 3) {
      const comboBonus = count;
      this.score += comboBonus;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('fn_best_score', this.bestScore.toString());
      }

      this.playSound('splatter');
      this.screenShake = 12;

      // Spawn authentic 3D combo banner matching Image 1:
      // "5 FRUIT \n COMBO \n +5"
      const lastSlice = this.currentStrokeSlices[this.currentStrokeSlices.length - 1];
      const cx = this.canvas.width * 0.50;
      const cy = this.canvas.height * 0.38;
      this.spawnComboBanner(count, comboBonus, cx, cy);
    }
    this.currentStrokeSlices = [];
  }

  spawnComboBanner(count, bonus, x, y) {
    this.floatingTexts.push({
      isCombo: true,
      textLine1: `${count} FRUIT`,
      textLine2: `COMBO`,
      textLine3: `+${bonus}`,
      x,
      y,
      vy: -0.4,
      scale: 0.6,
      targetScale: 1.15,
      alpha: 1.0,
      life: 85,
      maxLife: 85
    });
  }

  triggerBombExplosion(x, y) {
    this.playSound('boom');
    this.whiteFlashAlpha = 1.0;
    this.screenShake = 35;

    // Sparks & smoke
    for (let i = 0; i < 40; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 10;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: Math.random() > 0.5 ? '#f97316' : '#facc15',
        size: 3 + Math.random() * 5,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03
      });
    }

    // Trigger Game Over
    this.playSound('over');
    this.bladeTrail = [];
    this.gameOverEnterTime = performance.now();
    this.gameOverCooldown = 750;
    this.gameState = 'GAME_OVER';
  }

  spawnFruitHalves(type, x, y, cutAngle, size) {
    const spreadAngle = cutAngle + Math.PI / 2;
    const speed = 4 + Math.random() * 3;

    // Left half
    this.slicedHalves.push({
      type,
      halfIndex: 1,
      x,
      y,
      vx: -Math.cos(spreadAngle) * speed + (Math.random() - 0.5) * 2,
      vy: -Math.sin(spreadAngle) * speed - 2,
      rotation: cutAngle,
      rotSpeed: -0.08 - Math.random() * 0.06,
      size,
      alpha: 1.0
    });

    // Right half
    this.slicedHalves.push({
      type,
      halfIndex: 2,
      x,
      y,
      vx: Math.cos(spreadAngle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(spreadAngle) * speed - 2,
      rotation: cutAngle,
      rotSpeed: 0.08 + Math.random() * 0.06,
      size,
      alpha: 1.0
    });
  }

  spawnJuiceSplatter(x, y, color, splashKey) {
    // 1. Splat decal sticking onto the wooden wall
    this.splatDecals.push({
      x,
      y,
      splashKey: splashKey || 'splashRed',
      rotation: Math.random() * Math.PI * 2,
      scale: 0.75 + Math.random() * 0.45,
      alpha: 0.95,
      decay: 0.0015 // lingers on the wood for 10+ seconds
    });
    if (this.splatDecals.length > 18) {
      this.splatDecals.shift();
    }

    // 2. Flying spray particles (capped for 60 FPS smoothness)
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1,
        color,
        size: 3 + Math.random() * 5,
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.025
      });
    }
    if (this.particles.length > 60) {
      this.particles.splice(0, this.particles.length - 60);
    }
  }

  spawnFloatingScore(text, x, y, color) {
    this.floatingTexts.push({
      isCombo: false,
      text,
      x,
      y,
      vy: -1.8,
      alpha: 1.0,
      color,
      size: 32,
      life: 45,
      maxLife: 45
    });
  }

  lineIntersectsCircle(p1, p2, cx, cy, r) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(p1.x - cx, p1.y - cy) <= r;

    const t = Math.max(0, Math.min(1, ((cx - p1.x) * dx + (cy - p1.y) * dy) / lenSq));
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;
    return Math.hypot(projX - cx, projY - cy) <= r;
  }

  spawnFruits() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const diff = this.currentDifficulty || 'medium';

    let count;
    let allowBomb = false;
    let gravity = 0.38;
    let sizeScale = 1.0;

    if (diff === 'easy') {
      // EASY: 1-2 fruits, floaty gravity, 15% larger fruits, NO BOMBS (ระเบิดไม่มีเด็ดขาด)
      count = Math.random() < 0.60 ? 1 : 2;
      allowBomb = false;
      gravity = 0.32;
      sizeScale = 1.15;
    } else if (diff === 'hard') {
      // HARD: Tuned easier - strictly 2-3 fruits, balanced gravity, fair bomb chance
      count = Math.random() < 0.65 ? 2 : 3;
      allowBomb = this.score >= 15 && Math.random() < 0.20;
      gravity = 0.37;
      sizeScale = 1.0;
    } else if (diff === 'emotional_damage') {
      // EMOTIONAL DAMAGE: Former HARD mode specifications (3-6 fruits swarm, high bomb hazard)
      const r = Math.random();
      count = r < 0.25 ? 3 : (r < 0.65 ? 4 : (r < 0.90 ? 5 : 6));
      allowBomb = this.score >= 10 && Math.random() < 0.35;
      gravity = 0.44;
      sizeScale = 0.92;
    } else {
      // MEDIUM: Tuned even easier - gentle 1-2 fruits early, floatier arc, rare delayed bombs
      if (this.score < 20) {
        count = Math.random() < 0.50 ? 1 : 2;
      } else {
        count = Math.random() < 0.75 ? 2 : 3;
      }
      allowBomb = this.score >= 28 && Math.random() < 0.08;
      gravity = 0.33;
      sizeScale = 1.10;
    }

    const fruitDefs = [
      { type: 'watermelon', imgKey: 'sandia', size: Math.round(140 * sizeScale), radius: Math.round(68 * sizeScale), points: 10, juiceColor: '#ef4444', splashKey: 'splashRed' },
      { type: 'apple', imgKey: 'apple', size: Math.round(120 * sizeScale), radius: Math.round(58 * sizeScale), points: 10, juiceColor: '#f43f5e', splashKey: 'splashRed' },
      { type: 'orange', imgKey: 'orange', size: Math.round(120 * sizeScale), radius: Math.round(58 * sizeScale), points: 10, juiceColor: '#f97316', splashKey: 'splashOrange' },
      { type: 'banana', imgKey: 'banana', size: Math.round(130 * sizeScale), radius: Math.round(62 * sizeScale), points: 10, juiceColor: '#facc15', splashKey: 'splashYellow' },
      { type: 'pineapple', imgKey: 'pineapple', size: Math.round(140 * sizeScale), radius: Math.round(68 * sizeScale), points: 15, juiceColor: '#facc15', splashKey: 'splashYellow' },
      { type: 'peach', imgKey: 'peach', size: Math.round(115 * sizeScale), radius: Math.round(55 * sizeScale), points: 10, juiceColor: '#fb7185', splashKey: 'splashRed' },
      { type: 'coconut', imgKey: 'coconut', size: Math.round(120 * sizeScale), radius: Math.round(58 * sizeScale), points: 10, juiceColor: '#f8fafc', splashKey: 'splashYellow' }
    ];

    const bombDef = { type: 'bomb', imgKey: 'bomb', size: Math.round(130 * sizeScale), radius: Math.round(62 * sizeScale), points: 0, juiceColor: '#e2e8f0', splashKey: null };

    const bombIndex = allowBomb ? Math.floor(Math.random() * count) : -1;

    this.playSound('throw');

    const laneWidth = (W * 0.72) / count;

    for (let i = 0; i < count; i++) {
      const def = (i === bombIndex)
        ? bombDef
        : fruitDefs[Math.floor(Math.random() * fruitDefs.length)];

      const spawnX = W * 0.14 + (i + 0.5) * laneWidth + (Math.random() - 0.5) * (laneWidth * 0.5);
      const spawnY = H + 80 + Math.random() * 40;

      // Arc trajectory aiming towards upper-mid screen
      const targetX = W * 0.22 + Math.random() * (W * 0.56);
      const targetPeakY = H * 0.14 + Math.random() * (H * 0.26);

      const gravity = 0.38;
      const vy = -Math.sqrt(2 * gravity * (spawnY - targetPeakY));
      const flightTime = -vy / gravity;
      const vx = (targetX - spawnX) / flightTime;

      this.fruits.push({
        ...def,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        gravity,
        sliced: false
      });
    }
  }

  loop() {
    const now = performance.now();
    const dt = Math.min(50, now - this.lastFrameTime);
    this.lastFrameTime = now;

    // Detect per frame vision
    if (this.tracker) {
      this.tracker.detect();
    }

    if (this.gameState !== 'PAUSED') {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    // Menu rotation animations & magical aura
    this.menuRingAngle += 0.015;
    this.menuWatermelonAngle += 0.02;

    if (this.gameState === 'MENU' && Math.random() < 0.22) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 45;
      this.sparks.push({
        x: this.menuWatermelon.x + Math.cos(ang) * dist,
        y: this.menuWatermelon.y + Math.sin(ang) * dist,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.8 - Math.random() * 0.8,
        color: Math.random() > 0.35 ? '#facc15' : '#38bdf8',
        size: 2 + Math.random() * 2.5,
        alpha: 0.9,
        decay: 0.022
      });
    }

    if ((this.gameState === 'SELECT_MODE' || this.gameState === 'GAME_OVER') && Math.random() < 0.35) {
      const list = this.gameState === 'GAME_OVER' ? this.gameOverFruits : this.modeFruits;
      if (list && list.length > 0) {
        const mf = list[Math.floor(Math.random() * list.length)];
        if (mf && mf.x > 0) {
          const ang = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * 40;
          this.sparks.push({
            x: mf.x + Math.cos(ang) * dist,
            y: mf.y + Math.sin(ang) * dist,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.8 - Math.random() * 0.8,
            color: mf.color,
            size: 2 + Math.random() * 2.5,
            alpha: 0.85,
            decay: 0.025
          });
        }
      }
    }

    // Shake & Flash decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }
    if (this.whiteFlashAlpha > 0) {
      this.whiteFlashAlpha -= 0.05;
      if (this.whiteFlashAlpha < 0) this.whiteFlashAlpha = 0;
    }

    // Blade trail fade
    const trailCutoff = performance.now() - 200;
    while (this.bladeTrail.length > 0 && this.bladeTrail[0].time < trailCutoff) {
      this.bladeTrail.shift();
    }

    // Update Splat Decals on wooden wall
    for (let i = this.splatDecals.length - 1; i >= 0; i--) {
      this.splatDecals[i].alpha -= this.splatDecals[i].decay;
      if (this.splatDecals[i].alpha <= 0) {
        this.splatDecals.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.alpha -= p.decay;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= sp.decay;
      if (sp.alpha <= 0) this.sparks.splice(i, 1);
    }

    // Update Sliced Halves
    for (let i = this.slicedHalves.length - 1; i >= 0; i--) {
      const h = this.slicedHalves[i];
      h.x += h.vx;
      h.y += h.vy;
      h.vy += 0.45; // gravity
      h.rotation += h.rotSpeed;
      if (h.y > this.canvas.height + 150) {
        this.slicedHalves.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.isCombo && ft.scale < ft.targetScale) {
        ft.scale += 0.05;
      }
      ft.alpha = Math.max(0, ft.life / ft.maxLife);
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // In-Game updates (Spawning & Falling fruit misses)
    if (this.gameState === 'PLAYING') {
      this.fruitSpawnTimer += dt;
      if (this.fruitSpawnTimer >= this.nextSpawnInterval) {
        this.fruitSpawnTimer = 0;
        // Dynamic spawn cadence scaled by chosen difficulty
        let baseInterval = 750;
        let randomAdd = 300;
        if (this.currentDifficulty === 'easy') {
          baseInterval = Math.max(850, 1250 - Math.min(300, this.score * 1.5));
          randomAdd = 350;
        } else if (this.currentDifficulty === 'hard') {
          // Tuned easier: smooth rapid cadence without overwhelming
          baseInterval = Math.max(560, 820 - Math.min(200, this.score * 2.0));
          randomAdd = 250;
        } else if (this.currentDifficulty === 'emotional_damage') {
          // Former HARD mode frenzied frenzy cadence
          baseInterval = Math.max(380, 620 - Math.min(250, this.score * 3.0));
          randomAdd = 200;
        } else {
          // medium: Tuned even easier: relaxed classic cadence with generous reaction time
          baseInterval = Math.max(850, 1200 - Math.min(220, this.score * 1.2));
          randomAdd = 350;
        }
        this.nextSpawnInterval = baseInterval + Math.random() * randomAdd;
        this.spawnFruits();
      }

      for (let i = this.fruits.length - 1; i >= 0; i--) {
        const f = this.fruits[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.gravity;
        f.rotation += f.rotSpeed;

        // Check fruit drop without slice (strike penalty)
        if (f.y > this.canvas.height + 100 && f.vy > 0) {
          this.fruits.splice(i, 1);
          if (f.type !== 'bomb') {
            this.handleFruitMiss(f.x);
          }
        }
      }
    }
  }

  handleFruitMiss(x) {
    this.strikes++;
    this.screenShake = 8;
    this.spawnFloatingScore('❌', Math.max(80, Math.min(this.canvas.width - 80, x)), this.canvas.height - 40, '#ef4444');

    if (this.strikes >= (this.maxStrikes || 5)) {
      this.playSound('over');
      this.bladeTrail = [];
      this.gameOverEnterTime = performance.now();
      this.gameOverCooldown = 750;
      this.gameState = 'GAME_OVER';
    }
  }

  render() {
    this.ctx.save();

    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(sx, sy);
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameState === 'MENU') {
      this.renderMenuScreen();
    } else if (this.gameState === 'SELECT_MODE') {
      this.renderSelectModeScreen();
    } else {
      this.renderGameScreen();
    }

    // Katana Blade Trail & Slicing Sparks
    this.renderBladeTrail();

    // White Flash on Bomb Explosion
    if (this.whiteFlashAlpha > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.whiteFlashAlpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.restore();
  }

  // --- START MENU SCREEN (Fruit Neptune Courtyard - 100% Solid Background, No Camera) ---
  renderMenuScreen() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // 1. Custom Start Screen Background (Fruit Neptune CPE KMUTT) - Solid 100% (No Camera on Start Screen)
    const bgStart = this.images.bgStart || this.images.bgDojo;
    const isCustomBg = (this.images.bgStart && this.images.bgStart.complete && this.images.bgStart.naturalWidth > 0);
    
    if (bgStart && bgStart.complete && bgStart.naturalWidth > 0) {
      this.ctx.drawImage(bgStart, 0, 0, W, H);
    } else {
      this.ctx.fillStyle = '#1e1b4b';
      this.ctx.fillRect(0, 0, W, H);
    }

    // 2. Logo handling:
    // When using start_bg_2.jpg, "FRUIT NEPTUNE CPE KMUTT" is already rendered in the artwork at the top.
    // If running on a fallback background, render official floating 3D logo.
    if (!isCustomBg) {
      const logo = this.images.logo;
      if (logo && logo.complete && logo.naturalWidth > 0) {
        const logoW = Math.min(W * 0.48, 440);
        const logoH = (logoW / logo.naturalWidth) * logo.naturalHeight;
        const bounceY = Math.sin(performance.now() * 0.002) * 6;
        this.ctx.drawImage(logo, (W - logoW) / 2, H * 0.08 + bounceY, logoW, logoH);
      }
    }

    // 3. Centerpiece: Rotating "START SINGLE PLAYER" Ring + Rotating Watermelon
    // Aligned to optical center between CPE KMUTT students on the left and right (X = 54.5% W),
    // and hovering cleanly below the "CPE KMUTT" logo in front of the S3/S4 engineering building (Y = 54% H).
    const m = this.menuWatermelon;
    m.x = W * 0.545;
    const floatY = Math.sin(performance.now() * 0.003) * 7;
    m.y = H * 0.54 + floatY;
    m.radius = Math.min(W * 0.07, H * 0.10, 75);

    // Draw Rotating Start Ring with Golden Glow
    const ring = this.images.newGameRing;
    if (ring && ring.complete && ring.naturalWidth > 0) {
      this.ctx.save();
      this.ctx.translate(m.x, m.y);
      this.ctx.rotate(this.menuRingAngle);
      this.ctx.shadowColor = 'rgba(245, 158, 11, 0.55)';
      this.ctx.shadowBlur = 18;
      const ringSize = Math.min(W * 0.22, H * 0.30, 220);
      this.ctx.drawImage(ring, -ringSize / 2, -ringSize / 2, ringSize, ringSize);
      this.ctx.restore();
    }

    // Draw Whole Watermelon inside Ring with Juicy Green Aura
    const wm = this.images.sandia;
    if (wm && wm.complete && wm.naturalWidth > 0) {
      this.ctx.save();
      this.ctx.translate(m.x, m.y);
      this.ctx.rotate(this.menuWatermelonAngle);
      this.ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
      this.ctx.shadowBlur = 16;
      const wmSize = Math.min(W * 0.10, H * 0.14, 102);
      this.ctx.drawImage(wm, -wmSize / 2, -wmSize / 2, wmSize, wmSize);
      this.ctx.restore();
    }

    // 5. Prompt Text - Clean English Arcade Header (Removed Thai subtitle as requested)
    const promptY = m.y + Math.min(H * 0.16, 130);
    this.ctx.save();
    this.ctx.textAlign = 'center';

    this.ctx.font = "900 24px 'Impact', 'Segoe UI', sans-serif";
    this.ctx.strokeStyle = '#18181b';
    this.ctx.lineWidth = 6;
    this.ctx.shadowColor = 'rgba(250, 204, 21, 0.65)';
    this.ctx.shadowBlur = 14;
    this.ctx.strokeText('SWIPE WATERMELON TO PLAY!', m.x, promptY);
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('SWIPE WATERMELON TO PLAY!', m.x, promptY);
    this.ctx.restore();

    // Sliced Halves & Particles in Menu
    this.renderEntities();
  }

  // --- SELECT MODE SCREEN (Difficulty Selection with 3 Fruits) ---
  renderSelectModeScreen() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // 1. Solid Background: select_mode_page_2.png (100% Solid, No Camera Feed)
    const bgSelect = this.images.bgSelectMode || this.images.bgStart || this.images.bgDojo;
    if (bgSelect && bgSelect.complete && bgSelect.naturalWidth > 0) {
      this.ctx.drawImage(bgSelect, 0, 0, W, H);
    } else {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(0, 0, W, H);
    }

    // 2. Header Text (Chunky Arcade Style)
    this.ctx.save();
    this.ctx.textAlign = 'center';

    const headerY = Math.max(65, H * 0.16);
    this.drawChunkyArcadeText('SELECT DIFFICULTY', W * 0.50, headerY, Math.min(W * 0.042, 50), '#ffde00', '#f59e0b', '#451a03');

    // Subtitle instruction
    this.ctx.font = `900 ${Math.min(W * 0.018, 20)}px 'Impact', 'Segoe UI', sans-serif`;
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
    this.ctx.shadowBlur = 8;
    this.ctx.strokeText('SWIPE A FRUIT TO CHOOSE YOUR MODE!', W * 0.50, headerY + 40);
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillText('SWIPE A FRUIT TO CHOOSE YOUR MODE!', W * 0.50, headerY + 40);
    this.ctx.restore();

    // 3. Render Difficulty Fruits with Staggered Pop-in Bounce
    const ringImg = this.images.newGameRing;
    const now = performance.now();
    const elapsed = now - (this.modeSelectEnterTime || 0);

    this.modeFruits.forEach((mf, idx) => {
      // Staggered pop-in bounce animation (idx * 60ms delay)
      const delay = idx * 60;
      const fruitElapsed = Math.max(0, elapsed - delay);
      const t = Math.min(1.0, fruitElapsed / 380);
      // Elastic pop-in overshoot curve: expands from 0 to 1.08, settles at 1.0
      const scale = (t <= 0) ? 0 : (t >= 1) ? 1 : (1 + 1.6 * Math.pow(t - 1, 3) + 0.6 * Math.pow(t - 1, 2));

      if (scale <= 0.01) return;

      const bob = Math.sin(now * 0.0028 + idx * 1.4) * 8;
      const cx = mf.x;
      const cy = mf.y + bob;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(scale, scale);
      this.ctx.translate(-cx, -cy);

      // Draw Rotating Ring behind Fruit
      if (ringImg && ringImg.complete && ringImg.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.menuRingAngle * (idx % 2 === 0 ? 1 : -1));
        this.ctx.shadowColor = mf.glowColor;
        this.ctx.shadowBlur = 20;
        const ringSz = Math.min(W * 0.14, H * 0.20, 142);
        this.ctx.drawImage(ringImg, -ringSz / 2, -ringSz / 2, ringSz, ringSz);
        this.ctx.restore();
      }

      // Draw Rotating Fruit
      const fruitImg = this.images[mf.imgKey];
      if (fruitImg && fruitImg.complete && fruitImg.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.menuWatermelonAngle * (idx % 2 === 0 ? -1 : 1));
        this.ctx.shadowColor = mf.glowColor;
        this.ctx.shadowBlur = 18;
        const fruitSz = Math.min(W * 0.072, H * 0.10, 84);
        this.ctx.drawImage(fruitImg, -fruitSz / 2, -fruitSz / 2, fruitSz, fruitSz);
        this.ctx.restore();
      }

      // Mode Title & Info Card below Fruit
      const labelY = cy + Math.min(H * 0.11, 86);
      this.ctx.save();
      this.ctx.textAlign = 'center';

      // Title (Clean English arcade title without Thai suffix)
      const titleText = mf.nameEn || mf.name;
      const fontSize = mf.id === 'emotional_damage' ? Math.min(W * 0.015, 18) : Math.min(W * 0.021, 25);
      this.ctx.font = `900 ${fontSize}px 'Impact', 'Segoe UI', sans-serif`;
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 4.5;
      this.ctx.shadowColor = mf.glowColor;
      this.ctx.shadowBlur = 12;
      this.ctx.strokeText(titleText, cx, labelY);
      this.ctx.fillStyle = mf.color;
      this.ctx.fillText(titleText, cx, labelY);

      // Description pill
      const badgeY = labelY + 26;
      this.ctx.font = `700 ${Math.min(W * 0.010, 13)}px 'Segoe UI', sans-serif`;
      const badgeWidth = this.ctx.measureText(mf.badge).width + 18;
      const badgeHeight = 24;

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      this.ctx.strokeStyle = mf.color;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(cx - badgeWidth / 2, badgeY - badgeHeight / 2 - 3, badgeWidth, badgeHeight, 12);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#f8fafc';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText(mf.badge, cx, badgeY);
      this.ctx.restore();

      this.ctx.restore();
    });

    // 4. Sliced Halves & Particles in Mode Select Screen
    this.renderEntities();
  }

  // --- IN-GAME SCREEN (100% Real-time Camera Feed, NO Wood Background) ---
  renderGameScreen() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // 1. 100% Opacity Full-Screen Camera Background (Always ON at all times, not only when hand detected)
    // Wood background completely removed as requested
    if (this.tracker) {
      this.tracker.drawVideoBackground(this.ctx, W, H, 1.0);
    } else {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(0, 0, W, H);
    }

    // 2. Screen Splatter Decals (Permanent juice splats on the lens/glass)
    this.splatDecals.forEach(s => {
      const splashImg = this.images[s.splashKey] || this.images.splashRed;
      if (splashImg && splashImg.complete && splashImg.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, s.alpha);
        this.ctx.translate(s.x, s.y);
        this.ctx.rotate(s.rotation);
        const sz = 160 * s.scale;
        this.ctx.drawImage(splashImg, -sz / 2, -sz / 2, sz, sz);
        this.ctx.restore();
      }
    });

    // 3. Entities (Fruits, Halves, Juice Particles, Sparks)
    this.renderEntities();

    // 4. Authentic Fruit Ninja HUD (Score, Strikes, Pause Button)
    this.renderHUD();

    // 5. Game Over / Paused Overlay
    if (this.gameState === 'GAME_OVER') {
      this.renderGameOverOverlay();
    } else if (this.gameState === 'PAUSED') {
      this.renderPausedOverlay();
    }
  }

  renderEntities() {
    // Sliced Halves
    this.slicedHalves.forEach(h => {
      const halfImgKey = `${h.type}_${h.halfIndex}`;
      const img = this.images[halfImgKey] || this.images[`${h.type}_1`];
      if (img && img.complete && img.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.translate(h.x, h.y);
        this.ctx.rotate(h.rotation);
        const sz = h.size;
        this.ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
        this.ctx.restore();
      }
    });

    // Whole Fruits
    this.fruits.forEach(f => {
      const img = this.images[f.imgKey];
      if (img && img.complete && img.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.translate(f.x, f.y);
        this.ctx.rotate(f.rotation);
        const sz = f.size;
        this.ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
        this.ctx.restore();
      }
    });

    // Juice Droplets
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Sparks
    this.sparks.forEach(sp => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, sp.alpha);
      this.ctx.fillStyle = sp.color;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Floating Text & Combo Banners
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);

      if (ft.isCombo) {
        // Authentic 3D Stacked Golden Combo Banner (Image 1 Style)
        this.ctx.translate(ft.x, ft.y);
        this.ctx.scale(ft.scale, ft.scale);
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Line 1: "5 FRUIT"
        this.drawChunkyArcadeText(ft.textLine1, 0, -32, 38, '#ffe259', '#f39c12', '#451a03');
        // Line 2: "COMBO"
        this.drawChunkyArcadeText(ft.textLine2, 0, 10, 42, '#ffe259', '#f39c12', '#451a03');
        // Line 3: "+5"
        this.drawChunkyArcadeText(ft.textLine3, 0, 56, 48, '#ffde00', '#f97316', '#451a03');
      } else {
        // Small score or miss popup
        this.ctx.translate(ft.x, ft.y);
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.drawChunkyArcadeText(ft.text, 0, 0, ft.size || 32, ft.color, ft.color, '#000000');
      }

      this.ctx.restore();
    });
  }

  // --- AUTHENTIC HEADS-UP DISPLAY (Image 1) ---
  renderHUD() {
    const W = this.canvas.width;

    // 1. Top-Left: Sliced Watermelon Icon + Chunky Score + BEST
    const wmIcon = this.images.sandia_2;
    if (wmIcon && wmIcon.complete && wmIcon.naturalWidth > 0) {
      this.ctx.save();
      this.ctx.drawImage(wmIcon, 24, 20, 58, 58);
      this.ctx.restore();
    }

    // Score Number (Big bold golden arcade font from Image 1)
    this.ctx.save();
    this.ctx.textAlign = 'left';
    this.drawChunkyArcadeText(`${this.score}`, 88, 62, 54, '#ffde00', '#f39c12', '#451a03');

    // BEST Score below
    this.ctx.font = "900 17px 'Impact', 'Segoe UI', sans-serif";
    this.ctx.fillStyle = '#d97706';
    this.ctx.strokeStyle = '#1c1917';
    this.ctx.lineWidth = 3.5;
    this.ctx.strokeText(`BEST: ${this.bestScore}`, 28, 104);
    this.ctx.fillText(`BEST: ${this.bestScore}`, 28, 104);

    // Difficulty Badge below BEST
    const diff = (this.currentDifficulty || 'medium').toUpperCase();
    let diffColor = '#fb923c';
    let diffLabel = diff;
    if (diff === 'EASY') diffColor = '#4ade80';
    else if (diff === 'HARD') diffColor = '#facc15';
    else if (diff === 'EMOTIONAL_DAMAGE') {
      diffColor = '#ef4444';
      diffLabel = 'EMOTIONAL DAMAGE';
    }
    this.ctx.font = "900 13px 'Segoe UI', sans-serif";
    this.ctx.fillStyle = diffColor;
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(`MODE: ${diffLabel}`, 28, 126);
    this.ctx.fillText(`MODE: ${diffLabel}`, 28, 126);
    this.ctx.restore();

    // 2. Top-Right: Ninja 'X' Strikes / Lives (Fruit Ninja Arcade Style)
    // Supports dynamic strike counts: 10 lives for Emotional Damage, 5 lives for Classic modes
    const rightX = W - 32;
    const topY = 28;

    if (this.maxStrikes === 10) {
      // EMOTIONAL DAMAGE MODE: 10 Lives Layout (Two sleek arcade rows of 5 strikes)
      const row1 = [
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 162, y: topY + 4,  w: 24, h: 24, req: 1 },
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 130, y: topY + 4,  w: 24, h: 24, req: 2 },
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 98,  y: topY + 4,  w: 24, h: 24, req: 3 },
        { imgActive: this.images.xxf,  imgNormal: this.images.xx,  x: rightX - 66,  y: topY + 3,  w: 26, h: 26, req: 4 },
        { imgActive: this.images.xxxf, imgNormal: this.images.xxx, x: rightX - 32,  y: topY + 2,  w: 28, h: 28, req: 5 },
      ];

      const row2 = [
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 162, y: topY + 34, w: 24, h: 24, req: 6 },
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 130, y: topY + 34, w: 24, h: 24, req: 7 },
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 98,  y: topY + 34, w: 24, h: 24, req: 8 },
        { imgActive: this.images.xxf,  imgNormal: this.images.xx,  x: rightX - 66,  y: topY + 33, w: 26, h: 26, req: 9 },
        { imgActive: this.images.xxxf, imgNormal: this.images.xxx, x: rightX - 32,  y: topY + 32, w: 28, h: 28, req: 10 },
      ];

      const all10 = [...row1, ...row2];

      this.ctx.save();
      // Backing dark glass capsule with subtle red glow
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(rightX - 174, topY - 5, 182, 68, 12);
      this.ctx.fill();
      this.ctx.stroke();

      for (let i = 0; i < all10.length; i++) {
        const cfg = all10[i];
        const isStruck = this.strikes >= cfg.req;
        const img = isStruck ? cfg.imgActive : cfg.imgNormal;

        if (isStruck) {
          this.ctx.shadowColor = 'rgba(239, 68, 68, 0.85)';
          this.ctx.shadowBlur = 8;
        } else {
          this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          this.ctx.shadowBlur = 3;
        }

        if (img && img.complete) {
          this.ctx.drawImage(img, cfg.x, cfg.y, cfg.w, cfg.h);
        }
      }
      this.ctx.restore();
    } else {
      // Classic 5 Strikes Layout
      const strikeConfigs = [
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 176, y: topY + 7, w: 24, h: 24, req: 1 },
        { imgActive: this.images.xf,   imgNormal: this.images.x,   x: rightX - 142, y: topY + 5, w: 26, h: 26, req: 2 },
        { imgActive: this.images.xxf,  imgNormal: this.images.xx,  x: rightX - 106, y: topY + 3, w: 28, h: 28, req: 3 },
        { imgActive: this.images.xxf,  imgNormal: this.images.xx,  x: rightX - 68,  y: topY + 1, w: 31, h: 31, req: 4 },
        { imgActive: this.images.xxxf, imgNormal: this.images.xxx, x: rightX - 28,  y: topY,     w: 34, h: 34, req: 5 },
      ];

      this.ctx.save();
      for (let i = 0; i < strikeConfigs.length; i++) {
        const cfg = strikeConfigs[i];
        const isStruck = this.strikes >= cfg.req;
        const img = isStruck ? cfg.imgActive : cfg.imgNormal;

        if (isStruck) {
          this.ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
          this.ctx.shadowBlur = 10;
        } else {
          this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          this.ctx.shadowBlur = 4;
        }

        if (img && img.complete) {
          this.ctx.drawImage(img, cfg.x, cfg.y, cfg.w, cfg.h);
        }
      }
      this.ctx.restore();
    }

    // 3. Bottom-Left: Pause Button
    const b = this.pauseBtn;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(b.x, b.y, b.width, b.height, 12);
    this.ctx.fill();
    this.ctx.stroke();

    // Pause bars ||
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(b.x + 14, b.y + 12, 6, 24);
    this.ctx.fillRect(b.x + 28, b.y + 12, 6, 24);
    this.ctx.restore();
  }

  // --- GAME OVER SCREEN (4 Sliceable Mode Choices to Replay) ---
  renderGameOverOverlay() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Dark backdrop with rich arcade vignette
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    this.ctx.fillRect(0, 0, W, H);

    // Game Over Banner at top
    const goImg = this.images.gameOver;
    if (goImg && goImg.complete && goImg.naturalWidth > 0) {
      const goW = Math.min(W * 0.42, 420);
      const goH = (goW / goImg.naturalWidth) * goImg.naturalHeight;
      this.ctx.drawImage(goImg, (W - goW) / 2, H * 0.08, goW, goH);
    }

    // Score & Best Summary
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.drawChunkyArcadeText(`SCORE: ${this.score}`, W * 0.50, H * 0.28, Math.min(W * 0.034, 40), '#ffde00', '#f39c12', '#451a03');
    this.drawChunkyArcadeText(`BEST: ${this.bestScore}`, W * 0.50, H * 0.35, Math.min(W * 0.024, 28), '#38bdf8', '#0284c7', '#082f49');

    // Prompt instructions: Swipe any fruit to choose mode and play again
    const promptY = H * 0.44;
    this.ctx.font = `900 ${Math.min(W * 0.017, 20)}px 'Impact', 'Segoe UI', sans-serif`;
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 4.5;
    this.ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.strokeText('SWIPE A FRUIT TO CHOOSE MODE & REPLAY!', W * 0.50, promptY);
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('SWIPE A FRUIT TO CHOOSE MODE & REPLAY!', W * 0.50, promptY);
    this.ctx.restore();

    // 4 Slicing Mode Choices with Staggered Pop-in Bounce
    const ringImg = this.images.newGameRing;
    const now = performance.now();
    const elapsed = now - (this.gameOverEnterTime || 0);

    this.gameOverFruits.forEach((gf, idx) => {
      // Staggered pop-in bounce animation (idx * 60ms delay)
      const delay = idx * 60;
      const fruitElapsed = Math.max(0, elapsed - delay);
      const t = Math.min(1.0, fruitElapsed / 380);
      const scale = (t <= 0) ? 0 : (t >= 1) ? 1 : (1 + 1.6 * Math.pow(t - 1, 3) + 0.6 * Math.pow(t - 1, 2));

      if (scale <= 0.01) return;

      const bob = Math.sin(now * 0.0028 + idx * 1.4) * 6;
      const cx = gf.x;
      const cy = gf.y + bob;
      const isCurrent = (gf.id === this.currentDifficulty);

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(scale, scale);
      this.ctx.translate(-cx, -cy);

      // Rotating Ring behind Fruit
      if (ringImg && ringImg.complete && ringImg.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.menuRingAngle * (idx % 2 === 0 ? 1 : -1));
        this.ctx.shadowColor = isCurrent ? '#facc15' : gf.glowColor;
        this.ctx.shadowBlur = isCurrent ? 26 : 18;
        const ringSz = Math.min(W * 0.125, H * 0.18, 126);
        this.ctx.drawImage(ringImg, -ringSz / 2, -ringSz / 2, ringSz, ringSz);
        this.ctx.restore();
      }

      // Rotating Fruit
      const fruitImg = this.images[gf.imgKey];
      if (fruitImg && fruitImg.complete && fruitImg.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.menuWatermelonAngle * (idx % 2 === 0 ? -1 : 1));
        this.ctx.shadowColor = gf.glowColor;
        this.ctx.shadowBlur = 18;
        const fruitSz = Math.min(W * 0.065, H * 0.095, 78);
        this.ctx.drawImage(fruitImg, -fruitSz / 2, -fruitSz / 2, fruitSz, fruitSz);
        this.ctx.restore();
      }

      // Indicator if this was the mode just played (e.g. LAST PLAYED)
      if (isCurrent) {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = `900 ${Math.min(W * 0.010, 11)}px 'Segoe UI', sans-serif`;
        const tagText = 'LAST PLAYED';
        const tagWidth = this.ctx.measureText(tagText).width + 14;
        const tagY = cy - Math.min(H * 0.09, 64);

        this.ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
        this.ctx.beginPath();
        this.ctx.roundRect(cx - tagWidth / 2, tagY - 10, tagWidth, 18, 8);
        this.ctx.fill();

        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillText(tagText, cx, tagY + 3);
        this.ctx.restore();
      }

      // Mode Title below Fruit
      const labelY = cy + Math.min(H * 0.095, 74);
      this.ctx.save();
      this.ctx.textAlign = 'center';

      const titleText = gf.name;
      const fontSize = gf.id === 'emotional_damage' ? Math.min(W * 0.014, 16) : Math.min(W * 0.019, 22);
      this.ctx.font = `900 ${fontSize}px 'Impact', 'Segoe UI', sans-serif`;
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = gf.glowColor;
      this.ctx.shadowBlur = 10;
      this.ctx.strokeText(titleText, cx, labelY);
      this.ctx.fillStyle = gf.color;
      this.ctx.fillText(titleText, cx, labelY);

      // Description pill
      const badgeY = labelY + 22;
      this.ctx.font = `700 ${Math.min(W * 0.009, 12)}px 'Segoe UI', sans-serif`;
      const badgeWidth = this.ctx.measureText(gf.badge).width + 16;
      const badgeHeight = 22;

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      this.ctx.strokeStyle = isCurrent ? '#facc15' : gf.color;
      this.ctx.lineWidth = isCurrent ? 2 : 1.2;
      this.ctx.beginPath();
      this.ctx.roundRect(cx - badgeWidth / 2, badgeY - badgeHeight / 2 - 3, badgeWidth, badgeHeight, 10);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#f8fafc';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText(gf.badge, cx, badgeY);
      this.ctx.restore();

      this.ctx.restore();
    });
  }

  renderPausedOverlay() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.drawChunkyArcadeText('PAUSED', W * 0.5, H * 0.45, 60, '#facc15', '#eab308', '#451a03');
    this.ctx.font = "900 22px 'Segoe UI', sans-serif";
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillText('Click Pause button or press SPACE to resume', W * 0.5, H * 0.54);
    this.ctx.restore();
  }

  // --- KATANA BLADE TRAIL (Matching Image 1 Silver-White Arc) ---
  renderBladeTrail() {
    if (this.bladeTrail.length < 2) return;

    const pts = this.bladeTrail;
    const now = performance.now();

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // 1. Outer Cyan-Ice Glow
    this.ctx.beginPath();
    this.ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const xc = (pts[i].x + pts[i - 1].x) / 2;
      const yc = (pts[i].y + pts[i - 1].y) / 2;
      this.ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
    }
    this.ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    this.ctx.shadowColor = '#38bdf8';
    this.ctx.shadowBlur = 14;
    this.ctx.lineWidth = 14;
    this.ctx.stroke();

    // 2. Gleaming Silver-White Katana Core (tapers smoothly at ends, batched state for 60 FPS)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.shadowColor = '#ffffff';
    this.ctx.shadowBlur = 6;
    for (let i = 1; i < pts.length; i++) {
      const pPrev = pts[i - 1];
      const pCurr = pts[i];
      const progress = i / pts.length; // 0 to 1
      const width = Math.sin(progress * Math.PI) * 9 + 2;

      this.ctx.beginPath();
      this.ctx.moveTo(pPrev.x, pPrev.y);
      this.ctx.lineTo(pCurr.x, pCurr.y);
      this.ctx.lineWidth = width;
      this.ctx.stroke();
    }

    // 3. Katana tip glint spark
    const tip = pts[pts.length - 1];
    this.ctx.beginPath();
    this.ctx.arc(tip.x, tip.y, 4.5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#38bdf8';
    this.ctx.shadowBlur = 12;
    this.ctx.fill();

    this.ctx.restore();
  }

  // --- HELPER: CHUNKY ARCADE 3D TEXT WITH DUAL GRADIENT & SHADOW ---
  drawChunkyArcadeText(text, x, y, size, colorTop, colorBot, strokeColor) {
    this.ctx.save();
    this.ctx.font = `900 ${size}px 'Impact', 'Arial Black', sans-serif`;

    // Drop shadow / 3D extrusion stroke
    this.ctx.strokeStyle = strokeColor || '#381602';
    this.ctx.lineWidth = Math.max(5, size * 0.16);
    this.ctx.strokeText(text, x, y);

    // Gradient fill
    const grad = this.ctx.createLinearGradient(x, y - size * 0.8, x, y + size * 0.2);
    grad.addColorStop(0, colorTop || '#ffe259');
    grad.addColorStop(1, colorBot || '#ffa751');
    this.ctx.fillStyle = grad;
    this.ctx.fillText(text, x, y);

    this.ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.fruitNinjaApp = new FruitNinjaGame();
});
