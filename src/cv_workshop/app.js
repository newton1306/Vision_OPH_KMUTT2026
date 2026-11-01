// CV Workshop Application Controller & Code Execution Engine
class CVWorkshopApp {
  constructor() {
    this.workspace = null;
    this.currentMode = 'challengeA';
    this.isRunning = true;
    this.compiledUserFn = null;

    // DOM Elements
    this.video = document.getElementById('cv-video');
    this.canvas = document.getElementById('cv-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.btnRun = document.getElementById('btn-run');
    this.btnReset = document.getElementById('btn-reset');
    this.resetModal = document.getElementById('reset-modal');
    this.modalConfirm = document.getElementById('modal-confirm');
    this.modalCancel = document.getElementById('modal-cancel');
    this.toastEl = document.getElementById('toast');
    this.textBubbleEl = document.getElementById('printed-text-bubble');
    this.textContentEl = document.getElementById('printed-text-content');

    // MakeCode Pill Switcher & Preview Elements
    this.tabBlocks = document.getElementById('tab-blocks');
    this.tabJs = document.getElementById('tab-js');
    this.jsPreviewOverlay = document.getElementById('js-preview-overlay');
    this.jsCodeDisplay = document.getElementById('js-code-display');
    this.btnCloseJs = document.getElementById('btn-close-js');

    // Bottom Toolbar Elements
    this.activeChallengeBadge = document.getElementById('active-challenge-badge');
    this.activeChallengeTitle = document.getElementById('active-challenge-title');
    this.btnUndo = document.getElementById('btn-undo');
    this.btnRedo = document.getElementById('btn-redo');
    this.btnCenter = document.getElementById('btn-center');
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');

    // Challenge C Controls
    this.shapeActionBar = document.getElementById('shape-action-bar');
    this.btnSubmitShape = document.getElementById('btn-submit-shape');
    this.btnClearDrawing = document.getElementById('btn-clear-drawing');

    // Isolated state per challenge (XML and Undo/Redo stacks)
    this.challengeStates = {
      challengeA: { xml: null, undoStack: [], redoStack: [] },
      challengeB: { xml: null, undoStack: [], redoStack: [] },
      challengeC: { xml: null, undoStack: [], redoStack: [] }
    };

    // HUD Elements
    this.hudHandDot = document.getElementById('hud-hand-dot');
    this.hudHandText = document.getElementById('hud-hand-text');
    this.hudFingers = document.getElementById('hud-fingers');
    this.hudShape = document.getElementById('hud-shape');
    this.hudFps = document.getElementById('hud-fps');

    // Drawing & Sprite State for student code
    this.userSpritesToDraw = [];
    this.userTextToPrint = null;
    this.userTextColor = '#facc15';
    this.isDrawingEnabled = false;

    // Iron Man Arc Repulsor State
    this.hasTriggeredJarvis = false;
    this.lastRepulsorSoundTime = 0;

    // Performance tracking (Target: solid 60 FPS)
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.currentFps = 60;

    this.initCanvas();
    this.initBlockly();
    this.initUIEvents();
    this.initVision();
    this.startExecutionLoop();
  }

  getGenerator() {
    if (typeof window !== 'undefined' && window.javascript && window.javascript.javascriptGenerator) {
      if (typeof Blockly !== 'undefined' && !Blockly.JavaScript) {
        Blockly.JavaScript = window.javascript.javascriptGenerator;
      }
      return window.javascript.javascriptGenerator;
    }
    if (typeof Blockly !== 'undefined' && Blockly.JavaScript) {
      return Blockly.JavaScript;
    }
    return null;
  }

  initCanvas() {
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
  }

  getChallengeDisplayName(mode) {
    const names = {
      challengeA: 'Challenge A (Iron Man Repulsor)',
      challengeB: 'Challenge B (Finger Counter)',
      challengeC: 'Challenge C (Draw & Detect)'
    };
    return names[mode] || mode;
  }

  getToolboxXml(modeName) {
    if (modeName === 'challengeA') {
      // Challenge A: Iron Man Palm Repulsor
      // Required: ai_sensor (fingers), ai_attach_sprite, controls_if, logic_compare, math_number, ai_print_text, ai_play_sound
      // Strictly excluded: ai_draw_trail, ai_clear_screen, ai_shape_value
      return `
        <xml id="toolbox" style="display: none">
          <category name="AI &amp; Vision" colour="#7c3aed">
            <block type="ai_sensor"></block>
            <block type="ai_attach_sprite"></block>
          </category>
          <category name="Logic" colour="#00aba9">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_boolean"></block>
          </category>
          <category name="Math" colour="#8a00e1">
            <block type="math_number">
              <field name="NUM">5</field>
            </block>
            <block type="math_number">
              <field name="NUM">0</field>
            </block>
          </category>
          <category name="Text" colour="#0078d7">
            <block type="ai_print_text">
              <value name="TEXT">
                <block type="text">
                  <field name="TEXT">💥 JARVIS: MARK-85 ARC REPULSOR ACTIVE!</field>
                </block>
              </value>
            </block>
            <block type="text"></block>
          </category>
          <category name="Music" colour="#d83b01">
            <block type="ai_play_sound"></block>
          </category>
        </xml>
      `;
    }

    if (modeName === 'challengeB') {
      // Challenge B: Finger Counter
      // Required: ai_sensor (fingers), controls_if, logic_compare, math_number, ai_print_text, ai_play_sound
      // Strictly excluded: ai_attach_sprite, ai_draw_trail, ai_clear_screen, ai_shape_value
      return `
        <xml id="toolbox" style="display: none">
          <category name="AI &amp; Vision" colour="#7c3aed">
            <block type="ai_sensor"></block>
          </category>
          <category name="Logic" colour="#00aba9">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_boolean"></block>
          </category>
          <category name="Math" colour="#8a00e1">
            <block type="math_number">
              <field name="NUM">1</field>
            </block>
            <block type="math_number">
              <field name="NUM">2</field>
            </block>
            <block type="math_number">
              <field name="NUM">5</field>
            </block>
          </category>
          <category name="Text" colour="#0078d7">
            <block type="ai_print_text">
              <value name="TEXT">
                <block type="text">
                  <field name="TEXT">✌️ Peace / 2 Fingers!</field>
                </block>
              </value>
            </block>
            <block type="text"></block>
            <block type="text_join"></block>
          </category>
          <category name="Music" colour="#d83b01">
            <block type="ai_play_sound"></block>
          </category>
        </xml>
      `;
    }

    if (modeName === 'challengeC') {
      // Challenge C: Draw a Shape & Detect
      // Required: ai_sensor (shape), ai_draw_trail, ai_clear_screen, controls_if, logic_compare, ai_shape_value, ai_print_text, ai_play_sound
      // Strictly excluded: ai_attach_sprite, math_number
      return `
        <xml id="toolbox" style="display: none">
          <category name="AI &amp; Vision" colour="#7c3aed">
            <block type="ai_sensor"></block>
            <block type="ai_draw_trail"></block>
            <block type="ai_clear_screen"></block>
          </category>
          <category name="Logic" colour="#00aba9">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="ai_shape_value"></block>
            <block type="logic_operation"></block>
            <block type="logic_boolean"></block>
          </category>
          <category name="Text" colour="#0078d7">
            <block type="ai_print_text">
              <value name="TEXT">
                <block type="text">
                  <field name="TEXT">⭕ Great Circle Detected!</field>
                </block>
              </value>
            </block>
            <block type="text"></block>
          </category>
          <category name="Music" colour="#d83b01">
            <block type="ai_play_sound"></block>
          </category>
        </xml>
      `;
    }

    return '<xml id="toolbox"></xml>';
  }

  updateToolboxForMode(modeName) {
    if (!this.workspace) return;
    try {
      const toolboxXml = this.getToolboxXml(modeName);
      this.workspace.updateToolbox(toolboxXml);
      setTimeout(() => {
        this.decorateToolbox();
      }, 50);
    } catch (e) {
      console.warn('[CVWorkshop] Could not update toolbox for', modeName, e);
    }
  }

  initBlockly() {
    const toolboxXml = this.getToolboxXml(this.currentMode);

    // Inject Blockly Workspace with MakeCode grid & layout
    this.workspace = Blockly.inject('blockly-div', {
      toolbox: toolboxXml,
      media: '../shared/libs/blockly/media/',
      grid: {
        spacing: 24,
        length: 2,
        colour: 'rgba(203, 213, 225, 0.7)',
        snap: true
      },
      zoom: {
        controls: false, // Custom MakeCode bottom toolbar handles zoom
        wheel: true,
        startScale: 0.95,
        maxScale: 2.2,
        minScale: 0.45,
        scaleSpeed: 1.2
      },
      trashcan: true,
      scrollbars: true
    });

    // Auto-compile code on workspace change
    this.workspace.addChangeListener(() => {
      this.compileUserCode();
    });

    // Load initial challenge template with events disabled so undo history starts empty
    Blockly.Events.disable();
    this.loadTemplate(this.currentMode);
    Blockly.Events.enable();

    // Focus & center workspace on startup
    setTimeout(() => {
      this.centerWorkspace();
    }, 250);

    // Style MakeCode Category Rail with left colored stripes and icons
    setTimeout(() => {
      this.decorateToolbox();
    }, 150);
  }

  decorateToolbox() {
    const categoryMeta = {
      'AI & Vision': { color: '#7c3aed', icon: '👁️' },
      'Logic': { color: '#00aba9', icon: '🔀' },
      'Loops': { color: '#00a300', icon: '🔄' },
      'Math': { color: '#8a00e1', icon: '🧮' },
      'Text': { color: '#0078d7', icon: '💬' },
      'Music': { color: '#d83b01', icon: '🔔' },
      'Variables': { color: '#e3008c', icon: '📊' }
    };

    const rows = document.querySelectorAll('.blocklyTreeRow');
    rows.forEach(row => {
      const label = row.querySelector('.blocklyTreeLabel');
      if (!label) return;
      const name = label.textContent.trim();
      const meta = categoryMeta[name];
      if (meta) {
        row.style.setProperty('border-left', `8px solid ${meta.color}`, 'important');
        label.style.setProperty('color', meta.color, 'important');
        label.style.setProperty('font-weight', '700', 'important');

        if (!row.querySelector('.mc-cat-icon')) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'mc-cat-icon';
          iconSpan.textContent = meta.icon;
          iconSpan.style.marginRight = '8px';
          iconSpan.style.fontSize = '14px';
          label.parentNode.insertBefore(iconSpan, label);
        }
      }
    });
  }

