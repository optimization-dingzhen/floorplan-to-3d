// 3-layer test harness (miniature): golden counts, geometry invariants, world coords.
// Any extra/missing element = hallucination = fail. No merge on red.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planToWorld } from "../web-3d/src/transforms/planToWorld.mjs";

const plan = JSON.parse(readFileSync(new URL("../fixtures/l-shaped-3600x2700.json", import.meta.url)));

// Layer 1 — golden counts & tolerances
assert.equal(plan.rooms.length, 1, "room count");
assert.equal(plan.walls.length, 6, "wall count — extra/missing wall = hallucination");
assert.equal(plan.doors.length, 1, "door count");
assert.equal(plan.windows.length, 1, "window count");
assert.ok(plan.scale.error_pct < 2, "scale error must be <2%");

// Layer 2 — hard invariants
function polygonArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}
const poly = plan.rooms[0].polygon_mm;
assert.equal(polygonArea(poly), 8100000, "L-shape area must be 8.1 sqm (3600*1800 + 1800*900)");
for (const w of plan.walls) assert.ok([120, 240].includes(w.thickness_mm), "wall thickness whitelist");
assert.equal(plan.doors[0].position_mm[1], 0, "door must sit on the south wall");
assert.equal(plan.windows[0].position_mm[0], 3600, "window must sit on the east wall");

// Layer 3 — world-coordinate regression on the asymmetric L fixture (flips cannot hide)
const expect = [
  [[0, 0], { x: 0, y: 0, z: 0 }],
  [[3600, 0], { x: 3.6, y: 0, z: 0 }],
  [[3600, 1800], { x: 3.6, y: 0, z: -1.8 }],
  [[1800, 1800], { x: 1.8, y: 0, z: -1.8 }],
  [[1800, 2700], { x: 1.8, y: 0, z: -2.7 }],
  [[0, 2700], { x: 0, y: 0, z: -2.7 }],
];
for (const [[x, y], want] of expect) assert.deepEqual(planToWorld(x, y), want, `corner ${x},${y}`);
assert.equal(planToWorld(plan.doors[0].position_mm[0], 0).x, 0.6, "door offset 600mm from corner");

console.log("harness: all 3 layers passed — golden counts, invariants, world coords OK");
