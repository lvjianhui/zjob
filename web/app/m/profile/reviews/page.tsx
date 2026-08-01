"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Star } from "lucide-react";
import Link from "next/link";

type ReviewItem = {
  companyId: number;
  companyName: string;
  industry?: string;
  rating: number;
  content: string;
  createdAt: number;
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function MobileReviewsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zjob_reviews");
      const list: ReviewItem[] = stored ? JSON.parse(stored) : [];
      list.sort((a, b) => b.createdAt - a.createdAt);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
          <h1 className="text-lg font-semibold text-foreground">我的评价</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-[430px] mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-24 rounded-xl bg-secondary animate-pulse" />
            <div className="h-24 rounded-xl bg-secondary animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">还没有发表过评价</p>
            <Link
              href="/m"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 h-10 text-sm font-semibold"
            >
              <Search className="w-4 h-4" />
              去看看公司
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">
              共 {items.length} 条评价
            </p>
            {items.map((it, idx) => (
              <article
                key={`${it.companyId}-${idx}`}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/m/company/${it.companyId}`}
                    className="min-w-0"
                  >
                    <h2 className="text-base font-bold text-foreground truncate hover:underline">
                      {it.companyName}
                    </h2>
                    {it.industry && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {it.industry}
                      </p>
                    )}
                  </Link>
                  <div className="flex items-center gap-0.5 shrink-0 ml-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < it.rating
                            ? "text-emote-cream-500 fill-current"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {it.content && (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                    {it.content}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDate(it.createdAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
