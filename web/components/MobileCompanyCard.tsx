"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Building2,
  Clock,
  Heart,
  Landmark,
  type LucideIcon,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  CompanyListItem,
  CompanySummaryResponse,
  DIMENSIONS_META,
  LEVEL_COLORS,
} from "@/lib/types";
import { toggleFavorite as apiToggleFavorite, checkFavorite } from "@/lib/api";

const DIMENSION_ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  clock: Clock,
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
};

interface MobileCompanyCardProps {
  company: CompanyListItem;
  summary?: CompanySummaryResponse;
}

const isBrowser = () => typeof window !== "undefined";

function hasToken(): boolean {
  if (!isBrowser()) return false;
  return !!localStorage.getItem("zjob_token");
}

// --- localStorage 作为未登录/后端离线时的降级 ---
const FAV_KEY = "zjob_favorites";

type LocalFav = {
  id: number;
  name: string;
  industry?: string;
  short_name?: string;
};

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

function toggleLocalFav(company: CompanyListItem): boolean {
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

function isLocalFav(id: number): boolean {
  return readLocalFavs().some((it) => it.id === id);
}

export default function MobileCompanyCard({
  company,
  summary,
}: MobileCompanyCardProps) {
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);
  const score = summary?.overall_score;

  // 初始化收藏状态：登录态查后端，否则用 localStorage
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isBrowser()) return;
      if (hasToken()) {
        try {
          const res = await checkFavorite(company.id);
          if (!cancelled) setFavorited(!!res.favorited);
        } catch {
          // 后端不可用时回退
          setFavorited(isLocalFav(company.id));
        }
      } else {
        setFavorited(isLocalFav(company.id));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [company.id]);

  const doToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy) return;
      setBusy(true);
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
          // 后端失败则回退到本地存储
          nextFavorited = toggleLocalFav(company);
          console.warn("toggleFavorite API failed, fallback to localStorage:", err);
        }
      } else {
        nextFavorited = toggleLocalFav(company);
      }

      if (!success || nextFavorited !== optimistic) {
        setFavorited(nextFavorited);
      }
      setBusy(false);
    },
    [busy, favorited, company.id]
  );

  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 shadow-card hover:shadow-card-hover transition-shadow">
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
        onClick={doToggle}
        disabled={busy}
        aria-label={favorited ? "取消收藏" : "收藏"}
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-60 ${
          favorited
            ? "text-emote-rose-500 bg-emote-rose-50"
            : "text-muted-foreground hover:text-emote-rose-500 hover:bg-emote-rose-50/40"
        }`}
      >
        <Heart className={`w-6 h-6 ${favorited ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
