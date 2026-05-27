import * as THREE from 'three';

// SVG path data from spiral_path.svg (viewBox 854×952)
// Coordinate transform: center at (427, 476), flip Y, scale by 1/100
const ORIGIN_X = 427;
const ORIGIN_Y = 476;
const SCALE = 1 / 100;

function tx(x) { return (x - ORIGIN_X) * SCALE; }
function ty(y) { return -(y - ORIGIN_Y) * SCALE; }
function p(x, y) { return new THREE.Vector3(tx(x), ty(y), 0); }

export function createSpiralPath() {
  const curvePath = new THREE.CurvePath();

  // M852.875,1.822 L554.375,136.822
  curvePath.add(new THREE.LineCurve3(
    p(852.875, 1.822),
    p(554.375, 136.822)
  ));

  // C554.375,136.822 283.375,197.322 253.875,197.322
  curvePath.add(new THREE.CubicBezierCurve3(
    p(554.375, 136.822),
    p(283.375, 197.322),
    p(283.375, 197.322),
    p(253.875, 197.322)
  ));

  // C224.375,197.322 51.375,174.822 21.875,197.322
  curvePath.add(new THREE.CubicBezierCurve3(
    p(253.875, 197.322),
    p(224.375, 197.322),
    p(51.375, 174.822),
    p(21.875, 197.322)
  ));

  // C-7.625,219.822 1.375,251.822 12.875,301.322
  curvePath.add(new THREE.CubicBezierCurve3(
    p(21.875, 197.322),
    p(-7.625, 219.822),
    p(1.375, 251.822),
    p(12.875, 301.322)
  ));

  // C24.375,350.822 386.875,451.322 386.875,451.322
  curvePath.add(new THREE.CubicBezierCurve3(
    p(12.875, 301.322),
    p(24.375, 350.822),
    p(386.875, 451.322),
    p(386.875, 451.322)
  ));

  // L759.875,544.322
  curvePath.add(new THREE.LineCurve3(
    p(386.875, 451.322),
    p(759.875, 544.322)
  ));

  // C759.875,544.322 828.875,574.822 836.875,632.822
  curvePath.add(new THREE.CubicBezierCurve3(
    p(759.875, 544.322),
    p(828.875, 574.822),
    p(828.875, 574.822),
    p(836.875, 632.822)
  ));

  // C844.875,690.822 628.875,711.322 628.875,711.322
  curvePath.add(new THREE.CubicBezierCurve3(
    p(836.875, 632.822),
    p(844.875, 690.822),
    p(628.875, 711.322),
    p(628.875, 711.322)
  ));

  // L366.875,778.322
  curvePath.add(new THREE.LineCurve3(
    p(628.875, 711.322),
    p(366.875, 778.322)
  ));

  // L153.375,882.822
  curvePath.add(new THREE.LineCurve3(
    p(366.875, 778.322),
    p(153.375, 882.822)
  ));

  // L40.375,959.822
  curvePath.add(new THREE.LineCurve3(
    p(153.375, 882.822),
    p(40.375, 959.822)
  ));

  return curvePath;
}
