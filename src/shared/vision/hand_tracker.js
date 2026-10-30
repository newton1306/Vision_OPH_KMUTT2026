// Offline Hand Tracker & Shape Recognizer using local MediaPipe Tasks Vision
// Powered by WebGL GPU Acceleration & Synchronous per-frame detection

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index finger
  [5, 9], [9, 10], [10, 11], [11, 12],    // Middle finger
  [9, 13], [13, 14], [14, 15], [15, 16],  // Ring finger
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky & Palm base
];

class HandTracker {
  constructor(options = {}) {
    this.videoElement = options.videoElement || null;
    this.mediapipePath = options.mediapipePath || '../shared/libs/mediapipe/';
    this.autoPump = options.autoPump !== undefined ? options.autoPump : false;
    this.numHands = options.numHands || 2;

    this.landmarker = null;
    this.delegate = 'GPU';
    this.isReady = false;
    this.isRunning = false;
    this.lastVideoTime = -1;

    // Detection State
    this.handDetected = false;
    this.allHands = []; // Multi-hand tracking support
    this.lastLandmarks = null; // Mirrored Normalized coordinates [0..1]
    this.fingerCount = -1;
    this.fingerCountHistory = []; // For temporal smoothing
    this.handCenter = { x: 0.5, y: 0.5 };
    this.indexTip = { x: 0.5, y: 0.5 };
    this.thumbTip = { x: 0.5, y: 0.5 };
    this.smoothedIndexTip = null; // EMA smoothed tip
    this.detectedShape = 'None';

    // Pinch Gesture State (Thumb + Index tip pinch to draw)
    this.isPinching = false;
    this.wasPinching = false;
    this.pinchPoint = { x: 0.5, y: 0.5 };

    // Absolute Cinema Gesture State (Two hands raised to clear screen)
    this.cinemaPoseStartTime = 0;
    this.lastCinemaTriggerTime = -99999;
    this.onCinemaGesture = null;

    // Velocity tracking for Index Fingertip
    this.lastTipPos = { x: 0, y: 0, time: 0 };
    this.indexVelocity = 0; // px/sec

    // Drawing buffer for Challenge C (Strictly gated by isDrawingActive)
    this.isDrawingActive = false;
    this.drawingPoints = [];
    this.lastDrawTime = 0;
    this.hasSubmittedShape = false;

    // Video dimensions
    this.videoWidth = 640;
    this.videoHeight = 480;

    // Callbacks
    this.onResultsCallback = null;
    this.onStatusChange = null;
  }

  async init() {
    try {
      const baseUri = typeof window !== 'undefined' && window.location ? window.location.href : 'file:///';
      const resolvedBase = new URL(this.mediapipePath, baseUri).href;
      const basePath = resolvedBase.endsWith('/') ? resolvedBase : resolvedBase + '/';
      const bundleUrl = basePath + 'vision_bundle.mjs';
      const wasmPath = basePath + 'wasm';
      const modelPath = basePath + 'hand_landmarker.task';

      const { FilesetResolver, HandLandmarker } = await import(bundleUrl);
      const vision = await FilesetResolver.forVisionTasks(wasmPath);

      // Attempt GPU acceleration first (WebGL 2.0 ES 3.0)
      try {
        this.delegate = 'GPU';
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: this.numHands,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        console.log('[HandTracker] MediaPipe Tasks-Vision Ready (GPU Accelerated 🚀)');
      } catch (gpuErr) {
        console.warn('[HandTracker] GPU delegate failed. Falling back to CPU:', gpuErr);
        this.delegate = 'CPU';
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: this.numHands,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        console.log('[HandTracker] MediaPipe Tasks-Vision Ready (CPU Fallback)');
      }

      // Pre-warm WebGL shader pipeline and memory buffers before live camera starts
      // This completely eliminates the 250-400ms hitch on first detection
      await this.warmupPipeline();

      this.isReady = true;
      return true;
    } catch (err) {
      console.error('[HandTracker] Failed to initialize MediaPipe HandLandmarker:', err);
      throw err;
    }
  }

