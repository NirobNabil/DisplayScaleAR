const assert = require('assert');
const { presetToMeters } = require('./public/presets.js');

function close(actual, expected, tol = 0.001) {
  assert(Math.abs(actual - expected) < tol, `expected ~${expected}, got ${actual}`);
}

const cases = [
  { diag: 27, w: 16, h: 9, cm: [59.77, 33.62] },
  { diag: 32, w: 16, h: 9, cm: [70.84, 39.85] },
  { diag: 34, w: 21, h: 9, cm: [79.50, 34.07] },
  { diag: 49, w: 32, h: 9, cm: [119.65, 33.65] },
  { diag: 65, w: 16, h: 9, cm: [143.92, 80.96] },
];

for (const { diag, w, h, cm } of cases) {
  const { width, height } = presetToMeters(diag, w, h);
  close(width * 100, cm[0], 0.2);
  close(height * 100, cm[1], 0.2);
}

console.log('presetToMeters: all tests passed');
