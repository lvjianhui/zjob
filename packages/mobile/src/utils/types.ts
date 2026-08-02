/**
 * 真职 Zjob 类型定义
 * 从 web/lib/types.ts 移植，适配跨端
 */

export type DimensionKey =
  | "basic"
  | "compensation"
  | "welfare"
  | "worklife"
  | "growth"
  | "reputation";

export type TrafficLightLevel = "green" | "yellow" | "red";

export type CompanyStatus = "active" | "pending" | "archived";

export type ReviewSource =
  | "maimai"
  | "kanzhun"
  | "zhihu"
  | "xiaohongshu"
  | "linkedin"
  | "other";

export type ReviewSentiment = "positive" | "neutral" | "negative";

export type ReviewAuditStatus = "pending" | "approved" | "rejected";

export interface CompanyBase {
  name: string;
  short_name: string;
  en_name?: string | null;
  industry?: string | null;
  scale?: string | null;
  location?: string | null;
  logo_url?: string | null;
  is_listed: boolean;
  stock_code?: string | null;
  fortune500_trend?: Record<string, number | null> | null;
  industry_ranking?: string | null;
  tags?: string[] | null;
  status: CompanyStatus;
  source_urls?: Record<string, string> | null;
}

export interface Company extends CompanyBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyListItem {
  id: number;
  name: string;
  short_name: string;
  industry?: string | null;
  scale?: string | null;
  location?: string | null;
  logo_url?: string | null;
  tags?: string[] | null;
  status: CompanyStatus;
}

export interface DimensionData {
  id?: number;
  company_id?: number;
  dimension_key: DimensionKey;
  score: number;
  level: TrafficLightLevel;
  summary?: string | null;
  metrics?: Record<string, any> | null;
  source_note?: string | null;
  updated_at?: string;
}

export interface DimensionSummaryItem {
  key: DimensionKey;
  label: string;
  level: TrafficLightLevel;
  score: number;
}

export interface CompanyDimensionsResponse {
  company_id: number;
  name: string;
  dimensions: DimensionData[];
}

export interface CompanySummaryResponse {
  company_id: number;
  name: string;
  overall_score: number;
  dimensions: DimensionSummaryItem[];
}

export interface RealHourlyWage {
  monthly_take_home: number;
  monthly_work_hours: number;
  hourly_wage: number;
  industry_p50_hourly: number;
  percentile: number;
  verdict: string;
}

export interface SurfaceVsKitchen {
  surface: string;
  kitchen: string;
  insight: string;
}

export interface GrowthForecast3Y {
  track_potential: string;
  promotion_path: string;
  forecast: string;
}

export interface CompanyAnalysisResponse {
  company_id: number;
  real_hourly_wage: RealHourlyWage;
  surface_vs_kitchen: SurfaceVsKitchen;
  growth_forecast_3y: GrowthForecast3Y;
}

export interface Review {
  id?: number;
  company_id: number;
  source: ReviewSource;
  sentiment: ReviewSentiment;
  content_summary?: string | null;
  original_url?: string | null;
  published_at?: string | null;
  audit_status: ReviewAuditStatus;
  created_at?: string;
}

export interface CompareCompanyItem {
  company_id: number;
  name: string;
  short_name: string;
  industry: string;
  overall_score: number;
  dimensions: DimensionSummaryItem[];
}

export interface CompareResponse {
  companies: CompareCompanyItem[];
  dimension_keys: DimensionKey[];
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  username?: string | null;
  action: string;
  target_type: string;
  target_id: number;
  detail?: Record<string, any> | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  bio: string;
  role: string;
}

export interface UserUpdateRequest {
  nickname?: string;
  bio?: string;
}

export interface FavoriteItem {
  id: number;
  user_id: number;
  company_id: number;
  created_at: string;
  company_name?: string | null;
  company_short_name?: string | null;
  company_industry?: string | null;
}

export interface FavoriteToggleResult {
  favorited: boolean;
  company_id: number;
}
