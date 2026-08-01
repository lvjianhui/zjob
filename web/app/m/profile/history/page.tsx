"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Search } from "lucide-react";
import Link from "next/link";

type HistoryItem = {
  id: number;
  name: string;
  industry?: string;
  visitedAt: number;
};

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} 小时前`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} 天前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function MobileHistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zjob_view_history");
      const list: HistoryItem[] = stored ? JSON.parse(stored) : [];
      // 按访问时间倒序
      list.sort((a, b) => b.visitedAt - a.visitedAt);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = () => {
    if (!confirm("确定要清空浏览历史吗？")) return;
    setItems([]);
    localStorage.removeItem("zjob_view_history");
  };

  return (
    <div className="bg-background min-h-screen">
      {/* 顶栏 */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">浏览历史</h1>
          {items.length > 0 ? (
            <button
              onClick={clearHistory}
              className="px-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              清空
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </header>

      <div className="max-w-[430px] mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-secondary animate-pulse" />
            <div className="h-16 rounded-xl bg-secondary animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">还没有浏览记录</p>
            <Link
              href="/m"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 h-10 text-sm font-semibold"
            >
              <Search className="w-4 h-4" />
              去搜索
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">
              共 {items.length} 条记录
            </p>
            {items.map((it) => (
              <Link
                key={`${it.id}-${it.visitedAt}`}
                href={`/m/company/${it.id}`}
                className="block rounded-xl border border-border bg-card p-4 shadow-card hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground truncate">
                      {it.name}
                    </h2>
                    {it.industry && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {it.industry}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3">
                    {formatTime(it.visitedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
