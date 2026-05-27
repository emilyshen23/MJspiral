import { createCardMesh, updateCardTextures } from './CardMesh.js';
import { getScale } from './RotationMapper.js';

const POOL_SIZE = 15;
const SPACING = 1 / 14;
const SCROLL_SPEED = 1 / 50; // t-units per second (half speed)
const BUFFER = SPACING * 2;

export class SpiralManager {
  constructor(path, textures, scene) {
    this.path = path;
    this.textures = textures;
    this.scene = scene;
    this.speedMultiplier = 1.0;
    this.cards = [];

    // Distribute cards evenly across the full path range 0–1
    // Center the distribution so cards fill the visible path
    const totalSpan = (POOL_SIZE - 1) * SPACING;
    const startT = (1 - totalSpan) / 2; // center the block

    for (let i = 0; i < POOL_SIZE; i++) {
      const cardIndex = (i % 9) + 1; // 1-9 cycling
      const front = textures.getFront(cardIndex);
      const back = textures.getBack(cardIndex);
      const card = createCardMesh(front, back);

      card.userData.t = startT + i * SPACING;
      card.userData.cardIndex = cardIndex;

      this.cards.push(card);
      scene.add(card);
    }

    // Track cycling index for seamless 1-9 repetition
    this.nextCardIndex = (POOL_SIZE % 9) + 1;

    this._positionAllCards();
  }

  _positionAllCards() {
    for (const card of this.cards) {
      this._positionCard(card);
    }
  }

  _positionCard(card) {
    const t = card.userData.t;
    const clampedT = Math.max(0, Math.min(1, t));

    const point = this.path.getPointAt(clampedT);
    card.position.set(point.x, point.y, point.z);

    // Revolving door: only Y rotation, never tilt
    const naturalRotY = (Math.PI * 0.67) * Math.cos(Math.PI * clampedT);
    card.userData.naturalRotY = naturalRotY;
    card.rotation.x = 0;
    if (!card.userData.hoverLock) {
      card.rotation.y = naturalRotY;
    }
    card.rotation.z = 0;

    // Scale: larger at center, smaller at edges
    const s = getScale(clampedT);
    card.scale.setScalar(s);

    // Z-depth: cards further along the path (lower t = further ahead)
    // render in front of cards behind them (higher t = entering later)
    card.position.z = clampedT * 0.5;

    // Hide cards outside the visible range
    const visible = t >= -BUFFER && t <= 1.0 + BUFFER;
    card.visible = visible;

    // Fade out cards near edges
    if (visible) {
      const edgeFade = clampedT < 0.1
        ? clampedT / 0.1
        : clampedT > 0.9
          ? (1 - clampedT) / 0.1
          : 1;
      card.userData.frontMat.opacity = edgeFade;
      card.userData.backMat.opacity = edgeFade;
      card.userData.shadowMat.opacity = edgeFade * 0.7;
    }
  }

  update(delta) {
    for (const card of this.cards) {
      card.userData.t += SCROLL_SPEED * this.speedMultiplier * delta;

      // Recycle: when card exits bottom, wrap to top
      if (card.userData.t > 1.0 + BUFFER) {
        // Find the smallest t among all cards
        let minT = Infinity;
        for (const other of this.cards) {
          if (other !== card && other.userData.t < minT) {
            minT = other.userData.t;
          }
        }
        card.userData.t = minT - SPACING;

        // Cycle texture through 1-9
        card.userData.cardIndex = this.nextCardIndex;
        updateCardTextures(
          card,
          this.textures.getFront(this.nextCardIndex),
          this.textures.getBack(this.nextCardIndex)
        );
        this.nextCardIndex = (this.nextCardIndex % 9) + 1;
      }
    }

    this._positionAllCards();
  }

  getCardMeshes() {
    const meshes = [];
    for (const card of this.cards) {
      if (!card.visible) continue;
      card.traverse(child => {
        if (child.isMesh) meshes.push(child);
      });
    }
    return meshes;
  }
}
