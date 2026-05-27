import { createCardMesh, updateCardTextures } from './CardMesh.js';
import { getYRotation, getScale, getZRotation } from './RotationMapper.js';

const POOL_SIZE = 12;
const VISIBLE_CARDS = 9;
const SPACING = 1 / VISIBLE_CARDS;
const SCROLL_SPEED = 1 / 25; // t-units per second
const BUFFER = SPACING; // recycle buffer beyond 0–1

export class SpiralManager {
  constructor(path, textures, scene) {
    this.path = path;
    this.textures = textures;
    this.scene = scene;
    this.paused = false;
    this.cards = [];
    this.cardIndices = [];

    // Initial offset: card at index 1 (2H) should sit at t=0.5
    // Card 0 gets t = 0.5 - SPACING, card 1 gets t = 0.5, etc.
    const startT = 0.5 - SPACING;

    for (let i = 0; i < POOL_SIZE; i++) {
      const cardIndex = (i % 9) + 1; // 1-9 cycling
      const front = textures.getFront(cardIndex);
      const back = textures.getBack(cardIndex);
      const card = createCardMesh(front, back);

      const t = startT + i * SPACING;
      card.userData.t = t;
      card.userData.cardIndex = cardIndex;

      this.cards.push(card);
      scene.add(card);
    }

    // Next card index to assign when recycling
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

    // Clamp t to 0–1 for path sampling, but allow cards slightly outside
    const clampedT = Math.max(0, Math.min(1, t));

    const point = this.path.getPointAt(clampedT);
    const tangent = this.path.getTangentAt(clampedT);

    card.position.set(point.x, point.y, point.z);

    // Y rotation: front face at center, back face at edges
    const yRot = getYRotation(clampedT);
    card.rotation.y = yRot;

    // Z rotation: tilt to follow curve
    card.rotation.z = getZRotation(tangent);

    // Scale: larger at center, smaller at edges
    const s = getScale(clampedT);
    card.scale.setScalar(s);

    // Z-depth: cards closer to center render in front
    const centerDist = Math.abs(clampedT - 0.5);
    card.position.z = 0.5 - centerDist;

    // Fade out cards near edges
    const edgeFade = clampedT < 0.1
      ? clampedT / 0.1
      : clampedT > 0.9
        ? (1 - clampedT) / 0.1
        : 1;
    card.userData.frontMat.opacity = edgeFade;
    card.userData.backMat.opacity = edgeFade;
  }

  update(delta) {
    if (this.paused) return;

    for (const card of this.cards) {
      card.userData.t += SCROLL_SPEED * delta;

      // Recycle: when card goes past the bottom, wrap to top
      if (card.userData.t > 1.0 + BUFFER) {
        // Find the smallest t to place this card before it
        let minT = Infinity;
        for (const other of this.cards) {
          if (other !== card && other.userData.t < minT) {
            minT = other.userData.t;
          }
        }
        card.userData.t = minT - SPACING;

        // Cycle texture
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
    // Return all child meshes for raycasting
    const meshes = [];
    for (const card of this.cards) {
      card.traverse(child => {
        if (child.isMesh) meshes.push(child);
      });
    }
    return meshes;
  }
}