  centerWorkspace() {
    if (!this.workspace) return;
    try {
      this.workspace.setScale(0.95);
      this.workspace.scrollCenter();
    } catch (e) {
      console.warn('[CVWorkshop] Error centering workspace:', e);
    }
  }

  updateActiveBadge() {
    if (!this.activeChallengeTitle) return;
    const badgeMap = {
      challengeA: { icon: '💥', title: 'Challenge A: Iron Man Palm Repulsor' },
      challengeB: { icon: '🖐️', title: 'Challenge B: Finger Counter' },
      challengeC: { icon: '📐', title: 'Challenge C: Draw & Detect' }
    };
    const info = badgeMap[this.currentMode] || { icon: '🎯', title: this.currentMode };
    this.activeChallengeTitle.textContent = info.title;
    if (this.activeChallengeBadge) {
      const iconEl = this.activeChallengeBadge.querySelector('.badge-icon');
      if (iconEl) iconEl.textContent = info.icon;
    }
  }

  loadTemplate(modeName) {
    if (!this.workspace) return;
    this.workspace.clear();

    // STRICT ISOLATION: Reset all workshop overlay and drawing states
    this.isDrawingEnabled = false;
    if (this.tracker) {
      this.tracker.isDrawingActive = false;
      this.tracker.clearDrawing();
    }
    this.userSpritesToDraw = [];
    this.userTextToPrint = null;
    this.hasTriggeredJarvis = false;
    this.lastRepulsorSoundTime = 0;
    if (this.textBubbleEl) {
      this.textBubbleEl.style.display = 'none';
    }

    // Dynamically update the toolbox for this specific challenge
    this.updateToolboxForMode(modeName);

    let xmlText = '';
    if (this.challengeStates[modeName] && this.challengeStates[modeName].xml !== null) {
      xmlText = this.challengeStates[modeName].xml;
    } else if (typeof WorkshopTemplates !== 'undefined' && WorkshopTemplates[modeName] !== undefined) {
      xmlText = WorkshopTemplates[modeName];
    } else {
      xmlText = '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
    }
    try {
      const xmlDom = Blockly.utils.xml.textToDom(xmlText);
      Blockly.Xml.domToWorkspace(xmlDom, this.workspace);
    } catch (err) {
      console.warn('[CVWorkshop] Template XML parse error:', err);
    }

    this.compileUserCode();
    this.updateActiveBadge();

    // Toggle Challenge C action bar
    if (this.shapeActionBar) {
      this.shapeActionBar.style.display = (modeName === 'challengeC') ? 'flex' : 'none';
    }
  }

