export type SearchDirection = {
  id: string;
  title: string;
  subtitle: string;
  query: string;
  image: string;
};

export type LiveSearchFrame = {
  id: string;
  title: string;
  image: string;
  creator: string;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  direction?: string;
  width?: number;
  height?: number;
};

export type LiveSearchResponse = {
  results: LiveSearchFrame[];
  translatedQuery: string;
  intentLabel: string;
  activeSources: string[];
  directions: SearchDirection[];
};

type SearchIntent = {
  kind: "music-video" | "film" | "art" | "general";
  label: string;
  displayQuery: string;
  queries: Array<{ term: string; direction: string }>;
  directions: SearchDirection[];
};

const visualLexicon: Array<[RegExp, string]> = [
  [/孤独|独处|疏离|寂寞/g, "solitary"],
  [/女性|女人|女孩|女主角/g, "woman"],
  [/男性|男人|男孩|男主角/g, "man"],
  [/人物|人像|角色/g, "portrait"],
  [/建筑|空间|大厅|室内/g, "architecture"],
  [/粗野主义|混凝土/g, "brutalist concrete"],
  [/未来|科幻/g, "futuristic"],
  [/极简|留白|负空间/g, "minimal negative space"],
  [/冷银|银灰|冷色|蓝色/g, "cool blue"],
  [/暖色|暖金|琥珀|钨丝/g, "warm amber"],
  [/黑白|单色/g, "monochrome"],
  [/夜景|夜晚|深夜/g, "night lighting"],
  [/雨|雨夜/g, "rain reflections"],
  [/雾|烟雾/g, "fog haze"],
  [/舞台|剧场|戏剧/g, "theatre stage"],
  [/时尚|高级|服装|造型/g, "editorial fashion"],
  [/广告|商业/g, "advertising campaign"],
  [/自然|山|森林|海/g, "cinematic landscape"],
  [/工业|工厂|机械/g, "industrial architecture"],
  [/材质|纹理|肌理/g, "texture macro"],
  [/倒影|反射|镜面/g, "reflection"],
  [/阴影|影子|剪影/g, "shadow silhouette"],
  [/逆光|轮廓光/g, "backlight"],
  [/柔光|自然光|窗光/g, "window light"],
  [/广角/g, "wide angle"],
  [/特写|近景/g, "close up"],
  [/对称|秩序/g, "symmetry"],
  [/超现实|梦境/g, "surreal"],
  [/叙事|故事/g, "narrative"],
  [/表演|演唱|舞蹈/g, "performance"],
];

const englishFallback = "cinematic photography visual reference";
const musicVideoPattern = /(?:\bmv\b|music\s*video|音乐(?:视频|录像|影像|短片))/i;
const filmPattern = /(?:电影|影片|静帧|film\s*still|cinema|cinematic\s*frame)/i;
const artPattern = /(?:艺术|绘画|雕塑|博物馆|artwork|painting|sculpture|museum)/i;

const musicVideoDirections: SearchDirection[] = [
  { id: "performance", title: "舞台表演型", subtitle: "灯光、肢体、能量", query: "MV 舞台表演，强烈灯光与有设计的肢体动作", image: "/curation/2026-08-05/blue-stage.jpg" },
  { id: "narrative", title: "叙事电影型", subtitle: "人物、空间、情绪线", query: "叙事型 MV，电影感人物与环境，克制情绪", image: "/frame-window.png" },
  { id: "fashion", title: "时尚造型型", subtitle: "服装、置景、态度", query: "时尚型 MV，高级造型、编辑感布光与极简置景", image: "/frame-stage.png" },
  { id: "experimental", title: "实验视觉型", subtitle: "抽象、材质、视效", query: "实验型 MV，抽象色彩、材质与超现实视觉", image: "/curation/2026-08-05/fluted-color.jpg" },
  { id: "urban", title: "城市夜景型", subtitle: "街道、霓虹、孤独感", query: "城市夜景 MV，人物剪影、湿地反光与夜色", image: "/curation/2026-08-06/street-void.jpg" },
  { id: "minimal", title: "极简棚拍型", subtitle: "留白、轮廓、控制力", query: "极简棚拍 MV，大面积留白、轮廓光与克制表演", image: "/frame-hall.png" },
];

function safeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function stripMarkup(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metadataValue(metadata: Record<string, unknown>, key: string, fallback: string) {
  return stripMarkup(safeText(asRecord(metadata[key]).value, fallback));
}

function collectVisualTerms(input: string) {
  const terms: string[] = [];
  for (const [pattern, translation] of visualLexicon) {
    pattern.lastIndex = 0;
    if (pattern.test(input)) terms.push(translation);
  }
  const englishWords = input.match(/\b[a-zA-Z][a-zA-Z-]*\b/g)
    ?.filter((word) => !["mv", "music", "video"].includes(word.toLowerCase()))
    .slice(0, 8)
    .join(" ");
  if (englishWords) terms.unshift(englishWords);
  return terms;
}

function uniqueTerms(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function translateCreativeQuery(query: string, selected: string[] = []) {
  const typedQuery = query.trim();
  const terms = uniqueTerms([
    ...collectVisualTerms(typedQuery),
    ...collectVisualTerms(selected.join(" ")),
  ]);
  return terms.slice(0, 5).join(" ") || typedQuery || englishFallback;
}

function buildSearchIntent(query: string, selected: string[]): SearchIntent {
  const typedQuery = query.trim();
  const selectedTerms = collectVisualTerms(selected.join(" "));

  if (musicVideoPattern.test(typedQuery)) {
    const withoutIntent = typedQuery.replace(musicVideoPattern, " ");
    const detailTerms = uniqueTerms([...collectVisualTerms(withoutIntent), ...selectedTerms]).slice(0, 3);
    const detail = detailTerms.join(" ");
    const suffix = detail ? ` ${detail}` : "";
    return {
      kind: "music-video",
      label: "MV / 音乐影像",
      displayQuery: detail
        ? `music video · ${detail}`
        : "music video · performance / narrative / fashion / experimental",
      queries: [
        { term: `music video still cinematic${suffix}`, direction: "叙事电影型" },
        { term: `music video performance stage${suffix}`, direction: "舞台表演型" },
        { term: `fashion music video${suffix}`, direction: "时尚造型型" },
        { term: `experimental music video still${suffix}`, direction: "实验视觉型" },
      ],
      directions: musicVideoDirections,
    };
  }

  const translated = translateCreativeQuery(typedQuery, selected);
  if (filmPattern.test(typedQuery)) {
    return {
      kind: "film",
      label: "电影 / 叙事影像",
      displayQuery: `film still · ${translated}`,
      queries: [{ term: `film still ${translated}`, direction: "电影静帧" }],
      directions: [],
    };
  }

  return {
    kind: artPattern.test(typedQuery) ? "art" : "general",
    label: artPattern.test(typedQuery) ? "艺术视觉研究" : "综合视觉研究",
    displayQuery: translated,
    queries: [{ term: translated, direction: "综合参考" }],
    directions: [],
  };
}

async function searchOpenverse(term: string, signal?: AbortSignal): Promise<LiveSearchFrame[]> {
  const params = new URLSearchParams({ q: term, page_size: "20", mature: "false" });
  const response = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Openverse ${response.status}`);
  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results.flatMap((item: Record<string, unknown>) => {
    const image = safeText(item.thumbnail, safeText(item.url, ""));
    const sourceUrl = safeText(item.foreign_landing_url, safeText(item.detail_url, ""));
    if (!image || !sourceUrl) return [];
    const source = safeText(item.source, safeText(item.provider, "OPENVERSE"));
    return [{
      id: `openverse-${safeText(item.id, image)}`,
      title: safeText(item.title, "Untitled visual reference"),
      image,
      creator: safeText(item.creator, "Unknown creator"),
      source: `OPENVERSE · ${source.toUpperCase()}`,
      sourceUrl,
      license: safeText(item.license, "SOURCE TERMS").toUpperCase(),
      licenseUrl: safeText(item.license_url, sourceUrl),
      direction: "开放影像",
      width: typeof item.width === "number" ? item.width : undefined,
      height: typeof item.height === "number" ? item.height : undefined,
    }];
  });
}

async function searchWikimedia(term: string, direction: string, signal?: AbortSignal): Promise<LiveSearchFrame[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: term,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "960",
    format: "json",
    origin: "*",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { signal });
  if (!response.ok) throw new Error(`Wikimedia ${response.status}`);
  const payload = asRecord(await response.json());
  const pages = Object.values(asRecord(asRecord(payload.query).pages));

  return pages.flatMap((rawPage) => {
    const page = asRecord(rawPage);
    const imageInfo = Array.isArray(page.imageinfo) ? asRecord(page.imageinfo[0]) : {};
    const metadata = asRecord(imageInfo.extmetadata);
    const image = safeText(imageInfo.thumburl, safeText(imageInfo.url, ""));
    const pageId = typeof page.pageid === "number" ? page.pageid : 0;
    const sourceUrl = safeText(imageInfo.descriptionurl, pageId ? `https://commons.wikimedia.org/?curid=${pageId}` : "");
    if (!image || !sourceUrl) return [];
    const rawTitle = metadataValue(metadata, "ObjectName", safeText(page.title, "Untitled media"));
    const title = rawTitle.replace(/^File:/i, "").replace(/\.(?:jpe?g|png|webp|webm)$/i, "");
    return [{
      id: `wikimedia-${pageId || title}`,
      title,
      image,
      creator: metadataValue(metadata, "Artist", "Wikimedia contributor"),
      source: "WIKIMEDIA COMMONS",
      sourceUrl,
      license: metadataValue(metadata, "LicenseShortName", "SOURCE TERMS"),
      licenseUrl: metadataValue(metadata, "LicenseUrl", sourceUrl),
      direction,
      width: typeof imageInfo.thumbwidth === "number" ? imageInfo.thumbwidth : undefined,
      height: typeof imageInfo.thumbheight === "number" ? imageInfo.thumbheight : undefined,
    }];
  });
}

