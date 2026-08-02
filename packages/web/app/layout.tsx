import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-family-base",
  display: "swap",
});

export const metadata: Metadata = {
  title: "真职 Zjob - 公司信息查询与评估",
  description:
    "真职 Zjob 整合企业基本面、薪酬竞争力、福利保障、工作节奏、成长与制度、真实口碑六大维度，帮助求职者做出更理性的职业选择。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={nunito.variable}>
      <body className="antialiased font-sans bg-background text-foreground flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
