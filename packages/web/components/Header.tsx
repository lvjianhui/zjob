"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItem = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={
          active
            ? "text-sm font-medium text-foreground"
            : "text-sm font-medium text-muted-foreground hover:text-foreground"
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-[960px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground font-semibold text-lg"
        >
          <span className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </span>
          真职 Zjob
        </Link>
        <nav className="flex items-center gap-6">
          {navItem("/", "搜索")}
          {navItem("/compare", "对比")}
        </nav>
      </div>
    </header>
  );
}
