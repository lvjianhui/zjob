import {
  AuditLog,
  Company,
  CompanyDimensionsResponse,
  DimensionData,
  LoginRequest,
  Review,
  TokenResponse,
} from "./types";
import {
  buildMockAnalysis,
  buildMockCompare,
  buildMockSummary,
  MOCK_COMPANIES,
  MOCK_DIMENSIONS,
  MOCK_REVIEWS,
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
// 认证
// ---------------------------------------------------------------------------

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  return fetchJson<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// 公司查询（公开接口，编辑页加载用）
// ---------------------------------------------------------------------------

export async function getCompany(id: number): Promise<Company | null> {
  return safeFetch(
    () => fetchJson<Company>(`/api/companies/${id}`),
    MOCK_COMPANIES.find((c) => c.id === id) || null
  );
}

// ---------------------------------------------------------------------------
// 后台管理
// ---------------------------------------------------------------------------

export async function listAdminCompanies(
  limit = 50,
  offset = 0
): Promise<Company[]> {
  return safeFetch(
    () =>
      fetchJson<Company[]>(
        `/api/admin/companies?limit=${limit}&offset=${offset}`
      ),
    MOCK_COMPANIES
  );
}

export async function createCompany(
  payload: Omit<Company, "id" | "created_at" | "updated_at">
): Promise<Company> {
  return fetchJson<Company>("/api/admin/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCompany(
  id: number,
  payload: Partial<Company>
): Promise<Company> {
  return fetchJson<Company>(`/api/admin/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCompany(id: number): Promise<void> {
  await fetchVoid(`/api/admin/companies/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminCompanyDimensions(
  id: number
): Promise<CompanyDimensionsResponse | null> {
  return safeFetch(
    () =>
      fetchJson<CompanyDimensionsResponse>(`/api/admin/companies/${id}/dimensions`),
    MOCK_DIMENSIONS[id] || null
  );
}

export async function updateCompanyDimensions(
  id: number,
  payload: { dimension_key: string; score: number; level: string; summary?: string; metrics?: Record<string, unknown>; source_note?: string }[]
): Promise<CompanyDimensionsResponse> {
  return fetchJson<CompanyDimensionsResponse>(`/api/admin/companies/${id}/dimensions`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function listAdminReviews(params?: {
  company_id?: number;
  audit_status?: string;
  limit?: number;
  offset?: number;
}): Promise<Review[]> {
  const query = new URLSearchParams();
  if (params?.company_id) query.set("company_id", String(params.company_id));
  if (params?.audit_status) query.set("audit_status", params.audit_status);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));

  return safeFetch(
    () => fetchJson<Review[]>(`/api/admin/reviews?${query.toString()}`),
    Object.values(MOCK_REVIEWS).flat()
  );
}

export async function updateReview(
  id: number,
  payload: Partial<Review>
): Promise<Review> {
  return fetchJson<Review>(`/api/admin/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteReview(id: number): Promise<void> {
  await fetchVoid(`/api/admin/reviews/${id}`, {
    method: "DELETE",
  });
}

export async function listAuditLogs(
  limit = 50,
  offset = 0
): Promise<AuditLog[]> {
  return safeFetch(
    () =>
      fetchJson<AuditLog[]>(
        `/api/admin/audit-logs?limit=${limit}&offset=${offset}`
      ),
    []
  );
}