  switchMode(newMode) {
    if (!this.workspace) return;
    if (this.currentMode === newMode) return;

    const oldMode = this.currentMode;

    // 1. Snapshot current mode's blocks and undo/redo stacks
    try {
      const dom = Blockly.Xml.workspaceToDom(this.workspace);
      this.challengeStates[oldMode].xml = Blockly.Xml.domToText(dom);
    } catch (e) {
      console.warn('[CVWorkshop] Could not save XML for', oldMode, e);
    }
    this.challengeStates[oldMode].undoStack = this.workspace.undoStack_ ? [...this.workspace.undoStack_] : [];
    this.challengeStates[oldMode].redoStack = this.workspace.redoStack_ ? [...this.workspace.redoStack_] : [];

    // 2. Set new mode
    this.currentMode = newMode;

    // 3. Temporarily disable Blockly events so loading blocks does not pollute undo history
    Blockly.Events.disable();

    // 4. Load target template / state
    this.loadTemplate(newMode);

    // 5. Restore target challenge's isolated undo/redo stacks
    this.workspace.undoStack_ = this.challengeStates[newMode].undoStack ? [...this.challengeStates[newMode].undoStack] : [];
    this.workspace.redoStack_ = this.challengeStates[newMode].redoStack ? [...this.challengeStates[newMode].redoStack] : [];

    // 6. Re-enable Blockly events
    Blockly.Events.enable();

    // 7. Auto center blocks
    setTimeout(() => {
      this.centerWorkspace();
    }, 100);
  }

