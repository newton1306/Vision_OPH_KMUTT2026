const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filesToTest = [
  'src/main/main.js',
  'src/shared/audio/sound.js',
  'src/shared/assets/sprites.js',
  'src/shared/vision/hand_tracker.js',
  'src/fruit_ninja/game.js',
  'src/cv_workshop/custom_blocks.js',
  'src/cv_workshop/templates.js',
  'src/cv_workshop/app.js',
  'src/menu/menu.js'
];

let allPassed = true;

filesToTest.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  try {
    const code = fs.readFileSync(fullPath, 'utf8');
    // Check syntax by creating a Script object
    new vm.Script(code, { filename: relPath });
    console.log(`[PASS] Syntax valid: ${relPath}`);
  } catch (err) {
    console.error(`[FAIL] Syntax error in ${relPath}:`, err.message);
    allPassed = false;
  }
});

// Verify offline files presence
const requiredOfflineFiles = [
  'src/shared/libs/blockly/blockly_compressed.js',
  'src/shared/libs/blockly/blocks_compressed.js',
  'src/shared/libs/blockly/javascript_compressed.js',
  'src/shared/libs/blockly/msg/en.js',
  'src/shared/libs/mediapipe/camera_utils.js',
  'src/shared/libs/mediapipe/hands.js',
  'src/shared/libs/mediapipe/hands_solution_wasm_bin.wasm',
  'src/shared/libs/mediapipe/hands_solution_packed_assets.data',
  'src/shared/libs/mediapipe/hand_landmark_lite.tflite',
  'build/icon.ico',
  'build/fruit_ninja.ico',
  'build/cv_workshop.ico',
  'build/installer.nsh',
  'src/main/kiosk-guard.exe'
];

requiredOfflineFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size;
    console.log(`[PASS] Offline asset present: ${relPath} (${(size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`[FAIL] Missing offline asset: ${relPath}`);
    allPassed = false;
  }
});

// Check HTML files for prohibited external URLs
const htmlFiles = ['src/fruit_ninja/index.html', 'src/cv_workshop/index.html', 'src/menu/index.html'];
const cdnPatterns = [/http:\/\//i, /https:\/\//i, /cdn/i, /unpkg/i, /cdnjs/i];

htmlFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Exclude xml namespace standard url in templates or doctype
    if (line.includes('xmlns=')) return;
    if (line.includes('http://') || line.includes('https://') || line.includes('unpkg.com') || line.includes('cdnjs.cloudflare.com')) {
      console.warn(`[WARN] External link detected in ${relPath} line ${idx + 1}: ${line.trim()}`);
      allPassed = false;
    }
  });
  console.log(`[PASS] Zero CDN check passed: ${relPath}`);
});

if (!allPassed) {
  process.exit(1);
} else {
  console.log('\n>>> ALL OFFLINE SYNTAX AND ASSET INTEGRITY CHECKS PASSED! <<<');
}
