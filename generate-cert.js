// One-time self-signed cert for LAN HTTPS (WebXR requires a secure context).
// Run: node generate-cert.js
const os = require('os');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ips = Object.values(os.networkInterfaces())
  .flat()
  .filter((i) => i.family === 'IPv4' && !i.internal)
  .map((i) => i.address);

const altNames = ['DNS:localhost', 'IP:127.0.0.1', ...ips.map((ip) => `IP:${ip}`)].join(',');
const config = `[req]
distinguished_name=req
[san]
subjectAltName=${altNames}
`;
fs.writeFileSync('openssl-san.cnf', config);

execFileSync('openssl', [
  'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '825',
  '-keyout', 'key.pem', '-out', 'cert.pem',
  '-subj', '/CN=localhost',
  '-extensions', 'san', '-config', 'openssl-san.cnf',
]);

fs.unlinkSync('openssl-san.cnf');
console.log('Generated cert.pem and key.pem, valid for: localhost, 127.0.0.1' + (ips.length ? ', ' + ips.join(', ') : ''));
