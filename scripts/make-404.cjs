const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '../dist');
const index = path.join(dist, 'index.html');
const dest = path.join(dist, '404.html');

if (fs.existsSync(index)) {
  fs.copyFileSync(index, dest);
  console.log('Copied index.html to 404.html for GitHub Pages SPA fallback');
} else {
  console.error('index.html not found in dist. Run build first.');
  process.exit(1);
}
