const MAX_ROTATION = (75 * Math.PI) / 180; // 75 degrees at edges

/**
 * Get Y-axis rotation for a card at position t (0–1 along path).
 * Smooth sine curve: ~75° edge-on at top (t=0) and bottom (t=1),
 * 0° face-forward at center (t=0.5).
 */
export function getYRotation(t) {
  return MAX_ROTATION * Math.cos(Math.PI * t);
}

/**
 * Get uniform scale for a card at position t.
 * Graduated scale: center=1.4, then steps down toward edges.
 * Uses a power curve for steeper falloff away from center.
 */
export function getScale(t) {
  // 0 at edges, 1 at center
  const centerness = 1 - 2 * Math.abs(t - 0.5);
  // Power curve makes falloff steeper near edges
  return 0.35 + 1.05 * Math.pow(centerness, 1.5);
}

/**
 * Get Z-rotation to tilt card along the curve tangent.
 */
export function getZRotation(tangent) {
  return Math.atan2(tangent.y, tangent.x);
}
