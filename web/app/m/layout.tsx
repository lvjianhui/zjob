"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Scale, User } from "lucide-react";

// Mobile 端 layout：max-width 430px + 底部 Tab 栏（搜索 / 对比 / 我的）
export default function MobileLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isComparePage = pathname.startsWith("/m/compare");
  const isProfilePage = pathname.startsWith("/m/profile");
  const isLoginPage = pathname.startsWith("/m/login");

  // 首页 Tab 激活：当前在 /m 或 /m/company/* 下
  const isHomeActive = !isComparePage && !isProfilePage && !isLoginPage;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col">
        <div
          className={`flex-1 ${
            isLoginPage ? "" : "pb-[calc(64px+env(safe-area-inset-bottom,0px))]"
          }`}
        >
          {children}
        </div>
      </div>

      {/* 底部 Tab 栏（登录页隐藏） */}
      {!isLoginPage && (
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto">
          <Link
            href="/m"
            className={`flex items-center justify-center h-full flex-1 transition-colors ${
              isHomeActive ? "text-foreground" : "text-muted-foreground"
            }`}
            aria-label="首页"
          >
            <Home className="w-6 h-6" />
          </Link>
          <Link
            href="/m/compare"
            className={`flex items-center justify-center h-full flex-1 transition-colors ${
              isComparePage ? "text-foreground" : "text-muted-foreground"
            }`}
            aria-label="对比"
          >
            <Scale className="w-6 h-6" />
          </Link>
          <Link
            href="/m/profile"
            className={`flex items-center justify-center h-full flex-1 transition-colors ${
              isProfilePage ? "text-foreground" : "text-muted-foreground"
            }`}
            aria-label="我的"
          >
            <User className="w-6 h-6" />
          </Link>
        </div>
      </nav>
      )}
    </div>
  );
}
