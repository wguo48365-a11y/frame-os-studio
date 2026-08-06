export type LiveSearchFrame = {
  id: string;
  title: string;
  image: string;
  creator: string;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  width?: number;
  height?: number;
};

export type LiveSearchResponse = {
  results: LiveSearchFrame[];
  translatedQuery: string;
  activeSources: string[];
};

const visualLexicon: Array<[RegExp, string]> = [
  [/孤独|独处|疏离|寂寞/g, "solitary loneliness"],
  [/女性|女人|女孩|女主角/g, "woman female portrait"],
  [/男性|男人|男孩|男主角/g, "man male portrait"],
  [/人物|人像|角色/g, "cinematic portrait"],
  [/建筑|空间|大厅|室内/g, "modern architecture interior"],
  [/粗野主义|混凝土/g, "brutalist concrete architecture"],
  [/未来|科幻/g, "futuristic science fiction"],
  [/极简|留白|负空间/g, "minimal negative space"],
  [/冷银|银灰|冷色|蓝色/g, "cool blue silver tones"],
  [/暖色|暖金|琥珀|钨丝/g, "warm amber tungsten light"],
  [/黑白|单色/g, "black and white monochrome"],
  [/夜景|夜晚|深夜/g, "night cinematic lighting"],
  [/雨|雨夜/g, "rain wet reflections"],
  [/雾|烟雾/g, "fog atmospheric haze"],
  [/舞台|剧场|戏剧/g, "theatre stage lighting"],
  [/时尚|高级|服装/g, "editorial fashion photography"],
  [/广告|商业/g, "commercial campaign photography"],
  [/自然|山|森林|海/g, "cinematic landscape nature"],
  [/工业|工厂|机械/g, "industrial architecture machinery"],
  [/材质|纹理|肌理/g, "material texture macro"],
  [/倒影|反射|镜面/g, "reflection mirrored surface"],
  [/阴影|影子|剪影/g, "dramatic shadow silhouette"],
  [/逆光|轮廓光/g, "backlight rim light"],
  [/柔光|自然光|窗光/g, "soft natural window light"],
  [/广角/g, "wide angle composition"],
  [/特写|近景/g, "close up detail"],
  [/对称|秩序/g, "symmetrical composition"],
  [/超现实|梦境/g, "surreal dreamlike"],
];

const englishFallback = "cinematic photography visual reference";

const conciseTerms: Record<string, string> = {
  "solitary loneliness": "solitary",
  "woman female portrait": "woman",
  "man male portrait": "man",
  "cinematic portrait": "portrait",
  "modern architecture interior": "architecture",
  "brutalist concrete architecture": "brutalist concrete",
  "futuristic science fiction": "futuristic",
  "minimal negative space": "minimal negative space",
  "cool blue silver tones": "cool blue",
  "warm amber tungsten light": "warm amber",
  "black and white monochrome": "monochrome",
  "night cinematic lighting": "night lighting",
  "rain wet reflections": "rain reflections",
  "fog atmospheric haze": "fog haze",
  "theatre stage lighting": "theatre stage",
  "editorial fashion photography": "editorial fashion",
  "commercial campaign photography": "advertising campaign",
  "cinematic landscape nature": "cinematic landscape",
  "industrial architecture machinery": "industrial architecture",
  "material texture macro": "texture macro",
  "reflection mirrored surface": "reflection",
  "dramatic shadow silhouette": "shadow silhouette",
  "backlight rim light": "backlight",
  "soft natural window light": "window light",
  "wide angle composition": "wide angle",
  "close up detail": "close up",
  "symmetrical composition": "symmetry",
  "surreal dreamlike": "surreal",
};

function collectVisualTerms(input: string) {
  const terms: string[] = [];
  for (const [pattern, translation] of visualLexicon) {
    pattern.lastIndex = 0;
    if (pattern.test(input)) terms.push(conciseTerms[translation] ?? translation);
  }
  const englishWords = input.match(/\b[a-zA-Z][a-zA-Z-]*\b/g)?.slice(0, 8).join(" ");
  if (englishWords) terms.unshift(englishWords);
  return terms;
}

export function translateCreativeQuery(query: string, selected: string[] = []) {
  const typedQuery = query.trim();
  const terms = [
    ...collectVisualTerms(typedQuery),
    ...collectVisualTerms(selected.join(" ")),
  ];
  return Array.from(new Set(terms)).slice(0, 5).join(" ") || typedQuery || englishFallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

async function searchOpenverse(term: string, signal?: AbortSignal): Promise<LiveSearchFrame[]> {
  const params = new URLSearchParams({ q: term, page_size: "24", mature: "false" });
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
    const licenseName = safeText(item.license, "SOURCE TERMS").toUpperCase();
    return [{
      id: `openverse-${safeText(item.id, image)}`,
      title: safeText(item.title, "Untitled visual reference"),
      image,
      creator: safeText(item.creator, "Unknown creator"),
      source: `OPENVERSE · ${source.toUpperCase()}`,
      sourceUrl,
      license: licenseName,
      licenseUrl: safeText(item.license_url, sourceUrl),
      width: typeof item.width === "number" ? item.width : undefined,
      height: typeof item.height === "number" ? item.height : undefined,
    }];
  });
}

async function searchArtInstitute(term: string, signal?: AbortSignal): Promise<LiveSearchFrame[]> {
  const fields = "id,title,image_id,artist_display,date_display,is_public_domain,thumbnail";
  const museumTerm = term.split(/\s+/).slice(0, 4).join(" ");
  const params = new URLSearchParams({ q: museumTerm, limit: "16", fields });
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
    }];
  });
}

function qualityScore(frame: LiveSearchFrame) {
  const pixels = (frame.width ?? 1200) * (frame.height ?? 900);
  const ratio = frame.width && frame.height ? frame.width / frame.height : 1.3;
  const cinematicRatio = ratio >= 1.15 && ratio <= 2.5 ? 3 : 0;
  return Math.min(pixels / 1_000_000, 8) + cinematicRatio + (frame.title.toLowerCase().includes("untitled") ? -1 : 0);
}

export async function searchLiveFrames(query: string, selected: string[] = [], signal?: AbortSignal): Promise<LiveSearchResponse> {
  const translatedQuery = translateCreativeQuery(query, selected);
  const searches = await Promise.allSettled([
    searchOpenverse(translatedQuery, signal),
    searchArtInstitute(translatedQuery, signal),
  ]);
  const activeSources: string[] = [];
  const combined: LiveSearchFrame[] = [];
  if (searches[0].status === "fulfilled") {
    activeSources.push("OPENVERSE");
    combined.push(...searches[0].value);
  }
  if (searches[1].status === "fulfilled") {
    activeSources.push("ART INSTITUTE OF CHICAGO");
    combined.push(...searches[1].value);
  }
  const seen = new Set<string>();
  const results = combined
    .filter((frame) => {
      const key = `${frame.title.toLowerCase()}|${frame.creator.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => qualityScore(b) - qualityScore(a))
    .slice(0, 20);
  if (!activeSources.length) throw new Error("All live sources unavailable");
  return { results, translatedQuery, activeSources };
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
  const term = translateCreativeQuery(query, selected);
  return `https://www.bing.com/images/search?q=${encodeURIComponent(`site:${domain} ${term}`)}`;
}
