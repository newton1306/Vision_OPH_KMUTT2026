const fs = require('fs');
const path = require('path');

// Mock browser DOM for Blockly
const jsdom = require('jsdom') || null;
console.log('Testing templates syntax and validity...');

const templatesFile = fs.readFileSync(path.join(__dirname, '../src/cv_workshop/templates.js'), 'utf8');
eval(templatesFile.replace('const WorkshopTemplates =', 'global.WorkshopTemplates ='));

console.log('Available templates:', Object.keys(WorkshopTemplates));

Object.keys(WorkshopTemplates).forEach(name => {
  const xml = WorkshopTemplates[name];
  console.log(`Checking template: ${name} (length: ${xml.length})`);
  if (!xml.startsWith('<xml') || !xml.endsWith('</xml>')) {
    console.error(`Invalid XML tags in ${name}`);
    process.exit(1);
  }
});
console.log('All templates have valid XML structure!');