  compileUserCode() {
    if (!this.workspace) return;

    try {
      const jsGen = this.getGenerator();
      if (!jsGen) {
        console.warn('[CVWorkshop] JS Generator not ready.');
        return;
      }

      const code = jsGen.workspaceToCode(this.workspace);

      // Verify action blocks in workspace to prevent bare blocks from running unconditionally
      const ACTION_TYPES = ['ai_attach_sprite', 'ai_print_text', 'ai_play_sound', 'ai_clear_screen'];
      const allBlocks = this.workspace.getAllBlocks(false);
      let hasBareActionBlock = false;

      // Verify blocks allowed for current challenge (strictly isolate challenges - no inappropriate blocks allowed across sessions)
      const allowedSet = CVWorkshopApp.ALLOWED_BLOCKS[this.currentMode];
      let hasDisallowedBlock = false;

      for (const b of allBlocks) {
        if (allowedSet && !allowedSet.has(b.type)) {
          hasDisallowedBlock = true;
          if (b.setWarningText) {
            b.setWarningText(`⚠️ บล็อกนี้ไม่อนุญาตให้ใช้ใน ${this.getChallengeDisplayName(this.currentMode)}!`);
          }
          continue;
        }

        if (ACTION_TYPES.includes(b.type)) {
          const isEnclosed = typeof isEnclosedInCondition === 'function'
            ? isEnclosedInCondition(b)
            : (function (blk) {
                let p = blk.getSurroundParent();
                while (p) {
                  if (p.type === 'controls_if' || p.type === 'controls_ifelse' || p.type.startsWith('ai_if_')) return true;
                  p = p.getSurroundParent();
                }
                return false;
              })(b);

          if (!isEnclosed) {
            hasBareActionBlock = true;
            if (b.setWarningText) {
              b.setWarningText('⚠️ บล็อกคำสั่งนี้ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข');
            }
          } else {
            if (b.setWarningText) {
              b.setWarningText(null);
            }
          }
        }
      }

      if (hasDisallowedBlock) {
        const now = performance.now();
        if (now - (this.lastDisallowedToastTime || 0) > 4000) {
          this.showToast('⚠️ พบการใช้บล็อกที่ไม่ได้รับอนุญาตสำหรับ Challenge นี้!');
          this.lastDisallowedToastTime = now;
        }
      } else if (hasBareActionBlock) {
        const now = performance.now();
        if (now - (this.lastBareWarningToastTime || 0) > 4000) {
          this.showToast('⚠️ บล็อกคำสั่งต้องต่ออยู่ภายในบล็อก if ร่วมกับเงื่อนไข!');
          this.lastBareWarningToastTime = now;
        }
      }

      // Keep live JavaScript preview updated
      if (this.jsCodeDisplay) {
        this.jsCodeDisplay.textContent = code.trim() || '// No blocks currently in workspace';
      }

      // Create sandboxed runner function for student code
      this.compiledUserFn = new Function('cvState', `
        try {
          ${code}
        } catch (err) {
          // Ignore incomplete blocks during user typing
        }
      `);
    } catch (err) {
      console.warn('[CVWorkshop] Compilation error:', err);
      this.compiledUserFn = null;
    }

    this.updateShapeButtonState();
  }

  validateChallengeCBlocks() {
    if (!this.workspace) return { valid: false, message: '⚠️ ไม่พบพื้นที่เขียนโค้ด' };

    const allBlocks = this.workspace.getAllBlocks(false);

    // 1. Check if logic_compare has ai_sensor connected to input A
    const compareBlocks = allBlocks.filter(b => b.type === 'logic_compare');
    const hasSensorConnected = compareBlocks.some(b => {
      const aTarget = b.getInputTargetBlock('A');
      return aTarget && (aTarget.type === 'ai_sensor' || aTarget.type.startsWith('ai_'));
    });
    const hasSensorInWorkspace = allBlocks.some(b => b.type === 'ai_sensor' && b.getFieldValue('FEATURE') === 'shape');

    // 2. Check if controls_if has any command block inside DO0 statement
    const ifBlocks = allBlocks.filter(b => b.type === 'controls_if');
    const hasActionInDo = ifBlocks.some(b => {
      const doTarget = b.getInputTargetBlock('DO0');
      return !!doTarget;
    });
    const hasActionInWorkspace = allBlocks.some(b => b.type === 'ai_print_text' || b.type === 'ai_play_sound' || b.type === 'ai_draw_sprite');

    // Case A: Still empty starter scaffold (nothing inserted into comparison or DO slots)
    if ((!hasSensorConnected && !hasSensorInWorkspace) && (!hasActionInDo && !hasActionInWorkspace)) {
      return {
        valid: false,
        message: '⚠️ กรุณาต่อบล็อกเงื่อนไขและคำสั่งให้ครบก่อน!'
      };
    }

    // Case B: Sensor block missing in condition
    if (!hasSensorConnected) {
      return {
        valid: false,
        message: '⚠️ กรุณานำบล็อก [เซนเซอร์ รูปทรง] มาต่อในเงื่อนไข!'
      };
    }

    // Case C: Action block missing in DO slot
    if (!hasActionInDo) {
      return {
        valid: false,
        message: '⚠️ กรุณาใส่บล็อกคำสั่งลงในช่อง do ก่อน!'
      };
    }

    return { valid: true };
  }

  updateShapeButtonState() {
    if (this.currentMode !== 'challengeC' || !this.btnSubmitShape) return;
    const validation = this.validateChallengeCBlocks();
    if (validation.valid) {
      this.btnSubmitShape.classList.remove('needs-blocks');
      this.btnSubmitShape.title = 'ตรวจคำตอบและรูปทรงที่วาด';
    } else {
      this.btnSubmitShape.classList.add('needs-blocks');
      this.btnSubmitShape.title = validation.message;
    }
  }

