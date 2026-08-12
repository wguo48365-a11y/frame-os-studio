# FRAME OS — 导演视觉研究引擎

面向导演、摄影、美术与 AIGC 创作者的专业视觉研究系统。它不是免费图片墙，而是把电影、MV、广告与创意短片整理成可检索、可分析、可进入项目板的镜头参考。

## 产品框架

1. **专业作品索引**：以作品为单位收录真实静帧，保留导演、摄影、年份与原始来源。
2. **创作意图检索**：先匹配站内人工精选，再把中文视觉描述转换为英文行业词，实时查询 Directors' Library 的电影、MV、广告与创意短片。
3. **镜头级分析**：提炼构图、光线、色彩、表演与 Seedance 视觉提示词。
4. **项目视觉板**：将参考组织为章节、色板、空间关系和导演备注。
5. **每日编辑策展**：优先 FilmGrab、Directors' Library、Vimeo Staff Picks、shots、Ads of the World 与 ShotDeck 等专业来源，人工复核后入库。

## 页面

- `/`：专业静帧检索、实时联网结果、编辑精选、来源网络与项目入口
- `/analysis/`：构图、光影、色彩、镜头语言与 Seedance 提示词
- `/moodboard/`：「午夜仪式」章节式视觉研究 Moodboard

## 本地运行

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
node --test tests/rendered-html.test.mjs
```

项目使用 Next.js 静态导出，由 GitHub Actions 自动发布至 GitHub Pages。
