import * as THREE from 'three';

const HOVER_SPEED = 0.2;    // 20% of normal speed when hovering
const NORMAL_SPEED = 1.0;
const EASE_DURATION = 0.6;  // seconds for speed transition
const FLIP_DURATION = 0.4;  // seconds for card rotation ease

// Ease-in-out (smoothstep)
function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

export class HoverManager {
  constructor(camera, canvas, spiralManager) {
    this.camera = camera;
    this.canvas = canvas;
    this.spiralManager = spiralManager;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredCard = null;
    this.isHovering = false;

    // Speed easing state
    this.targetSpeed = NORMAL_SPEED;
    this.currentSpeed = NORMAL_SPEED;
    this.easeStartSpeed = NORMAL_SPEED;
    this.easeStartTime = 0;
    this.easing = false;

    // Card rotation easing state
    this.flipCard = null;       // card currently being eased
    this.flipStartRot = 0;
    this.flipTargetRot = 0;
    this.flipStartTime = 0;
    this.flipping = false;

    canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    canvas.addEventListener('mouseleave', () => {
      this._setHover(null);
    });
  }

  update(delta, elapsed) {
    // Raycast
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.spiralManager.getCardMeshes();
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitCard = intersects[0].object.parent;
      if (hitCard !== this.hoveredCard) {
        this._setHover(hitCard, elapsed);
      }
    } else {
      if (this.hoveredCard) {
        this._setHover(null, elapsed);
      }
    }

    // Ease speed
    if (this.easing) {
      const t = Math.min((elapsed - this.easeStartTime) / EASE_DURATION, 1);
      const easedT = easeInOut(t);
      this.currentSpeed = this.easeStartSpeed + (this.targetSpeed - this.easeStartSpeed) * easedT;

      if (t >= 1) {
        this.currentSpeed = this.targetSpeed;
        this.easing = false;
      }

      this.spiralManager.speedMultiplier = this.currentSpeed;
    }

    // Ease card rotation
    if (this.flipping && this.flipCard) {
      const t = Math.min((elapsed - this.flipStartTime) / FLIP_DURATION, 1);
      const easedT = easeInOut(t);
      const rot = this.flipStartRot + (this.flipTargetRot - this.flipStartRot) * easedT;
      this.flipCard.rotation.y = rot;

      if (t >= 1) {
        this.flipCard.rotation.y = this.flipTargetRot;
        this.flipping = false;
        if (this.flipOnComplete) {
          this.flipOnComplete();
          this.flipOnComplete = null;
        }
      }
    }
  }

  _setHover(card, elapsed) {
    // Ease previous card back to its natural rotation
    if (this.hoveredCard && this.hoveredCard !== card) {
      const prev = this.hoveredCard;
      this._startFlip(prev, prev.userData.naturalRotY, elapsed, () => {
        prev.userData.hoverLock = false;
      });
    }

    this.hoveredCard = card;

    if (card) {
      this.isHovering = true;
      this.canvas.style.cursor = 'pointer';
      card.userData.hoverLock = true;
      this._startFlip(card, 0, elapsed); // ease to face-forward
      this._startSpeedEase(HOVER_SPEED, elapsed);
    } else {
      this.isHovering = false;
      this.canvas.style.cursor = 'default';
      this._startSpeedEase(NORMAL_SPEED, elapsed);
    }
  }

  _startFlip(card, targetRot, elapsed, onComplete) {
    this.flipCard = card;
    this.flipStartRot = card.rotation.y;
    this.flipTargetRot = targetRot;
    this.flipStartTime = elapsed;
    this.flipping = true;
    this.flipOnComplete = onComplete || null;
  }

  _startSpeedEase(target, elapsed) {
    this.targetSpeed = target;
    this.easeStartSpeed = this.currentSpeed;
    this.easeStartTime = elapsed;
    this.easing = true;
  }
}
