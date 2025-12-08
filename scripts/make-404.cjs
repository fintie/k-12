const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '../dist');
const dest = path.join(dist, '404.html');

// Create a small redirecting 404 page that forwards unknown paths to the
// hash-based route (so /k-12/news -> /k-12/#/news). This avoids relying on
// GitHub Pages serving index.html for deep links.
const redirectHtml = `<!doctype html>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=/k-12/#${""}">
<script>
  (function(){
    try {
      var path = window.location.pathname || '/';
      var search = window.location.search || '';
      var hash = window.location.hash || '';
      // Ensure base is /k-12 — if site served at root adjust accordingly
      var base = '/k-12';
      // If already contains hash, just reload
      if (path.indexOf('#') !== -1) {
        return;
      }
      var target = base + '/#' + path + search + hash;
      // Normalize double slashes
      target = target.replace(/([^:])\/\//g, '$1/');
      window.location.replace(target);
    } catch (e) {
      console.error(e);
    }
  })();
</script>
<title>Redirecting…</title>`;

try {
  fs.writeFileSync(dest, redirectHtml, 'utf8');
  console.log('Wrote redirecting 404.html for GitHub Pages SPA fallback');
} catch (err) {
  console.error('Failed to write 404.html', err);
  process.exit(1);
}
