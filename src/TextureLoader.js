import * as THREE from 'three';

const CARD_COUNT = 9;

export async function preloadTextures() {
  const loader = new THREE.TextureLoader();
  const fronts = [];
  const backs = [];

  const promises = [];

  for (let i = 1; i <= CARD_COUNT; i++) {
    promises.push(
      loader.loadAsync(`/src/assets/cards/front/${i}H.png`).then(tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        fronts[i] = tex;
      })
    );
    promises.push(
      loader.loadAsync(`/src/assets/cards/back/${i}P.png`).then(tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        backs[i] = tex;
      })
    );
  }

  await Promise.all(promises);

  return {
    getFront(n) { return fronts[((n - 1) % CARD_COUNT) + 1]; },
    getBack(n) { return backs[((n - 1) % CARD_COUNT) + 1]; },
  };
}
