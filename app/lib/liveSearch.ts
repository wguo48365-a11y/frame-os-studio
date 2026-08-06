import { curatedFrames } from "../data/curation";
import { ProfessionalWork, professionalWorks } from "../data/professionalWorks";

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
  mediaType?: "video" | "frame";
  duration?: string;
  qualitySignals?: string[];
};

export type LiveSearchResponse = {
  results: LiveSearchFrame[];
  translatedQuery: string;
  intentLabel: string;
  activeSources: string[];
  directions: SearchDirection[];
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetUrl = (path: string) => `${basePath}${path}`;
const musicIntentPattern = /(?:\bmv\b|music\s*video|音乐|乐队|歌手|演唱|演奏|舞蹈|concert|band|singer|performance)/i;

const musicVideoDirections: SearchDirection[] = [
  { id: "performance", title: "舞台表演型", subtitle: "灯光、肢体、能量", query: "MV 舞台表演，强烈灯光与有设计的肢体动作", image: "/curation/2026-08-05/blue-stage.jpg" },
  { id: "narrative", title: "叙事电影型", subtitle: "人物、空间、情绪线", query: "叙事型 MV，电影感人物与环境，克制情绪", image: "/frame-window.png" },
  { id: "fashion", title: "时尚造型型", subtitle: "服装、置景、态度", query: "时尚型 MV，高级造型、编辑感布光与极简置景", image: "/frame-stage.png" },
  { id: "experimental", title: "实验视觉型", subtitle: "抽象、材质、视效", query: "实验型 MV，抽象色彩、材质与超现实视觉", image: "/curation/2026-08-05/fluted-color.jpg" },
  { id: "urban", title: "城市夜景型", subtitle: "街道、火光、孤独感", query: "城市夜景 MV，人物剪影、湿地反光与夜色", image: "/curation/2026-08-06/street-void.jpg" },
  { id: "minimal", title: "极简棚拍型", subtitle: "留白、轮廓、控制力", query: "极简棚拍 MV，大面积留白、轮廓光与克制表演", image: "/frame-hall.png" },
];

const searchableSignals = [
  "乐队", "女性", "男性", "人物", "舞台", "表演", "舞蹈", "时尚", "造型", "叙事", "电影感",
  "实验", "超现实", "夜景", "火光", "霓虹", "黑白", "纪实", "自然", "建筑", "空间", "极简",
  "胶片", "色彩", "视效", "城市", "荒野", "群像", "动作", "冷色", "暖色", "剪影", "特写",
];

function normalized(value: string) {
  return value.toLocaleLowerCase().replace(/[\s·|/,_—–-]+/g, " ").trim();
}

function selectedSignals(query: string, selected: string[]) {
  const input = `${query} ${selected.join(" ")}`;
  return searchableSignals.filter((signal) => input.includes(signal));
}

function scoreProfessional(work: ProfessionalWork, query: string, selected: string[]) {
  const input = normalized(`${query} ${selected.join(" ")}`);
  const haystack = normalized(`${work.title} ${work.artist} ${work.creator} ${work.cinematography ?? ""} ${work.direction} ${work.tags.join(" ")}`);
  let score = musicIntentPattern.test(input) ? 12 : 0;
  if (input && haystack.includes(input)) score += 30;
  for (const signal of selectedSignals(query, selected)) {
    if (haystack.includes(normalized(signal))) score += signal === "乐队" ? 14 : 7;
  }
  for (const tag of selected) {
    if (haystack.includes(normalized(tag))) score += 8;
  }
  return score;
}

function professionalResults(query: string, selected: string[]): LiveSearchFrame[] {
  if (!musicIntentPattern.test(`${query} ${selected.join(" ")}`)) return [];
  return professionalWorks
    .map((work) => ({ work, score: scoreProfessional(work, query, selected) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ work }) => ({
      id: work.id,
      title: `${work.artist} · ${work.title}`,
      image: assetUrl(work.image),
      creator: `导演 · ${work.creator}${work.cinematography ? `  /  摄影 · ${work.cinematography}` : ""}`,
      source: "VIMEO · EDITORIAL CURATION",
      sourceUrl: work.sourceUrl,
      license: work.quality,
      licenseUrl: work.sourceUrl,
      direction: work.direction,
      mediaType: "video" as const,
      duration: work.duration,
      qualitySignals: [work.quality, work.year],
    }));
}

function scoreCuratedFrame(frame: (typeof curatedFrames)[number], query: string, selected: string[]) {
  const input = normalized(`${query} ${selected.join(" ")}`);
  const haystack = normalized(`${frame.title} ${frame.category} ${frame.tags.join(" ")} ${frame.mood}`);
  let score = input && haystack.includes(input) ? 25 : 0;
  for (const signal of selectedSignals(query, selected)) {
    if (haystack.includes(normalized(signal))) score += 7;
  }
  for (const tag of selected) {
    if (haystack.includes(normalized(tag))) score += 8;
  }
  return score;
}

function curatedResults(query: string, selected: string[]): LiveSearchFrame[] {
  return curatedFrames
    .map((frame) => ({ frame, score: scoreCuratedFrame(frame, query, selected) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ frame }) => ({
      id: `curated-${frame.id}`,
      title: frame.title,
      image: assetUrl(frame.image),
      creator: `摄影 · ${frame.author}`,
      source: "FRAME OS · EDITORIAL CURATION",
      sourceUrl: frame.sourceUrl,
      license: "FRAME OS 人工筛选",
      licenseUrl: frame.sourceUrl,
      direction: frame.category,
      mediaType: "frame" as const,
      qualitySignals: ["人工审视构图 / 光影 / 色彩", frame.date],
    }));
}

export function translateCreativeQuery(query: string, selected: string[] = []) {
  const clean = `${query.trim()} ${selected.join(" ")}`.trim();
  if (musicIntentPattern.test(clean)) return `专业音乐影像 · ${clean}`;
  return clean || "高质量电影视觉参考";
}

export async function searchLiveFrames(query: string, selected: string[] = []): Promise<LiveSearchResponse> {
  const isMusic = musicIntentPattern.test(`${query} ${selected.join(" ")}`);
  const results = isMusic ? professionalResults(query, selected) : curatedResults(query, selected);
  return {
    results,
    translatedQuery: translateCreativeQuery(query, selected),
    intentLabel: isMusic ? "专业 MV / 音乐影像" : "FRAME OS 精选静帧",
    activeSources: results.length ? [isMusic ? "VIMEO PROFESSIONAL CURATION" : "FRAME OS EDITORIAL"] : [],
    directions: isMusic ? musicVideoDirections : [],
  };
}

export const professionalSources = [
  { name: "SHOTDECK", domain: "shotdeck.com", type: "电影静帧" },
  { name: "FILMGRAB", domain: "film-grab.com", type: "电影构图" },
  { name: "DIRECTORS' LIBRARY", domain: "directorslibrary.com", type: "导演作品" },
  { name: "BEHANCE", domain: "behance.net", type: "视觉项目" },
  { name: "NOWNESS", domain: "nowness.com", type: "时尚影像" },
  { name: "VIMEO", domain: "vimeo.com", type: "Staff Picks" },
];

export function professionalSearchUrl(domain: string, query: string, selected: string[] = []) {
  const isMusic = musicIntentPattern.test(`${query} ${selected.join(" ")}`);
  const musicTerms: Record<string, string> = {
    "shotdeck.com": "performance film stage cinematic",
    "film-grab.com": "music performance film cinematography",
    "directorslibrary.com": "music video band cinematography",
    "behance.net": "music video art direction",
    "nowness.com": "music video fashion film",
    "vimeo.com": "staff pick music video cinematography",
  };
  const term = isMusic ? musicTerms[domain] ?? "music video cinematography" : translateCreativeQuery(query, selected);
  return `https://www.bing.com/images/search?q=${encodeURIComponent(`site:${domain} ${term}`)}`;
}
