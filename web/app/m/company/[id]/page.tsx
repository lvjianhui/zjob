"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Award,
  Building2,
  Calculator,
  CheckCircle2,
  Gauge,
  Heart,
  Layers,
  Share2,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Banknote,
  Clock,
  Landmark,
  type LucideIcon,
  MessageSquare,
  ShieldCheck,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import {
  getCompany,
  getCompanyAnalysis,
  getCompanyDimensions,
  getCompanySummary,
  getCompanyReviews,
  toggleFavorite as apiToggleFavorite,
  checkFavorite,
} from "@/lib/api";
import {
  Company,
  CompanyAnalysisResponse,
  CompanyDimensionsResponse,
  CompanySummaryResponse,
  DIMENSIONS_META,
  DIMENSION_ACCENT,
  DimensionData,
  LEVEL_COLORS,
  METRIC_LABELS,
  Review,
  REVIEW_SOURCE_LABELS,
  SENTIMENT_LABELS,
  formatMetricValue,
} from "@/lib/types";

const DIMENSION_ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  clock: Clock,
  "trending-up": TrendingUpIcon,
  "message-square": MessageSquare,
};

// --- 收藏：localStorage 作为未登录/后端离线时的降级 ---
const FAV_KEY = "zjob_favorites";

type LocalFav = {
  id: number;
  name: string;
  industry?: string;
  short_name?: string;
};

const isBrowser = () => typeof window !== "undefined";
const hasToken = () => isBrowser() && !!localStorage.getItem("zjob_token");

function readLocalFavs(): LocalFav[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as LocalFav[]) : [];
  } catch {
    return [];
  }
}

