import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../out/", import.meta.url);

async function page(path) {
  return readFile(new URL(path, root), "utf8");
}

test("exports the rebuilt director research workflow", async () => {
  const [home, analysis, moodboard] = await Promise.all([
    page("index.html"),
    page("analysis/index.html"),
    page("moodboard/index.html"),
  ]);

  assert.match(home, /找到能解决镜头问题的参考/);
  assert.match(home, /电影 \/ MV \/ 广告 \/ 短片/);
  assert.match(home, /The Calm &amp; The Chaos/);
  assert.match(home, /We Beg To Differ/);
  assert.match(home, /Now You Saw Me/);
  assert.match(home, /Paradise Rains/);
  assert.match(home, /Fallen Angels/);
  assert.match(home, /The Handmaiden/);
  assert.match(home, /Camera — Charli xcx/);
  assert.match(home, /Everything Disappears — ASICS/);
  assert.match(home, /SOURCE NETWORK/);
  assert.match(home, /LIVE PROFESSIONAL NETWORK/);
  assert.match(home, /联网寻找参考/);
  assert.match(home, /ShotDeck/);
  assert.match(home, /Directors(?:'|&#x27;) Library/);
  assert.doesNotMatch(home, /今日入库|Wikimedia|Openverse|QUALITY GATE ACTIVE/);
  assert.equal((home.match(/work-card/g) ?? []).length, 27);

  assert.match(analysis, /FRAME READING/);
  assert.match(analysis, /它为什么值得参考/);
  assert.match(analysis, /Seedance/);
  assert.match(moodboard, /午夜仪式/);
  assert.match(moodboard, /DIRECTOR(?:'|&#x27;)S NOTE/);
  assert.doesNotMatch(home + analysis + moodboard, /chatgpt\.site/);
});

test("live search connects a professional source and translates Chinese visual intent", async () => {
  const [networkSearch, workspace] = await Promise.all([
    readFile(new URL("../app/lib/networkSearch.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FrameOS.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(workspace, /实时联网结果/);
  assert.match(networkSearch, /directorslibrary\.com\/wp-json\/wp\/v2\/video/);
  assert.match(networkSearch, /科幻\|太空\|宇宙/);
  assert.match(networkSearch, /science fiction/);
  assert.match(networkSearch, /music video/);
  assert.match(networkSearch, /campaign/);
  assert.match(networkSearch, /short film/);
  assert.match(workspace, /"短片"/);
  assert.match(networkSearch, /Promise\.allSettled/);
  assert.match(networkSearch, /AbortSignal/);
});

test("exports every professional reference image", async () => {
  await Promise.all([
    "og.png",
    "professional/reframe/film-fallen-angels.jpg",
    "professional/reframe/film-neon-demon.jpg",
    "professional/reframe/film-handmaiden.jpg",
    "professional/reframe/film-dune.jpg",
    "professional/reframe/mv-camera.jpg",
    "professional/reframe/mv-i-wait.jpg",
    "professional/reframe/mv-seeing-signs.jpg",
    "professional/reframe/mv-happy-hour.jpg",
    "professional/reframe/ad-asics.jpg",
    "professional/reframe/ad-maybach.jpg",
    "professional/reframe/ad-bystander.jpg",
    "professional/reframe/ad-adidas.jpg",
    "professional/2026-08-12/stone-island-calm-chaos.jpg",
    "professional/2026-08-12/we-beg-to-differ.jpg",
    "professional/2026-08-12/wishes-are-medicine.jpg",
    "professional/2026-08-12/the-return.jpg",
    "professional/2026-08-12/heads-of-cerberus.jpg",
    "professional/2026-08-12/ground-beneath-our-feet.jpg",
    "professional/2026-08-12/mariinka.jpg",
    "professional/2026-08-13/now-you-saw-me.jpg",
    "professional/2026-08-13/derby.png",
    "professional/2026-08-13/lost-boys.jpg",
    "professional/2026-08-13/paradise-rains.jpg",
    "professional/2026-08-13/international-klein-blue.jpg",
    "professional/2026-08-13/amazomania.jpg",
    "professional/2026-08-13/this-is-african-time.jpg",
    "professional/2026-08-13/jaripeo.jpg",
  ].map((name) => access(new URL(name, root))));
});

test("professional index keeps credits, sources, and craft notes", async () => {
  const works = await readFile(new URL("../app/data/professionalWorks.ts", import.meta.url), "utf8");

  assert.equal((works.match(/id: "(?:film|mv|ad|short)-/g) ?? []).length, 27);
  assert.equal((works.match(/\n    sourceUrl:/g) ?? []).length, 27);
  assert.equal((works.match(/\n    why:/g) ?? []).length, 27);
  assert.match(works, /FILMGRAB/);
  assert.match(works, /DIRECTORS' LIBRARY/);
  assert.match(works, /cinematography/);
  assert.doesNotMatch(works, /Wikimedia|Openverse/);
});