async function searchArtInstitute(term: string, signal?: AbortSignal): Promise<LiveSearchFrame[]> {
  const fields = "id,title,image_id,artist_display,date_display,is_public_domain,thumbnail";
  const museumTerm = term.split(/\s+/).slice(0, 4).join(" ");
  const params = new URLSearchParams({ q: museumTerm, limit: "12", fields });
  params.set("query[term][is_public_domain]", "true");
  const response = await fetch(`https://api.artic.edu/api/v1/artworks/search?${params}`, { signal });
  if (!response.ok) throw new Error(`Art Institute ${response.status}`);
  const payload = await response.json();
  const data = Array.isArray(payload.data) ? payload.data : [];
  const iiif = safeText(payload.config?.iiif_url, "https://www.artic.edu/iiif/2");
  return data.flatMap((item: Record<string, unknown>) => {
    if (!item.image_id || item.is_public_domain !== true) return [];
    const id = String(item.id);
    return [{
      id: `aic-${id}`,
      title: safeText(item.title, "Untitled artwork"),
      image: `${iiif}/${item.image_id}/full/843,/0/default.jpg`,
      creator: safeText(item.artist_display, "Unknown artist"),
      source: "ART INSTITUTE OF CHICAGO",
      sourceUrl: `https://www.artic.edu/artworks/${id}`,
      license: "PUBLIC DOMAIN",
      licenseUrl: "https://www.artic.edu/open-access/open-access-images",
      direction: "艺术史参照",
    }];
  });
}

function qualityScore(frame: LiveSearchFrame) {
  const pixels = (frame.width ?? 1200) * (frame.height ?? 900);
  const ratio = frame.width && frame.height ? frame.width / frame.height : 1.3;
  const cinematicRatio = ratio >= 1.15 && ratio <= 2.5 ? 3 : 0;
  return Math.min(pixels / 1_000_000, 8) + cinematicRatio + (frame.title.toLowerCase().includes("untitled") ? -1 : 0);
}

