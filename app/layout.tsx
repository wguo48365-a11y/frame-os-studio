import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const socialImage = `${siteUrl.replace(/\/$/, "")}/og.png`;
const favicon = `${siteUrl.replace(/\/$/, "")}/favicon.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FRAME OS — 导演视觉研究引擎",
  description: "连接电影、MV 与广告作品的专业静帧索引、镜头分析和项目视觉板。",
  icons: { icon: favicon, shortcut: favicon },
  openGraph: { title: "FRAME OS — 导演视觉研究引擎", description: "电影、MV、广告静帧索引与创作者工作台", images: [{ url: socialImage }] },
  twitter: { card: "summary_large_image", title: "FRAME OS — 导演视觉研究引擎", description: "电影、MV、广告静帧索引与创作者工作台", images: [socialImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
