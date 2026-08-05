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
  assert.match(home, /粗野主义地平线/);
  assert.match(home, /CC BY-SA 4\.0/);
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
    "curation/2026-08-05/brutalist-horizon.jpg",
    "curation/2026-08-05/window-contrast.jpg",
    "curation/2026-08-05/blue-stage.jpg",
    "curation/2026-08-05/shadow-rehearsal.jpg",
    "curation/2026-08-05/fog-axis.jpg",
    "curation/2026-08-05/golden-ditch.jpg",
    "curation/2026-08-05/fluted-color.jpg",
    "curation/2026-08-05/white-ribbon.jpg",
  ].map((name) => access(new URL(name, root))));
});