  initUIEvents() {
    // 1. Mode Buttons: switching between Challenge A, B, and C
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.switchMode(btn.dataset.mode);
        this.showToast(`Switched to ${btn.textContent.trim()}`);
      });
    });

    // 2. MakeCode Pill Switcher (Blocks vs JavaScript)
    if (this.tabBlocks && this.tabJs) {
      const showBlocks = () => {
        this.tabBlocks.classList.add('active');
        this.tabJs.classList.remove('active');
        if (this.jsPreviewOverlay) this.jsPreviewOverlay.style.display = 'none';
      };

      const showJs = () => {
        this.tabJs.classList.add('active');
        this.tabBlocks.classList.remove('active');
        this.compileUserCode();
        if (this.jsPreviewOverlay) this.jsPreviewOverlay.style.display = 'block';
      };

      this.tabBlocks.addEventListener('click', showBlocks);
      this.tabJs.addEventListener('click', showJs);
      if (this.btnCloseJs) this.btnCloseJs.addEventListener('click', showBlocks);
    }

    // 3. Bottom Toolbar Undo / Redo (strictly operates on current challenge stack)
    if (this.btnUndo) {
      this.btnUndo.addEventListener('click', () => {
        if (this.workspace) this.workspace.undo(false);
      });
    }
    if (this.btnRedo) {
      this.btnRedo.addEventListener('click', () => {
        if (this.workspace) this.workspace.undo(true);
      });
    }

    // 4. Bottom Toolbar Center & Zoom Controls
    if (this.btnCenter) {
      this.btnCenter.addEventListener('click', () => {
        this.centerWorkspace();
        this.showToast('🎯 View Centered');
      });
    }
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => {
        if (this.workspace) this.workspace.zoomCenter(1);
      });
    }
    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => {
        if (this.workspace) this.workspace.zoomCenter(-1);
      });
    }

    // 5. Challenge C Submit & Clear Shape Controls
    if (this.btnSubmitShape) {
      this.btnSubmitShape.addEventListener('click', () => {
        if (!this.tracker) return;

        // 1. First verify if blocks in workspace have been completed (not just empty starter scaffold)
        const validation = this.validateChallengeCBlocks();
        if (!validation.valid) {
          this.showToast(validation.message);
          return;
        }

        // 2. Verify drawing exists on canvas
        if (this.tracker.drawingPoints.length < 15) {
          this.showToast('⚠️ กรุณาวาดรูปบนหน้าจอก่อนกดตรวจคำตอบ!');
          return;
        }

        const predicted = this.tracker.submitDrawing();
        console.log('[CVWorkshop] Shape submitted:', predicted);

        if (predicted && predicted !== 'None') {
          const emoji = predicted === 'Circle' ? '⭕' : (predicted === 'Triangle' ? '🔺' : '🟩');
          this.showToast(`🎯 โมเดลตรวจพบ: ${predicted} ${emoji}!`);
        } else {
          this.showToast('❓ ยังระบุรูปทรงไม่ได้ ลองวาดใหม่อีกครั้ง');
        }
      });
    }

    if (this.btnClearDrawing) {
      this.btnClearDrawing.addEventListener('click', () => {
        if (this.tracker) {
          this.tracker.clearDrawing();
        }
        this.userTextToPrint = null;
        if (this.textBubbleEl) {
          this.textBubbleEl.style.display = 'none';
        }
        this.showToast('🧹 ล้างกระดานวาดรูปแล้ว พร้อมวาดใหม่');
      });
    }

    // 6. Navigation Buttons: Back to Menu & Switch to Fruit Neptune
    const btnNavMenu = document.getElementById('btn-nav-menu');
    if (btnNavMenu) {
      btnNavMenu.addEventListener('click', () => {
        if (window.electronAPI && window.electronAPI.switchMode) {
          window.electronAPI.switchMode('menu');
        }
      });
    }

    const btnNavFruit = document.getElementById('btn-nav-fruit');
    if (btnNavFruit) {
      btnNavFruit.addEventListener('click', () => {
        if (window.electronAPI && window.electronAPI.switchMode) {
          window.electronAPI.switchMode('fruit-ninja');
        }
      });
    }

    // 7. Run / Stop Toggle
    this.btnRun.addEventListener('click', () => {
      SoundFX.init();
      this.isRunning = !this.isRunning;
      if (this.isRunning) {
        this.btnRun.innerHTML = '<span class="btn-icon">⏹</span> STOP';
        this.btnRun.classList.add('running');
        this.compileUserCode();
      } else {
        this.btnRun.innerHTML = '<span class="btn-icon">▶</span> RUN CODE';
        this.btnRun.classList.remove('running');
        this.userSpritesToDraw = [];
        this.userTextToPrint = null;
        this.textBubbleEl.style.display = 'none';
      }
    });

    // 6. Reset Session Button & Modal
    this.btnReset.addEventListener('click', () => {
      this.resetModal.classList.add('active');
    });

    this.modalCancel.addEventListener('click', () => {
      this.resetModal.classList.remove('active');
    });

    this.modalConfirm.addEventListener('click', () => {
      this.resetSession();
      this.resetModal.classList.remove('active');
    });

    window.addEventListener('keydown', (e) => {
      // Secret Admin Exit: Alt+B exits the program
      if (e.altKey && (e.key === 'b' || e.key === 'B' || e.code === 'KeyB')) {
        e.preventDefault();
        if (window.electronAPI && window.electronAPI.forceQuit) {
          window.electronAPI.forceQuit();
        }
        return;
      }

      // Secret Admin Shortcut: Alt+A silently spawns the correct solution onto active challenge workspace
      if (e.altKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) {
        const target = e.target;
        const active = document.activeElement;
        const isInput = (el) => el && (
          el.tagName === 'INPUT' || 
          el.tagName === 'TEXTAREA' || 
          el.isContentEditable || 
          (el.classList && el.classList.contains('blocklyHtmlInput'))
        );
        if (isInput(target) || isInput(active)) return;

        e.preventDefault();
        this.spawnSolution();
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();
        this.resetSession();
      }
      if (e.key === 'F11') {
        if (typeof require !== 'undefined') {
          try {
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('app:toggle-fullscreen');
          } catch (err) {}
        }
      }
    });
  }

  spawnSolution() {
    if (!this.workspace) return;
    const solutions = (typeof WorkshopSolutions !== 'undefined' ? WorkshopSolutions : (window.WorkshopSolutions || {}));
    const solutionXml = solutions[this.currentMode];
    if (!solutionXml) return;

    try {
      Blockly.Events.disable();
      this.workspace.clear();
      const xmlDom = Blockly.utils.xml.textToDom(solutionXml);
      Blockly.Xml.domToWorkspace(xmlDom, this.workspace);
      Blockly.Events.enable();

      if (this.challengeStates[this.currentMode]) {
        this.challengeStates[this.currentMode].xml = solutionXml;
        this.challengeStates[this.currentMode].undoStack = [];
        this.challengeStates[this.currentMode].redoStack = [];
      }

      this.compileUserCode();
      setTimeout(() => this.centerWorkspace(), 50);
    } catch (err) {
      console.warn('[CVWorkshop] Solution spawn error:', err);
    }
  }

  resetSession() {
    // 1. Wipe storage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Reset all saved challenge states and undo stacks
    this.challengeStates = {
      challengeA: { xml: null, undoStack: [], redoStack: [] },
      challengeB: { xml: null, undoStack: [], redoStack: [] },
      challengeC: { xml: null, undoStack: [], redoStack: [] }
    };

    // 3. Reset Mode to Challenge A
    this.currentMode = 'challengeA';
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.mode === 'challengeA');
    });

    // 4. Temporarily disable events and reload Challenge A template
    Blockly.Events.disable();
    this.loadTemplate('challengeA');
    if (this.workspace) {
      this.workspace.undoStack_ = [];
      this.workspace.redoStack_ = [];
    }
    Blockly.Events.enable();

    // 5. Clear Canvas drawings and messages
    this.userSpritesToDraw = [];
    this.userTextToPrint = null;
    this.hasTriggeredJarvis = false;
    this.lastRepulsorSoundTime = 0;
    this.textBubbleEl.style.display = 'none';
    if (this.tracker) {
      this.tracker.clearDrawing();
    }

    // 6. Ensure execution is active
    this.isRunning = true;
    this.btnRun.innerHTML = '<span class="btn-icon">⏹</span> STOP';
    this.btnRun.classList.add('running');

    setTimeout(() => {
      this.centerWorkspace();
    }, 150);

    this.showToast('✨ Session Cleaned! Ready for the next student.');
  }

  showToast(msg) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2400);
  }

  async initVision() {
    try {
      this.tracker = new HandTracker({
        videoElement: this.video,
        mediapipePath: '../shared/libs/mediapipe/',
        autoPump: false // Synchronous master loop in startExecutionLoop unlocks 60 FPS
      });

      // Hook up Absolute Cinema Two-Hand Screen Clear Gesture (strictly active during drawing mode)
      this.tracker.onCinemaGesture = () => {
        if (!this.isDrawingEnabled && this.currentMode !== 'challengeC') return;
        this.showToast('🎬 ABSOLUTE CINEMA! ล้างหน้าจอแล้ว ✨');
        this.userTextToPrint = null;
        if (this.textBubbleEl) {
          this.textBubbleEl.style.display = 'none';
        }
      };

      this.tracker.onResultsCallback = (res) => {
        if (res.handDetected) {
          this.hudHandDot.classList.add('active');
          this.hudHandText.textContent = 'Hand: Visible 🟢';
          this.hudFingers.textContent = `🖐️ Fingers: ${res.fingerCount >= 0 ? res.fingerCount : 0}`;
        } else {
          this.hudHandDot.classList.remove('active');
          this.hudHandText.textContent = 'Hand: Searching ⚪';
          this.hudFingers.textContent = '🖐️ Fingers: -';
        }

        if (this.currentMode === 'challengeC') {
          if (this.tracker.detectedShape && this.tracker.detectedShape !== 'None') {
            const emoji = this.tracker.detectedShape === 'Circle' ? '⭕' : (this.tracker.detectedShape === 'Triangle' ? '🔺' : '🟩');
            this.hudShape.textContent = `📐 Shape: ${this.tracker.detectedShape} ${emoji}`;
          } else if (res.isPinching) {
            this.hudShape.textContent = '📐 Shape: Drawing... ✍️ (Pinch Active)';
          } else if (this.tracker.drawingPoints && this.tracker.drawingPoints.length > 5) {
            this.hudShape.textContent = '📐 Shape: Ready (จีบนิ้วเพื่อวาดต่อ / กดตรวจ)';
          } else {
            this.hudShape.textContent = '📐 Shape: จีบนิ้วเพื่อวาด 🤏 | ยก 2 มือล้างจอ 🙌';
          }
        } else {
          this.hudShape.textContent = `📐 Shape: None`;
        }
      };

      await this.tracker.start();
    } catch (err) {
      console.warn('[CVWorkshop] Vision start warning:', err);
      this.hudHandText.textContent = 'Camera Off (Offline Mode)';
    }
  }

  startExecutionLoop() {
    const loop = () => {
      this.frameCount++;
      const now = performance.now();

      // Measure true framerate every 500ms
      if (now - this.lastFpsTime >= 500) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
        this.hudFps.textContent = `⚡ FPS: ${this.currentFps}`;
        this.frameCount = 0;
        this.lastFpsTime = now;
      }

      // Direct synchronous vision detection: updates landmarks & index tip cleanly in sync with render
      if (this.tracker) {
        this.tracker.detect();
      }

      // Hand detection tracking
      if (this.tracker && this.tracker.handDetected) {
        if (!this.hasTriggeredJarvis) {
          this.hasTriggeredJarvis = true;
        }
      } else {
        this.hasTriggeredJarvis = false;
      }

      this.userSpritesToDraw = [];
      this.userTextToPrint = null;

      // Execute student code if running
      if (this.isRunning && this.compiledUserFn && this.tracker) {
        const cvState = {
          handDetected: this.tracker.handDetected,
          fingerCount: this.tracker.handDetected ? (this.tracker.fingerCount >= 0 ? this.tracker.fingerCount : 0) : -1,
          detectedShape: this.tracker.detectedShape,
          getAiValue: (feature) => {
            if (!this.tracker) return (feature === 'fingers' ? -1 : 0);
            switch (feature) {
              case 'fingers':
                return this.tracker.handDetected ? (this.tracker.fingerCount >= 0 ? this.tracker.fingerCount : 0) : -1;
              case 'shape':
                return this.tracker.detectedShape || 'None';
              case 'index_x': {
                if (!this.tracker.handDetected) return -1;
                const pt = this.tracker.toCanvasCoords(this.tracker.indexTip.x, this.tracker.indexTip.y, this.canvas.width, this.canvas.height);
                return Math.round((pt.x / this.canvas.width) * 100);
              }
              case 'index_y': {
                if (!this.tracker.handDetected) return -1;
                const pt = this.tracker.toCanvasCoords(this.tracker.indexTip.x, this.tracker.indexTip.y, this.canvas.width, this.canvas.height);
                return Math.round((pt.y / this.canvas.height) * 100);
              }
              case 'palm_x': {
                if (!this.tracker.handDetected) return -1;
                const pt = this.tracker.toCanvasCoords(this.tracker.handCenter.x, this.tracker.handCenter.y, this.canvas.width, this.canvas.height);
                return Math.round((pt.x / this.canvas.width) * 100);
              }
              case 'palm_y': {
                if (!this.tracker.handDetected) return -1;
                const pt = this.tracker.toCanvasCoords(this.tracker.handCenter.x, this.tracker.handCenter.y, this.canvas.width, this.canvas.height);
                return Math.round((pt.y / this.canvas.height) * 100);
              }
              case 'hand_detected':
                return !!this.tracker.handDetected;
              default:
                return 0;
            }
          },
          getCoord: (part, axis) => {
            if (!this.tracker || !this.tracker.handDetected) return -1;
            let rawPt = this.tracker.handCenter;
            if (part === 'index') rawPt = this.tracker.indexTip;
            else if (part === 'thumb') rawPt = this.tracker.thumbTip;
            else if (this.tracker.lastLandmarks) {
              const tipIndices = { middle: 12, ring: 16, pinky: 20 };
              const idx = tipIndices[part];
              if (idx && this.tracker.lastLandmarks[idx]) {
                rawPt = this.tracker.lastLandmarks[idx];
              }
            }
            const pt = this.tracker.toCanvasCoords(rawPt.x, rawPt.y, this.canvas.width, this.canvas.height);
            return Math.round(axis === 'x' ? (pt.x / this.canvas.width) * 100 : (pt.y / this.canvas.height) * 100);
          },
          drawSprite: (spriteName, target = 'palm') => {
            if (!this.tracker || !this.tracker.handDetected) return;
            this.userSpritesToDraw.push({
              name: spriteName,
              target: target
            });
          },
          printText: (text, color = '#facc15') => {
            this.userTextToPrint = text;
            this.userTextColor = color;
          },
          enableDrawing: (enable) => {
            this.isDrawingEnabled = !!enable;
            if (this.tracker) {
              this.tracker.isDrawingActive = !!enable;
            }
          },
          clearDrawing: () => {
            if (this.tracker) {
              this.tracker.clearDrawing();
            }
          },
          playSound: (soundName) => {
            if (now - (this.lastSoundPlayTime || 0) > 1200) {
              if (soundName === 'swish') SoundFX.playSwish();
              else if (soundName === 'splat') SoundFX.playSplat();
              else if (soundName === 'combo') SoundFX.playCombo(3);
              else if (soundName === 'click') SoundFX.playClick();
              this.lastSoundPlayTime = now;
            }
          }
        };

        try {
          this.compiledUserFn(cvState);
        } catch (e) {
          // Ignore student script runtime error
        }
      }

      // Update text bubble UI
      if (this.userTextToPrint) {
        const textSpan = document.getElementById('printed-text-content');
        if (textSpan) {
          if (textSpan.textContent !== this.userTextToPrint) {
            textSpan.textContent = this.userTextToPrint;
          }
        }
        if (this.textBubbleEl && this.textBubbleEl.style.display !== 'inline-flex') {
          this.textBubbleEl.style.display = 'inline-flex';
        }
      } else {
        if (this.textBubbleEl && this.textBubbleEl.style.display !== 'none') {
          this.textBubbleEl.style.display = 'none';
        }
      }

      // Render Canvas
      this.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw perfectly aligned mirrored camera video directly on canvas
    if (this.tracker) {
      this.tracker.drawVideoBackground(this.ctx, this.canvas.width, this.canvas.height, 0.95);
    }

    // 2. Draw pixel-perfect hand skeleton overlay
    if (this.tracker && this.tracker.handDetected && this.tracker.lastLandmarks) {
      this.tracker.drawSkeleton(this.ctx, this.canvas.width, this.canvas.height);
    }

    // 3. Draw finger trail ONLY IF DRAWING IS ACTIVELY ENABLED
    if (this.isDrawingEnabled && this.tracker && this.tracker.drawingPoints.length > 1) {
      this.drawDrawingTrail(this.tracker.drawingPoints);
    }

    // 4. Draw student attached sprites (All 5 VFX animations on any of 5 fingers or palm)
    if (this.tracker && this.tracker.handDetected && this.tracker.lastLandmarks) {
      const pts = this.tracker.lastLandmarks.map(lm => {
        const c = this.tracker.toCanvasCoords(lm.x, lm.y, this.canvas.width, this.canvas.height);
        return { x: c.x, y: c.y, z: lm.z || 0 };
      });
      this.userSpritesToDraw.forEach(s => {
        SpriteRenderer.drawVFX(this.ctx, s.name, pts, s.target);
      });
    }
  }

  drawDrawingTrail(points) {
    if (!points || points.length === 0) return;
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const pts = points.map(p => ({
      coords: this.tracker.toCanvasCoords(p.x, p.y, this.canvas.width, this.canvas.height),
      isNewStroke: p.isNewStroke
    }));

    // Glow
    this.ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (i === 0 || pts[i].isNewStroke) {
        this.ctx.moveTo(pts[i].coords.x, pts[i].coords.y);
      } else {
        this.ctx.lineTo(pts[i].coords.x, pts[i].coords.y);
      }
    }
    this.ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
    this.ctx.lineWidth = 14;
    this.ctx.stroke();

    // Core
    this.ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (i === 0 || pts[i].isNewStroke) {
        this.ctx.moveTo(pts[i].coords.x, pts[i].coords.y);
      } else {
        this.ctx.lineTo(pts[i].coords.x, pts[i].coords.y);
      }
    }
    this.ctx.strokeStyle = '#facc15';
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    this.ctx.restore();
  }
}

