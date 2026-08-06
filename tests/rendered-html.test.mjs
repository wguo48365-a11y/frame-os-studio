import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../out/", import.meta.url);

async function page(path) {
  return readFile(new URL(path, root), "utf8");
}

test("exports every FRAME OS route", async () => {
  const [home, analysis, moodboard] = await Promise.all([
    page("index.html"),
    page("analysis/index.html"),
    page("moodboard/index.html"),
  ]);

  assert.match(home, /FRAME OS/);
  assert.match(home, /今日视觉主题/);
  assert.match(home, /今日入库/);
  assert.match(home, /QUALITY GATE ACTIVE/);
  assert.match(home, /VIMEO STAFF PICKS/);
  assert.match(home, /NO AUTO-FILL/);
  assert.match(home, /联网寻找参考/);
  assert.match(home, /时尚型 MV/);
  assert.match(home, /混凝土缎带/);
  assert.match(home, /2026-08-06/);
  assert.match(home, /CC BY-SA 4\.0/);
  assert.doesNotMatch(home, /粗野主义地平线/);
  assert.equal((home.match(/curation-card/g) ?? []).length, 8);
  assert.match(analysis, /静帧分析/);
  assert.match(analysis, /Seedance/);
  assert.match(moodboard, /静默建筑/);
  assert.match(moodboard, /DIRECTOR(?:'|&#x27;)S NOTE/);
  assert.doesNotMatch(home + analysis + moodboard, /chatgpt\.site/);
});

test("exports all cinematic assets", async () => {
  await Promise.all([
    "frame-hall.png",
    "frame-window.png",
    "frame-concrete.png",
    "frame-stage.png",
    "frame-texture.png",
    "og.png",
    "professional/mv/beside-april.jpg",
    "professional/mv/xena.jpg",
    "professional/mv/ocha.jpg",
    "professional/mv/territory.jpg",
    "professional/mv/arcadian.jpg",
    "professional/mv/mira-mira.jpg",
    "professional/mv/another-night-out.jpg",
    "professional/mv/growing-young.jpg",
    "professional/mv/nobody-speak.jpg",
    "professional/mv/tailor-swif.jpg",
    "curation/2026-08-05/brutalist-horizon.jpg",
    "curation/2026-08-05/window-contrast.jpg",
    "curation/2026-08-05/blue-stage.jpg",
    "curation/2026-08-05/shadow-rehearsal.jpg",
    "curation/2026-08-05/fog-axis.jpg",
    "curation/2026-08-05/golden-ditch.jpg",
    "curation/2026-08-05/fluted-color.jpg",
    "curation/2026-08-05/white-ribbon.jpg",
    "curation/2026-08-06/concrete-ribbon.jpg",
    "curation/2026-08-06/perseid-mirror.jpg",
    "curation/2026-08-06/needle-eye.jpg",
    "curation/2026-08-06/arid-delta.jpg",
    "curation/2026-08-06/machine-dials.jpg",
    "curation/2026-08-06/street-void.jpg",
    "curation/2026-08-06/slate-copper.jpg",
    "curation/2026-08-06/spike-shadow.jpg",
  ].map((name) => access(new URL(name, root))));
});

test("uses the professional quality index instead of open archive auto-fill", async () => {
  const [works, search] = await Promise.all([
    readFile(new URL("../app/data/professionalWorks.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/liveSearch.ts", import.meta.url), "utf8"),
  ]);

  assert.equal((works.match(/id: "vimeo-/g) ?? []).length, 10);
  assert.match(works, /VIMEO STAFF PICK/);
  assert.match(search, /乐队/);
  assert.doesNotMatch(search, /api\.openverse\.org|api\.artic\.edu|commons\.wikimedia\.org\/w\/api/);
});
