import {
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
import {
  buildMockAnalysis,
  buildMockCompare,
  buildMockSummary,
  MOCK_COMPANIES,
  MOCK_DIMENSIONS,
  MOCK_REVIEWS,
  searchMockCompanies,
} from "./mockData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("zjob_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 后端统一响应信封 */
interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

async function fetchRaw(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res;
}

async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetchRaw(url, options);
  const body: ApiResponse<T> = await res.json();

  // 解包统一响应格式 {code, msg, data}
  if (body && typeof body === "object" && "code" in body && "msg" in body) {
    if (body.code !== 0) {
      throw new Error(body.msg || `API error (code: ${body.code})`);
    }
    return body.data;
  }

  // 兼容旧格式（直接返回数据）
  return body as unknown as T;
}

async function fetchVoid(
  url: string,
  options: RequestInit = {}
): Promise<void> {
  const res = await fetchRaw(url, options);
  // 后端统一返回 {code, msg, data}，检查业务错误码
  const body = await res.json().catch(() => ({ code: 0, msg: "ok", data: null }));
  if (body && typeof body === "object" && "code" in body && body.code !== 0) {
    throw new Error(body.msg || `API error (code: ${body.code})`);
  }
}

async function safeFetch<T>(
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("API unavailable, using mock data:", err);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// 公开接口
// ---------------------------------------------------------------------------

export async function searchCompanies(
  q: string,
  limit = 20,
  offset = 0
): Promise<CompanyListItem[]> {
  return safeFetch(
    () =>
      fetchJson<CompanyListItem[]>(
        `/api/companies/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
      ),
    searchMockCompanies(q)
  );
}

export async function getCompany(id: number): Promise<Company | null> {
  return safeFetch(
    () => fetchJson<Company>(`/api/companies/${id}`),
    MOCK_COMPANIES.find((c) => c.id === id) || null
  );
}

export async function getCompanyDimensions(
  id: number
): Promise<CompanyDimensionsResponse | null> {
  return safeFetch(
    () => fetchJson<CompanyDimensionsResponse>(`/api/companies/${id}/dimensions`),
    MOCK_DIMENSIONS[id] || null
  );
}

export async function getCompanySummary(
  id: number
): Promise<CompanySummaryResponse | null> {
  return safeFetch(
    () => fetchJson<CompanySummaryResponse>(`/api/companies/${id}/summary`),
    buildMockSummary(id)
  );
}

export async function getCompanyAnalysis(
  id: number
): Promise<CompanyAnalysisResponse | null> {
  return safeFetch(
    () => fetchJson<CompanyAnalysisResponse>(`/api/companies/${id}/analysis`),
    buildMockAnalysis(id)
  );
}

export async function getCompanyReviews(
  id: number,
  limit = 20,
  offset = 0
): Promise<Review[]> {
  return safeFetch(
    () =>
      fetchJson<Review[]>(
        `/api/companies/${id}/reviews?limit=${limit}&offset=${offset}`
      ),
    (MOCK_REVIEWS[id] || []).filter((r) => r.audit_status === "approved")
  );
}

export async function compareCompanies(
  companyIds: number[]
): Promise<CompareResponse | null> {
  return safeFetch(
    () =>
      fetchJson<CompareResponse>("/api/companies/compare", {
        method: "POST",
        body: JSON.stringify({ company_ids: companyIds }),
      }),
    buildMockCompare(companyIds)
  );
}

// ---------------------------------------------------------------------------
// 认证
// ---------------------------------------------------------------------------

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  return fetchJson<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(
  payload: RegisterRequest
): Promise<TokenResponse> {
  return fetchJson<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<UserProfile> {
  return fetchJson<UserProfile>("/api/auth/me");
}

export async function updateProfile(
  payload: UserUpdateRequest
): Promise<UserProfile> {
  return fetchJson<UserProfile>("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// 收藏
// ---------------------------------------------------------------------------

export async function getFavorites(): Promise<FavoriteItem[]> {
  return fetchJson<FavoriteItem[]>("/api/favorites");
}

export async function checkFavorite(
  companyId: number
): Promise<FavoriteToggleResult> {
  return fetchJson<FavoriteToggleResult>(`/api/favorites/check/${companyId}`);
}

export async function addFavorite(
  companyId: number
): Promise<FavoriteItem> {
  return fetchJson<FavoriteItem>("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ company_id: companyId }),
  });
}

export async function removeFavorite(companyId: number): Promise<void> {
  await fetchVoid(`/api/favorites/${companyId}`, {
    method: "DELETE",
  });
}

export async function toggleFavorite(
  companyId: number
): Promise<FavoriteToggleResult> {
  return fetchJson<FavoriteToggleResult>("/api/favorites/toggle", {
    method: "POST",
    body: JSON.stringify({ company_id: companyId }),
  });
}