// Strict Allowed Block Sets per Challenge (prevents carrying unneeded/irrelevant blocks across sessions)
CVWorkshopApp.ALLOWED_BLOCKS = {
  challengeA: new Set([
    'ai_sensor', 'ai_attach_sprite',
    'controls_if', 'controls_ifelse', 'ai_if_fingers',
    'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean',
    'math_number', 'math_arithmetic',
    'ai_print_text', 'text', 'text_join', 'text_length',
    'ai_play_sound', 'variables_get', 'variables_set'
  ]),
  challengeB: new Set([
    'ai_sensor',
    'controls_if', 'controls_ifelse', 'ai_if_fingers',
    'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean',
    'math_number', 'math_arithmetic',
    'ai_print_text', 'text', 'text_join', 'text_length',
    'ai_play_sound', 'variables_get', 'variables_set'
  ]),
  challengeC: new Set([
    'ai_sensor', 'ai_draw_trail', 'ai_clear_screen',
    'controls_if', 'controls_ifelse', 'ai_if_shape',
    'logic_compare', 'ai_shape_value', 'logic_operation', 'logic_negate', 'logic_boolean',
    'ai_print_text', 'text', 'text_join', 'text_length',
    'ai_play_sound', 'variables_get', 'variables_set'
  ])
};

window.addEventListener('DOMContentLoaded', () => {
  window.workshopApp = new CVWorkshopApp();
});

