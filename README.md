# FRAME OS — 镜库 OS

为 AIGC 导演设计的电影静帧灵感与视觉分析工作台。

## 页面

- `/`：AI 灵感搜索、今日精选与项目入口
- `/analysis/`：构图、光影、色彩、镜头语言与 Seedance 提示词
- `/moodboard/`：「静默建筑」章节式视觉研究 Moodboard

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
