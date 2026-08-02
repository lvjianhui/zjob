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
  title: "真职后台 · Zjob Admin",
  description: "真职后台管理系统",
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