function dedupe(frames: LiveSearchFrame[]) {
  const seen = new Set<string>();
  return frames.filter((frame) => {
    const key = `${frame.title.toLowerCase()}|${frame.creator.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function roundRobinByDirection(frames: LiveSearchFrame[]) {
  const directions = Array.from(new Set(frames.map((frame) => frame.direction ?? "综合参考")));
  const buckets = directions.map((direction) => frames
    .filter((frame) => (frame.direction ?? "综合参考") === direction)
    .sort((a, b) => qualityScore(b) - qualityScore(a)));
  const output: LiveSearchFrame[] = [];
  while (output.length < 20 && buckets.some((bucket) => bucket.length)) {
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (next) output.push(next);
      if (output.length === 20) break;
    }
  }
  return output;
}

export async function searchLiveFrames(query: string, selected: string[] = [], signal?: AbortSignal): Promise<LiveSearchResponse> {
  const intent = buildSearchIntent(query, selected);
  const activeSources: string[] = [];
  const combined: LiveSearchFrame[] = [];

  if (intent.kind === "music-video" || intent.kind === "film") {
    const searches = await Promise.allSettled(intent.queries.map((item) => searchWikimedia(item.term, item.direction, signal)));
    for (const search of searches) {
      if (search.status === "fulfilled") combined.push(...search.value);
    }
    if (searches.some((search) => search.status === "fulfilled")) activeSources.push("WIKIMEDIA COMMONS");
  } else {
    const searches = await Promise.allSettled([
      searchOpenverse(intent.queries[0].term, signal),
      searchWikimedia(intent.queries[0].term, "公开媒体", signal),
      ...(intent.kind === "art" ? [searchArtInstitute(intent.queries[0].term, signal)] : []),
    ]);
    if (searches[0]?.status === "fulfilled") {
      activeSources.push("OPENVERSE");
      combined.push(...searches[0].value);
    }
    if (searches[1]?.status === "fulfilled") {
      activeSources.push("WIKIMEDIA COMMONS");
      combined.push(...searches[1].value);
    }
    if (intent.kind === "art" && searches[2]?.status === "fulfilled") {
      activeSources.push("ART INSTITUTE OF CHICAGO");
      combined.push(...searches[2].value);
    }
  }

  if (!activeSources.length) throw new Error("All live sources unavailable");
  const results = roundRobinByDirection(dedupe(combined));
  return {
    results,
    translatedQuery: intent.displayQuery,
    intentLabel: intent.label,
    activeSources,
    directions: intent.directions,
  };
}

export const professionalSources = [
  { name: "SHOTDECK", domain: "shotdeck.com", type: "电影静帧" },
  { name: "FILMGRAB", domain: "film-grab.com", type: "电影构图" },
  { name: "ADS OF THE WORLD", domain: "adsoftheworld.com", type: "广告案例" },
  { name: "BEHANCE", domain: "behance.net", type: "视觉项目" },
  { name: "NOWNESS", domain: "nowness.com", type: "时尚影像" },
  { name: "VIMEO", domain: "vimeo.com", type: "导演作品" },
];

export function professionalSearchUrl(domain: string, query: string, selected: string[] = []) {
  const isMusicVideo = musicVideoPattern.test(query);
  const musicVideoTerms: Record<string, string> = {
    "shotdeck.com": "performance film stage cinematic",
    "film-grab.com": "music performance film cinematography",
    "adsoftheworld.com": "music video campaign film",
    "behance.net": "music video art direction",
    "nowness.com": "music video fashion film",
    "vimeo.com": "music video staff pick cinematography",
  };
  const term = isMusicVideo ? musicVideoTerms[domain] ?? "music video cinematography" : translateCreativeQuery(query, selected);
  return `https://www.bing.com/images/search?q=${encodeURIComponent(`site:${domain} ${term}`)}`;
}
