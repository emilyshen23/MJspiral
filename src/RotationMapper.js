const MAX_ROTATION = (105 * Math.PI) / 180; // 105 degrees

/**
 * Get Y-axis rotation for a card at position t (0–1 along path).
 * At t=0 and t=1 (extremes), rotation is ±105° (showing back face).
 * At t=0.5 (center), rotation is 0 (showing front face).
 */
export function getYRotation(t) {
  return MAX_ROTATION * Math.cos(Math.PI * t);
}

/**
 * Get uniform scale for a card at position t.
 * 1.0 at center (t=0.5), 0.6 at edges (t=0 or t=1).
 */
export function getScale(t) {
  return 0.6 + 0.4 * (1 - 2 * Math.abs(t - 0.5));
}

/**
 * Get Z-rotation to tilt card along the curve tangent.
 */
export function getZRotation(tangent) {
  return Math.atan2(tangent.y, tangent.x);
}
