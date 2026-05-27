import * as THREE from 'three';

const CARD_WIDTH = 2.4;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16); // 16:9 → ~1.35
const SEGMENTS_X = 32;
const SEGMENTS_Y = 20;
const BEND_AMOUNT = 0.12;

let sharedAlphaMap = null;
let sharedShadowMap = null;
let sharedGlowMap = null;

function createAlphaMap() {
  if (sharedAlphaMap) return sharedAlphaMap;

  const size = 256;
  const radius = 20;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();

  sharedAlphaMap = new THREE.CanvasTexture(canvas);
  sharedAlphaMap.needsUpdate = true;
  return sharedAlphaMap;
}

function createShadowMap() {
  if (sharedShadowMap) return sharedShadowMap;

  const size = 256;
  const padding = 30; // soft edge region
  const radius = 20;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  // Draw a blurred rounded rect shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = padding;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(padding, padding, size - padding * 2, size - padding * 2, radius);
  ctx.fill();

  sharedShadowMap = new THREE.CanvasTexture(canvas);
  sharedShadowMap.needsUpdate = true;
  return sharedShadowMap;
}

function createGlowMap() {
  if (sharedGlowMap) return sharedGlowMap;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  // Radial glow: white center fading to transparent at edges
  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, size * 0.15, cx, cy, size * 0.5);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  sharedGlowMap = new THREE.CanvasTexture(canvas);
  sharedGlowMap.needsUpdate = true;
  return sharedGlowMap;
}

function createFlatPlane() {
  return new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
}

export function createCardMesh(frontTexture, backTexture) {
  const alphaMap = createAlphaMap();
  const group = new THREE.Group();

  // Drop shadow plane — slightly larger, offset down-right, behind card
  const shadowMap = createShadowMap();
  const shadowScale = 1.3;
  const shadowGeo = new THREE.PlaneGeometry(
    CARD_WIDTH * shadowScale,
    CARD_HEIGHT * shadowScale
  );
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowMap,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.set(0.02, -0.02, -0.05); // offset down-right and behind
  shadowMesh.name = 'shadow';
  shadowMesh.raycast = () => {}; // exclude from raycasting
  group.add(shadowMesh);

  // Hover glow plane — larger, behind card, hidden by default
  const glowMap = createGlowMap();
  const glowScale = 1.6;
  const glowGeo = new THREE.PlaneGeometry(
    CARD_WIDTH * glowScale,
    CARD_HEIGHT * glowScale
  );
  const glowMat = new THREE.MeshBasicMaterial({
    map: glowMap,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.set(0, 0, -0.03);
  glowMesh.name = 'glow';
  glowMesh.raycast = () => {}; // exclude from raycasting
  group.add(glowMesh);

  // Front face
  const frontGeo = createFlatPlane();
  const frontMat = new THREE.MeshBasicMaterial({
    map: frontTexture,
    alphaMap,
    transparent: true,
    side: THREE.FrontSide,
  });
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  frontMesh.name = 'front';
  group.add(frontMesh);

  // Back face
  const backGeo = createFlatPlane();
  const backMat = new THREE.MeshBasicMaterial({
    map: backTexture,
    alphaMap,
    transparent: true,
    side: THREE.FrontSide,
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backMesh.name = 'back';
  group.add(backMesh);

  group.userData.frontMat = frontMat;
  group.userData.backMat = backMat;
  group.userData.shadowMat = shadowMat;
  group.userData.glowMat = glowMat;

  return group;
}

export function updateCardTextures(card, frontTexture, backTexture) {
  card.userData.frontMat.map = frontTexture;
  card.userData.backMat.map = backTexture;
  card.userData.frontMat.needsUpdate = true;
  card.userData.backMat.needsUpdate = true;
}
