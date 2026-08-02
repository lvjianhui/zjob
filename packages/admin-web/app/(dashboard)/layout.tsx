"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  MessageSquareText,
  Menu,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("zjob_token");
    setToken(stored);
    if (!stored) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("zjob_token");
    localStorage.removeItem("zjob_role");
    router.push("/login");
  };

  const isEditRoute = /\/companies\/[^/]+\/edit$/.test(pathname);
  const isDashboard = pathname === "/";

  let title = "概览";
  if (pathname === "/") title = "概览";
  else if (pathname === "/companies") title = "公司管理";
  else if (pathname === "/reviews") title = "口碑审核";
  else if (isEditRoute) title = "编辑公司";

  const navItems = [
    { href: "/", label: "概览", icon: LayoutDashboard },
    { href: "/companies", label: "公司管理", icon: Building2 },
    { href: "/reviews", label: "口碑管理", icon: MessageSquareText },
  ];

  const handleTopbarSave = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin:save-company"));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 w-[220px] bg-sidebar border-r border-border flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-14 flex items-center gap-3 px-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            Z
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">
            真职后台
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 lg:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Top header */}
      <header className="fixed top-0 left-0 lg:left-[220px] right-0 z-30 h-14 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-secondary"
            aria-label="菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {isEditRoute && (
            <button
              type="button"
              onClick={handleTopbarSave}
              data-dom-id="company-edit-save"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors shadow-card"
            >
              保存
            </button>
          )}
          {token && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="用户菜单"
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 h-9 pl-1.5 pr-2 sm:pl-2.5 sm:pr-3 rounded-md hover:bg-secondary transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium text-sm">
                  运
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                  运营同学
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-60 rounded-lg border border-border bg-card shadow-modal overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      运营同学
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      admin@zjob.com
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    data-dom-id={isDashboard ? "dash-logout" : undefined}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 lg:ml-[220px] pt-14 min-h-screen bg-background flex flex-col">
        <div className="flex-1 overflow-auto">
          <div
            className={`${
              isEditRoute ? "" : "max-w-6xl mx-auto"
            } px-4 sm:px-6 lg:px-8 py-6 sm:py-8`}
          >
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-background mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>真职 Zjob · 后台管理系统</span>
            <span>© 2026 真职 Zjob</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
