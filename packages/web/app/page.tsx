"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import CompanyCard from "@/components/CompanyCard";
import { getCompanySummary, searchCompanies } from "@/lib/api";
import {
  CompanyListItem,
  CompanySummaryResponse,
  DIMENSIONS_META,
} from "@/lib/types";
import {
  Banknote,
  Clock,
  Flame,
  Landmark,
  type LucideIcon,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const DIMENSION_ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  clock: Clock,
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
};

export default function HomePage() {
  const [results, setResults] = useState<CompanyListItem[]>([]);
  const [summaryMap, setSummaryMap] = useState<
    Record<number, CompanySummaryResponse>
  >({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState("");

  const handleSearch = useCallback(async (kw: string) => {
    setLoading(true);
    setHasSearched(true);
    setKeyword(kw);
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
    // 首页默认展示热门公司（空关键词返回全部 Demo 公司）
    handleSearch("");
  }, [handleSearch]);

  const sectionTitle =
    hasSearched && keyword.trim().length > 0 ? "搜索结果" : "热门公司推荐";

  return (
    <>
      <Header />
      <div className="max-w-[960px] mx-auto px-4 w-full flex-1">
        <section className="pt-12 pb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            入职前，先看清楚这家公司
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            六维交叉验证 · 红绿灯预警 · 真实时薪
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBox
              onSearch={handleSearch}
              placeholder="搜索公司名称，如 特斯拉、立讯精密、达能"
            />
          </div>
        </section>

        <section className="py-10">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-emote-cream-400" />
            <h2 className="text-xl font-semibold text-foreground">
              {sectionTitle}
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl bg-secondary animate-pulse"
                />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {results.map((c) => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  summary={summaryMap[c.id]}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              未找到相关公司，试试其他关键词
            </div>
          )}
        </section>

        <section className="py-10">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            六维亮点说明
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIMENSIONS_META.map((meta) => {
              const Icon = DIMENSION_ICON_MAP[meta.icon] ?? Landmark;
              return (
                <div
                  key={meta.key}
                  className="flex items-start gap-3 p-4 rounded-xl bg-secondary"
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-background text-foreground shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {meta.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {meta.oneLiner}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
