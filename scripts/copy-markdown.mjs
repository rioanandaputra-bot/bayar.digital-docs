import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('docs');
const staticDir = path.resolve('static/markdown');

if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  fs.copyFileSync(path.join(docsDir, file), path.join(staticDir, file));
  console.log(`Copied ${file} → static/markdown/${file}`);
}
