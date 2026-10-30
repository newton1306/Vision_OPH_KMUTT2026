// High-performance procedural Canvas sprite generator for Fruit Ninja & CV Workshop
// Hyper-realistic 3D fruit models, sliced cross-sections, and animated VFX

const SpriteRenderer = {
  // Draw whole fruit with 3D depth and specular lighting
  drawFruit(ctx, type, x, y, size = 60, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    switch (type) {
      case 'watermelon':
        this.drawWatermelon(ctx, size);
        break;
      case 'apple':
        this.drawApple(ctx, size);
        break;
      case 'orange':
        this.drawOrange(ctx, size);
        break;
      case 'banana':
        this.drawBanana(ctx, size);
        break;
      case 'strawberry':
        this.drawStrawberry(ctx, size);
        break;
      case 'bomb':
        this.drawBomb(ctx, size);
        break;
      default:
        this.drawWatermelon(ctx, size);
    }
    ctx.restore();
  },

  // Draw sliced fruit halves with realistic exposed pulp, pith, seeds, and rinds
  drawFruitHalf(ctx, type, x, y, size = 60, rotation = 0, side = 'left') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    if (side === 'left' || side === -1) {
      ctx.rect(-size * 1.5, -size * 1.5, size * 1.5, size * 3);
    } else {
      ctx.rect(0, -size * 1.5, size * 1.5, size * 3);
    }
    ctx.clip();

    switch (type) {
      case 'watermelon':
        this.drawWatermelonSlice(ctx, size);
        break;
      case 'apple':
        this.drawAppleSlice(ctx, size);
        break;
      case 'orange':
        this.drawOrangeSlice(ctx, size);
        break;
      case 'banana':
        this.drawBananaSlice(ctx, size);
        break;
      case 'strawberry':
        this.drawStrawberrySlice(ctx, size);
        break;
      default:
        this.drawWatermelonSlice(ctx, size);
    }
    ctx.restore();
  },

  // 1. Hyper-Realistic 3D Watermelon
  drawWatermelon(ctx, r) {
    const rad = r * 0.52;

    // 3D Spherical shading gradient
    const grad = ctx.createRadialGradient(-rad * 0.32, -rad * 0.32, rad * 0.1, 0, 0, rad);
    grad.addColorStop(0, '#2ec4b6');
    grad.addColorStop(0.35, '#1e824c');
    grad.addColorStop(0.75, '#145a32');
    grad.addColorStop(1, '#0b3c1d');

    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Organic wavy dark stripes
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = '#0a2f16';
    ctx.lineWidth = rad * 0.16;
    ctx.lineCap = 'round';

    for (let offset = -rad * 0.85; offset <= rad * 0.85; offset += rad * 0.35) {
      ctx.beginPath();
      ctx.moveTo(offset, -rad);
      ctx.bezierCurveTo(
        offset + rad * 0.25, -rad * 0.3,
        offset - rad * 0.2, rad * 0.3,
        offset + rad * 0.1, rad
      );
      ctx.stroke();
    }

    // Specular curved highlight glint
    ctx.beginPath();
    ctx.ellipse(-rad * 0.35, -rad * 0.35, rad * 0.35, rad * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.fill();
    ctx.restore();
  },

  // Sliced Watermelon Half (Rich red pulp, white rind, black seeds)
  drawWatermelonSlice(ctx, r) {
    const rad = r * 0.52;

    // Outer dark green rind
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = '#145a32';
    ctx.fill();

    // Pale green / white inner rind
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.93, 0, Math.PI * 2);
    ctx.fillStyle = '#e8f8f5';
    ctx.fill();

    // Rich juicy crimson red flesh
    const fleshGrad = ctx.createRadialGradient(0, 0, rad * 0.1, 0, 0, rad * 0.86);
    fleshGrad.addColorStop(0, '#ff3366');
    fleshGrad.addColorStop(0.7, '#e60039');
    fleshGrad.addColorStop(1, '#c70030');

    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.86, 0, Math.PI * 2);
    ctx.fillStyle = fleshGrad;
    ctx.fill();

    // Teardrop black seeds with shine highlights
    ctx.fillStyle = '#1a1a1a';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3.5) {
      const sx = Math.cos(a) * (rad * 0.55);
      const sy = Math.sin(a) * (rad * 0.55);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 3, 5, a + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();

      // Seed highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(sx - 1, sy - 1.5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
    }
  },

  // 2. Hyper-Realistic 3D Red Apple
  drawApple(ctx, r) {
    const rad = r * 0.48;

    // Curved indented apple silhouette
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -rad * 0.7);
    ctx.bezierCurveTo(rad * 0.55, -rad * 1.1, rad * 1.15, -rad * 0.2, rad * 0.85, rad * 0.85);
    ctx.bezierCurveTo(rad * 0.6, rad * 1.1, 0, rad * 0.8, 0, rad * 0.8);
    ctx.bezierCurveTo(0, rad * 0.8, -rad * 0.6, rad * 1.1, -rad * 0.85, rad * 0.85);
    ctx.bezierCurveTo(-rad * 1.15, -rad * 0.2, -rad * 0.55, -rad * 1.1, 0, -rad * 0.7);
    ctx.closePath();

    // 3D Radial lighting gradient
    const appleGrad = ctx.createRadialGradient(-rad * 0.35, -rad * 0.35, rad * 0.1, 0, 0, rad * 1.2);
    appleGrad.addColorStop(0, '#ff6b81');
    appleGrad.addColorStop(0.3, '#ee5253');
    appleGrad.addColorStop(0.75, '#c0392b');
    appleGrad.addColorStop(1, '#67000d');

    ctx.fillStyle = appleGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Specular glossy glint
    ctx.beginPath();
    ctx.ellipse(-rad * 0.38, -rad * 0.35, rad * 0.28, rad * 0.14, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // Wooden Stem
    ctx.beginPath();
    ctx.moveTo(0, -rad * 0.7);
    ctx.bezierCurveTo(rad * 0.1, -rad * 1.2, rad * 0.25, -rad * 1.35, rad * 0.3, -rad * 1.45);
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Green Leaf
    ctx.beginPath();
    ctx.moveTo(rad * 0.1, -rad * 1.15);
    ctx.bezierCurveTo(rad * 0.55, -rad * 1.3, rad * 0.65, -rad * 0.95, rad * 0.1, -rad * 1.15);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();
    ctx.restore();
  },

  // Sliced Apple Half (Creamy interior, core & brown seeds)
  drawAppleSlice(ctx, r) {
    const rad = r * 0.48;

    // Red skin outline
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = '#c0392b';
    ctx.fill();

    // Creamy white/yellow flesh
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf0';
    ctx.fill();

    // Star-like core
    ctx.strokeStyle = '#ecdcb9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.32, 0, Math.PI * 2);
    ctx.stroke();

    // Brown seeds
    ctx.fillStyle = '#4e2d14';
    ctx.beginPath();
    ctx.ellipse(-rad * 0.12, 0, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(rad * 0.12, 0, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  },

  // 3. Hyper-Realistic 3D Orange
  drawOrange(ctx, r) {
    const rad = r * 0.48;

    // 3D Spherical shading
    const grad = ctx.createRadialGradient(-rad * 0.35, -rad * 0.35, rad * 0.1, 0, 0, rad);
    grad.addColorStop(0, '#ffa726');
    grad.addColorStop(0.4, '#ff9100');
    grad.addColorStop(0.8, '#ff6d00');
    grad.addColorStop(1, '#b23c00');

    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dimpled peel texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * (rad * 0.75);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stem calyx star
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(0, -rad * 0.85, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Specular glint
    ctx.beginPath();
    ctx.arc(-rad * 0.35, -rad * 0.35, rad * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();
  },

  // Sliced Orange Half (Peel, white pith, radiating segments)
  drawOrangeSlice(ctx, r) {
    const rad = r * 0.48;

    // Vibrant outer rind
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6d00';
    ctx.fill();

    // White spongy pith
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8e7';
    ctx.fill();

    // Center circular hub
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#fff8e7';
    ctx.fill();

    // Radiating triangular pulp segments
    const segments = 9;
    ctx.fillStyle = '#ffa000';
    for (let i = 0; i < segments; i++) {
      const a1 = (i * 2 * Math.PI) / segments + 0.08;
      const a2 = ((i + 1) * 2 * Math.PI) / segments - 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, rad * 0.84, a1, a2);
      ctx.lineTo(Math.cos(a2) * (rad * 0.16), Math.sin(a2) * (rad * 0.16));
      ctx.arc(0, 0, rad * 0.16, a2, a1, true);
      ctx.closePath();
      ctx.fill();
    }
  },

  // 4. Hyper-Realistic 3D Banana
  drawBanana(ctx, r) {
    const rad = r * 0.52;

    ctx.save();
    // Curved crescent peel
    ctx.beginPath();
    ctx.arc(0, rad * 0.65, rad * 1.25, Math.PI * 1.15, Math.PI * 1.85);
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = rad * 0.46;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner ridge contour
    ctx.beginPath();
    ctx.arc(0, rad * 0.65, rad * 1.25, Math.PI * 1.2, Math.PI * 1.8);
    ctx.strokeStyle = '#ffee55';
    ctx.lineWidth = rad * 0.22;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Stem and tips (Green & brown)
    ctx.strokeStyle = '#689f38';
    ctx.lineWidth = rad * 0.42;
    ctx.stroke();
    ctx.restore();
  },

  // Sliced Banana Half
  drawBananaSlice(ctx, r) {
    const rad = r * 0.44;

    // Yellow peel
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd600';
    ctx.fill();

    // Creamy white pulp
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = '#fffde7';
    ctx.fill();

    // 3 central tiny seed specs
    ctx.fillStyle = '#795548';
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (rad * 0.2), Math.sin(a) * (rad * 0.2), 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // 5. Hyper-Realistic 3D Strawberry
  drawStrawberry(ctx, r) {
    const rad = r * 0.46;

    // Plump heart/tapered berry silhouette
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, rad * 1.05);
    ctx.bezierCurveTo(rad * 0.8, rad * 0.6, rad * 1.05, -rad * 0.4, rad * 0.55, -rad * 0.8);
    ctx.bezierCurveTo(0, -rad * 0.65, 0, -rad * 0.65, -rad * 0.55, -rad * 0.8);
    ctx.bezierCurveTo(-rad * 1.05, -rad * 0.4, -rad * 0.8, rad * 0.6, 0, rad * 1.05);
    ctx.closePath();

    const berryGrad = ctx.createRadialGradient(-rad * 0.3, -rad * 0.3, rad * 0.1, 0, 0, rad * 1.1);
    berryGrad.addColorStop(0, '#ff4757');
    berryGrad.addColorStop(0.5, '#ee1133');
    berryGrad.addColorStop(1, '#8b0000');

    ctx.fillStyle = berryGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Yellow seeds (achenes)
    ctx.fillStyle = '#ffeaa7';
    const seedGrid = [
      [-rad * 0.4, -rad * 0.3], [0, -rad * 0.4], [rad * 0.4, -rad * 0.3],
      [-rad * 0.5, 0], [-rad * 0.18, -rad * 0.05], [rad * 0.18, -rad * 0.05], [rad * 0.5, 0],
      [-rad * 0.3, rad * 0.3], [0, rad * 0.25], [rad * 0.3, rad * 0.3],
      [-rad * 0.15, rad * 0.6], [rad * 0.15, rad * 0.6],
      [0, rad * 0.85]
    ];
    seedGrid.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 1.5, 2.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Green leafy crown (Calyx)
    ctx.fillStyle = '#2ed573';
    for (let a = -Math.PI * 0.8; a <= -Math.PI * 0.2; a += Math.PI * 0.15) {
      ctx.beginPath();
      ctx.moveTo(0, -rad * 0.7);
      ctx.lineTo(Math.cos(a) * (rad * 0.8), Math.sin(a) * (rad * 0.8));
      ctx.lineTo(Math.cos(a + 0.08) * (rad * 0.4), Math.sin(a + 0.08) * (rad * 0.4));
      ctx.fill();
    }
    ctx.restore();
  },

  // Sliced Strawberry Half
  drawStrawberrySlice(ctx, r) {
    const rad = r * 0.46;

    // Red outer edge
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = '#ee1133';
    ctx.fill();

    // Pink/white marbled core
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.86, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb8c6';
    ctx.fill();

    // White ray bursts
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * (rad * 0.6), Math.sin(a) * (rad * 0.6));
      ctx.stroke();
    }
  },

  // 6. Hyper-Realistic 3D Cast-Iron Bomb with Sizzling Spark Fuse
  drawBomb(ctx, r) {
    const rad = r * 0.48;

    // Heavy iron sphere gradient
    const bombGrad = ctx.createRadialGradient(-rad * 0.35, -rad * 0.35, rad * 0.1, 0, 0, rad * 1.05);
    bombGrad.addColorStop(0, '#4b5563');
    bombGrad.addColorStop(0.4, '#1f2937');
    bombGrad.addColorStop(0.85, '#111827');
    bombGrad.addColorStop(1, '#030712');

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = bombGrad;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.45)';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Brass neck collar
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-rad * 0.2, -rad * 1.12, rad * 0.4, rad * 0.22);

    // Glowing skull / hazard mark
    ctx.font = `bold ${Math.round(rad * 0.8)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💣', 0, 2);

    // Curved rope fuse
    ctx.beginPath();
    ctx.moveTo(0, -rad * 1.12);
    ctx.bezierCurveTo(rad * 0.4, -rad * 1.45, rad * 0.15, -rad * 1.7, rad * 0.55, -rad * 1.95);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Sizzling Sparks (Animated with Date.now)
    const t = Date.now() * 0.015;
    const sparkX = rad * 0.55;
    const sparkY = -rad * 1.95;

    // Bright spark glow
    const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 1, sparkX, sparkY, 16);
    sparkGrad.addColorStop(0, '#ffffff');
    sparkGrad.addColorStop(0.3, '#facc15');
    sparkGrad.addColorStop(0.7, '#f97316');
    sparkGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    ctx.fillStyle = sparkGrad;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Spark projectile stars
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + t;
      const len = 7 + Math.sin(t * 3 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(sparkX, sparkY);
      ctx.lineTo(sparkX + Math.cos(a) * len, sparkY + Math.sin(a) * len);
      ctx.stroke();
    }

    ctx.restore();
  },

  // Workshop AR effects: Epic Iron Man Mark 85 Palm Repulsor & Arc Reactor Core
  drawWorkshopSprite(ctx, name, x, y, size = 110, extra = {}) {
    if (extra && extra.landmarks && extra.landmarks.length >= 21) {
      this.drawEpicPalmRepulsor(ctx, extra.landmarks, extra.target || 'palm');
    } else {
      this.drawEpicPalmRepulsor(ctx, null, 'palm', x, y, size);
    }
  },

  drawIronManGauntlet(ctx, pts, progress = 1.0, target = 'palm') {
    this.drawEpicPalmRepulsor(ctx, pts, target);
  },

  // Procedural Fractal Lightning Bolt
  drawLightningBolt(ctx, x1, y1, x2, y2, segments = 5, jitter = 12) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;

    for (let i = 1; i < segments; i++) {
      const frac = i / segments;
      const j = (Math.random() - 0.5) * jitter * (1 - Math.abs(frac - 0.5) * 0.8);
      const px = x1 + dx * frac + nx * j;
      const py = y1 + dy * frac + ny * j;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x2, y2);

    // Outer cyan glow
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Inner bright diamond-white beam
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.shadowBlur = 4;
    ctx.stroke();

    ctx.restore();
  },

  // Epic Iron Man Mark 85 Palm Repulsor & Arc Reactor Core (Ultra High-Tech 2D FX)
  drawEpicPalmRepulsor(ctx, pts, target = 'palm', fallbackX = null, fallbackY = null, customSize = 110) {
    const now = performance.now();
    const t = now * 0.003;

    let posX = fallbackX !== null ? fallbackX : 320;
    let posY = fallbackY !== null ? fallbackY : 240;
    let handScale = 85;
    let angle = 0;
    let hasFullHand = false;
    let tips = [];

    if (pts && pts.length >= 21) {
      hasFullHand = true;
      const wrist = pts[0];
      const indexMcp = pts[5];
      const midMcp = pts[9];
      const ringMcp = pts[13];
      const pinkyMcp = pts[17];

      // Exact anatomical centroid of palm
      const palmX = (wrist.x + indexMcp.x + midMcp.x + ringMcp.x + pinkyMcp.x) / 5;
      const palmY = (wrist.y + indexMcp.y + midMcp.y + ringMcp.y + pinkyMcp.y) / 5;

      const dx = midMcp.x - wrist.x;
      const dy = midMcp.y - wrist.y;
      handScale = Math.max(50, Math.hypot(dx, dy));
      angle = Math.atan2(dy, dx) + Math.PI / 2;

      tips = [pts[4], pts[8], pts[12], pts[16], pts[20]]; // 5 fingertips

      const targetMap = {
        palm:   { x: palmX,    y: palmY,    scale: 1.0 },
        thumb:  { x: pts[4].x,  y: pts[4].y,  scale: 0.55 },
        index:  { x: pts[8].x,  y: pts[8].y,  scale: 0.55 },
        middle: { x: pts[12].x, y: pts[12].y, scale: 0.55 },
        ring:   { x: pts[16].x, y: pts[16].y, scale: 0.55 },
        pinky:  { x: pts[20].x, y: pts[20].y, scale: 0.48 }
      };

      const info = targetMap[target] || targetMap.palm;
      posX = info.x;
      posY = info.y;
      handScale *= info.scale;
    } else if (fallbackX !== null && fallbackY !== null) {
      posX = fallbackX;
      posY = fallbackY;
      handScale = customSize * 0.8;
    }

    const r = handScale * 0.58;

    ctx.save();

    // =========================================================================
    // LAYER 1: Dynamic High-Voltage Lightning Arcs from Core to all 5 Fingertips (when on Palm)
    // =========================================================================
    if (hasFullHand && target === 'palm' && tips.length === 5) {
      tips.forEach((tip) => {
        this.drawLightningBolt(ctx, posX, posY, tip.x, tip.y, 6, r * 0.35);
        // Fingertip plasma diode spark
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    ctx.translate(posX, posY);
    ctx.rotate(angle);

    // =========================================================================
    // LAYER 2: Triple Expanding Plasma Shockwaves
    // =========================================================================
    const shockwaveCount = 3;
    for (let s = 0; s < shockwaveCount; s++) {
      const offset = s / shockwaveCount;
      const phase = ((now * 0.0012 + offset) % 1.0);
      const shockR = r * 0.35 + phase * r * 2.1;
      const shockAlpha = Math.pow(1 - phase, 1.8) * 0.85;

      ctx.save();
      ctx.strokeStyle = `rgba(0, 240, 255, ${shockAlpha})`;
      ctx.lineWidth = 2.5 * (1 - phase * 0.5);
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14 * (1 - phase);
      ctx.beginPath();
      ctx.arc(0, 0, shockR, 0, Math.PI * 2);
      ctx.stroke();

      // Outer secondary ripple
      ctx.strokeStyle = `rgba(56, 189, 248, ${shockAlpha * 0.5})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, shockR * 1.08, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // LAYER 3: Holographic HUD Targeting Reticle & Brackets
    // =========================================================================
    ctx.save();
    const hudR = r * 1.35;
    const bLen = r * 0.38;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    const corners = [
      { x: -hudR, y: -hudR, dx: 1, dy: 1 },
      { x: hudR, y: -hudR, dx: -1, dy: 1 },
      { x: hudR, y: hudR, dx: -1, dy: -1 },
      { x: -hudR, y: hudR, dx: 1, dy: -1 }
    ];

    corners.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(c.x + c.dx * bLen, c.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x, c.y + c.dy * bLen);
      ctx.stroke();
    });

    // Circular dial ticks every 15 degrees
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = (deg % 45 === 0);
      const inner = hudR * (isMajor ? 0.90 : 0.95);
      const outer = hudR * 1.0;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * inner, Math.sin(rad) * inner);
      ctx.lineTo(Math.cos(rad) * outer, Math.sin(rad) * outer);
      ctx.stroke();
    }

    // Telemetry text
    ctx.font = "800 10px 'Segoe UI', monospace";
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.fillText('⚡ MARK-85 REPULSOR', 0, -hudR - 10);
    ctx.font = "700 8px 'Segoe UI', monospace";
    ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.fillText('OUTPUT: 100% MAXIMUM // ARMED', 0, hudR + 18);
    ctx.restore();

    // =========================================================================
    // LAYER 4: Counter-Rotating Magnetic Containment Rings
    // =========================================================================
    ctx.save();
    ctx.rotate(t * 1.6);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.8;
    ctx.setLineDash([16, 12]);
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(-t * 3.2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(t * 4.8);
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // =========================================================================
    // LAYER 5: Titanium & Gold Nano-Iris Turbine Blades (8 Aperture Blades)
    // =========================================================================
    ctx.save();
    ctx.rotate(t * 0.75);
    const bladeCount = 8;
    for (let b = 0; b < bladeCount; b++) {
      const bAngle = (b * Math.PI * 2) / bladeCount;
      ctx.save();
      ctx.rotate(bAngle);

      const bladeGrad = ctx.createLinearGradient(0, r * 0.35, 0, r * 0.85);
      bladeGrad.addColorStop(0, '#f59e0b');
      bladeGrad.addColorStop(0.5, '#d97706');
      bladeGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(-r * 0.12, r * 0.40);
      ctx.lineTo(0, r * 0.82);
      ctx.lineTo(r * 0.12, r * 0.40);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.45);
      ctx.lineTo(0, r * 0.75);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // =========================================================================
    // LAYER 6: Inflowing Gravitational Energy Particles (Vortex Swarm)
    // =========================================================================
    ctx.save();
    const particleCount = 16;
    for (let p = 0; p < particleCount; p++) {
      const pOffset = (p / particleCount) * Math.PI * 2;
      const pPhase = ((now * 0.0018 + p * 0.13) % 1.0);
      const pDist = r * 1.6 * (1 - pPhase) + r * 0.15;
      const pSpiralAngle = pOffset + pPhase * Math.PI * 3.5;
      const px = Math.cos(pSpiralAngle) * pDist;
      const py = Math.sin(pSpiralAngle) * pDist;
      const pAlpha = Math.sin(pPhase * Math.PI);

      ctx.fillStyle = `rgba(186, 230, 253, ${pAlpha})`;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 2.5 * pPhase + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // =========================================================================
    // LAYER 7: 8-Point Anamorphic Photon Flare Cross & Starburst
    // =========================================================================
    ctx.save();
    ctx.rotate(-t * 0.9);
    for (let i = 0; i < 4; i++) {
      const sAngle = (i * Math.PI) / 2;
      const spikeLen = r * 1.45 + Math.sin(t * 5 + i) * (r * 0.35);
      ctx.save();
      ctx.rotate(sAngle);

      const flareGrad = ctx.createLinearGradient(0, 0, spikeLen, 0);
      flareGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      flareGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.85)');
      flareGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.moveTo(0, -3.5);
      ctx.lineTo(spikeLen, 0);
      ctx.lineTo(0, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < 4; i++) {
      const sAngle = (i * Math.PI) / 2 + Math.PI / 4;
      const spikeLen = r * 0.95 + Math.cos(t * 4 + i) * (r * 0.22);
      ctx.save();
      ctx.rotate(sAngle);

      const flareGrad = ctx.createLinearGradient(0, 0, spikeLen, 0);
      flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      flareGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.7)');
      flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.moveTo(0, -2.5);
      ctx.lineTo(spikeLen, 0);
      ctx.lineTo(0, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Horizontal Anamorphic Lens Flare Streak
    const streakLen = r * 2.4;
    const streakGrad = ctx.createLinearGradient(-streakLen, 0, streakLen, 0);
    streakGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    streakGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.55)');
    streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    streakGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.55)');
    streakGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

    ctx.fillStyle = streakGrad;
    ctx.fillRect(-streakLen, -2, streakLen * 2, 4);
    ctx.restore();

    // =========================================================================
    // LAYER 8: Superheated Arc Core Reactor (Unison Core Emitter)
    // =========================================================================
    const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 0.75);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    coreGrad.addColorStop(0.20, 'rgba(224, 242, 254, 0.98)');
    coreGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.85)');
    coreGrad.addColorStop(0.75, 'rgba(2, 132, 199, 0.40)');
    coreGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // 1. Naruto Chakra Rasengan (Spiraling Sphere)
  drawRasengan(ctx, x, y, size = 90) {
    const now = performance.now();
    const t = now * 0.005;
    const r = size * 0.52;

    ctx.save();
    ctx.translate(x, y);

    // 1. Outer Swirling Aura Glow
    const auraGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.35);
    auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    auraGrad.addColorStop(0.25, 'rgba(186, 230, 253, 0.85)');
    auraGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.55)');
    auraGrad.addColorStop(0.85, 'rgba(2, 132, 199, 0.2)');
    auraGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

    ctx.fillStyle = auraGrad;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 2. High-speed Rotating Elliptical Orbital Chakra Bands
    const bandAngles = [0.5, 1.8, 2.6, 3.4];
    for (let b = 0; b < bandAngles.length; b++) {
      ctx.save();
      ctx.rotate(bandAngles[b] + t * (b % 2 === 0 ? 3.5 : -4.2));
      ctx.scale(1.0, 0.42);
      ctx.strokeStyle = (b % 2 === 0) ? '#e0f2fe' : '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Multi-layer Spiral Chakra Vortexes (Counter-swirling Archimedean Spirals)
    const spiralCount = 7;
    for (let s = 0; s < spiralCount; s++) {
      const baseAngle = (s * Math.PI * 2) / spiralCount + t * 9;
      ctx.save();
      ctx.beginPath();
      for (let theta = 0; theta < Math.PI * 3.2; theta += 0.2) {
        const dist = (theta / (Math.PI * 3.2)) * r * 0.92;
        const curA = baseAngle + theta;
        const px = Math.cos(curA) * dist;
        const py = Math.sin(curA) * dist;
        if (theta === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = s % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Inward Swirling Chakra Particles
    const pCount = 12;
    for (let p = 0; p < pCount; p++) {
      const pPhase = ((now * 0.003 + p * 0.08) % 1.0);
      const pDist = r * (1.3 - pPhase * 0.85);
      const pAngle = (p * Math.PI * 2) / pCount + pPhase * Math.PI * 4;
      const px = Math.cos(pAngle) * pDist;
      const py = Math.sin(pAngle) * pDist;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 2.2 * (1 - pPhase * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Super-Dense White Radiant Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // 2. Solar Flare / Dragon Flame Orb
  drawSolarFireball(ctx, x, y, size = 90) {
    const now = performance.now();
    const t = now * 0.004;
    const r = size * 0.52;

    ctx.save();
    ctx.translate(x, y);

    // 1. Expanding Thermal Shockwave Ripple
    const wavePhase = (now * 0.0015) % 1.0;
    ctx.strokeStyle = `rgba(249, 115, 22, ${Math.pow(1 - wavePhase, 1.5) * 0.7})`;
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, r * (0.6 + wavePhase * 1.4), 0, Math.PI * 2);
    ctx.stroke();

    // 2. Outer Coronal Ejection Flare Tongues
    ctx.beginPath();
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      const a = (i * Math.PI * 2) / steps;
      const noise = Math.sin(a * 5 + t * 8) * 0.22 + Math.cos(a * 8 - t * 6) * 0.16;
      const curR = r * (1.18 + noise);
      const px = Math.cos(a) * curR;
      const py = Math.sin(a) * curR;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const flareGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.4);
    flareGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    flareGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.85)');
    flareGrad.addColorStop(0.75, 'rgba(220, 38, 38, 0.55)');
    flareGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
    ctx.fillStyle = flareGrad;
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 25;
    ctx.fill();

    // 3. Dynamic Flame Petals (Rotating Eruptive Tongues)
    const petalCount = 8;
    for (let p = 0; p < petalCount; p++) {
      const pAngle = (p * Math.PI * 2) / petalCount + t * 2.2;
      const pLen = r * 0.95 + Math.sin(t * 6 + p * 2) * (r * 0.28);
      ctx.save();
      ctx.rotate(pAngle);
      const pGrad = ctx.createLinearGradient(0, 0, pLen, 0);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.3, '#facc15');
      pGrad.addColorStop(0.7, '#ea580c');
      pGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.18);
      ctx.quadraticCurveTo(pLen * 0.6, -r * 0.28, pLen, 0);
      ctx.quadraticCurveTo(pLen * 0.6, r * 0.28, 0, r * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4. Dancing Embers & Sparks Floating Upward
    const emberCount = 10;
    for (let e = 0; e < emberCount; e++) {
      const ePhase = ((now * 0.002 + e * 0.1) % 1.0);
      const eDist = r * 0.4 + ePhase * r * 1.1;
      const eAngle = -Math.PI / 2 + (Math.sin(e * 7 + t * 3) * 0.9);
      const ex = Math.cos(eAngle) * eDist + Math.sin(t * 5 + e) * 8;
      const ey = Math.sin(eAngle) * eDist;
      ctx.fillStyle = `rgba(254, 240, 138, ${1 - ePhase})`;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.0 * (1 - ePhase * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. White-Hot Nuclear Solar Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // 3. Cosmic Void / Dark Nebula Singularity
  drawCosmicBlackHole(ctx, x, y, size = 90) {
    const now = performance.now();
    const t = now * 0.003;
    const r = size * 0.52;

    ctx.save();
    ctx.translate(x, y);

    // 1. Gravitational Lensing Distortion Halo
    const lensGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.5);
    lensGrad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    lensGrad.addColorStop(0.4, 'rgba(236, 72, 153, 0.35)');
    lensGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.2)');
    lensGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

    ctx.fillStyle = lensGrad;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Relativistic Tilted Accretion Disk (3D Perspective Projection)
    ctx.save();
    ctx.rotate(0.35); // Angle of accretion disk
    ctx.scale(1.0, 0.42); // Elliptical projection

    // Outer plasma rings
    const diskRings = [
      { r: 1.45, color: '#c084fc', width: 4.0, dash: [20, 14], speed: 4.2 },
      { r: 1.25, color: '#f472b6', width: 3.0, dash: [14, 10], speed: -5.5 },
      { r: 1.05, color: '#38bdf8', width: 2.5, dash: [10, 8],  speed: 7.0 },
      { r: 0.85, color: '#e0e7ff', width: 2.0, dash: [6, 6],   speed: -8.8 }
    ];

    diskRings.forEach(d => {
      ctx.save();
      ctx.rotate(t * d.speed);
      ctx.strokeStyle = d.color;
      ctx.lineWidth = d.width;
      ctx.setLineDash(d.dash);
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, r * d.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();

    // 3. Inflowing Relativistic Stardust Particles
    const particleCount = 14;
    for (let p = 0; p < particleCount; p++) {
      const pPhase = ((now * 0.002 + p * 0.07) % 1.0);
      const pDist = r * (1.5 - pPhase * 1.1);
      const pAngle = (p * Math.PI * 2) / particleCount + pPhase * Math.PI * 5;
      const px = Math.cos(pAngle) * pDist;
      const py = Math.sin(pAngle) * pDist * 0.55;

      ctx.fillStyle = `rgba(240, 171, 252, ${Math.sin(pPhase * Math.PI)})`;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(px, py, 2.0 * (1 - pPhase * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Photon Sphere (Razor-Sharp Glowing Ring)
    ctx.strokeStyle = '#f5d0fe';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.44, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Event Horizon Singularity (Pure Absolute Void)
    ctx.fillStyle = '#020617';
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // 4. Doctor Strange Eldritch Mystic Arts Mandala
  drawMysticCircle(ctx, x, y, size = 90) {
    const now = performance.now();
    const t = now * 0.0018;
    const r = size * 0.54;

    ctx.save();
    ctx.translate(x, y);

    // 1. Eldritch Mystic Aura Glow
    const auraGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.35);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    auraGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.25)');
    auraGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
    ctx.fillStyle = auraGrad;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 2. Outer Concentric Circles & Runic Rings
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2);
    ctx.stroke();

    // Runic tick ring
    ctx.rotate(t * 1.5);
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. Clockwise Rotating Sacred Hexagram (Two Interlocking Equilateral Triangles)
    ctx.save();
    ctx.rotate(t * 1.2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;

    for (let tri = 0; tri < 2; tri++) {
      ctx.beginPath();
      const offset = (tri * Math.PI) / 3;
      for (let v = 0; v < 3; v++) {
        const vAngle = offset + (v * Math.PI * 2) / 3;
        const vx = Math.cos(vAngle) * (r * 0.72);
        const vy = Math.sin(vAngle) * (r * 0.72);
        if (v === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    // 4. Counter-Clockwise Concentric Squares (Octagram)
    ctx.save();
    ctx.rotate(-t * 2.0);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
    ctx.lineWidth = 1.6;
    for (let sq = 0; sq < 2; sq++) {
      ctx.save();
      ctx.rotate((sq * Math.PI) / 4);
      const sHalf = r * 0.48;
      ctx.strokeRect(-sHalf, -sHalf, sHalf * 2, sHalf * 2);
      ctx.restore();
    }
    ctx.restore();

    // 5. 12 Eldritch Spokes (Ray Dividers)
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r * 0.86), Math.sin(a) * (r * 0.86));
      ctx.lineTo(Math.cos(a) * (r * 0.98), Math.sin(a) * (r * 0.98));
      ctx.stroke();
    }
    ctx.restore();

    // 6. Floating Golden Magical Embers
    const emberCount = 10;
    for (let e = 0; e < emberCount; e++) {
      const ePhase = ((now * 0.0018 + e * 0.1) % 1.0);
      const eDist = r * 0.25 + ePhase * r * 0.95;
      const eAngle = (e * Math.PI * 2) / emberCount + Math.sin(t * 3 + e) * 0.5;
      const ex = Math.cos(eAngle) * eDist;
      const ey = Math.sin(eAngle) * eDist;
      ctx.fillStyle = `rgba(254, 240, 138, ${1 - ePhase})`;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.0 * (1 - ePhase * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Golden Eye Core Emitter
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // 5. Unified VFX Dispatcher supporting All 5 Animations & 6 Attachment Targets
  drawVFX(ctx, spriteName, pts, target = 'palm', fallbackX = null, fallbackY = null, customSize = 90) {
    let posX = fallbackX !== null ? fallbackX : 320;
    let posY = fallbackY !== null ? fallbackY : 240;
    let size = customSize;

    if (pts && pts.length >= 21) {
      const wrist = pts[0];
      const indexMcp = pts[5];
      const midMcp = pts[9];
      const ringMcp = pts[13];
      const pinkyMcp = pts[17];

      const palmX = (wrist.x + indexMcp.x + midMcp.x + ringMcp.x + pinkyMcp.x) / 5;
      const palmY = (wrist.y + indexMcp.y + midMcp.y + ringMcp.y + pinkyMcp.y) / 5;

      const dx = midMcp.x - wrist.x;
      const dy = midMcp.y - wrist.y;
      const handLen = Math.max(50, Math.hypot(dx, dy));

      const targetMap = {
        palm:   { x: palmX,    y: palmY,    scale: 0.95 },
        thumb:  { x: pts[4].x,  y: pts[4].y,  scale: 0.52 },
        index:  { x: pts[8].x,  y: pts[8].y,  scale: 0.52 },
        middle: { x: pts[12].x, y: pts[12].y, scale: 0.52 },
        ring:   { x: pts[16].x, y: pts[16].y, scale: 0.52 },
        pinky:  { x: pts[20].x, y: pts[20].y, scale: 0.46 }
      };

      const info = targetMap[target] || targetMap.palm;
      posX = info.x;
      posY = info.y;
      size = handLen * info.scale;
    }

    switch (spriteName) {
      case 'ironman':
        this.drawEpicPalmRepulsor(ctx, pts, target, posX, posY, size);
        break;
      case 'rasengan':
        this.drawRasengan(ctx, posX, posY, size);
        break;
      case 'fireball':
        this.drawSolarFireball(ctx, posX, posY, size);
        break;
      case 'blackhole':
        this.drawCosmicBlackHole(ctx, posX, posY, size);
        break;
      case 'magic_circle':
        this.drawMysticCircle(ctx, posX, posY, size);
        break;
      default:
        this.drawEpicPalmRepulsor(ctx, pts, target, posX, posY, size);
        break;
    }
  },

  drawIronManRepulsor(ctx, x, y, size = 110) {
    this.drawEpicPalmRepulsor(ctx, null, 'palm', x, y, size);
  }
};

if (typeof window !== 'undefined') {
  window.SpriteRenderer = SpriteRenderer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpriteRenderer;
}
