import * as THREE from 'three';

const CARD_WIDTH = 0.84;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16); // 16:9 → ~0.47
const SEGMENTS_X = 32;
const SEGMENTS_Y = 20;
const BEND_AMOUNT = 0.06;

let sharedAlphaMap = null;

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

function createWarpedPlane() {
  const geo = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, SEGMENTS_X, SEGMENTS_Y);
  const pos = geo.attributes.position;
  const halfW = CARD_WIDTH / 2;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const normalizedX = x / halfW; // -1 to 1
    pos.setZ(i, -BEND_AMOUNT * normalizedX * normalizedX);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function createCardMesh(frontTexture, backTexture) {
  const alphaMap = createAlphaMap();
  const group = new THREE.Group();

  const frontGeo = createWarpedPlane();
  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTexture,
    alphaMap,
    transparent: true,
    side: THREE.FrontSide,
  });
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  frontMesh.name = 'front';
  group.add(frontMesh);

  const backGeo = createWarpedPlane();
  const backMat = new THREE.MeshStandardMaterial({
    map: backTexture,
    alphaMap,
    transparent: true,
    side: THREE.FrontSide,
  });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.y = Math.PI; // face opposite direction
  backMesh.name = 'back';
  group.add(backMesh);

  group.userData.frontMat = frontMat;
  group.userData.backMat = backMat;

  return group;
}

export function updateCardTextures(card, frontTexture, backTexture) {
  card.userData.frontMat.map = frontTexture;
  card.userData.backMat.map = backTexture;
  card.userData.frontMat.needsUpdate = true;
  card.userData.backMat.needsUpdate = true;
}
