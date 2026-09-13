// Shared by browser (<script>) and Node (test.js) — no build step.
function presetToMeters(diagonalInches, aspectW, aspectH) {
  const diag = diagonalInches / Math.sqrt(aspectW * aspectW + aspectH * aspectH);
  return {
    width: diag * aspectW * 0.0254,
    height: diag * aspectH * 0.0254,
  };
}

const PRESETS = [
  // PC Monitors 16:9
  { name: '24" 16:9', diagonalInches: 24, aspectW: 16, aspectH: 9, category: 'PC Monitors 16:9' },
  { name: '27" 16:9', diagonalInches: 27, aspectW: 16, aspectH: 9, category: 'PC Monitors 16:9' },
  { name: '32" 16:9', diagonalInches: 32, aspectW: 16, aspectH: 9, category: 'PC Monitors 16:9' },

  // PC Monitors 16:10
  { name: '24" 16:10', diagonalInches: 24, aspectW: 16, aspectH: 10, category: 'PC Monitors 16:10' },
  { name: '27" 16:10', diagonalInches: 27, aspectW: 16, aspectH: 10, category: 'PC Monitors 16:10' },
  { name: '32" 16:10', diagonalInches: 32, aspectW: 16, aspectH: 10, category: 'PC Monitors 16:10' },

  // Ultrawide 21:9
  { name: '29" 21:9', diagonalInches: 29, aspectW: 21, aspectH: 9, category: 'Ultrawide 21:9' },
  { name: '34" 21:9', diagonalInches: 34, aspectW: 21, aspectH: 9, category: 'Ultrawide 21:9' },
  { name: '38" 21:9', diagonalInches: 38, aspectW: 21, aspectH: 9, category: 'Ultrawide 21:9' },

  // Super Ultrawide 32:9
  { name: '49" 32:9', diagonalInches: 49, aspectW: 32, aspectH: 9, category: 'Super Ultrawide 32:9' },
  { name: '57" 32:9', diagonalInches: 57, aspectW: 32, aspectH: 9, category: 'Super Ultrawide 32:9' },

  // TVs 16:9
  { name: '43" 16:9', diagonalInches: 43, aspectW: 16, aspectH: 9, category: 'TVs 16:9' },
  { name: '55" 16:9', diagonalInches: 55, aspectW: 16, aspectH: 9, category: 'TVs 16:9' },
  { name: '65" 16:9', diagonalInches: 65, aspectW: 16, aspectH: 9, category: 'TVs 16:9' },
  { name: '75" 16:9', diagonalInches: 75, aspectW: 16, aspectH: 9, category: 'TVs 16:9' },
  { name: '85" 16:9', diagonalInches: 85, aspectW: 16, aspectH: 9, category: 'TVs 16:9' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { presetToMeters, PRESETS };
}
