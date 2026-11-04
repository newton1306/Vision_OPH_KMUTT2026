const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const csPath = path.join(__dirname, '..', 'src', 'main', 'kiosk_guard.cs');
const exePath = path.join(__dirname, '..', 'src', 'main', 'kiosk-guard.exe');

// Standard Windows .NET Framework 4.0/4.8 CSC compiler paths
const candidateCscPaths = [
  'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe',
  'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe'
];

let cscExe = candidateCscPaths.find(p => fs.existsSync(p));

if (!cscExe) {
  try {
    cscExe = execSync('where csc.exe', { encoding: 'utf8' }).trim().split('\n')[0].trim();
  } catch (_) {}
}

if (!cscExe || !fs.existsSync(cscExe)) {
  console.error('[ERROR] Could not find csc.exe compiler on this Windows system.');
  process.exit(1);
}

console.log(`[BUILD] Compiling kiosk_guard.cs using ${cscExe}...`);

const cmd = `"${cscExe}" /nologo /target:winexe /optimize+ /reference:System.Windows.Forms.dll /out:"${exePath}" "${csPath}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  const stat = fs.statSync(exePath);
  console.log(`[SUCCESS] Compiled kiosk-guard.exe (${(stat.size / 1024).toFixed(1)} KB) -> ${exePath}`);
} catch (err) {
  console.error('[ERROR] Compilation of kiosk-guard.exe failed:', err.message);
  process.exit(1);
}
