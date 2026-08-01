"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  Clock,
  Landmark,
  Lightbulb,
  type LucideIcon,
  MessageSquare,
  Scale,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import {
  compareCompanies,
  getCompanyAnalysis,
  getCompanySummary,
  searchCompanies,
} from "@/lib/api";
import {
  CompanyAnalysisResponse,
  CompanyListItem,
  CompanySummaryResponse,
  CompareResponse,
  DIMENSIONS_META,
  DIMENSION_ACCENT,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  LEVEL_COLORS,
} from "@/lib/types";

const DIMENSION_ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  clock: Clock,
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
};

const COMPARE_KEY = "zjob_compare_ids";
const MAX_COMPARE = 2;

export default function MobileComparePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "compare">("select");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<CompanyListItem[]>([]);
  const [summaryMap, setSummaryMap] = useState<
    Record<number, CompanySummaryResponse>
  >({});
  const [loading, setLoading] = useState(false);

  // 对比模式数据
  const [data, setData] = useState<CompareResponse | null>(null);
  const [analysisMap, setAnalysisMap] = useState<
    Record<number, CompanyAnalysisResponse>
  >({});
  const [compareLoading, setCompareLoading] = useState(false);

  // 初始化：读取已选公司 ID
  useEffect(() => {
    const stored = localStorage.getItem(COMPARE_KEY);
    const ids: number[] = stored ? JSON.parse(stored) : [];
    setSelectedIds(ids);
  }, []);

  // 加载公司列表
  const loadCompanies = useCallback(async (kw: string) => {
    setLoading(true);
    try {
      const list = await searchCompanies(kw, 50, 0);
      setResults(list);
      const summaries = await Promise.all(
        list.map((c) => getCompanySummary(c.id))
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
    loadCompanies("");
  }, [loadCompanies]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadCompanies(keyword.trim());
  };

  const handleClear = () => {
    setKeyword("");
    loadCompanies("");
  };

  const persist = (ids: number[]) => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      let next: number[];
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else if (prev.length >= MAX_COMPARE) {
        // 已满 2 个，替换最早的一个
        next = [...prev.slice(1), id];
      } else {
        next = [...prev, id];
      }
      persist(next);
      return next;
    });
  };

  const removeSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      persist(next);
      return next;
    });
  };

  const startCompare = async () => {
    if (selectedIds.length !== 2) return;
    setMode("compare");
    setCompareLoading(true);
    try {
      const res = await compareCompanies(selectedIds);
      if (res) {
        setData(res);
        const analyses = await Promise.all(
          res.companies.map((c) => getCompanyAnalysis(c.company_id))
        );
        const next: Record<number, CompanyAnalysisResponse> = {};
        for (let i = 0; i < res.companies.length; i++) {
          if (analyses[i]) {
            next[res.companies[i].company_id] = analyses[i]!;
          }
        }
        setAnalysisMap(next);
      }
    } finally {
      setCompareLoading(false);
    }
  };

  const backToSelect = () => {
    setMode("select");
    setData(null);
    setAnalysisMap({});
  };

  // 已选公司详情（用于顶部 chips 显示名称）
  const selectedCompanies = selectedIds
    .map((id) => results.find((c) => c.id === id))
    .filter((c): c is CompanyListItem => !!c);

  // ============ 对比模式 ============
  if (mode === "compare") {
    return (
      <div>
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={backToSelect}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回选择</span>
            </button>
            <span className="text-sm font-semibold text-foreground">
              1v1 对比
            </span>
          </div>
        </div>

        {compareLoading ? (
          <div className="max-w-[430px] mx-auto px-4 py-6 space-y-4">
            <div className="h-10 rounded-lg bg-secondary animate-pulse" />
            <div className="h-32 rounded-xl bg-secondary animate-pulse" />
            <div className="h-64 rounded-xl bg-secondary animate-pulse" />
          </div>
        ) : data && data.companies.length === 2 ? (
          <CompareDetail
            data={data}
            analysisMap={analysisMap}
            onRemove={(id) => {
              removeSelected(id);
              backToSelect();
            }}
          />
        ) : (
          <div className="max-w-[430px] mx-auto px-4 py-20 text-center text-sm text-muted-foreground">
            对比数据加载失败，请重试
          </div>
        )}
      </div>
    );
  }

  // ============ 选择模式 ============
  return (
    <div className="pb-[calc(64px+64px+env(safe-area-inset-bottom,0px))]">
      {/* 顶栏 */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/m")}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-base font-semibold text-foreground">公司对比</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="max-w-[430px] mx-auto px-4">
        {/* 说明 */}
        <div className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              1v1 对比
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            从下方选择 2 家公司，查看六维横向对比与真实时薪
          </p>
        </div>

        {/* 搜索框 */}
        <form onSubmit={onSubmit} className="pb-3">
          <div className="flex items-center bg-card border border-border rounded-full px-3 h-10 shadow-card">
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

        {/* 已选公司 chips */}
        {selectedCompanies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-3">
            {selectedCompanies.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium"
              >
                {c.short_name || c.name}
                <button
                  type="button"
                  onClick={() => removeSelected(c.id)}
                  className="w-5 h-5 rounded-full inline-flex items-center justify-center hover:bg-primary-foreground/20"
                  aria-label={`移除${c.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedIds.length < MAX_COMPARE && (
              <span className="text-xs text-muted-foreground">
                再选 {MAX_COMPARE - selectedIds.length} 家
              </span>
            )}
          </div>
        )}

        {/* 公司列表 */}
        {loading ? (
          <div className="space-y-2 py-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="mb-2">未找到相关公司</p>
            <p className="text-xs">试试其他关键词</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((c) => (
              <CompanySelectCard
                key={c.id}
                company={c}
                summary={summaryMap[c.id]}
                selected={selectedIds.includes(c.id)}
                onToggle={() => toggleSelect(c.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部操作栏（位于底部导航栏之上） */}
      <div
        className="fixed left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 text-xs text-muted-foreground">
            已选 <span className="font-semibold text-foreground">{selectedIds.length}</span> / {MAX_COMPARE}
          </div>
          <button
            type="button"
            onClick={startCompare}
            disabled={selectedIds.length !== 2}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 h-10 text-sm font-semibold shadow-card disabled:opacity-50 disabled:shadow-none transition-opacity"
          >
            <Scale className="w-4 h-4" />
            开始 1v1 对比
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ 选择卡片 ============
function CompanySelectCard({
  company,
  summary,
  selected,
  onToggle,
}: {
  company: CompanyListItem;
  summary?: CompanySummaryResponse;
  selected: boolean;
  onToggle: () => void;
}) {
  const score = summary?.overall_score;
  return (
    <div
      className={`flex items-center gap-3 bg-card border rounded-lg p-3 shadow-card transition-colors ${
        selected
          ? "border-primary ring-1 ring-primary/30"
          : "border-border"
      }`}
    >
      <Link
        href={`/m/company/${company.id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {company.name}
            </h3>
            {score != null && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                style={{
                  backgroundColor: "var(--emote-mint-100)",
                  color: "var(--emote-mint-900)",
                }}
              >
                {(score / 10).toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mb-1.5">
            {company.industry || "未知行业"} · {company.scale || "未知规模"}
          </p>
          {summary && (
            <div className="flex items-center gap-1">
              {summary.dimensions.map((dim) => {
                const color = LEVEL_COLORS[dim.level];
                const meta = DIMENSIONS_META.find((m) => m.key === dim.key);
                const Icon = meta
                  ? DIMENSION_ICON_MAP[meta.icon] ?? Landmark
                  : Landmark;
                return (
                  <span
                    key={dim.key}
                    className="inline-flex items-center justify-center w-5 h-5 rounded"
                    style={{
                      backgroundColor: `${color.hex}22`,
                      color: color.hex,
                    }}
                    title={`${dim.label} ${dim.score}分`}
                  >
                    <Icon className="w-3 h-3" />
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={onToggle}
        aria-label={selected ? "移出对比" : "加入对比"}
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
          selected
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-primary hover:bg-secondary"
        }`}
      >
        {selected ? (
          <Check className="w-5 h-5" />
        ) : (
          <Scale className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

// ============ 对比详情 ============
function CompareDetail({
  data,
  analysisMap,
  onRemove,
}: {
  data: CompareResponse;
  analysisMap: Record<number, CompanyAnalysisResponse>;
  onRemove: (id: number) => void;
}) {
  const companies = data.companies;

  return (
    <div className="max-w-[430px] mx-auto px-4 py-6 space-y-6">
      {/* 已选公司头卡（左右布局 + VS） */}
      <section className="relative">
        <div className="grid grid-cols-2 gap-2 items-stretch">
          {companies.map((c) => {
            const score = c.overall_score;
            const scoreColor =
              score >= 80
                ? { bg: "var(--emote-mint-100)", text: "var(--emote-mint-700)" }
                : score >= 60
                ? { bg: "var(--emote-cream-100)", text: "var(--emote-cream-700)" }
                : { bg: "var(--emote-rose-100)", text: "var(--emote-rose-700)" };
            return (
              <article
                key={c.company_id}
                className="relative rounded-lg border border-border bg-card p-2 shadow-card flex flex-col min-w-0"
              >
                <button
                  onClick={() => onRemove(c.company_id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shadow z-10"
                  aria-label={`删除${c.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="min-w-0 flex-1 pr-1">
                  <h2 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                    {c.short_name || c.name}
                  </h2>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xl font-extrabold text-foreground leading-none">
                    {(score / 10).toFixed(1)}
                  </span>
                  <span
                    className="text-[9px] font-medium px-1.5 py-px rounded-full"
                    style={{
                      backgroundColor: scoreColor.bg,
                      color: scoreColor.text,
                    }}
                  >
                    综合
                  </span>
                </div>
              </article>
            );
          })}
        </div>
        {/* VS 徽章（居中覆盖） */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold shadow-lg border-2 border-background">
            VS
          </span>
        </div>
      </section>

      {/* 结论摘要 */}
      <section className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb
            className="w-5 h-5 mt-0.5 shrink-0"
            style={{ color: "var(--emote-cream-500)" }}
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground">结论摘要</h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {companies
                .map((c) => c.name)
                .join("、")}
              已完成 1v1 对比，综合评分最高的是
              {companies.reduce((max, c) =>
                c.overall_score > max.overall_score ? c : max
              ).name}
              。
            </p>
          </div>
        </div>
      </section>

      {/* 六维逐项对比（卡片行样式，避免维度名换行） */}
      <section className="rounded-xl border border-border bg-card p-3 shadow-card space-y-2">
        <h3 className="text-sm font-semibold text-foreground px-1 mb-1">
          六维度逐项对比
        </h3>
        {DIMENSION_ORDER.map((dimKey) => {
          const label = DIMENSION_LABELS[dimKey];
          const meta = DIMENSIONS_META.find((m) => m.key === dimKey);
          const accent = meta ? DIMENSION_ACCENT[meta.accent] : DIMENSION_ACCENT.charcoal;
          const Icon = meta
            ? DIMENSION_ICON_MAP[meta.icon] ?? Landmark
            : Landmark;
          // 确定本维度 2 家公司中最高分（用于胜出高亮）
          const scores = companies.map((c) => {
            const dim = c.dimensions.find((d) => d.key === dimKey);
            return dim ? dim.score : 0;
          });
          const maxScore = Math.max(...scores);
          return (
            <div
              key={dimKey}
              className="flex items-center gap-3 px-2 py-2 rounded-lg bg-secondary/30"
            >
              {/* 维度信息（左列：图标 + 名称，固定宽度避免换行） */}
              <div className="flex items-center gap-2 shrink-0 w-[110px] min-w-0">
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${accent.bg} ${accent.text}`}
                  title={meta?.oneLiner}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span
                  className="text-xs font-semibold text-foreground truncate"
                  title={label}
                >
                  {label}
                </span>
              </div>
              {/* 分隔竖线 */}
              <div className="w-px h-6 bg-border shrink-0" />
              {/* 每家公司的分数（等宽两列，中间分隔） */}
              {companies.map((c, idx) => {
                const dim = c.dimensions.find((d) => d.key === dimKey);
                const score = dim ? dim.score : 0;
                const isWin = score > 0 && score === maxScore;
                const color = dim
                  ? LEVEL_COLORS[dim.level].hex
                  : "var(--emote-charcoal-300)";
                return (
                  <div key={c.company_id} className="flex-1 min-w-0 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[10px] text-muted-foreground truncate mb-0.5 ${
                          isWin ? "text-foreground" : ""
                        }`}
                        title={c.short_name || c.name}
                      >
                        {c.short_name || c.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: color,
                              width: `${(score / 100) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-extrabold leading-none ${
                            isWin ? "text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {(score / 10).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    {/* 胜者小皇冠指示 */}
                    {isWin && scores[0] !== scores[1] && (
                      <span className="shrink-0 w-4 h-4 rounded-full bg-emote-cream-100 text-emote-cream-700 inline-flex items-center justify-center" title="本项领先">
                        <TrendingUp className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* 真实时薪对比 */}
      {(() => {
        const hourlyWages: Record<number, number> = {};
        companies.forEach((c) => {
          const hw =
            analysisMap[c.company_id]?.real_hourly_wage?.hourly_wage;
          if (typeof hw === "number" && !Number.isNaN(hw) && hw > 0)
            hourlyWages[c.company_id] = hw;
        });
        const hasAny = Object.keys(hourlyWages).length > 0;
        if (!hasAny) return null;
        const maxWage = Math.max(...Object.values(hourlyWages));
        return (
          <section className="rounded-xl border border-border bg-card p-3 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                真实时薪对比
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {companies.map((c) => {
                const analysis = analysisMap[c.company_id];
                const hw = analysis?.real_hourly_wage;
                const wage = hourlyWages[c.company_id] ?? 0;
                const p50 = hw?.industry_p50_hourly ?? 0;
                const monthly = hw?.monthly_take_home;
                const hours = hw?.monthly_work_hours;
                const percent = hw?.percentile;
                const heightPct = maxWage > 0 ? (wage / maxWage) * 100 : 0;
                const color =
                  p50 > 0 && wage >= p50
                    ? "var(--emote-mint-500)"
                    : "var(--emote-cream-500)";
                return (
                  <div
                    key={c.company_id}
                    className="rounded-lg bg-secondary/30 p-2.5 flex flex-col gap-1.5"
                  >
                    <div className="text-[11px] font-semibold text-foreground truncate">
                      {c.short_name || c.name}
                    </div>
                    {wage > 0 ? (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-extrabold text-foreground leading-none">
                            ¥{wage.toFixed(0)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            /小时
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mt-1">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${heightPct}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                          {typeof monthly === "number" && (
                            <div>
                              月到手{" "}
                              <span className="text-foreground font-semibold">
                                ¥{(monthly / 1000).toFixed(1)}k
                              </span>
                            </div>
                          )}
                          {typeof hours === "number" && (
                            <div>
                              月工时{" "}
                              <span className="text-foreground font-semibold">
                                {hours.toFixed(0)}h
                              </span>
                            </div>
                          )}
                          {p50 > 0 && (
                            <div>
                              行业P50{" "}
                              <span className="text-foreground font-semibold">
                                ¥{p50.toFixed(0)}
                              </span>
                            </div>
                          )}
                          {typeof percent === "number" && (
                            <div>
                              行业分位{" "}
                              <span className="text-foreground font-semibold">
                                P{percent}
                              </span>
                            </div>
                          )}
                        </div>
                        {hw?.verdict && (
                          <p className="mt-1 text-[10px] leading-snug text-muted-foreground line-clamp-3">
                            {hw.verdict}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="py-3 text-center text-[11px] text-muted-foreground">
                        暂无时薪数据
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">
              * 真实时薪 = 月到手收入 ÷ 月工时（含加班），仅供参考
            </p>
          </section>
        );
      })()}

      {/* 综合维度进度条对比 */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            综合维度对比
          </h3>
        </div>
        <div className="space-y-3">
          {DIMENSION_ORDER.map((dimKey) => {
            const label = DIMENSION_LABELS[dimKey];
            const scores = companies.map((c) => {
              const dim = c.dimensions.find((d) => d.key === dimKey);
              return dim ? dim.score : 0;
            });
            const maxScore = Math.max(...scores, 1);
            return (
              <div key={dimKey}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{label}</span>
                </div>
                <div className="space-y-1.5">
                  {companies.map((c) => {
                    const dim = c.dimensions.find((d) => d.key === dimKey);
                    const score = dim ? dim.score : 0;
                    const widthPct = (score / maxScore) * 100;
                    const color = dim
                      ? LEVEL_COLORS[dim.level].hex
                      : "var(--emote-charcoal-300)";
                    return (
                      <div
                        key={c.company_id}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-muted-foreground w-12 truncate">
                          {c.short_name}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: color,
                              width: `${widthPct}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">
                          {(score / 10).toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
