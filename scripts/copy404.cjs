const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'dist')
const source = path.join(distDir, 'index.html')
const target = path.join(distDir, '404.html')

if (!fs.existsSync(source)) {
  console.error('Build output not found. Run "npm run build" before copying 404.html.')
  process.exit(1)
}

fs.copyFileSync(source, target)
console.log(`Created ${target} to mirror ${source} for GitHub Pages SPA routing.`)
