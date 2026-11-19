# floorplan-to-3d — 3D Reno App

A 3D renovation app for small apartments (50–90 sqm): upload a flat floor plan (PDF / JPG / phone photo) and get a **buildable** plan, not just a pretty render.

- To-scale 3D from a flat floor plan — **no LiDAR, no pro designer needed**
- Output: local-price budget, shoppable bill of materials, contractor/DIY handoff
- Built for small Asian apartments: storage-first layouts, multifunction furniture

## Status (early prototype)

Built so far:
- `plan.schema.json` — versioned contract (`plan.schema.json`, v1) shared by all repos
- Frozen coordinate transform `web-3d/src/transforms/planToWorld.mjs` (read-only to bots)
- Golden fixture `fixtures/l-shaped-3600x2700.json` — asymmetric L-shaped room, 3600×2700 mm, door offset 600 mm from one corner (flips/rotations cannot hide)
- Test harness `tests/harness.test.mjs` — golden counts, geometry invariants, and world-coordinate assertions. Run: `npm test`

In progress: ingest pipeline (OpenCV cleaning, dimension OCR, scale anchoring), vectorisation to plan JSON, Three.js editor/viewer, BOM/pricing engine.

## The gnarly part: messy floor plans, no LiDAR

Geometry never comes from photos.
1. **Clean** — OpenCV perspective fix, deskew, upscale/denoise
2. **Scale first** — OCR printed dimension labels (e.g. `3600mm`); if none, the user taps ONE known wall, or we anchor to a standard 900 mm door (1 click)
3. **Vectorise, not raster** — walls/doors/windows as structured JSON (120/240 mm wall thickness, closed room polygons)
4. **Human-in-the-loop** — low-confidence walls are flagged for a ~30 s drag/snap fix; validation rejects unclosed/impossible geometry instead of hallucinating

## Multi-repo orchestration

One orchestrator (the author) is the only merger to `main`. Bot worker sessions are each locked to one repo / one branch / one issue, and only talk through the versioned `plan.schema.json` contract:
- Repo 1 `ingest` (Python/FastAPI): cleaning, OCR, scale
- Repo 2 `geometry`: vectorisation → plan JSON
- Repo 3 `web-3d` (React/Three.js): editor, viewer, BOM

## Coordinate systems (frozen)

- Image space: pixels, origin top-left, Y down
- Plan space: mm, origin bottom-left, Y up
- World space: metres, Three.js Y-up — `planToWorld(x_mm, y_mm) = (x/1000, 0, -y/1000)`

No other coordinate conversion is allowed anywhere in the codebase.