  async warmupPipeline() {
    if (!this.landmarker) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 160, 160);

      // Dual-pass warmup forces WebGL driver to compile shaders and allocate textures upfront
      this.landmarker.detectForVideo(canvas, 1);
      this.landmarker.detectForVideo(canvas, 2);

      console.log('[HandTracker] MediaPipe GPU Shaders & Pipeline pre-warmed successfully ⚡');
    } catch (warmErr) {
      console.warn('[HandTracker] Pre-warmup notice (non-fatal):', warmErr);
    }
  }

  async start() {
    if (!this.videoElement) {
      throw new Error('No video element provided.');
    }
    if (!this.landmarker) {
      await this.init();
    }

    this.isRunning = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      this.videoElement.srcObject = stream;

      await new Promise((resolve) => {
        if (this.videoElement.readyState >= 1) {
          resolve();
        } else {
          this.videoElement.onloadedmetadata = () => resolve();
        }
      });

      await this.videoElement.play();
      this.videoWidth = this.videoElement.videoWidth || 640;
      this.videoHeight = this.videoElement.videoHeight || 480;

      console.log('[HandTracker] Camera ready: ' + this.videoWidth + 'x' + this.videoHeight);

      // Start internal pump only if caller does not manage its own animation loop
      if (this.autoPump) {
        this.pumpFrame();
      }
    } catch (err) {
      console.error('[HandTracker] Webcam access error:', err);
      throw err;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.videoElement && this.videoElement.srcObject) {
      const tracks = this.videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
  }

  pumpFrame() {
    if (!this.isRunning) return;

    this.detect();

    if (this.isRunning) {
      requestAnimationFrame(() => this.pumpFrame());
    }
  }

  detect() {
    if (!this.isReady || !this.videoElement || this.videoElement.readyState < 2) {
      return null;
    }

    const currentTime = this.videoElement.currentTime;
    const now = performance.now();
    const isNewVideoTime = (currentTime !== this.lastVideoTime && currentTime > 0);
    const isFallbackElapsed = (now - (this.lastDetectTime || 0)) >= 32; // ~30Hz processing cap for battery/APU efficiency

    if (isNewVideoTime || isFallbackElapsed) {
      this.lastVideoTime = currentTime;
      this.lastDetectTime = now;
      try {
        const results = this.landmarker.detectForVideo(this.videoElement, now);
        this.handleResults(results);
      } catch (err) {
        // MediaPipe monotonic timestamp guard
      }
    }

    return this.getCurrentState();
  }

  handleResults(results) {
    const now = performance.now();

    if (results && results.landmarks && results.landmarks.length > 0) {
      this.handDetected = true;

      // Process all detected hands (supports multi-hand tracking)
      this.allHands = results.landmarks.map(rawLms => {
        const mirrored = rawLms.map(pt => ({
          x: 1.0 - pt.x,
          y: pt.y,
          z: pt.z
        }));
        const ext = this.calculateFingerExtensions(mirrored);
        const palmIndices = [0, 5, 9, 13, 17];
        let cx = 0, cy = 0;
        palmIndices.forEach(idx => {
          cx += mirrored[idx].x;
          cy += mirrored[idx].y;
        });
        return {
          landmarks: mirrored,
          fingerCount: ext.count,
          center: { x: cx / 5, y: cy / 5 },
          thumbTip: mirrored[4],
          indexTip: mirrored[8]
        };
      });

      // Primary active hand is hand 0
      this.lastLandmarks = this.allHands[0].landmarks;

      // Index fingertip (landmark 8)
      const rawIndexTip = this.lastLandmarks[8];

      // Adaptive Dual-Rate Filtering for Index Tip:
      // High speed swipe -> alpha 0.88 (instantaneous 0-lag response)
      // Slow movement / hover -> alpha 0.35 (rock-solid, zero jitter)
      if (this.smoothedIndexTip) {
        const moveDist = Math.hypot(
          (rawIndexTip.x - this.smoothedIndexTip.x) * this.videoWidth,
          (rawIndexTip.y - this.smoothedIndexTip.y) * this.videoHeight
        );
        const alpha = Math.min(0.88, Math.max(0.35, moveDist / 18));
        this.smoothedIndexTip = {
          x: this.smoothedIndexTip.x * (1 - alpha) + rawIndexTip.x * alpha,
          y: this.smoothedIndexTip.y * (1 - alpha) + rawIndexTip.y * alpha
        };
      } else {
        this.smoothedIndexTip = { x: rawIndexTip.x, y: rawIndexTip.y };
      }
      this.indexTip = this.smoothedIndexTip;

      // Calculate instantaneous velocity of index fingertip
      if (this.lastTipPos.time > 0) {
        const dt = (now - this.lastTipPos.time) / 1000;
        if (dt > 0.005 && dt < 0.3) {
          const dx = (this.indexTip.x - this.lastTipPos.x) * this.videoWidth;
          const dy = (this.indexTip.y - this.lastTipPos.y) * this.videoHeight;
          const dist = Math.hypot(dx, dy);
          const instVel = dist / dt;
          this.indexVelocity = this.indexVelocity * 0.4 + instVel * 0.6;
        }
      }
      this.lastTipPos = { x: this.indexTip.x, y: this.indexTip.y, time: now };

      // Thumb tip (landmark 4) & Palm Center
      this.thumbTip = this.lastLandmarks[4];
      this.handCenter = this.allHands[0].center;

      // Rotation-invariant Euclidean finger counting (smoothed for primary hand)
      this.fingerCount = this.smoothFingerCount(this.allHands[0].fingerCount);

      // --- PINCH GESTURE DETECTION (Thumb tip 4 touches Index tip 8) ---
      const thumbPt = this.lastLandmarks[4];
      const indexPt = this.lastLandmarks[8];
      const wristPt = this.lastLandmarks[0];
      const indexMcp = this.lastLandmarks[5];

      const pinchDist = Math.hypot(thumbPt.x - indexPt.x, thumbPt.y - indexPt.y);
      const handScale = Math.hypot(wristPt.x - indexMcp.x, wristPt.y - indexMcp.y) || 0.2;
      const pinchRatio = pinchDist / handScale;

      // Hysteresis threshold to prevent flickering at pinch threshold
      if (!this.isPinching) {
        if (pinchDist < 0.058 || pinchRatio < 0.32) {
          this.isPinching = true;
        }
      } else {
        if (pinchDist > 0.078 && pinchRatio > 0.42) {
          this.isPinching = false;
        }
      }

      this.pinchPoint = {
        x: (thumbPt.x + indexPt.x) / 2,
        y: (thumbPt.y + indexPt.y) / 2
      };

      // --- ABSOLUTE CINEMA GESTURE (TWO HANDS RAISED WITH OPEN PALMS TO CLEAR SCREEN) ---
      // Strictly gated to active drawing mode so it never interferes with other challenges
      const isCinemaPose = this.isDrawingActive && (
        this.allHands.length >= 2 &&
        this.allHands[0].fingerCount >= 4 &&
        this.allHands[1].fingerCount >= 4 &&
        this.allHands[0].landmarks[8].y < this.allHands[0].landmarks[0].y &&
        this.allHands[1].landmarks[8].y < this.allHands[1].landmarks[0].y &&
        Math.abs(this.allHands[0].center.x - this.allHands[1].center.x) > 0.12
      );

      if (isCinemaPose) {
        if (!this.cinemaPoseStartTime) {
          this.cinemaPoseStartTime = now;
        } else if (now - this.cinemaPoseStartTime > 260) { // held for ~260ms
          if (now - (this.lastCinemaTriggerTime || 0) > 1500) { // 1.5s cooldown
            this.lastCinemaTriggerTime = now;
            this.clearDrawing();
            if (this.onCinemaGesture) {
              this.onCinemaGesture();
            }
          }
        }
      } else {
        this.cinemaPoseStartTime = 0;
      }

      // Update drawing trail (strictly gated by isDrawingActive and isPinching)
      this.updateDrawingTrail();
    } else {
      this.handDetected = false;
      this.allHands = [];
      this.lastLandmarks = null;
      this.fingerCount = -1;
      this.fingerCountHistory = [];
      this.indexVelocity = 0;
      this.smoothedIndexTip = null;
      this.lastTipPos.time = 0;
      this.isPinching = false;
      this.wasPinching = false;
      this.cinemaPoseStartTime = 0;
    }

    if (this.onResultsCallback) {
      this.onResultsCallback(this.getCurrentState());
    }
  }

  getCurrentState() {
    return {
      handDetected: this.handDetected,
      allHands: this.allHands,
      landmarks: this.lastLandmarks,
      indexTip: this.indexTip,
      thumbTip: this.thumbTip,
      pinchPoint: this.pinchPoint,
      isPinching: this.isPinching,
      handCenter: this.handCenter,
      fingerCount: this.fingerCount,
      indexVelocity: this.indexVelocity,
      detectedShape: this.detectedShape,
      drawingPoints: this.drawingPoints,
      videoWidth: this.videoWidth,
      videoHeight: this.videoHeight
    };
  }

  calculateFingerExtensions(pts) {
    const wrist = pts[0];
    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // Thumb extension detection (Dual-vector: outward abduction + joint unfolding)
    // Solves upright hand false negative where thumb pointed upward failed overly strict 1.15x threshold
    const thumbTipToPinky = dist(pts[4], pts[17]);
    const thumbIpToPinky = dist(pts[3], pts[17]);
    const thumbTipToIndex = dist(pts[4], pts[5]);
    const thumbMcpToIndex = dist(pts[2], pts[5]);
    const thumbTipToMcp = dist(pts[4], pts[2]);
    const thumbIpToMcp = dist(pts[3], pts[2]);

    const isAbductedFromPinky = thumbTipToPinky > thumbIpToPinky * 1.04;
    const isAwayFromIndex = thumbTipToIndex > thumbMcpToIndex * 0.85;
    const isStraightThumb = thumbTipToMcp > thumbIpToMcp * 1.25;

    const thumbExtended = (isAbductedFromPinky && isAwayFromIndex) || (isStraightThumb && isAwayFromIndex);

    // 4 Finger extensions (Index, Middle, Ring, Pinky)
    // Tip distance to wrist vs PIP joint distance to wrist with natural anatomical tolerance (1.04)
    const indexExtended = dist(pts[8], wrist) > dist(pts[6], wrist) * 1.04;
    const middleExtended = dist(pts[12], wrist) > dist(pts[10], wrist) * 1.04;
    const ringExtended = dist(pts[16], wrist) > dist(pts[14], wrist) * 1.04;
    const pinkyExtended = dist(pts[20], wrist) > dist(pts[18], wrist) * 1.04;

    const count = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

    return {
      thumb: thumbExtended,
      index: indexExtended,
      middle: middleExtended,
      ring: ringExtended,
      pinky: pinkyExtended,
      count
    };
  }

  smoothFingerCount(currentCount) {
    this.fingerCountHistory.push(currentCount);
    if (this.fingerCountHistory.length > 5) {
      this.fingerCountHistory.shift();
    }

    const counts = {};
    let maxFreq = 0;
    let modeVal = currentCount;

    for (const val of this.fingerCountHistory) {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxFreq) {
        maxFreq = counts[val];
        modeVal = val;
      }
    }

    return modeVal;
  }

  toCanvasCoords(normX, normY, canvasWidth, canvasHeight) {
    const vw = this.videoWidth || 640;
    const vh = this.videoHeight || 480;
    const scale = Math.max(canvasWidth / vw, canvasHeight / vh);
    const renderW = vw * scale;
    const renderH = vh * scale;
    const offsetX = (canvasWidth - renderW) / 2;
    const offsetY = (canvasHeight - renderH) / 2;

    return {
      x: offsetX + normX * renderW,
      y: offsetY + normY * renderH
    };
  }

  drawVideoBackground(ctx, canvasWidth, canvasHeight, opacity = 1.0) {
    if (!this.videoElement || this.videoElement.readyState < 2) return;

    const vw = this.videoWidth || 640;
    const vh = this.videoHeight || 480;
    const scale = Math.max(canvasWidth / vw, canvasHeight / vh);
    const renderW = vw * scale;
    const renderH = vh * scale;
    const offsetX = (canvasWidth - renderW) / 2;
    const offsetY = (canvasHeight - renderH) / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(canvasWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.videoElement, offsetX, offsetY, renderW, renderH);
    ctx.restore();
  }

  drawSkeleton(ctx, canvasWidth, canvasHeight) {
    if (!this.handDetected) return;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.lineCap = 'round';

    // Draw skeleton for all detected hands (supports multi-hand & Absolute Cinema gesture)
    const handsToDraw = (this.allHands && this.allHands.length > 0)
      ? this.allHands
      : [{ landmarks: this.lastLandmarks, center: this.handCenter }];

    handsToDraw.forEach((hand, handIdx) => {
      if (!hand.landmarks) return;
      const pts = hand.landmarks.map(pt => this.toCanvasCoords(pt.x, pt.y, canvasWidth, canvasHeight));

      // Bone connections
      for (const [start, end] of HAND_CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(pts[start].x, pts[start].y);
        ctx.lineTo(pts[end].x, pts[end].y);
        ctx.stroke();
      }

      // Joint landmarks
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        const isTip = [4, 8, 12, 16, 20].includes(i);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isTip ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? '#ff007f' : '#ffffff';
        ctx.shadowColor = isTip ? '#ff007f' : '#00e5ff';
        ctx.shadowBlur = isTip ? 12 : 6;
        ctx.fill();
      }

      // Palm center
      const palmPt = this.toCanvasCoords(hand.center.x, hand.center.y, canvasWidth, canvasHeight);
      ctx.beginPath();
      ctx.arc(palmPt.x, palmPt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = handIdx === 0 ? '#ffaa00' : '#38bdf8';
      ctx.shadowColor = handIdx === 0 ? '#ffaa00' : '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
    });

    // Special Visual Cue for Pinch Gesture on primary hand:
    if (this.isDrawingActive && this.isPinching && this.pinchPoint) {
      const p = this.toCanvasCoords(this.pinchPoint.x, this.pinchPoint.y, canvasWidth, canvasHeight);
      // Glowing outer halo indicating pen is active
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.fill();

      // Sharp golden drawing core
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();
    } else if (this.isDrawingActive && this.indexTip) {
      // Subtle reticle when hovering / pen lifted (pinch to draw)
      const p = this.toCanvasCoords(this.indexTip.x, this.indexTip.y, canvasWidth, canvasHeight);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  updateDrawingTrail() {
    if (!this.isDrawingActive) return;

    if (this.lastLandmarks) {
      // If student previously submitted a prediction and now starts drawing a new shape, clear previous points
      if (this.hasSubmittedShape) {
        this.drawingPoints = [];
        this.detectedShape = 'None';
        this.hasSubmittedShape = false;
        this.wasPinching = false;
      }

      // ONLY DRAW WHEN PINCH GESTURE IS ACTIVE!
      if (this.isPinching) {
        const isNewStroke = !this.wasPinching;
        const pt = { 
          x: this.pinchPoint.x, 
          y: this.pinchPoint.y, 
          t: Date.now(),
          isNewStroke: isNewStroke
        };
        this.drawingPoints.push(pt);

        if (this.drawingPoints.length > 500) {
          this.drawingPoints.shift();
        }

        this.lastDrawTime = Date.now();
      }
      this.wasPinching = this.isPinching;
    }
  }

  clearDrawing() {
    this.drawingPoints = [];
    this.detectedShape = 'None';
    this.hasSubmittedShape = false;
    this.wasPinching = false;
  }

  submitDrawing() {
    this.hasSubmittedShape = true;
    if (this.drawingPoints.length < 15) {
      this.detectedShape = 'None';
      return 'None';
    }
    this.detectShape();
    return this.detectedShape;
  }

  resamplePoints(points, n = 64) {
    if (!points || points.length === 0) return [];
    let totalLen = 0;
    for (let i = 1; i < points.length; i++) {
      totalLen += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    if (totalLen <= 0.0001) return points.slice();

    const interval = totalLen / (n - 1);
    let D = 0;
    const newPoints = [{ x: points[0].x, y: points[0].y }];
    let i = 1;
    let curr = { x: points[0].x, y: points[0].y };

    while (i < points.length) {
      const next = points[i];
      const d = Math.hypot(next.x - curr.x, next.y - curr.y);
      if (D + d >= interval) {
        const qx = curr.x + ((interval - D) / d) * (next.x - curr.x);
        const qy = curr.y + ((interval - D) / d) * (next.y - curr.y);
        const q = { x: qx, y: qy };
        newPoints.push(q);
        curr = q;
        D = 0;
      } else {
        D += d;
        curr = next;
        i++;
      }
    }
    while (newPoints.length < n) {
      newPoints.push({ x: points[points.length - 1].x, y: points[points.length - 1].y });
    }
    return newPoints;
  }

  detectShape() {
    if (!this.drawingPoints || this.drawingPoints.length < 15) {
      this.detectedShape = 'None';
      return;
    }

    const rawPoints = this.drawingPoints;
    const pts = this.resamplePoints(rawPoints, 64);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const w = maxX - minX;
    const h = maxY - minY;
    if (w < 0.05 || h < 0.05) {
      this.detectedShape = 'None';
      return;
    }

    const boxArea = w * h;

    // Shoelace formula for polygon area and perimeter
    let signedArea = 0;
    let perimeter = 0;
    const N = pts.length;
    for (let i = 0; i < N; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % N];
      signedArea += (p1.x * p2.y - p2.x * p1.y);
      perimeter += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
    const polyArea = Math.abs(signedArea) / 2;
    const fillRatio = polyArea / (boxArea || 1);
    const circularity = (4 * Math.PI * polyArea) / (perimeter * perimeter || 1);

    // Centroid and radial variance
    let cx = 0, cy = 0;
    for (const p of pts) {
      cx += p.x;
      cy += p.y;
    }
    cx /= N;
    cy /= N;

    const radii = pts.map(p => Math.hypot(p.x - cx, p.y - cy));
    const meanRadius = radii.reduce((a, b) => a + b, 0) / N;
    let radiusVariance = 0;
    for (const r of radii) {
      radiusVariance += (r - meanRadius) ** 2;
    }
    const cvRadius = Math.sqrt(radiusVariance / N) / (meanRadius || 1);

    // High-Precision Geometric Decision Tree
    // 1. Triangle: Area Fill Ratio <= 0.62 (any triangle inside a bounding box has area <= 0.50-0.58)
    if (fillRatio <= 0.62) {
      this.detectedShape = 'Triangle';
      return;
    }

    // 2. Square: Area Fill Ratio >= 0.83 (fills almost the entire bounding box)
    if (fillRatio >= 0.83) {
      this.detectedShape = 'Square';
      return;
    }

    // 3. Circle vs Square in intermediate range (0.62 < fillRatio < 0.83):
    // Circle is centered around pi/4 = 0.785, with high circularity (> 0.68) and very low radial variance
    if (cvRadius < 0.15 && circularity > 0.68) {
      this.detectedShape = 'Circle';
      return;
    }

    if (fillRatio > 0.75) {
      this.detectedShape = 'Square';
    } else {
      this.detectedShape = 'Circle';
    }
  }
}

if (typeof window !== 'undefined') {
  window.HandTracker = HandTracker;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HandTracker;
}
