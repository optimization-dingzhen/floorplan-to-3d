// FROZEN MODULE — read-only to bots. The ONLY coordinate conversion in the codebase.
// Plan space:  mm, origin bottom-left, Y up.
// World space: metres, Three.js Y-up. Height extrudes on +Y.
export function planToWorld(x_mm, y_mm) {
  return { x: x_mm / 1000, y: 0, z: -y_mm / 1000 + 0 }; // +0 normalises -0 at the origin
}

export function planLengthToWorld(mm) {
  return mm / 1000;
}