function writeLocalFavs(list: LocalFav[]) {
  if (!isBrowser()) return;
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

function isLocalFav(id: number): boolean {
  return readLocalFavs().some((it) => it.id === id);
}

function toggleLocalFav(company: Company): boolean {
  const list = readLocalFavs();
  const exists = list.some((it) => it.id === company.id);
  if (exists) {
    writeLocalFavs(list.filter((it) => it.id !== company.id));
    return false;
  }
  writeLocalFavs([
    {
      id: company.id,
      name: company.name,
      industry: company.industry ?? undefined,
      short_name: company.short_name,
    },
    ...list,
  ]);
  return true;
}

export default function MobileCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [summary, setSummary] = useState<CompanySummaryResponse | null>(null);
  const [dimensions, setDimensions] = useState<CompanyDimensionsResponse | null>(null);
  const [analysis, setAnalysis] = useState<CompanyAnalysisResponse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [favorited, setFavorited] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getCompany(id),
      getCompanySummary(id),
      getCompanyDimensions(id),
      getCompanyAnalysis(id),
      getCompanyReviews(id, 3, 0),
    ])
      .then(([c, s, d, a, r]) => {
        setCompany(c);
        setSummary(s);
        setDimensions(d);
        setAnalysis(a);
        setReviews(r);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 初始化收藏状态：登录态查后端，否则用 localStorage
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function loadFav() {
      if (!isBrowser()) return;
      if (hasToken()) {
        try {
          const res = await checkFavorite(id);
          if (!cancelled) setFavorited(!!res.favorited);
        } catch {
          if (!cancelled) setFavorited(isLocalFav(id));
        }
      } else {
        setFavorited(isLocalFav(id));
      }
    }
    loadFav();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const doToggleFav = useCallback(async () => {
    if (favBusy || !company) return;
    setFavBusy(true);
    const optimistic = !favorited;
    setFavorited(optimistic);

    let success = true;
    let nextFavorited = optimistic;

    if (hasToken()) {
      try {
        const res = await apiToggleFavorite(company.id);
        nextFavorited = !!res.favorited;
      } catch (err) {
        success = false;
        nextFavorited = toggleLocalFav(company);
        console.warn("toggleFavorite API failed, fallback to localStorage:", err);
      }
    } else {
      nextFavorited = toggleLocalFav(company);
    }

    if (!success || nextFavorited !== optimistic) {
      setFavorited(nextFavorited);
    }
    setFavBusy(false);
  }, [favBusy, favorited, company]);

  // 生成分享二维码
  const handleShare = async () => {
    if (shareOpen) {
      setShareOpen(false);
      return;
    }
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/m/company/${id}`;
    try {
      const dataUrl = await QRCode.toDataURL(shareUrl, {
        width: 240,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#475569", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
      setShareOpen(true);
    } catch {
      // 兜底：复制链接
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("链接已复制：" + shareUrl);
      } catch {
        alert(shareUrl);
      }
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <div className="h-14 rounded-lg bg-secondary animate-pulse" />
        <div className="h-40 rounded-xl bg-secondary animate-pulse" />
        <div className="h-32 rounded-xl bg-secondary animate-pulse" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="px-4 py-20 text-center text-muted-foreground">
        公司不存在
      </div>
    );
  }

  const dimensionMap: Record<string, DimensionData> = {};
  if (dimensions) {
    for (const d of dimensions.dimensions) {
      dimensionMap[d.dimension_key] = d;
    }
  }

  return (
    <div>
      {/* 顶栏 */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-secondary transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={doToggleFav}
              disabled={favBusy}
              aria-label={favorited ? "取消收藏" : "收藏"}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors disabled:opacity-60 ${
                favorited
                  ? "text-emote-rose-500 hover:bg-emote-rose-50"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-foreground hover:bg-secondary transition-colors"
              aria-label="分享"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 pt-6 space-y-6">
        {/* 公司头卡 */}
        <section>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-emote-charcoal-900 text-white flex items-center justify-center text-xl font-bold">
                  {company.short_name.charAt(0) || company.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground leading-tight">
                    {company.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {company.industry || "未知行业"}
                  </p>
                </div>
              </div>
              {summary && (
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-2xl font-bold text-emote-mint-500">
                    {summary.overall_score}
                  </span>
                  <span className="text-xs text-muted-foreground">综合评分</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {company.scale && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emote-charcoal-50 text-xs text-muted-foreground border border-border">
                  <Building2 className="w-3.5 h-3.5" />
                  {company.scale}
                </span>
              )}
              {company.is_listed && company.stock_code && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emote-charcoal-50 text-xs text-muted-foreground border border-border">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {company.stock_code}
                </span>
              )}
              {company.is_listed && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emote-mint-50 text-xs text-emote-mint-700 border border-emote-mint-200">
                  <Award className="w-3.5 h-3.5" />
                  上市企业
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 六维红绿灯总览 */}
        {summary && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">
                  六维红绿灯总览
                </h2>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emote-mint-500" />
                  ≥80
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emote-cream-500" />
                  60+
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emote-rose-500" />
                  &lt;60
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {summary.dimensions.map((dim) => {
                const color = LEVEL_COLORS[dim.level];
                const meta = DIMENSIONS_META.find((m) => m.key === dim.key);
                const Icon = meta
                  ? DIMENSION_ICON_MAP[meta.icon] ?? Landmark
                  : Landmark;
                const dimDetail = dimensionMap[dim.key];
                return (
                  <div
                    key={dim.key}
                    className="bg-card border border-border rounded-lg p-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md"
                        style={{ backgroundColor: `${color.hex}22` }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: color.hex }}
                        />
                      </span>
                      <span
                        className="text-lg font-bold"
                        style={{ color: color.hex }}
                      >
                        {dim.score}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">
                      {dim.label}
                    </p>
                    {dimDetail?.summary && (
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {dimDetail.summary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 真实时薪卡 */}
        {analysis && (
          <section>
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-emote-sky-100 flex items-center justify-center text-emote-sky-600">
                  <Calculator className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  真实时薪交叉验证
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-emote-charcoal-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">月到手</p>
                  <p className="text-lg font-bold text-foreground">
                    ¥{analysis.real_hourly_wage.monthly_take_home.toLocaleString()}
                  </p>
                </div>
                <div className="bg-emote-charcoal-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">月工时</p>
                  <p className="text-lg font-bold text-foreground">
                    {analysis.real_hourly_wage.monthly_work_hours}h
                  </p>
                </div>
                <div className="bg-emote-mint-50 rounded-lg p-3 text-center border border-emote-mint-200">
                  <p className="text-xs text-emote-mint-700 mb-1">真实时薪</p>
                  <p className="text-lg font-bold text-emote-mint-600">
                    ¥{analysis.real_hourly_wage.hourly_wage.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">行业 P50</span>
                <span className="font-semibold text-foreground">
                  ¥{analysis.real_hourly_wage.industry_p50_hourly.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">百分位</span>
                <span className="font-semibold text-emote-mint-600">
                  {analysis.real_hourly_wage.percentile}%
                </span>
              </div>
              <div className="bg-emote-charcoal-50 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emote-mint-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">
                  {analysis.real_hourly_wage.verdict}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 六维详情卡 */}
        {dimensions && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">
                六维度详情
              </h2>
            </div>
            <div className="space-y-4">
              {DIMENSIONS_META.map((meta) => {
                const dim = dimensionMap[meta.key];
                if (!dim) return null;
                const Icon = DIMENSION_ICON_MAP[meta.icon] ?? Landmark;
                const accent = DIMENSION_ACCENT[meta.accent];
                const color = LEVEL_COLORS[dim.level];
                const metrics = dim.metrics
                  ? Object.entries(dim.metrics).filter(
                      ([, v]) => v != null && v !== ""
                    )
                  : [];
                return (
                  <article
                    key={meta.key}
                    className="bg-card border border-border rounded-xl p-5 shadow-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-md ${accent.bg} flex items-center justify-center ${accent.text}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">
                          {meta.label}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${color.dot}`}
                        />
                        <span
                          className={`text-lg font-bold ${color.text}`}
                        >
                          {dim.score}
                        </span>
                      </div>
                    </div>
                    {dim.summary && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {dim.summary}
                      </p>
                    )}
                    {/* 决策意义（突出显示） */}
                    <div
                      className="rounded-lg p-3 mb-3 border-l-2"
                      style={{
                        backgroundColor: `${color.hex}14`,
                        borderColor: color.hex,
                      }}
                    >
                      <p className="text-xs font-semibold mb-0.5" style={{ color: color.hex }}>
                        决策意义
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {meta.decisionMeaning}
                      </p>
                    </div>
                    {metrics.length > 0 && (
                      <ul className="space-y-2.5">
                        {metrics.map(([key, value]) => (
                          <li key={key} className="flex items-start gap-2">
                            <span className="inline-flex items-center shrink-0 h-5 px-2 rounded text-xs font-medium bg-secondary text-muted-foreground mt-0.5">
                              {METRIC_LABELS[key] ?? key}
                            </span>
                            <span className="text-sm font-medium text-foreground leading-relaxed flex-1 min-w-0">
                              {formatMetricValue(value)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* 精选口碑 */}
        {reviews.length > 0 && (
          <section className="pb-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">
                精选口碑
              </h2>
            </div>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div
                  key={r.id ?? i}
                  className="bg-card border border-border rounded-xl p-4 shadow-card"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {REVIEW_SOURCE_LABELS[r.source]}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.sentiment === "positive"
                          ? "bg-emote-mint-50 text-emote-mint-700"
                          : r.sentiment === "negative"
                          ? "bg-emote-rose-50 text-emote-rose-700"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {SENTIMENT_LABELS[r.sentiment]}
                    </span>
                  </div>
                  {r.content_summary && (
                    <p className="text-sm text-foreground leading-relaxed">
                      {r.content_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 分享二维码弹层 */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="bg-card rounded-2xl p-6 max-w-[280px] w-full shadow-float relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShareOpen(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-semibold text-foreground text-center mb-1">
              扫码查看公司详情
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-4">
              {company?.name}
            </p>
            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="二维码"
                  className="w-48 h-48 rounded-lg"
                />
              </div>
            )}
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              扫描二维码即可查看「{company?.name}」的六维评分详情
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
