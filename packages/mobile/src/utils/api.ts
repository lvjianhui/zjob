/**
 * 真职 Zjob 跨端 API 层
 * 使用 uni.request 替代 fetch
 * 从 web/lib/api.ts 移植
 */

import type {
  AuditLog,
  Company,
  CompanyAnalysisResponse,
  CompanyDimensionsResponse,
  CompanyListItem,
  CompanySummaryResponse,
  CompareResponse,
  FavoriteItem,
  FavoriteToggleResult,
  LoginRequest,
  RegisterRequest,
  Review,
  TokenResponse,
  UserProfile,
  UserUpdateRequest,
} from "./types";
import { getToken, readLocalFavs } from "./storage";

/**
 * API 基础地址
 * 开发环境使用 localhost，生产环境使用线上 API
 */
// #ifdef H5
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";
// #endif

// #ifndef H5
// App 端（iOS/Android/鸿蒙）：开发环境连本机后端，生产环境连线上
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://api.zjob.asia";
// #endif

/** 统一响应信封 */
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/** 获取鉴权头 */
function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** uni.request 封装 */
function request<T>(
  url: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    data?: any;
  } = {}
): Promise<T> {
  const { method = "GET", data } = options;
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      success: (res: any) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const body = res.data as ApiResponse<T>;
        if (body && typeof body === "object" && "code" in body && "msg" in body) {
          if (body.code !== 0) {
            reject(new Error(body.msg || `API error (code: ${body.code})`));
            return;
          }
          resolve(body.data);
          return;
        }
        resolve(body as T);
      },
      fail: (err: any) => {
        reject(new Error(err?.errMsg || "网络请求失败"));
      },
    });
  });
}

/** 安全请求：失败时返回 fallback */
async function safeRequest<T>(
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    console.warn("API unavailable, using local fallback:", err);
    return fallback;
  }
}

// ============ 公开接口 ============

export async function searchCompanies(
  q: string,
  limit = 20,
  offset = 0
): Promise<CompanyListItem[]> {
  return request<CompanyListItem[]>(
    `/api/companies/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
  );
}

export async function getCompany(id: number): Promise<Company | null> {
  return request<Company>(`/api/companies/${id}`);
}

export async function getCompanyDimensions(
  id: number
): Promise<CompanyDimensionsResponse | null> {
  return request<CompanyDimensionsResponse>(`/api/companies/${id}/dimensions`);
}

export async function getCompanySummary(
  id: number
): Promise<CompanySummaryResponse | null> {
  return request<CompanySummaryResponse>(`/api/companies/${id}/summary`);
}

export async function getCompanyAnalysis(
  id: number
): Promise<CompanyAnalysisResponse | null> {
  return request<CompanyAnalysisResponse>(`/api/companies/${id}/analysis`);
}

export async function getCompanyReviews(
  id: number,
  limit = 20,
  offset = 0
): Promise<Review[]> {
  return request<Review[]>(
    `/api/companies/${id}/reviews?limit=${limit}&offset=${offset}`
  );
}

export async function compareCompanies(
  companyIds: number[]
): Promise<CompareResponse | null> {
  return request<CompareResponse>("/api/companies/compare", {
    method: "POST",
    data: { company_ids: companyIds },
  });
}

// ============ 认证 ============

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  return request<TokenResponse>("/api/auth/login", {
    method: "POST",
    data: payload,
  });
}

export async function register(
  payload: RegisterRequest
): Promise<TokenResponse> {
  return request<TokenResponse>("/api/auth/register", {
    method: "POST",
    data: payload,
  });
}

export async function getMe(): Promise<UserProfile> {
  return request<UserProfile>("/api/auth/me");
}

export async function updateProfile(
  payload: UserUpdateRequest
): Promise<UserProfile> {
  return request<UserProfile>("/api/auth/me", {
    method: "PUT",
    data: payload,
  });
}

// ============ 收藏 ============

export async function getFavorites(): Promise<FavoriteItem[]> {
  return safeRequest(
    () => request<FavoriteItem[]>("/api/favorites"),
    readLocalFavs().map((f) => ({
      id: f.id,
      user_id: 0,
      company_id: f.id,
      created_at: "",
      company_name: f.name,
      company_short_name: f.short_name,
      company_industry: f.industry,
    }))
  );
}

export async function checkFavorite(
  companyId: number
): Promise<FavoriteToggleResult> {
  return safeRequest(
    () => request<FavoriteToggleResult>(`/api/favorites/check/${companyId}`),
    { favorited: readLocalFavs().some((f) => f.id === companyId), company_id: companyId }
  );
}

export async function toggleFavorite(
  companyId: number
): Promise<FavoriteToggleResult> {
  return request<FavoriteToggleResult>("/api/favorites/toggle", {
    method: "POST",
    data: { company_id: companyId },
  });
}
