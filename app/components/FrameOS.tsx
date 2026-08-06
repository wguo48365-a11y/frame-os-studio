"use client";

import { useState } from "react";
import { curatedFrames, curationDate } from "../data/curation";
import { LiveSearchFrame, SearchDirection, professionalSearchUrl, professionalSources, searchLiveFrames } from "../lib/liveSearch";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const url = (path: string) => `${basePath}${path}`;
const dailyFrames = curatedFrames.filter((frame) => frame.date === curationDate);

const nav = [
  { href: "/", label: "视觉工作台", icon: "⌂" },
  { href: "/analysis", label: "静帧分析", icon: "◎" },
  { href: "/moodboard", label: "项目板", icon: "▦" },
];

function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  const archiveTotal = 248 + curatedFrames.length;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href={url("/")} className="brand" aria-label="FRAME OS 首页">
          <span className="brand-mark">F</span>
          <span><b>FRAME</b><small>OS / 镜库</small></span>
        </a>
        <nav className="side-nav" aria-label="主导航">
          <p className="eyebrow">WORKSPACE</p>
          {nav.map((item) => (
            <a key={item.href} href={url(item.href)} className={active === item.href ? "active" : ""}>
              <span>{item.icon}</span>{item.label}
            </a>
          ))}
        </nav>
        <div className="side-library">
          <p className="eyebrow">LIBRARY</p>
          <button><span className="dot silver" />全部静帧 <em>{archiveTotal}</em></button>
          <button><span className="dot amber" />今日新增 <em>{dailyFrames.length}</em></button>
          <button><span className="dot slate" />授权清晰 <em>100%</em></button>
        </div>
        <div className="profile">
          <span className="avatar">KD</span>
          <span><b>KEN DIRECTOR</b><small>PRIVATE ARCHIVE</small></span>
          <i>•••</i>
        </div>
      </aside>
      <main className="main-canvas">
        <header className="topbar">
          <span className="mobile-brand">FRAME OS</span>
          <div className="top-status"><span className="live-dot" /> PRIVATE STUDIO</div>
          <div className="top-actions"><button aria-label="搜索">⌕</button><button aria-label="通知">◌</button><button className="add-btn">＋ 添加静帧</button></div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function HomeWorkspace() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [searchResults, setSearchResults] = useState<LiveSearchFrame[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [intentLabel, setIntentLabel] = useState("联网参考");
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [searchDirections, setSearchDirections] = useState<SearchDirection[]>([]);
  const [curationFilter, setCurationFilter] = useState("全部");
  const toggle = (tag: string) => setSelected((s) => s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]);
  const categories = ["全部", ...Array.from(new Set(dailyFrames.map((frame) => frame.category)))];
  const visibleFrames = curationFilter === "全部" ? dailyFrames : dailyFrames.filter((frame) => frame.category === curationFilter);
  const runSearch = async (overrideQuery?: string) => {
    const requestedQuery = typeof overrideQuery === "string" ? overrideQuery : query;
    if (!requestedQuery.trim() && !selected.length) return;
    if (typeof overrideQuery === "string") setQuery(overrideQuery);
    setSearchStatus("loading");
    setSearchResults([]);
    setSearchDirections([]);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 18000);
    try {
      const response = await searchLiveFrames(requestedQuery, selected, controller.signal);
      setSearchResults(response.results);
      setSearchTerm(response.translatedQuery);
      setIntentLabel(response.intentLabel);
      setActiveSources(response.activeSources);
      setSearchDirections(response.directions);
      setSearchStatus("ready");
    } catch {
      setSearchTerm(requestedQuery.trim() || selected.join(" "));
      setIntentLabel("联网参考");
      setActiveSources([]);
      setSearchStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return (
    <Shell active="/">
      <div className="page home-page">
        <section className="welcome-row">
          <div><p className="eyebrow gold">THURSDAY · 06 AUG</p><h1>早上好，导演。</h1><p>今天要创造怎样的画面？</p></div>
          <div className="archive-count"><b>{248 + curatedFrames.length}</b><span>FRAMES<br />ARCHIVED</span></div>
        </section>

        <section className="ai-search-panel">
          <div className="ai-spark">✦</div>
          <div className="search-content">
            <label htmlFor="creative-search">告诉 FRAME AI 你正在创作什么</label>
            <textarea id="creative-search" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") void runSearch(); }} placeholder="例如：时尚型 MV，女性独舞，红色舞台，强轮廓光，克制而有力量……" />
            <div className="search-footer">
              <div className="chips">
                {["时尚造型", "舞台表演", "叙事电影", "实验影像"].map((tag) => <button type="button" key={tag} onClick={() => toggle(tag)} className={selected.includes(tag) ? "selected" : ""}>{tag}</button>)}
              </div>
              <button type="button" className="generate-btn" onClick={() => void runSearch()} disabled={searchStatus === "loading"}>{searchStatus === "loading" ? "正在检索网络…" : "联网寻找参考"} <span>→</span></button>
            </div>
          </div>
        </section>
        <div className="network-source-strip"><span><i /> LIVE SEARCH READY</span><b>WIKIMEDIA COMMONS · FILM &amp; MEDIA</b><b>OPENVERSE · OPEN WORKS</b><em>Ctrl / ⌘ + Enter</em></div>

        {searchStatus !== "idle" && <section className={`network-results ${searchStatus}`} aria-live="polite" aria-busy={searchStatus === "loading"}>
          <header className="network-results-head">
            <div><p className="eyebrow gold">NETWORK VISUAL RESEARCH</p><h2>{searchStatus === "loading" ? "正在穿过视觉网络…" : intentLabel}</h2></div>
            {searchStatus === "ready" && <div className="network-stats"><span>{searchResults.length} RESULTS</span><span>{activeSources.length} LIVE SOURCES</span></div>}
          </header>
          {searchStatus === "loading" && <div className="network-loading"><i /><i /><i /><p>正在跨来源检索、去重并整理出处。</p></div>}
          {searchStatus === "error" && <div className="network-error"><b>实时来源暂时没有响应。</b><span>你仍可使用下方专业站点深度检索；稍后也可以再次点击联网搜索。</span></div>}
          {(searchStatus === "ready" || searchStatus === "error") && <>
            <div className="search-interpretation"><span>FRAME OS 理解的视觉意图</span><b>{searchTerm}</b></div>
            {searchDirections.length > 0 && <div className="intent-directions">
              <div><p className="eyebrow">CHOOSE A DIRECTION</p><h3>“MV”范围很大，继续收窄方向</h3><p>下面的结果已按四类 MV 语言检索；选择一个方向可获得更准确的下一轮参考。</p></div>
              <div>{searchDirections.map((direction) => <button type="button" key={direction.id} onClick={() => void runSearch(direction.query)}>
                <img src={url(direction.image)} alt="" />
                <span><b>{direction.title}</b><small>{direction.subtitle}</small></span><i>→</i>
              </button>)}</div>
            </div>}
            <div className="professional-searches">
              <div><p className="eyebrow">PROFESSIONAL INDEX</p><h3>专业站点深度检索</h3></div>
              <div>{professionalSources.map((source) => <a key={source.name} href={professionalSearchUrl(source.domain, query, selected)} target="_blank" rel="noreferrer"><span>{source.name}</span><small>{source.type}</small><i>↗</i></a>)}</div>
            </div>
          </>}
          {searchStatus === "ready" && searchResults.length === 0 && <div className="network-error"><b>当前关键词没有直接结果。</b><span>尝试减少限制词，或从专业站点继续检索。</span></div>}
          {searchStatus === "ready" && searchResults.length > 0 && <div className="network-grid">
            {searchResults.map((frame, index) => <article className="network-card" key={frame.id}>
              <a href={frame.sourceUrl} target="_blank" rel="noreferrer" className="network-image">
                <img src={frame.image} alt={frame.title} loading="lazy" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.parentElement?.classList.add("image-unavailable"); }} />
                <span className="image-fallback">预览暂不可用 · 查看原站</span>
                <span className="network-index">{String(index + 1).padStart(2, "0")}</span><b>{frame.source}</b>
                {frame.direction && <em>{frame.direction}</em>}
              </a>
              <div><h3>{frame.title}</h3><p>{frame.creator}</p><footer><a href={frame.licenseUrl} target="_blank" rel="noreferrer">{frame.license}</a><a href={frame.sourceUrl} target="_blank" rel="noreferrer">查看原站 ↗</a></footer></div>
            </article>)}
          </div>}
        </section>}

        <section className="section-head"><div><p className="eyebrow gold">DAILY CURATION</p><h2>今日视觉主题</h2></div><div className="theme-meta"><span>NO. 084</span><span>4 FRAMES</span></div></section>
        <section className="hero-frame">
          <a href={url("/analysis/")} className="hero-image">
            <img src={url("/frame-hall.png")} alt="女性走在冷银色现代建筑大厅中的电影静帧" />
            <div className="frame-index">FRAME 01 / 04</div>
            <div className="hero-overlay"><p>VISUAL THEME · 084</p><h3>空旷之中，<br />人的尺度。</h3><div><span>孤独女性</span><span>建筑秩序</span><span>冷银色调</span></div></div>
            <span className="analyze-link">分析此静帧 ↗</span>
          </a>
          <aside className="why-card">
            <p className="eyebrow gold">WHY IT WORKS</p>
            <h3>为什么高级？</h3>
            <ol>
              <li><b>01</b><span><strong>空间压过人物</strong><small>人物仅占画面 6%，建筑成为情绪本身。</small></span></li>
              <li><b>02</b><span><strong>克制的色彩关系</strong><small>冷银灰为主，仅保留一处暖金呼吸点。</small></span></li>
              <li><b>03</b><span><strong>精确但不僵硬</strong><small>对称秩序被人物步态轻微打破。</small></span></li>
            </ol>
            <a href={url("/analysis/")}>查看完整视觉分析 <span>→</span></a>
          </aside>
        </section>

        <section className="intake-section" aria-labelledby="intake-title">
          <div className="section-head intake-head">
            <div><p className="eyebrow gold">TODAY&apos;S INTAKE · {curationDate}</p><h2 id="intake-title">今日入库</h2><p className="section-description">每日从授权清晰的公开来源中筛选，按创作者工作流归档。</p></div>
            <div className="theme-meta"><span>{dailyFrames.length} NEW FRAMES</span><span>{categories.length - 1} CATEGORIES</span></div>
          </div>
          <div className="curation-filters" aria-label="静帧类别">
            {categories.map((category) => <button key={category} aria-pressed={curationFilter === category} onClick={() => setCurationFilter(category)} className={curationFilter === category ? "active" : ""}>{category}</button>)}
          </div>
          <div className="curation-grid">
            {visibleFrames.map((frame, index) => (
              <article className="curation-card" key={frame.id}>
                <a className="curation-image" href={frame.sourceUrl} target="_blank" rel="noreferrer">
                  <img src={url(frame.image)} alt={frame.title} />
                  <span className="curation-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="curation-category">{frame.category}</span>
                </a>
                <div className="curation-info">
                  <div><h3>{frame.title}</h3><p>{frame.mood}</p></div>
                  <div className="curation-tags">{frame.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <footer><span>PHOTO · {frame.author}</span><span><a href={frame.sourceUrl} target="_blank" rel="noreferrer">来源 ↗</a><a href={frame.licenseUrl} target="_blank" rel="noreferrer">{frame.license}</a></span></footer>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="project-section">
          <div className="section-head"><div><p className="eyebrow gold">ACTIVE PROJECTS</p><h2>继续你的项目</h2></div><a href={url("/moodboard/")}>查看全部 3 个项目 →</a></div>
          <a className="project-card" href={url("/moodboard/")}>
            <div className="project-collage"><img src={url("/frame-window.png")} alt="雨夜窗边女性" /><img src={url("/frame-stage.png")} alt="暖光舞台女性" /></div>
            <div className="project-info"><p>VISUAL STUDY · IN PROGRESS</p><h3>静默建筑</h3><span>空间 / 人物 / 光的距离</span><div className="progress"><i style={{ width: "68%" }} /><small>68% 视觉开发</small></div></div>
            <div className="project-stat"><b>24</b><span>REFERENCES</span><i>→</i></div>
          </a>
        </section>
      </div>
    </Shell>
  );
}

const promptText = `电影感广角镜头，一位身穿黑色极简长裙的亚洲女性站在雨夜落地窗前。人物位于画面右侧三分之一处，左侧保留大面积蓝黑负空间。冷青色窗光勾勒面部，室内一盏低照度钨丝灯形成暖色边缘。35mm 镜头，轻微手持漂移，极慢推近，真实皮肤纹理，细腻 35mm 胶片颗粒，克制、疏离，不要商业广告感，不要赛博朋克霓虹，不要塑料皮肤。`;

export function AnalysisPage() {
  const [tab, setTab] = useState("视觉拆解");
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard?.writeText(promptText); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <Shell active="/analysis">
      <div className="page analysis-page">
        <div className="breadcrumb"><a href={url("/")}>静帧库</a><span>/</span><b>夜窗独白</b></div>
        <section className="analysis-title"><div><p className="eyebrow gold">FRAME ANALYSIS · 0178</p><h1>夜窗独白</h1><p>来自视觉研究「静默建筑」 · Chapter 02</p></div><div className="analysis-actions"><button>♡ 收藏</button><button>＋ 加入项目</button><button>•••</button></div></section>
        <section className="analysis-hero">
          <div className="analysis-image"><img src={url("/frame-window.png")} alt="雨夜窗边女性的电影静帧" /><span className="ratio">2.39 : 1</span><span className="focus-dot" /></div>
          <div className="score-panel"><p>REAL CINEMA SCORE</p><div className="score-ring"><b>92</b><span>/ 100</span></div><h3>高真实电影感</h3><p>自然肤质、克制光比与非对称构图共同降低 AI 感。</p><div className="risk-row"><span>塑料肤质</span><i><b style={{ width: "12%" }} /></i><em>低</em></div><div className="risk-row"><span>过度锐化</span><i><b style={{ width: "18%" }} /></i><em>低</em></div><div className="risk-row"><span>棚拍广告感</span><i><b style={{ width: "26%" }} /></i><em>低</em></div></div>
        </section>
        <div className="analysis-tabs">{["视觉拆解", "镜头语言", "Seedance 提示词"].map((t) => <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>{t}</button>)}</div>
        {tab === "视觉拆解" && <section className="analysis-grid">
          <article><p className="eyebrow gold">01 · COMPOSITION</p><h3>构图</h3><div className="mini-frame composition"><span /><i /><b /></div><dl><div><dt>主体位置</dt><dd>右侧 1/3 · 视觉重心偏右</dd></div><div><dt>负空间</dt><dd>约 54% · 蓝黑窗面</dd></div><div><dt>结构</dt><dd>垂直框架 + 水平视线</dd></div></dl></article>
          <article><p className="eyebrow gold">02 · LIGHTING</p><h3>光影</h3><div className="lighting-orb"><span>主光<br /><b>冷青 76%</b></span><span>辅光<br /><b>暖金 24%</b></span></div><dl><div><dt>光比</dt><dd>1 : 5.8 · 低调照明</dd></div><div><dt>方向</dt><dd>左侧窗光 + 右后方轮廓光</dd></div><div><dt>质感</dt><dd>柔光 / 低饱和 / 保留暗部</dd></div></dl></article>
          <article><p className="eyebrow gold">03 · COLOR</p><h3>色彩</h3><div className="palette"><span style={{ background: "#0b2028" }}>36%</span><span style={{ background: "#22383d" }}>28%</span><span style={{ background: "#8a765e" }}>18%</span><span style={{ background: "#bc9370" }}>10%</span><span style={{ background: "#090909" }}>8%</span></div><dl><div><dt>主色</dt><dd>深海青 / 蓝黑</dd></div><div><dt>对比色</dt><dd>低照度钨丝金</dd></div><div><dt>情绪</dt><dd>等待 · 克制 · 夜的余温</dd></div></dl></article>
        </section>}
        {tab === "镜头语言" && <section className="shot-language"><div><span>SHOT SIZE</span><b>MCU</b><p>中近景，保留环境压迫感</p></div><div><span>LENS</span><b>35<span>mm</span></b><p>轻微空间延展，不扭曲面部</p></div><div><span>MOVEMENT</span><b>03<span>cm/s</span></b><p>极慢推近 + 微弱手持漂移</p></div><div><span>DEPTH</span><b>T2.8</b><p>背景可辨，焦点锁定眼部</p></div></section>}
        {tab === "Seedance 提示词" && <section className="prompt-card"><div className="prompt-head"><div><p className="eyebrow gold">SEEDANCE 2.0 · IMAGE TO VIDEO</p><h3>动态镜头提示词</h3></div><button onClick={copy}>{copied ? "✓ 已复制" : "复制提示词"}</button></div><p>{promptText}</p><div className="prompt-settings"><span><b>时长</b> 8 秒</span><span><b>画幅</b> 2.39:1</span><span><b>运动强度</b> 低</span><span><b>人物动作</b> 呼吸 + 眼神偏移</span></div><div className="avoid"><b>避免：</b> 面部重绘、夸张眨眼、头发漂浮、镜头突然加速、景深呼吸</div></section>}
      </div>
    </Shell>
  );
}

const chapters = [
  { no: "01", title: "冷银大厅", emotion: "等待 / 疏离", color: "银灰 + 白", camera: "慢推 + 侧逆光", note: "让人物被空间吞没。开场不要急着交代面孔，先交代她与世界的距离。" },
  { no: "02", title: "夜窗独白", emotion: "回望 / 克制", color: "蓝黑 + 暖金", camera: "35mm 微手持", note: "情绪第一次靠近人物，但不要表演悲伤。让雨、水汽和呼吸代替台词。" },
  { no: "03", title: "暖光剧场", emotion: "释放 / 告别", color: "琥珀 + 黑", camera: "横移 + 定格", note: "歌曲最后一次副歌进入暖色。她不是被照亮，而是主动走进光里。" },
];

export function MoodboardPage() {
  const [chapter, setChapter] = useState(0);
  const [note, setNote] = useState(chapters[0].note);
  const change = (index: number) => { setChapter(index); setNote(chapters[index].note); };
  const c = chapters[chapter];
  return (
    <Shell active="/moodboard">
      <div className="page mood-page">
        <div className="breadcrumb"><a href={url("/")}>项目</a><span>/</span><b>静默建筑</b></div>
        <section className="mood-title"><div><p className="eyebrow gold">VISUAL STUDY · PROJECT 01</p><h1>静默建筑</h1><p>关于空间、人物与光的距离研究</p></div><div className="mood-actions"><div className="member-stack"><span>KD</span><span>AI</span></div><button>分享</button><button className="export-btn">导出导演板</button></div></section>
        <div className="mood-layout">
          <aside className="chapter-nav"><div className="chapter-head"><p className="eyebrow">CHAPTERS</p><button>＋</button></div>{chapters.map((item, i) => <button key={item.no} onClick={() => change(i)} className={chapter === i ? "active" : ""}><span>{item.no}</span><div><b>{item.title}</b><small>{item.emotion}</small></div><i>{chapter === i ? "●" : "○"}</i></button>)}<div className="project-progress"><div><span>视觉开发进度</span><b>68%</b></div><i><b /></i><small>24 张参考 · 3 个章节</small></div></aside>
          <section className="director-board">
            <header className="board-head"><div><span>CHAPTER {c.no}</span><h2>{c.title}</h2></div><div className="chapter-data"><span><small>EMOTION</small>{c.emotion}</span><span><small>COLOR</small>{c.color}</span><span><small>CAMERA</small>{c.camera}</span></div></header>
            <div className="board-grid">
              <article className="board-card hero-ref"><div className="card-label"><span>01</span>主视觉 / HERO FRAME</div><img src={url(chapter === 2 ? "/frame-stage.png" : chapter === 1 ? "/frame-window.png" : "/frame-hall.png")} alt="章节主视觉参考" /><button>↗ 分析</button></article>
              <article className="board-card space-ref"><div className="card-label"><span>02</span>空间 / SPACE</div><img src={url("/frame-concrete.png")} alt="混凝土空间参考" /></article>
              <article className="board-card light-ref"><div className="card-label"><span>03</span>光影 / LIGHT</div><img src={url("/frame-stage.png")} alt="琥珀舞台光影参考" /></article>
              <article className="board-card texture-ref"><div className="card-label"><span>04</span>材质 / TEXTURE</div><img src={url("/frame-texture.png")} alt="金属与丝绸材质参考" /></article>
              <article className="color-card"><div className="card-label"><span>05</span>色板 / PALETTE</div><div className="color-strips"><span style={{ background: "#d9d8d2" }}><b>冷白</b><small>#D9D8D2</small></span><span style={{ background: "#889196" }}><b>银灰</b><small>#889196</small></span><span style={{ background: "#273137" }}><b>石墨</b><small>#273137</small></span><span style={{ background: "#9b6a32" }}><b>余温</b><small>#9B6A32</small></span></div></article>
              <article className="notes-card"><div className="card-label"><span>06</span>导演备注 / DIRECTOR&apos;S NOTE</div><textarea value={note} onChange={(e) => setNote(e.target.value)} aria-label="导演备注" /><footer><span>已自动保存</span><button>＋ 添加标注</button></footer></article>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
