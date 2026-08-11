import type { ReferenceKind } from "../data/professionalWorks";

export type NetworkResult = {
  id: string;
  title: string;
  kind: ReferenceKind;
  year: string;
  image: string;
  source: "DIRECTORS' LIBRARY · LIVE";
  sourceUrl: string;
  description: string;
  matchedTerm: string;
};

type DirectorsLibraryVideo = {
  id: number;
  date?: string;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  class_list?: string[];
  yoast_head_json?: {
    og_image?: Array<{ url?: string }>;
  };
};

const DIRECTORS_LIBRARY_API = "https://directorslibrary.com/wp-json/wp/v2/video";

const conceptDictionary: Array<{ pattern: RegExp; term: string }> = [
  { pattern: /科幻|太空|宇宙|外星|星际|未来世界/, term: "science fiction" },
  { pattern: /赛博|霓虹都市|科技都市/, term: "cyberpunk" },
  { pattern: /反乌托邦|末日|废土/, term: "dystopia" },
  { pattern: /人工智能|机器人|机械人/, term: "artificial intelligence" },
  { pattern: /梦境|超现实|幻觉|怪诞/, term: "surreal" },
  { pattern: /恐怖|惊悚|不安|诡异/, term: "horror" },
  { pattern: /孤独|孤立|疏离|寂寞/, term: "lonely" },
  { pattern: /女性|女人|女孩|女主角|女歌手/, term: "woman" },
  { pattern: /男性|男人|男孩|男主角|男歌手/, term: "man" },
  { pattern: /舞蹈|独舞|群舞|跳舞/, term: "dance" },
  { pattern: /舞台|演出|表演|现场/, term: "performance" },
  { pattern: /音乐|歌手|乐队|演唱|\bmv\b/i, term: "music video" },
  { pattern: /红色|红光|暖红|红黑/, term: "red" },
  { pattern: /蓝色|蓝光|冷蓝|冷色/, term: "blue" },
  { pattern: /黑白|单色|无彩色/, term: "black and white" },
  { pattern: /夜景|夜晚|深夜|午夜/, term: "night" },
  { pattern: /雨|湿地|湿润|水面反光/, term: "rain" },
  { pattern: /建筑|空间|大厅|室内|楼梯/, term: "architecture" },
  { pattern: /城市|街道|都市|街头/, term: "city" },
  { pattern: /森林|自然|山野|荒野/, term: "nature" },
  { pattern: /海边|海岸|海面|水下/, term: "ocean" },
  { pattern: /极简|留白|负空间/, term: "minimal" },
  { pattern: /奢华|豪华|高级感/, term: "luxury" },
  { pattern: /时尚|服装|造型|秀场/, term: "fashion" },
  { pattern: /汽车|轿车|跑车|车辆/, term: "car" },
  { pattern: /手持|纪实|纪录|真实感/, term: "documentary" },
  { pattern: /复古|怀旧|年代感/, term: "vintage" },
  { pattern: /青春|少年|青年/, term: "youth" },
  { pattern: /家庭|母亲|父亲|亲情/, term: "family" },
  { pattern: /爱情|浪漫|情侣|恋人/, term: "romance" },
];

const kindDefaults: Record<ReferenceKind, string> = {
  电影: "cinema",
  MV: "music video",
  广告: "campaign",
};

function decodeText(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code: string) => {
      const point = code.toLowerCase().startsWith("x") ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : "";
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&hellip;/gi, "…")
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&#8212;|&mdash;/gi, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function detectKind(video: DirectorsLibraryVideo): ReferenceKind | null {
  const path = `${video.link ?? ""} ${(video.class_list ?? []).join(" ")}`.toLowerCase();
  if (/music-videos?|category-music/.test(path)) return "MV";
  if (/campaigns?|commercials?|category-campaign/.test(path)) return "广告";
  if (/film-tv|movies?|short-films?|category-movies?|category-tv/.test(path)) return "电影";
  return null;
}

export function buildNetworkTerms(query: string, kind: ReferenceKind | null) {
  const normalized = query.trim().toLocaleLowerCase();
  const matched = conceptDictionary
    .filter(({ pattern }) => pattern.test(normalized))
    .map(({ term }) => term);
  const latinQuery = normalized.match(/[a-z][a-z0-9\s-]{1,60}/i)?.[0]?.trim();

  const terms = [...new Set([
    ...(latinQuery ? [latinQuery] : []),
    ...matched,
    ...(matched.length === 0 && kind ? [kindDefaults[kind]] : []),
  ])];

  return terms.slice(0, 3);
}

function makeUrl(term: string) {
  const fields = "id,date,link,title,excerpt,yoast_head_json,class_list";
  return `${DIRECTORS_LIBRARY_API}?search=${encodeURIComponent(term)}&per_page=10&_fields=${encodeURIComponent(fields)}`;
}

function mapVideo(video: DirectorsLibraryVideo, term: string): NetworkResult | null {
  const kind = detectKind(video);
  const image = video.yoast_head_json?.og_image?.[0]?.url;
  if (!kind || !video.link || !image || !video.title?.rendered) return null;

  return {
    id: `directors-library-${video.id}`,
    title: decodeText(video.title.rendered),
    kind,
    year: video.date?.slice(0, 4) ?? "—",
    image,
    source: "DIRECTORS' LIBRARY · LIVE",
    sourceUrl: video.link,
    description: decodeText(video.excerpt?.rendered) || "打开原作品查看完整影片、导演与制作名单。",
    matchedTerm: term,
  };
}

export async function searchProfessionalNetwork(
  query: string,
  kind: ReferenceKind | null,
  signal?: AbortSignal,
) {
  const terms = buildNetworkTerms(query, kind);
  if (!terms.length) return { results: [] as NetworkResult[], terms };

  const responses = await Promise.allSettled(
    terms.map(async (term) => {
      const response = await fetch(makeUrl(term), { signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Directors' Library ${response.status}`);
      const videos = await response.json() as DirectorsLibraryVideo[];
      return videos.map((video) => mapVideo(video, term)).filter((video): video is NetworkResult => Boolean(video));
    }),
  );

  const fulfilled = responses.filter((response): response is PromiseFulfilledResult<NetworkResult[]> => response.status === "fulfilled");
  if (!fulfilled.length) throw new Error("专业来源暂时无法连接");

  const merged = fulfilled.flatMap((response) => response.value);
  const unique = [...new Map(merged.map((result) => [result.id, result])).values()]
    .filter((result) => !kind || result.kind === kind)
    .slice(0, 12);

  return { results: unique, terms };
}
