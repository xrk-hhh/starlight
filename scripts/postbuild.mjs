import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')

const redirectScript = `<script>
  (function () {
    var segments = location.pathname.split('/');
    var repo = segments[1] || '';
    var root = repo ? '/' + repo + '/' : '/';
    sessionStorage.redirect = location.href;
    location.replace(root);
  })();
</script>`

const html = readFileSync('dist/404.html', 'utf-8')
  .replace('<head>', '<head>' + redirectScript)

writeFileSync('dist/404.html', html)
