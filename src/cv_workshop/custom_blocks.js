// Custom Google Blockly AI & Vision Blocks for CV Workshop
(function () {
  if (typeof Blockly === 'undefined') {
    console.error('Blockly is not loaded!');
    return;
  }

  // Robust resolver for JavaScript code generator across all Blockly versions
  function getJsGen() {
    if (typeof window !== 'undefined' && window.javascript && window.javascript.javascriptGenerator) {
      if (!Blockly.JavaScript) {
        Blockly.JavaScript = window.javascript.javascriptGenerator;
      }
      return window.javascript.javascriptGenerator;
    }
    if (Blockly.JavaScript) return Blockly.JavaScript;
    if (Blockly.javascript && Blockly.javascript.javascriptGenerator) return Blockly.javascript.javascriptGenerator;
    return null;
  }

  const AI_COLOR = '#7c3aed'; // Vibrant Purple

  function registerGenerator(blockName, generatorFn) {
    const jsGen = getJsGen();
    if (jsGen) {
      if (jsGen.forBlock) {
        jsGen.forBlock[blockName] = generatorFn;
      }
      jsGen[blockName] = generatorFn;
    }
  }

  // Helper: Verify if an action block is properly enclosed within a conditional structure (if / ifelse / ai_if_*)
  function isEnclosedInCondition(block) {
    if (!block) return false;
    let parent = block.getSurroundParent();
    while (parent) {
      const t = parent.type;
      if (t === 'controls_if' || t === 'controls_ifelse' || t.startsWith('ai_if_')) {
        return true;
      }
      parent = parent.getSurroundParent();
    }
    return false;
  }
  // Expose helper globally for workspace compile validation
  if (typeof window !== 'undefined') {
    window.isEnclosedInCondition = isEnclosedInCondition;
  }

  // 0. Core Unified AI Sensor Block (Output connector, functions like variables)
  Blockly.Blocks['ai_sensor'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('👁️ AI')
        .appendField(new Blockly.FieldDropdown([
          ['🖐️ จำนวนนิ้วที่ตรวจพบ', 'fingers'],
          ['📐 รูปทรงที่ตรวจพบ', 'shape'],
          ['📍 ตำแหน่ง X นิ้วชี้', 'index_x'],
          ['📍 ตำแหน่ง Y นิ้วชี้', 'index_y'],
          ['📍 ตำแหน่ง X ฝ่ามือ', 'palm_x'],
          ['📍 ตำแหน่ง Y ฝ่ามือ', 'palm_y'],
          ['👀 ตรวจพบมือหรือไม่', 'hand_detected']
        ]), 'FEATURE');
      this.setOutput(true, null);
      this.setColour(AI_COLOR);
      this.setTooltip('อ่านค่าจากระบบตรวจจับ AI (จำนวนนิ้ว, รูปทรง, ตำแหน่งนิ้ว หรือสถานะมือ) เพื่อนำไปต่อกับ if หรือตัวแปร');
    }
  };

  registerGenerator('ai_sensor', function (block) {
    const feature = block.getFieldValue('FEATURE');
    return [`cvState.getAiValue('${feature}')`, 0];
  });

  // 0.1 Shape Selector Value Block (Placed in Logic category for comparison)
  Blockly.Blocks['ai_shape_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('รูปทรง')
        .appendField(new Blockly.FieldDropdown([
          ['Circle ⭕ (วงกลม)', 'Circle'],
          ['Triangle 🔺 (สามเหลี่ยม)', 'Triangle'],
          ['Square 🟩 (สี่เหลี่ยม)', 'Square']
        ]), 'SHAPE');
      this.setOutput(true, 'String');
      this.setColour('#00aba9');
      this.setTooltip('ค่ารูปทรงเรขาคณิตสำหรับนำไปเปรียบเทียบกับ AI รูปทรงที่ตรวจพบ');
    }
  };

  registerGenerator('ai_shape_value', function (block) {
    if (typeof window !== 'undefined' && window.workshopApp && window.workshopApp.currentMode !== 'challengeC') {
      return ["'None'", 0];
    }
    const shape = block.getFieldValue('SHAPE');
    return [`'${shape}'`, 0];
  });

  // 1. Block: [If] [AI detects: X fingers] [Then] (Legacy fallback)
  Blockly.Blocks['ai_if_fingers'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('✋ if AI detects')
        .appendField(new Blockly.FieldDropdown([
          ['1 finger', '1'],
          ['2 fingers', '2'],
          ['3 fingers', '3'],
          ['4 fingers', '4'],
          ['5 fingers (open hand)', '5'],
          ['0 fingers (fist)', '0']
        ]), 'FINGERS');
      this.appendStatementInput('DO')
        .appendField('then');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(AI_COLOR);
      this.setTooltip('Runs blocks when AI detects the chosen number of fingers.');
    }
  };

  registerGenerator('ai_if_fingers', function (block, generator) {
    const gen = generator || getJsGen();
    const fingers = block.getFieldValue('FINGERS');
    const branch = gen.statementToCode(block, 'DO');
    return `if (cvState.handDetected && cvState.fingerCount === ${fingers}) {\n${branch}}\n`;
  });

  // 2. Block: [If] [AI detects Shape: X] [Then]
  Blockly.Blocks['ai_if_shape'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('📐 if AI detects shape')
        .appendField(new Blockly.FieldDropdown([
          ['Circle ⭕', 'Circle'],
          ['Triangle 🔺', 'Triangle'],
          ['Square 🟩', 'Square']
        ]), 'SHAPE');
      this.appendStatementInput('DO')
        .appendField('then');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(AI_COLOR);
      this.setTooltip('Runs blocks when AI detects the drawn or gestured shape.');
    }
  };

  registerGenerator('ai_if_shape', function (block, generator) {
    const gen = generator || getJsGen();
    const shape = block.getFieldValue('SHAPE');
    const branch = gen.statementToCode(block, 'DO');
    return `if (cvState.detectedShape === '${shape}') {\n${branch}}\n`;
  });

  // 3. Block: [Track X, Y of Hand]
  Blockly.Blocks['ai_get_hand_xy'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('📍 track')
        .appendField(new Blockly.FieldDropdown([
          ['X position', 'x'],
          ['Y position', 'y']
        ]), 'COORD')
        .appendField('of')
        .appendField(new Blockly.FieldDropdown([
          ['Index Fingertip', 'index'],
          ['Hand Center / Palm', 'palm']
        ]), 'PART');
      this.setOutput(true, 'Number');
      this.setColour(AI_COLOR);
      this.setTooltip('Returns the coordinate (0 to 100) of the selected hand part.');
    }
  };

  registerGenerator('ai_get_hand_xy', function (block) {
    const coord = block.getFieldValue('COORD');
    const part = block.getFieldValue('PART');
    const code = `cvState.getCoord('${part}', '${coord}')`;
    return [code, 0];
  });

  // Offline SVG Thumbnails for Animation Visual Preview in Blockly Blocks
  const makeSvgUri = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

  const SPRITE_THUMBNAILS = {
    ironman: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#0f172a" stroke="#00f0ff" stroke-width="2.5"/><circle cx="20" cy="20" r="12" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,2"/><circle cx="20" cy="20" r="6" fill="#ffffff" stroke="#00f0ff" stroke-width="2"/><line x1="20" y1="2" x2="20" y2="38" stroke="#00f0ff" stroke-width="1.5"/><line x1="2" y1="20" x2="38" y2="20" stroke="#00f0ff" stroke-width="1.5"/></svg>'),
    rasengan: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/><circle cx="20" cy="20" r="13" fill="#0284c7" stroke="#e0f2fe" stroke-width="2" stroke-dasharray="6,3"/><path d="M20,5 Q35,20 20,35 Q5,20 20,5" fill="none" stroke="#ffffff" stroke-width="2.5"/><circle cx="20" cy="20" r="5" fill="#ffffff"/></svg>'),
    fireball: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/><circle cx="20" cy="20" r="13" fill="#ea580c"/><circle cx="20" cy="20" r="8" fill="#f59e0b"/><circle cx="20" cy="20" r="4" fill="#fef08a"/><path d="M20,3 Q27,13 20,20 Q13,13 20,3" fill="#fbbf24"/></svg>'),
    blackhole: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#090514" stroke="#c084fc" stroke-width="2"/><ellipse cx="20" cy="20" rx="17" ry="6" fill="none" stroke="#c084fc" stroke-width="2.5"/><ellipse cx="20" cy="20" rx="13" ry="4" fill="none" stroke="#ec4899" stroke-width="1.5"/><circle cx="20" cy="20" r="6" fill="#020617" stroke="#38bdf8" stroke-width="1.5"/></svg>'),
    magic_circle: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#1c1917" stroke="#f59e0b" stroke-width="2"/><circle cx="20" cy="20" r="14" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3,2"/><polygon points="20,7 31,26 9,26" fill="none" stroke="#f59e0b" stroke-width="1.5"/><polygon points="20,33 31,14 9,14" fill="none" stroke="#f59e0b" stroke-width="1.5"/><circle cx="20" cy="20" r="4" fill="#fef08a"/></svg>')
  };

  const SPRITE_OPTIONS = [
    ['💥 Iron Man Arc Repulsor (Mark 85)', 'ironman'],
    ['🌀 Chakra Rasengan (กระสุนวงจักร)', 'rasengan'],
    ['🔥 Solar Flare (บอลเพลิงสุริยะ)', 'fireball'],
    ['🌌 Cosmic Singularity (หลุมดำคอสมิก)', 'blackhole'],
    ['✨ Mystic Arts Mandala (วงเวทย์มิติ)', 'magic_circle']
  ];

  const TARGET_OPTIONS = [
    ['🖐️ Palm (ฝ่ามือ)', 'palm'],
    ['👍 Thumb (นิ้วโป้ง)', 'thumb'],
    ['☝️ Index (นิ้วชี้)', 'index'],
    ['🖕 Middle (นิ้วกลาง)', 'middle'],
    ['💍 Ring (นิ้วนาง)', 'ring'],
    ['🤙 Pinky (นิ้วก้อย)', 'pinky']
  ];

  // 4. Block: [Attach Sprite/Effect to Palm & Fingertip]
  Blockly.Blocks['ai_attach_sprite'] = {
    init: function () {
      const initialSprite = 'ironman';
      this.previewImg = new Blockly.FieldImage(SPRITE_THUMBNAILS[initialSprite], 26, 26, 'VFX Preview');

      const spriteDropdown = new Blockly.FieldDropdown(SPRITE_OPTIONS, (newValue) => {
        if (this.previewImg && SPRITE_THUMBNAILS[newValue]) {
          this.previewImg.setValue(SPRITE_THUMBNAILS[newValue]);
        }
        return newValue;
      });

      this.appendDummyInput()
        .appendField('✨ attach')
        .appendField(this.previewImg, 'PREVIEW_IMG')
        .appendField(spriteDropdown, 'SPRITE')
        .appendField('to')
        .appendField(new Blockly.FieldDropdown(TARGET_OPTIONS), 'TARGET');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(AI_COLOR);
      this.setTooltip('Attaches an epic VFX animation to your palm or any of the 5 fingers.');
    },
    onchange: function () {
      const sprite = this.getFieldValue('SPRITE');
      if (this.previewImg && SPRITE_THUMBNAILS[sprite] && this.previewImg.getValue() !== SPRITE_THUMBNAILS[sprite]) {
        this.previewImg.setValue(SPRITE_THUMBNAILS[sprite]);
      }
      if (this.workspace && !this.isInFlyout) {
        if (!isEnclosedInCondition(this)) {
          this.setWarningText('⚠️ บล็อกคำสั่งนี้ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข');
        } else {
          this.setWarningText(null);
        }
      }
    }
  };

  registerGenerator('ai_attach_sprite', function (block) {
    if (typeof window !== 'undefined' && window.workshopApp && window.workshopApp.currentMode !== 'challengeA') {
      return '// ⚠️ บล็อก [attach sprite] อนุญาตให้ใช้เฉพาะใน Challenge A เท่านั้น\n';
    }
    if (!isEnclosedInCondition(block)) {
      return '// ⚠️ บล็อก [attach sprite] ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข\n';
    }
    const sprite = block.getFieldValue('SPRITE');
    const target = block.getFieldValue('TARGET');
    return `cvState.drawSprite('${sprite}', '${target}');\n`;
  });

  // Offline SVG Thumbnail for 3D Ribbon Pill Banner
  const RIBBON_PILL_SVG = makeSvgUri(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 28" width="42" height="20">' +
    '<!-- Red Pill -->' +
    '<rect x="2" y="6" width="56" height="20" rx="10" fill="#ed2c23" stroke="#b51e12" stroke-width="1.6"/>' +
    '<rect x="4" y="8" width="52" height="16" rx="8" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>' +
    '<!-- Ribbon Curls Behind -->' +
    '<path d="M8 8 C6 8 5 6 7 3 C9 2 11 2 12 5 Z" fill="#1b2260"/>' +
    '<path d="M52 8 C54 8 55 6 53 3 C51 2 49 2 48 5 Z" fill="#1b2260"/>' +
    '<!-- Blue Ribbon Front Flap -->' +
    '<path d="M10 2 L50 2 C48 3 47 5 47 7 C46 9 45 11 43 11 L17 11 C15 11 14 9 13 7 C13 5 12 3 10 2 Z" fill="#3b65bf"/>' +
    '</svg>'
  );

  // 5. Block: [Print Text on Screen: "___"]
  Blockly.Blocks['ai_print_text'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField(new Blockly.FieldImage(RIBBON_PILL_SVG, 36, 18, 'Ribbon Pill Banner'))
        .appendField('💬 print text');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#dc2626'); // Vibrant Crimson matching the pill badge
      this.setTooltip('Displays the 3D glossy Pill Badge with Curled Blue Ribbon on the camera feed.');
    },
    onchange: function () {
      if (this.workspace && !this.isInFlyout) {
        if (!isEnclosedInCondition(this)) {
          this.setWarningText('⚠️ บล็อกคำสั่งนี้ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข');
        } else {
          this.setWarningText(null);
        }
      }
    }
  };

  registerGenerator('ai_print_text', function (block, generator) {
    if (!isEnclosedInCondition(block)) {
      return '// ⚠️ บล็อก [print text] ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข\n';
    }
    const gen = generator || getJsGen();
    const textCode = gen.valueToCode(block, 'TEXT', 0) || "''";
    return `cvState.printText(${textCode});\n`;
  });

  // 6. Block: [Hand is Detected] (Boolean Reporter)
  Blockly.Blocks['ai_hand_detected'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('👀 hand is visible?');
      this.setOutput(true, 'Boolean');
      this.setColour(AI_COLOR);
      this.setTooltip('Returns TRUE if a hand is currently seen by the camera.');
    }
  };

  registerGenerator('ai_hand_detected', function () {
    return ['cvState.handDetected', 0];
  });

  // 7. Block: [Number of Detected Fingers] (Number Reporter)
  Blockly.Blocks['ai_finger_count'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🖐️ count of fingers');
      this.setOutput(true, 'Number');
      this.setColour(AI_COLOR);
      this.setTooltip('Returns the number of fingers currently held up (0 to 5).');
    }
  };

  registerGenerator('ai_finger_count', function () {
    return ['cvState.fingerCount', 0];
  });

  // 8. Block: [Enable Drawing Trail]
  Blockly.Blocks['ai_draw_trail'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('✏️ finger drawing trail')
        .appendField(new Blockly.FieldDropdown([
          ['ON (จีบนิ้วเพื่อวาด / pinch to draw)', 'true'],
          ['OFF (หยุดวาด / stop drawing)', 'false']
        ]), 'STATE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(AI_COLOR);
      this.setTooltip('Enables or disables drawing lines on screen by pinching thumb and index finger together (จีบนิ้วเพื่อวาด).');
    }
  };

  registerGenerator('ai_draw_trail', function (block) {
    if (typeof window !== 'undefined' && window.workshopApp && window.workshopApp.currentMode !== 'challengeC') {
      return '// ⚠️ บล็อกวาดเส้น อนุญาตให้ใช้เฉพาะใน Challenge C เท่านั้น\n';
    }
    const state = block.getFieldValue('STATE');
    return `cvState.enableDrawing(${state});\n`;
  });

  // 9. Block: [Clear Screen & Drawings]
  Blockly.Blocks['ai_clear_screen'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🧹 clear screen drawings');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(AI_COLOR);
      this.setTooltip('Clears drawn strokes and temporary messages.');
    },
    onchange: function () {
      if (this.workspace && !this.isInFlyout) {
        if (!isEnclosedInCondition(this)) {
          this.setWarningText('⚠️ บล็อกคำสั่งนี้ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข');
        } else {
          this.setWarningText(null);
        }
      }
    }
  };

  registerGenerator('ai_clear_screen', function (block) {
    if (typeof window !== 'undefined' && window.workshopApp && window.workshopApp.currentMode !== 'challengeC') {
      return '// ⚠️ บล็อกล้างหน้าจอ อนุญาตให้ใช้เฉพาะใน Challenge C เท่านั้น\n';
    }
    if (!isEnclosedInCondition(block)) {
      return '// ⚠️ บล็อก [clear screen] ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข\n';
    }
    return 'cvState.clearDrawing();\n';
  });

  // 10. Block: [Play Sound Effect]
  Blockly.Blocks['ai_play_sound'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🔊 play sound')
        .appendField(new Blockly.FieldDropdown([
          ['Blade Swish', 'swish'],
          ['Fruit Splat', 'splat'],
          ['Combo Fanfare', 'combo'],
          ['Click', 'click']
        ]), 'SOUND');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#d83b01'); // Music Category
      this.setTooltip('Plays an offline synthesized sound effect.');
    },
    onchange: function () {
      if (this.workspace && !this.isInFlyout) {
        if (!isEnclosedInCondition(this)) {
          this.setWarningText('⚠️ บล็อกคำสั่งนี้ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข');
        } else {
          this.setWarningText(null);
        }
      }
    }
  };

  registerGenerator('ai_play_sound', function (block) {
    if (!isEnclosedInCondition(block)) {
      return '// ⚠️ บล็อก [play sound] ต้องต่ออยู่ภายในบล็อก if เพื่อกำหนดเงื่อนไข\n';
    }
    const sound = block.getFieldValue('SOUND');
    return `cvState.playSound('${sound}');\n`;
  });

  console.log('[CustomBlocks] AI & Vision Blockly blocks registered successfully.');
})();
