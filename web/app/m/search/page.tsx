"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { getCompanySummary, searchCompanies } from "@/lib/api";
import {
  CompanyListItem,
  CompanySummaryResponse,
  DIMENSIONS_META,
  DimensionKey,
  LEVEL_COLORS,
  TrafficLightLevel,
} from "@/lib/types";
import MobileCompanyCard from "@/components/MobileCompanyCard";

const PAGE_SIZE = 20;

function scoreToLevel(score: number): TrafficLightLevel {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

function MobileSearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("q") || "";
  const [keyword, setKeyword] = useState(initialKeyword);
  const [results, setResults] = useState<CompanyListItem[]>([]);
  const [summaryMap, setSummaryMap] = useState<
    Record<number, CompanySummaryResponse>
  >({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelOpen, setLevelOpen] = useState(false);
  const [dimOpen, setDimOpen] = useState(false);
  const [levelFilter, setLevelFilter] = useState<TrafficLightLevel | null>(null);
  const [dimFilter, setDimFilter] = useState<DimensionKey[]>([]);

  // 用于无限滚动
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  // 下拉容器引用（用于点击外部关闭）
  const levelWrapRef = useRef<HTMLDivElement | null>(null);
  const dimWrapRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!levelOpen && !dimOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        levelOpen &&
        levelWrapRef.current &&
        !levelWrapRef.current.contains(target)
      ) {
        setLevelOpen(false);
      }
      if (
        dimOpen &&
        dimWrapRef.current &&
        !dimWrapRef.current.contains(target)
      ) {
        setDimOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [levelOpen, dimOpen]);

  // 加载一页数据
  const loadPage = useCallback(
    async (kw: string, offset: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await searchCompanies(kw, PAGE_SIZE, offset);
        if (append) {
          setResults((prev) => {
            // 去重
            const existingIds = new Set(prev.map((c) => c.id));
            const merged = [...prev, ...data.filter((c) => !existingIds.has(c.id))];
            return merged;
          });
        } else {
          setResults(data);
        }
        // 不足一页说明没更多了
        setHasMore(data.length === PAGE_SIZE);
        offsetRef.current = offset + data.length;

        // 拉 summary
        const summaries = await Promise.all(
          data.map((c) => getCompanySummary(c.id))
        );
        setSummaryMap((prev) => {
          const next = { ...prev };
          for (const s of summaries) {
            if (s) next[s.company_id] = s;
          }
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
        if (!append) setHasMore(false);
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    []
  );

  // 首次加载：读取 URL 中的 q 参数作为初始关键词
  useEffect(() => {
    setKeyword(initialKeyword);
    offsetRef.current = 0;
    setHasMore(true);
    loadPage(initialKeyword, 0, false);
  }, [loadPage, initialKeyword]);

  // 搜索提交：同步 URL，便于分享/返回
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    const url = trimmed ? `/m/search?q=${encodeURIComponent(trimmed)}` : "/m/search";
    router.replace(url);
    offsetRef.current = 0;
    setHasMore(true);
    loadPage(trimmed, 0, false);
  };

  const handleClear = () => {
    setKeyword("");
    router.replace("/m/search");
    offsetRef.current = 0;
    setHasMore(true);
    loadPage("", 0, false);
  };

  // 筛选切换
  const selectLevel = (lvl: TrafficLightLevel) => {
    setLevelFilter((prev) => (prev === lvl ? null : lvl));
  };
  const toggleDim = (dk: DimensionKey) => {
    setDimFilter((prev) =>
      prev.includes(dk) ? prev.filter((d) => d !== dk) : [...prev, dk]
    );
  };
  const clearFilters = () => {
    setLevelFilter(null);
    setDimFilter([]);
  };

  const hasFilter = levelFilter !== null || dimFilter.length > 0;

  // 前端过滤（基于已加载的 summary）
  const filteredResults = results.filter((c) => {
    const summary = summaryMap[c.id];
    if (!summary) return hasFilter ? false : true;
    if (levelFilter !== null) {
      const overallLevel = scoreToLevel(summary.overall_score);
      if (overallLevel !== levelFilter) return false;
    }
    if (dimFilter.length > 0) {
      for (const dk of dimFilter) {
        const dim = summary.dimensions.find((d) => d.key === dk);
        if (!dim || dim.level !== "green") return false;
      }
    }
    return true;
  });

  // 无限滚动：IntersectionObserver
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore && !loading) {
          loadPage(keyword, offsetRef.current, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, keyword, loadPage]);

  // 筛选后结果不足时自动加载更多
  useEffect(() => {
    if (
      hasFilter &&
      filteredResults.length < 5 &&
      hasMore &&
      !loadingMore &&
      !loading
    ) {
      loadPage(keyword, offsetRef.current, true);
    }
  }, [hasFilter, filteredResults.length, hasMore, loadingMore, loading, keyword, loadPage]);

  return (
    <div>
      {/* 顶栏：返回 + 搜索框 */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-foreground"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={onSubmit} className="flex-1">
            <div className="flex items-center bg-secondary rounded-full px-3 h-9">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索公司名称"
                className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground px-2"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="清空"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto px-4">
        {/* 筛选区：综合评分 + 维度 独立两个下拉 */}
        <div className="py-3 flex items-center gap-2 border-b border-border">
          {/* 综合评分下拉 */}
          <div ref={levelWrapRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setLevelOpen((v) => !v);
                setDimOpen(false);
              }}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                levelFilter !== null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              综合评分
              {levelFilter !== null && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] bg-background text-foreground">
                  1
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${levelOpen ? "rotate-180" : ""}`}
              />
            </button>
            {levelOpen && (
              <div className="absolute top-full left-0 mt-1 z-40 bg-card border border-border rounded-lg shadow-float p-3 w-56">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-muted-foreground">综合评分</p>
                  {levelFilter !== null && (
                    <button
                      type="button"
                      onClick={() => setLevelFilter(null)}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      清除
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {(["green", "yellow", "red"] as TrafficLightLevel[]).map(
                    (lvl) => {
                      const color = LEVEL_COLORS[lvl];
                      const active = levelFilter === lvl;
                      const label =
                        lvl === "green"
                          ? "绿灯 ≥80"
                          : lvl === "yellow"
                            ? "黄灯 60-79"
                            : "红灯 <60";
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => selectLevel(lvl)}
                          className={`inline-flex items-center gap-2 h-8 px-2.5 rounded-md text-xs font-medium border transition-colors ${
                            active
                              ? "text-foreground"
                              : "bg-secondary text-muted-foreground border-transparent"
                          }`}
                          style={
                            active
                              ? {
                                  backgroundColor: `${color.hex}22`,
                                  borderColor: color.hex,
                                  color: color.hex,
                                }
                              : undefined
                          }
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color.hex }}
                          />
                          {label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 维度下拉 */}
          <div ref={dimWrapRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setDimOpen((v) => !v);
                setLevelOpen(false);
              }}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                dimFilter.length > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              维度
              {dimFilter.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] bg-background text-foreground">
                  {dimFilter.length}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${dimOpen ? "rotate-180" : ""}`}
              />
            </button>
            {dimOpen && (
              <div className="absolute top-full left-0 mt-1 z-40 bg-card border border-border rounded-lg shadow-float p-3 w-56">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-muted-foreground">
                    维度（选中=该维度为绿灯）
                  </p>
                  {dimFilter.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDimFilter([])}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      清除
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {DIMENSIONS_META.map((meta) => {
                    const active = dimFilter.includes(meta.key);
                    return (
                      <button
                        key={meta.key}
                        type="button"
                        onClick={() => toggleDim(meta.key)}
                        className={`inline-flex items-center h-8 px-2.5 rounded-md text-xs font-medium border transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-muted-foreground border-transparent"
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {hasFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              清除全部
            </button>
          )}
        </div>

        {/* 结果计数 */}
        {!loading && results.length > 0 && (
          <p className="py-3 text-xs text-muted-foreground">
            {keyword ? `「${keyword}」相关公司` : "全部公司"} · 共{" "}
            {hasFilter
              ? `${filteredResults.length}/${results.length}`
              : results.length}{" "}
            家
          </p>
        )}

        {/* 列表 */}
        {loading ? (
          <div className="space-y-2 py-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-2">未找到相关公司</p>
            <p className="text-xs">试试其他关键词</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-2">没有符合筛选条件的公司</p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-primary"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div className="space-y-2 pb-6">
            {filteredResults.map((c) => (
              <MobileCompanyCard
                key={c.id}
                company={c}
                summary={summaryMap[c.id]}
              />
            ))}

            {/* 无限滚动哨兵 */}
            <div ref={sentinelRef} className="h-10 flex items-center justify-center">
              {loadingMore && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  加载中...
                </span>
              )}
              {!hasMore && !loadingMore && results.length > 0 && (
                <span className="text-xs text-muted-foreground">没有更多了</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-20 text-center text-sm text-muted-foreground">
          加载中...
        </div>
      }
    >
      <MobileSearchPageInner />
    </Suspense>
  );
}
