import * as THREE from 'three';

const EMISSIVE_COLOR = new THREE.Color(0xffffff);
const EMISSIVE_INTENSITY = 0.5;

export class HoverManager {
  constructor(camera, canvas, spiralManager) {
    this.camera = camera;
    this.canvas = canvas;
    this.spiralManager = spiralManager;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredCard = null;

    canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    canvas.addEventListener('mouseleave', () => {
      this._clearHover();
    });
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.spiralManager.getCardMeshes();
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      // Get the card group (parent of the hit mesh)
      const hitCard = intersects[0].object.parent;

      if (hitCard !== this.hoveredCard) {
        this._clearHover();
        this.hoveredCard = hitCard;
        this._applyHover(hitCard);
      }
    } else {
      this._clearHover();
    }
  }

  _applyHover(card) {
    this.spiralManager.paused = true;
    this.canvas.style.cursor = 'pointer';

    card.userData.frontMat.emissive = EMISSIVE_COLOR;
    card.userData.frontMat.emissiveIntensity = EMISSIVE_INTENSITY;
    card.userData.backMat.emissive = EMISSIVE_COLOR;
    card.userData.backMat.emissiveIntensity = EMISSIVE_INTENSITY;
  }

  _clearHover() {
    if (!this.hoveredCard) return;

    this.spiralManager.paused = false;
    this.canvas.style.cursor = 'default';

    this.hoveredCard.userData.frontMat.emissive = new THREE.Color(0x000000);
    this.hoveredCard.userData.frontMat.emissiveIntensity = 0;
    this.hoveredCard.userData.backMat.emissive = new THREE.Color(0x000000);
    this.hoveredCard.userData.backMat.emissiveIntensity = 0;

    this.hoveredCard = null;
  }
}
