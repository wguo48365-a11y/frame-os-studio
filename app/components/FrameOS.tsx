"use client";

import { useEffect, useMemo, useState } from "react";
import { professionalSources, professionalWorks, ReferenceKind } from "../data/professionalWorks";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${basePath}${path}`;
const route = (path: string) => `${basePath}${path}`;

const nav = [
  { href: "/", label: "视觉检索", index: "01" },
  { href: "/analysis", label: "静帧分析", index: "02" },
  { href: "/moodboard", label: "项目板", index: "03" },
];

function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href={route("/")} className="brand" aria-label="FRAME OS 首页">
          <span className="brand-mark">F</span>
          <span><b>FRAME OS</b><small>DIRECTOR&apos;S RESEARCH SYSTEM</small></span>
        </a>
        <nav className="side-nav" aria-label="主导航">
          <p className="eyebrow">WORKSPACE</p>
          {nav.map((item) => (
            <a key={item.href} href={route(item.href)} className={active === item.href ? "active" : ""}>
              <span>{item.index}</span><b>{item.label}</b>
            </a>
          ))}
        </nav>
        <div className="library-status">
          <p className="eyebrow">PROFESSIONAL INDEX</p>
          <dl>
            <div><dt>精选作品</dt><dd>{professionalWorks.length}</dd></div>
            <div><dt>来源网络</dt><dd>{professionalSources.length}</dd></div>
            <div><dt>内容类型</dt><dd>电影 / MV / 广告</dd></div>
          </dl>
        </div>
        <div className="profile"><span>K</span><div><b>KEN&apos;S PRIVATE DESK</b><small>RESEARCH, NOT A GALLERY</small></div></div>
      </aside>
      <main className="main-canvas">
        <header className="topbar">
          <b>FRAME OS</b>
          <span><i /> EDITORIAL INDEX · HUMAN REVIEWED</span>
          <a href="#source-network">来源网络</a>
        </header>
        {children}
      </main>
    </div>
  );
}

const examples = [
  { label: "红色舞台上的女性独舞", kind: "MV" as ReferenceKind },
  { label: "冷峻未来建筑与孤独人物", kind: "电影" as ReferenceKind },
  { label: "夜景、湿地反光、手持纪录感", kind: "MV" as ReferenceKind },
  { label: "奢华汽车广告，不要棚拍感", kind: "广告" as ReferenceKind },
];

function searchableText(work: (typeof professionalWorks)[number]) {
  return [work.title, work.subtitle, work.kind, work.director, work.cinematography, work.mood, ...work.tags, ...work.craft, work.why]
    .filter(Boolean).join(" ").toLocaleLowerCase();
}

function expandQuery(value: string) {
  const query = value.toLocaleLowerCase();
  const additions: string[] = [];
  if (/mv|音乐|歌手|乐队|舞台/.test(query)) additions.push("mv 表演 舞台 人物");
  if (/广告|品牌|商业/.test(query)) additions.push("广告 高级 时尚");
  if (/电影|叙事/.test(query)) additions.push("电影 叙事 电影感");
  if (/孤独|疏离|冷峻/.test(query)) additions.push("负空间 疏离 冷静 人物尺度");
  if (/高级|奢华/.test(query)) additions.push("时尚 奢华 极简 冷白");
  if (/红|暖/.test(query)) additions.push("暖红 琥珀 红黑 烛光");
  if (/蓝|冷/.test(query)) additions.push("蓝色 灰蓝 冷银 冷白");
  if (/女性|女人/.test(query)) additions.push("女性 肖像 时尚 婚礼");
  return `${query} ${additions.join(" ")}`.trim();
}

function scoreWork(work: (typeof professionalWorks)[number], query: string) {
  if (!query.trim()) return work.featured ? 3 : 1;
  const expanded = expandQuery(query);
  const haystack = searchableText(work);
  return expanded.split(/[\s，。、]+/).filter((word) => word.length > 1).reduce((score, word) => score + (haystack.includes(word) ? 2 : 0), 0);
}

function inferKind(query: string): ReferenceKind | null {
  if (/\bmv\b|音乐|歌手|乐队|舞台/.test(query.toLocaleLowerCase())) return "MV";
  if (/广告|品牌|商业/.test(query)) return "广告";
  if (/电影|叙事片|长片/.test(query)) return "电影";
  return null;
}

function WorkCard({ work, index }: { work: (typeof professionalWorks)[number]; index: number }) {
  return (
    <article className="work-card">
      <a className="work-image" href={`${route("/analysis/")}?ref=${encodeURIComponent(work.id)}`}>
        <img src={asset(work.image)} alt={`${work.title} 静帧`} />
        <span className={`kind kind-${work.kind.toLowerCase()}`}>{work.kind}</span>
        <span className="work-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="analyze-cta">分析这张静帧 →</span>
      </a>
      <div className="work-copy">
        <div className="work-title-row"><div><h3>{work.title}</h3><p>{work.subtitle}</p></div><b>{work.year}</b></div>
        <p className="work-credit">导演 {work.director}{work.cinematography ? ` · 摄影 ${work.cinematography}` : ""}</p>
        <div className="work-tags">{work.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <p className="work-why">{work.why}</p>
        <footer><span>{work.source}</span><a href={work.sourceUrl} target="_blank" rel="noreferrer">查看原作品 ↗</a></footer>
      </div>
    </article>
  );
}

export function HomeWorkspace() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"全部" | ReferenceKind>("全部");
  const [searched, setSearched] = useState(false);

  const results = useMemo(() => {
    const requestedKind = kind === "全部" ? inferKind(query) : kind;
    return professionalWorks
      .map((work) => ({ work, score: scoreWork(work, query) }))
      .filter(({ work, score }) => (!requestedKind || work.kind === requestedKind) && (!searched || !query.trim() || score > 0))
      .sort((a, b) => b.score - a.score)
      .map(({ work }) => work);
  }, [kind, query, searched]);

  const runSearch = () => setSearched(true);
  const applyExample = (label: string, nextKind: ReferenceKind) => {
    setQuery(label);
    setKind(nextKind);
    setSearched(true);
  };

  return (
    <Shell active="/">
      <div className="page home-page">
        <section className="home-intro">
          <p className="eyebrow gold">FRAME OS · REBUILT AS A RESEARCH ENGINE</p>
          <h1>别再搜“好看的图”。<br /><em>找到能解决镜头问题的参考。</em></h1>
          <p>面向导演、摄影、美术与 AIGC 创作者的专业视觉索引。内容来自电影、MV 与广告作品，并保留导演、摄影、出处和镜头价值。</p>
        </section>

        <section className="research-console" aria-label="视觉参考检索">
          <div className="console-head"><span>01 · CREATIVE INTENT</span><b>{professionalWorks.length} EDITORIAL REFERENCES</b></div>
          <label htmlFor="research-query">描述你正在寻找的画面</label>
          <textarea id="research-query" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runSearch(); }} placeholder="例如：女歌手站在红色舞台中央，极简、强轮廓光、克制但有力量……" />
          <div className="console-controls">
            <div className="kind-filter" aria-label="作品类型">
              {(["全部", "电影", "MV", "广告"] as const).map((item) => <button key={item} className={kind === item ? "active" : ""} onClick={() => setKind(item)}>{item}</button>)}
            </div>
            <button className="primary-action" onClick={runSearch}>检索专业索引 <span>→</span></button>
          </div>
          <div className="examples"><span>试试：</span>{examples.map((example) => <button key={example.label} onClick={() => applyExample(example.label, example.kind)}>{example.label}</button>)}</div>
        </section>

        <section className="results-section" aria-live="polite">
          <header className="section-title">
            <div><p className="eyebrow gold">{searched ? "SEARCH RESULTS" : "EDITOR'S SELECTION"}</p><h2>{searched ? `为“${query || kind}”找到的参考` : "先看真正值得研究的画面"}</h2></div>
            <p><b>{results.length}</b> 个作品样本<br />电影 / MV / 广告</p>
          </header>
          {results.length ? <div className="work-grid">{results.map((work, index) => <WorkCard key={work.id} work={work} index={index} />)}</div> : (
            <div className="empty-state"><b>当前专业索引里没有足够准确的结果。</b><p>FRAME OS 不会用普通摄影图补位。请换一个更具体的描述，或从下方专业来源继续查找。</p></div>
          )}
        </section>

        <section className="source-network" id="source-network">
          <header className="section-title"><div><p className="eyebrow gold">SOURCE NETWORK</p><h2>我们应该连接什么，而不是什么都抓</h2></div><p>来源清楚 · 作品优先 · 人工复核</p></header>
          <div className="source-grid">{professionalSources.map((source, index) => <a key={source.name} href={source.url} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2, "0")}</span><div><b>{source.name}</b><small>{source.type}</small><p>{source.note}</p></div><i>↗</i></a>)}</div>
          <p className="source-note">FRAME OS 只保存用于研究的低分辨率预览与结构化笔记；点击任何画面都能回到原作品。公开版不会冒充原站，也不会把搜索引擎缩略图当成策展。</p>
        </section>

        <section className="project-entry">
          <div><p className="eyebrow gold">ACTIVE VISUAL STUDY</p><h2>午夜仪式</h2><p>把人物肖像、仪式空间、冷暖光线和失控段落组织成一套可拍摄的视觉语法。</p><a href={route("/moodboard/")}>进入项目板 →</a></div>
          <div className="project-strip">{["film-handmaiden.jpg", "mv-i-wait.jpg", "film-fallen-angels.jpg"].map((name) => <img key={name} src={asset(`/professional/reframe/${name}`)} alt="项目参考静帧" />)}</div>
        </section>
      </div>
    </Shell>
  );
}

function readAnalysisWork() {
  if (typeof window === "undefined") return "film-handmaiden";
  return new URLSearchParams(window.location.search).get("ref") ?? "film-handmaiden";
}

export function AnalysisPage() {
  const [workId, setWorkId] = useState("film-handmaiden");
  const [tab, setTab] = useState<"视觉拆解" | "镜头语言" | "Seedance 提示词">("视觉拆解");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const requestedWork = readAnalysisWork();
    queueMicrotask(() => setWorkId(requestedWork));
  }, []);
  const work = professionalWorks.find((item) => item.id === workId) ?? professionalWorks[2];
  const promptText = `电影感 ${work.kind} 画面。${work.subtitle}。${work.why} 构图关键词：${work.craft.join("、")}。视觉元素：${work.tags.join("、")}。情绪：${work.mood}。人物保持自然微动作与真实皮肤纹理，镜头运动克制，保留环境关系和暗部层次，不要塑料质感，不要通用广告棚拍感。`;
  const copyPrompt = async () => {
    await navigator.clipboard?.writeText(promptText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Shell active="/analysis">
      <div className="page analysis-page">
        <div className="breadcrumb"><a href={route("/")}>视觉索引</a><span>/</span><b>{work.kind}</b><span>/</span><strong>{work.title}</strong></div>
        <section className="analysis-heading">
          <div><p className="eyebrow gold">FRAME READING · {work.year}</p><h1>{work.title}</h1><p>{work.subtitle}</p></div>
          <a href={work.sourceUrl} target="_blank" rel="noreferrer">查看原作品 ↗</a>
        </section>
        <section className="analysis-stage">
          <div className="analysis-visual"><img src={asset(work.image)} alt={`${work.title} 静帧`} /><span>{work.format ?? "FRAME"}</span></div>
          <aside>
            <p className="eyebrow gold">WHY THIS FRAME</p>
            <h2>它为什么值得参考？</h2>
            <p>{work.why}</p>
            <dl><div><dt>作品类型</dt><dd>{work.kind}</dd></div><div><dt>导演</dt><dd>{work.director}</dd></div>{work.cinematography && <div><dt>摄影</dt><dd>{work.cinematography}</dd></div>}<div><dt>情绪</dt><dd>{work.mood}</dd></div></dl>
          </aside>
        </section>

        <div className="analysis-tabs">{(["视觉拆解", "镜头语言", "Seedance 提示词"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? "active" : ""}>{item}</button>)}</div>
        {tab === "视觉拆解" && <section className="analysis-cards">
          <article><span>01 · COMPOSITION</span><h3>构图</h3><b>{work.craft[0]}</b><p>{work.why}</p></article>
          <article><span>02 · LIGHT & SPACE</span><h3>光与空间</h3><b>{work.craft[1]}</b><p>保留画面中的明暗关系，不把暗部全部提亮；先读空间，再读人物。</p></article>
          <article><span>03 · COLOR</span><h3>色彩</h3><b>{work.tags.slice(0, 3).join(" / ")}</b><p>颜色不是滤镜，而是人物、场景和情绪之间的组织关系。</p></article>
        </section>}
        {tab === "镜头语言" && <section className="shot-reading">
          <div><span>FRAME</span><b>{work.format ?? "2.39:1"}</b><p>先以原作画幅判断空间压力。</p></div>
          <div><span>CAMERA</span><b>克制运动</b><p>不为了“有运镜”而移动；让动作或空间触发镜头。</p></div>
          <div><span>PERFORMANCE</span><b>低密度表演</b><p>视线、呼吸和身体重心比连续动作更重要。</p></div>
          <div><span>TEXTURE</span><b>保留真实</b><p>接受颗粒、混合色温与局部失焦。</p></div>
        </section>}
        {tab === "Seedance 提示词" && <section className="prompt-panel">
          <header><div><p className="eyebrow gold">SEEDANCE · VISUAL TRANSLATION</p><h3>从参考提炼，不复制作品</h3></div><button onClick={copyPrompt}>{copied ? "已复制" : "复制提示词"}</button></header>
          <p>{promptText}</p>
          <div>{work.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </section>}
      </div>
    </Shell>
  );
}

const chapters = [
  {
    id: "01", title: "蓝色前奏", subtitle: "人物尚未进入仪式", image: "/professional/reframe/mv-seeing-signs.jpg", second: "/professional/reframe/film-dune.jpg", third: "/professional/reframe/ad-asics.jpg",
    palette: ["#0b162e", "#173d6d", "#74c4bf", "#d7d0c4"], note: "用大面积冷色负空间建立距离。人物不做完整表演，只让视线和呼吸先出现。",
  },
  {
    id: "02", title: "仪式肖像", subtitle: "凝视进入画面中心", image: "/professional/reframe/film-handmaiden.jpg", second: "/professional/reframe/mv-i-wait.jpg", third: "/professional/reframe/film-neon-demon.jpg",
    palette: ["#07191a", "#4b2c1e", "#a9662f", "#d8b57b"], note: "构图从偏置切换到严格中心。光线集中在眼睛、首饰与双侧烛火，背景保持可读但不抢人物。",
  },
  {
    id: "03", title: "红色失控", subtitle: "空间开始压向人物", image: "/professional/reframe/film-fallen-angels.jpg", second: "/professional/reframe/ad-bystander.jpg", third: "/professional/reframe/mv-happy-hour.jpg",
    palette: ["#120b0b", "#571d18", "#c84d2e", "#e89a62"], note: "不靠快速剪辑制造高潮。让前景、广角畸变和红色实景灯逐步挤压人物，最后用一个平静宽景结束。",
  },
];

export function MoodboardPage() {
  const [active, setActive] = useState(1);
  const [notes, setNotes] = useState<Record<number, string>>(() => Object.fromEntries(chapters.map((chapter, index) => [index, chapter.note])));
  const chapter = chapters[active];
  return (
    <Shell active="/moodboard">
      <div className="page mood-page">
        <div className="breadcrumb"><a href={route("/")}>项目</a><span>/</span><strong>午夜仪式</strong></div>
        <section className="mood-heading"><div><p className="eyebrow gold">VISUAL STUDY · IN DEVELOPMENT</p><h1>午夜仪式</h1><p>人物 / 仪式空间 / 冷暖光线 / 克制表演</p></div><button onClick={() => window.print()}>导出项目板</button></section>
        <div className="mood-layout">
          <aside className="chapter-list"><p className="eyebrow">CHAPTERS</p>{chapters.map((item, index) => <button key={item.id} className={active === index ? "active" : ""} onClick={() => setActive(index)}><span>{item.id}</span><div><b>{item.title}</b><small>{item.subtitle}</small></div><i>→</i></button>)}</aside>
          <section className="director-board">
            <header><div><span>CHAPTER {chapter.id}</span><h2>{chapter.title}</h2></div><p>{chapter.subtitle}</p></header>
            <div className="board-grid">
              <article className="board-image board-hero"><span>01 · 主视觉</span><img src={asset(chapter.image)} alt={`${chapter.title} 主视觉`} /></article>
              <article className="board-image"><span>02 · 空间关系</span><img src={asset(chapter.second)} alt="空间参考" /></article>
              <article className="board-image"><span>03 · 光线与动作</span><img src={asset(chapter.third)} alt="光线参考" /></article>
              <article className="palette-board"><span>04 · COLOR SYSTEM</span><div>{chapter.palette.map((color) => <i key={color} style={{ backgroundColor: color }}><b>{color}</b></i>)}</div></article>
              <article className="notes-board"><span>05 · DIRECTOR&apos;S NOTE</span><textarea aria-label="导演备注" value={notes[active]} onChange={(event) => setNotes((current) => ({ ...current, [active]: event.target.value }))} /><footer><b>自动保留在当前会话</b><em>{notes[active].length} 字</em></footer></article>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
