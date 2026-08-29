import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "苗绣·生生不息 | 数字文化创新表达平台",
  description:
    "以智能科技与数字创意，让千年苗绣在数字时代焕发新生。纹样图谱、虚拟绣艺、AI纹样生成、传承人故事——铸牢中华民族共同体意识的数字文化实践。",
  keywords: [
    "苗绣",
    "苗族刺绣",
    "非物质文化遗产",
    "民族文化",
    "数字文化",
    "纹样图谱",
    "AI纹样生成",
    "文化创新表达",
  ],
  authors: [{ name: "苗绣·生生不息项目组" }],
  openGraph: {
    title: "苗绣·生生不息 | 数字文化创新表达平台",
    description: "以智能科技与数字创意，让千年苗绣在数字时代焕发新生",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${notoSerif.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
