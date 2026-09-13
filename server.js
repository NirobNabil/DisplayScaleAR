// Static file server over HTTPS (WebXR requires a secure context on a LAN IP).
// Run: node server.js  then open https://<laptop-lan-ip>:8443 on the phone.
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8443;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
};

if (!fs.existsSync('cert.pem') || !fs.existsSync('key.pem')) {
  console.error('Missing cert.pem/key.pem — run `node generate-cert.js` first.');
  process.exit(1);
}

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

https.createServer(options, (req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Serving ${ROOT} at https://<this-machine-lan-ip>:${PORT}`);
});
