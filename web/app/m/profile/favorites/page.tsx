"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  FavoriteItem as ApiFavoriteItem,
  FavoriteItem,
} from "@/lib/types";
import {
  getFavorites as apiGetFavorites,
  removeFavorite as apiRemoveFavorite,
} from "@/lib/api";

const isBrowser = () => typeof window !== "undefined";
const hasToken = () =>
  isBrowser() && !!localStorage.getItem("zjob_token");

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

// 将后端返回的收藏项或本地收藏项统一成列表卡片渲染结构
type DisplayFav = {
  id: number;
  name: string;
  industry?: string | null;
};

function toDisplayList(
  source: "api" | "local",
  list: ApiFavoriteItem[] | LocalFav[]
): DisplayFav[] {
  if (source === "api") {
    return (list as ApiFavoriteItem[]).map((it) => ({
      id: it.company_id,
      name: it.company_name ?? `公司 #${it.company_id}`,
      industry: it.company_industry,
    }));
  }
  return (list as LocalFav[]).map((it) => ({
    id: it.id,
    name: it.name,
    industry: it.industry,
  }));
}

export default function MobileFavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<DisplayFav[]>([]);
  const [source, setSource] = useState<"api" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (hasToken()) {
      try {
        const data = await apiGetFavorites();
        setSource("api");
        setItems(toDisplayList("api", data));
        // 同步到本地，保持一致性
        writeLocalFavs(
          data.map((it) => ({
            id: it.company_id,
            name: it.company_name ?? `公司 #${it.company_id}`,
            industry: it.company_industry ?? undefined,
            short_name: it.company_short_name ?? undefined,
          }))
        );
        return;
      } catch (err) {
        console.warn("getFavorites API failed, fallback to localStorage:", err);
      }
    }
    setSource("local");
    setItems(toDisplayList("local", readLocalFavs()));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const removeFavorite = useCallback(
    async (id: number) => {
      setPendingId(id);
      let success = true;
      if (source === "api" && hasToken()) {
        try {
          await apiRemoveFavorite(id);
        } catch (err) {
          console.warn("removeFavorite API failed, fallback to local:", err);
          success = false;
        }
      }
      // 无论成功与否，更新本地存储 + 列表状态
      const local = readLocalFavs().filter((it) => it.id !== id);
      writeLocalFavs(local);
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (!success) {
        // 后端失败但本地已删：也走 load 拉一次确认
        await load().catch(() => {});
      }
      setPendingId(null);
    },
    [source, load]
  );

  const clearAll = useCallback(async () => {
    if (!confirm("确定要清空所有收藏吗？")) return;
    setPendingId(-1);
    let ok = true;
    if (source === "api" && hasToken()) {
      const snapshot = [...items];
      for (const it of snapshot) {
        try {
          await apiRemoveFavorite(it.id);
        } catch {
          ok = false;
        }
      }
    }
    writeLocalFavs([]);
    setItems([]);
    if (!ok) await load().catch(() => {});
    setPendingId(null);
  }, [items, source, load]);

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
          <h1 className="text-lg font-semibold text-foreground">我的收藏</h1>
          <div className="w-9" />
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
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">还没有收藏的公司</p>
            <Link
              href="/m"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 h-10 text-sm font-semibold"
            >
              <Search className="w-4 h-4" />
              去发现
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 pb-1">
              <p className="text-xs text-muted-foreground">
                共 {items.length} 家
                {source === "api" ? "" : "（本地）"}
              </p>
              <button
                onClick={clearAll}
                disabled={pendingId === -1}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
            {items.map((it) => (
              <article
                key={it.id}
                className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <Link
                  href={`/m/company/${it.id}`}
                  className="min-w-0 flex-1 flex items-center gap-2"
                >
                  <h2 className="text-sm font-semibold text-foreground truncate shrink-0">
                    {it.name}
                  </h2>
                  {it.industry && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-emote-sky-100 text-emote-sky-700 font-medium truncate">
                      {it.industry}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => removeFavorite(it.id)}
                  disabled={pendingId === it.id}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-60 shrink-0 active:scale-90"
                  aria-label="取消收藏"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
