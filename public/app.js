import * as THREE from './three.module.min.js';

const startBtn = document.getElementById('start-ar');
const startScreen = document.getElementById('start');
const unsupportedEl = document.getElementById('unsupported');
const hintEl = document.getElementById('hint');
const overlayEl = document.getElementById('overlay');
const selectEl = document.getElementById('preset');
const resetBtn = document.getElementById('reset');

// PRESETS / presetToMeters come from presets.js (plain <script>, loaded before this module).

for (const category of [...new Set(PRESETS.map((p) => p.category))]) {
  const group = document.createElement('optgroup');
  group.label = category;
  PRESETS.forEach((p, i) => {
    if (p.category !== category) return;
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = p.name;
    group.appendChild(opt);
  });
  selectEl.appendChild(group);
}

if (!navigator.xr) {
  unsupportedEl.style.display = 'flex';
  startScreen.style.display = 'none';
} else {
  navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
    if (!supported) {
      unsupportedEl.style.display = 'flex';
      startScreen.style.display = 'none';
    }
  });
}

let renderer, scene, camera, reticle, controller;
let hitTestSource = null;
let localSpace = null;
let anchorTransform = null; // { position: THREE.Vector3, quaternion: THREE.Quaternion }
let rectGroup = null;
let latestHitPose = null;

function makeLabelSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.5, 0.125, 1);
  return sprite;
}

function buildRectGroup(presetIndex) {
  const preset = PRESETS[presetIndex];
  const { width, height } = presetToMeters(preset.diagonalInches, preset.aspectW, preset.aspectH);

  const group = new THREE.Group();

  const planeGeom = new THREE.PlaneGeometry(width, height);
  planeGeom.rotateX(-Math.PI / 2); // lie flat: local Y becomes the surface normal

  const fillMat = new THREE.MeshBasicMaterial({
    color: 0x3388ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  group.add(new THREE.Mesh(planeGeom, fillMat));

  const edgesGeom = new THREE.EdgesGeometry(planeGeom);
  const edgesMat = new THREE.LineBasicMaterial({ color: 0x3388ff });
  group.add(new THREE.LineSegments(edgesGeom, edgesMat));

  const wCm = (width * 100).toFixed(1);
  const hCm = (height * 100).toFixed(1);
  const label = makeLabelSprite(`${preset.name} — ${wCm} × ${hCm} cm`);
  label.position.set(0, 0.02, -height / 2 - 0.15);
  group.add(label);

  return group;
}

function rebuildRectAtAnchor() {
  if (!anchorTransform) return;
  if (rectGroup) scene.remove(rectGroup);
  rectGroup = buildRectGroup(+selectEl.value);
  rectGroup.position.copy(anchorTransform.position);
  rectGroup.quaternion.copy(anchorTransform.quaternion);
  scene.add(rectGroup);
}

selectEl.addEventListener('change', rebuildRectAtAnchor);

resetBtn.addEventListener('click', () => {
  anchorTransform = null;
  if (rectGroup) {
    scene.remove(rectGroup);
    rectGroup = null;
  }
});

function onSelect() {
  if (!latestHitPose) return;
  const { position, orientation } = latestHitPose;
  anchorTransform = {
    position: new THREE.Vector3(position.x, position.y, position.z),
    quaternion: new THREE.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w),
  };
  rebuildRectAtAnchor();
}

function onXRFrame(timestamp, frame) {
  if (frame && hitTestSource) {
    const results = frame.getHitTestResults(hitTestSource);
    if (results.length > 0) {
      const pose = results[0].getPose(localSpace);
      latestHitPose = pose.transform;
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);
    } else {
      latestHitPose = null;
      reticle.visible = false;
    }
  }
  renderer.render(scene, camera);
}

async function startAR() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const reticleGeom = new THREE.RingGeometry(0.06, 0.08, 32).rotateX(-Math.PI / 2);
  const reticleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  reticle = new THREE.Mesh(reticleGeom, reticleMat);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  const session = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: document.body },
  });

  session.addEventListener('end', () => {
    startScreen.style.display = 'flex';
    hintEl.hidden = true;
    overlayEl.hidden = true;
  });

  renderer.xr.setReferenceSpaceType('local');
  await renderer.xr.setSession(session);

  localSpace = renderer.xr.getReferenceSpace();
  const viewerSpace = await session.requestReferenceSpace('viewer');
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);

  startScreen.style.display = 'none';
  hintEl.hidden = false;
  overlayEl.hidden = false;

  renderer.setAnimationLoop(onXRFrame);
}

startBtn.addEventListener('click', () => {
  startAR().catch((err) => {
    console.error(err);
    unsupportedEl.textContent = `Failed to start AR: ${err.message}`;
    unsupportedEl.style.display = 'flex';
  });
});
