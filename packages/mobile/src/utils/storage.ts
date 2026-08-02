/**
 * 真职 Zjob 跨端存储工具
 * 封装 uni.getStorageSync / uni.setStorageSync
 */

export const Storage = {
  get(key: string): any {
    try {
      return uni.getStorageSync(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: any): void {
    try {
      uni.setStorageSync(key, value);
    } catch (e) {
      console.warn("Storage set failed:", e);
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(key);
    } catch (e) {
      console.warn("Storage remove failed:", e);
    }
  },

  getJSON<T>(key: string, fallback: T): T {
    try {
      const raw = uni.getStorageSync(key);
      if (!raw) return fallback;
      if (typeof raw === "string") {
        return JSON.parse(raw) as T;
      }
      return raw as T;
    } catch {
      return fallback;
    }
  },

  setJSON(key: string, value: any): void {
    try {
      uni.setStorageSync(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage setJSON failed:", e);
    }
  },
};

/* Token 管理 */
export function getToken(): string {
  return Storage.get("zjob_token") || "";
}

export function setToken(token: string): void {
  Storage.set("zjob_token", token);
}

export function removeToken(): void {
  Storage.remove("zjob_token");
  Storage.remove("zjob_role");
  Storage.remove("zjob_nickname");
  Storage.remove("zjob_avatar");
  Storage.remove("zjob_bio");
}

export function hasToken(): boolean {
  return !!getToken();
}

/* 收藏管理（本地降级） */
const FAV_KEY = "zjob_favorites";

interface LocalFav {
  id: number;
  name: string;
  industry?: string;
  short_name?: string;
}

export function readLocalFavs(): LocalFav[] {
  return Storage.getJSON<LocalFav[]>(FAV_KEY, []);
}

export function writeLocalFavs(list: LocalFav[]): void {
  Storage.setJSON(FAV_KEY, list);
}

export function isLocalFav(id: number): boolean {
  return readLocalFavs().some((it) => it.id === id);
}

export function toggleLocalFav(company: {
  id: number;
  name: string;
  industry?: string | null;
  short_name: string;
}): boolean {
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

/* 对比列表 */
const COMPARE_KEY = "zjob_compare_ids";

export function getCompareIds(): number[] {
  return Storage.getJSON<number[]>(COMPARE_KEY, []);
}

export function setCompareIds(ids: number[]): void {
  Storage.setJSON(COMPARE_KEY, ids);
}
