const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');

const replacements = [
  { pattern: /bg-white(?![\/\-])/g, replacement: 'bg-white/10' },
  { pattern: /border-stone-[0-9]+/g, replacement: 'border-white/20' },
  { pattern: /text-stone-[789]00/g, replacement: 'text-white' },
  { pattern: /text-stone-[56]00/g, replacement: 'text-white/80' },
  { pattern: /text-stone-400/g, replacement: 'text-white/60' },
  { pattern: /bg-stone-[12]?00/g, replacement: 'bg-white/10' },
  { pattern: /bg-stone-50(?!\/)/g, replacement: 'bg-white/5' },
  { pattern: /bg-stone-[89]00/g, replacement: 'bg-white' },
  { pattern: /text-amber-[0-9]+/g, replacement: 'text-white' },
  { pattern: /bg-amber-50/g, replacement: 'bg-white/10' },
  { pattern: /border-amber-200/g, replacement: 'border-white/20' },
  { pattern: /bg-orange-[0-9]+/g, replacement: 'bg-white text-orange-500' },
  { pattern: /text-orange-[0-9]+/g, replacement: 'text-white' },
  { pattern: /text-emerald-[0-9]+/g, replacement: 'text-white font-bold' },
  { pattern: /bg-emerald-50/g, replacement: 'bg-white/10' },
  { pattern: /border-emerald-[0-9]+/g, replacement: 'border-white/20' },
  { pattern: /shadow-sm/g, replacement: '' }, // Remove soft shadows for flat design
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (const r of replacements) {
        newContent = newContent.replace(r.pattern, r.replacement);
      }
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

processDir(dir);
