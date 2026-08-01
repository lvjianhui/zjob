// 真职（Zjob）跨端共享 TypeScript 类型
// Phase 1 主要供 Web 端与小程序端复用

export type DimensionKey =
  | "basic"
  | "compensation"
  | "welfare"
  | "worklife"
  | "growth"
  | "reputation";

export type TrafficLightLevel = "green" | "yellow" | "red";

export interface CompanyBase {
  id: number;
  name: string;
  short_name: string;
  en_name: string;
  industry: string;
  scale: string;
  location: string;
  logo_url?: string;
  is_listed: boolean;
  stock_code?: string;
  tags: string[];
  status: "active" | "pending" | "archived";
}

export interface DimensionSummary {
  key: DimensionKey;
  label: string;
  level: TrafficLightLevel;
  score: number;
}

export interface DimensionData {
  dimension_key: DimensionKey;
  score: number;
  level: TrafficLightLevel;
  summary: string;
  metrics: Record<string, any>;
  source_note: string;
  updated_at: string;
}

export interface CompanySummary {
  company_id: number;
  name: string;
  overall_score: number;
  dimensions: DimensionSummary[];
}

export interface RealHourlyWage {
  monthly_take_home: number;
  monthly_work_hours: number;
  hourly_wage: number;
  industry_p50_hourly: number;
  percentile: number;
  verdict: string;
}

export interface CompanyAnalysis {
  company_id: number;
  real_hourly_wage: RealHourlyWage;
  surface_vs_kitchen: {
    surface: string;
    kitchen: string;
    insight: string;
  };
  growth_forecast_3y: {
    track_potential: string;
    promotion_path: string;
    forecast: string;
  };
}

export type ReviewSource =
  | "maimai"
  | "kanzhun"
  | "zhihu"
  | "xiaohongshu"
  | "linkedin"
  | "other";

export type ReviewSentiment = "positive" | "neutral" | "negative";

export interface Review {
  id: number;
  company_id: number;
  source: ReviewSource;
  sentiment: ReviewSentiment;
  content_summary: string;
  original_url?: string;
  published_at?: string;
  audit_status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  target_type: string;
  target_id: number;
  detail: Record<string, any>;
  created_at: string;
}
