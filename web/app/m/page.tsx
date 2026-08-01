"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  ChevronRight,
  Clock,
  Flame,
  Landmark,
  type LucideIcon,
  MessageSquare,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getCompanySummary, searchCompanies } from "@/lib/api";
import {
  CompanyListItem,
  CompanySummaryResponse,
  DIMENSIONS_META,
  DIMENSION_ACCENT,
} from "@/lib/types";
import MobileCompanyCard from "@/components/MobileCompanyCard";

const DIMENSION_ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  clock: Clock,
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
};

export default function MobileHomePage() {
  const router = useRouter();
  const [results, setResults] = useState<CompanyListItem[]>([]);
  const [summaryMap, setSummaryMap] = useState<
    Record<number, CompanySummaryResponse>
  >({});
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const handleSearch = useCallback(async (kw: string) => {
    setLoading(true);
    try {
      const data = await searchCompanies(kw, 20, 0);
      setResults(data);
      const summaries = await Promise.all(
        data.map((c) => getCompanySummary(c.id))
      );
      const next: Record<number, CompanySummaryResponse> = {};
      for (const s of summaries) {
        if (s) next[s.company_id] = s;
      }
      setSummaryMap(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch("");
  }, [handleSearch]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    const target = trimmed
      ? `/m/search?q=${encodeURIComponent(trimmed)}`
      : "/m/search";
    router.push(target);
  };

  return (
    <div className="px-4">
      {/* Hero + 搜索框 */}
      <section className="pt-10 pb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
          入职前，先看清楚这家公司
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          六维交叉验证 · 红绿灯预警 · 真实时薪
        </p>
        <form onSubmit={onSubmit}>
          <div className="flex items-center bg-card border border-border rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-emote-sky-400 shadow-float">
            <span className="pl-5 text-muted-foreground">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索公司名称，如 特斯拉、立讯精密"
              className="w-full h-12 px-3 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <button
              type="submit"
              className="h-9 px-5 mr-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-emote-charcoal-800 transition-colors shrink-0"
            >
              搜索
            </button>
          </div>
        </form>
      </section>

      {/* 热门公司推荐 */}
      <section className="pt-6 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emote-cream-400" />
            <h2 className="text-lg font-semibold text-foreground">
              热门公司推荐
            </h2>
          </div>
          {results.length > 0 && (
            <Link
              href="/m/search"
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              查看更多
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map((c) => (
              <MobileCompanyCard
                key={c.id}
                company={c}
                summary={summaryMap[c.id]}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            暂无推荐公司
          </div>
        )}
      </section>

      {/* 六维亮点说明 */}
      <section className="pt-2 pb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          六维亮点说明
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {DIMENSIONS_META.map((meta) => {
            const Icon = DIMENSION_ICON_MAP[meta.icon] ?? Landmark;
            const accent = DIMENSION_ACCENT[meta.accent];
            return (
              <div
                key={meta.key}
                className="bg-card border border-border rounded-xl p-4 shadow-card flex flex-col"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg ${accent.bg} flex items-center justify-center ${accent.text} shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      {meta.label}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {meta.oneLiner}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {meta.decisionMeaning}
                </p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
