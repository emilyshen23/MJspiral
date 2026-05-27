import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { createSpiralPath } from './SpiralPath.js';
import { preloadTextures } from './TextureLoader.js';
import { SpiralManager } from './SpiralManager.js';
import { HoverManager } from './HoverManager.js';

async function init() {
  const canvas = document.getElementById('spiral-canvas');

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 7;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(2, 4, 5);
  scene.add(directional);

  // Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,   // strength
    0.4,   // radius
    0.85   // threshold
  );
  composer.addPass(bloomPass);

  // Load textures
  const textures = await preloadTextures();

  // Build spiral
  const path = createSpiralPath();
  const spiralManager = new SpiralManager(path, textures, scene);
  const hoverManager = new HoverManager(camera, canvas, spiralManager);

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    spiralManager.update(delta);
    hoverManager.update();
    composer.render();
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.resolution.set(w, h);
  });
}

init();
