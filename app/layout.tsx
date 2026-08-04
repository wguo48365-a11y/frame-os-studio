import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const socialImage = `${siteUrl.replace(/\/$/, "")}/og.png`;
const favicon = `${siteUrl.replace(/\/$/, "")}/favicon.svg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FRAME OS — 镜库 OS",
  description: "为 AIGC 导演而生的电影静帧灵感与视觉分析工作台。",
  icons: { icon: favicon, shortcut: favicon },
  openGraph: { title: "FRAME OS — 镜库 OS", description: "AIGC 电影静帧灵感与导演工作台", images: [{ url: socialImage }] },
  twitter: { card: "summary_large_image", title: "FRAME OS — 镜库 OS", description: "AIGC 电影静帧灵感与导演工作台", images: [socialImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
