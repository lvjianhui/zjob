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
  metrics?: Record<string, unknown> | null;
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
  detail?: Record<string, unknown> | null;
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

// ---------------------------------------------------------------------------
// 收藏
// ---------------------------------------------------------------------------

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


export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  basic: "企业基本面",
  compensation: "薪酬竞争力",
  welfare: "福利保障",
  worklife: "工作节奏",
  growth: "成长与制度",
  reputation: "真实口碑",
};

export const DIMENSION_ORDER: DimensionKey[] = [
  "basic",
  "compensation",
  "welfare",
  "worklife",
  "growth",
  "reputation",
];

export const REVIEW_SOURCE_LABELS: Record<ReviewSource, string> = {
  maimai: "脉脉",
  kanzhun: "看准",
  zhihu: "知乎",
  xiaohongshu: "小红书",
  linkedin: "LinkedIn",
  other: "其他",
};

export const SENTIMENT_LABELS: Record<ReviewSentiment, string> = {
  positive: "正面",
  neutral: "中性",
  negative: "负面",
};

export const AUDIT_STATUS_LABELS: Record<ReviewAuditStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

export const LEVEL_COLORS: Record<
  TrafficLightLevel,
  { bg: string; text: string; dot: string; hex: string; ring?: string }
> = {
  green: {
    bg: "bg-emote-mint-50",
    text: "text-emote-mint-700",
    dot: "bg-emote-mint-500",
    hex: "#22c55e",
  },
  yellow: {
    bg: "bg-emote-cream-50",
    text: "text-emote-cream-700",
    dot: "bg-emote-cream-500",
    hex: "#f59e0b",
  },
  red: {
    bg: "bg-emote-rose-50",
    text: "text-emote-rose-700",
    dot: "bg-emote-rose-500",
    hex: "#ef4444",
  },
};

export type DimensionAccent =
  | "sky"
  | "mint"
  | "cream"
  | "lavender"
  | "charcoal"
  | "rose";

export interface DimensionMeta {
  key: DimensionKey;
  label: string;
  oneLiner: string;
  decisionMeaning: string;
  icon: string; // lucide icon name (kebab-case)
  accent: DimensionAccent;
}

export const DIMENSIONS_META: DimensionMeta[] = [
  {
    key: "basic",
    label: "企业基本面",
    oneLiner: "多大 / 多稳 / 多强",
    decisionMeaning:
      "判断公司处于上升期/平台期/衰退期，决定职业是顺风还是逆风。",
    icon: "landmark",
    accent: "charcoal",
  },
  {
    key: "compensation",
    label: "薪酬竞争力",
    oneLiner: "同岗同酬 / 涨薪空间",
    decisionMeaning:
      "不只看数字，看性价比——同岗行业百分位低的公司，说明它在压榨。",
    icon: "banknote",
    accent: "mint",
  },
  {
    key: "welfare",
    label: "福利保障",
    oneLiner: "五险一金 / 补贴 / 假期",
    decisionMeaning:
      "福利是隐性薪资，规范的公司这块能多出 10-20% 的实际收入感。",
    icon: "shield-check",
    accent: "cream",
  },
  {
    key: "worklife",
    label: "工作节奏",
    oneLiner: "加班强度 / 弹性 / 通勤",
    decisionMeaning: "月薪 3 万 + 996 ≈ 月薪 2 万 + 965，时薪才是真实薪资。",
    icon: "clock",
    accent: "cream",
  },
  {
    key: "growth",
    label: "成长与制度",
    oneLiner: "晋升 / 培训 / 管理规范",
    decisionMeaning:
      "前几份工作成长性 > 薪资，3 年后你是行业抢手货还是被锁死在旧岗位。",
    icon: "trending-up",
    accent: "lavender",
  },
  {
    key: "reputation",
    label: "真实口碑",
    oneLiner: "一线员工 / 离职反馈",
    decisionMeaning:
      "HR 展示的是橱窗，在职/离职员工展示的是厨房，这里最接近真相。",
    icon: "message-square",
    accent: "rose",
  },
];

// 维度图标徽章配色（与 design 的 company-detail 维度卡片一致）
export const DIMENSION_ACCENT: Record<
  string,
  { bg: string; text: string }
> = {
  charcoal: { bg: "bg-emote-charcoal-100", text: "text-emote-charcoal-700" },
  mint: { bg: "bg-emote-mint-100", text: "text-emote-mint-600" },
  cream: { bg: "bg-emote-cream-100", text: "text-emote-cream-600" },
  lavender: { bg: "bg-emote-lavender-100", text: "text-emote-lavender-600" },
  rose: { bg: "bg-emote-rose-100", text: "text-emote-rose-600" },
  sky: { bg: "bg-emote-sky-100", text: "text-emote-sky-600" },
};

// 维度 metrics 字段名 → 中文标签
export const METRIC_LABELS: Record<string, string> = {
  // basic
  scale_level: "规模级别",
  listed_info: "上市信息",
  fortune500_5y: "世界500强（近5年）",
  industry_status: "行业地位",
  // compensation
  real_salary_range: "真实薪资范围",
  salary_structure: "薪资结构",
  percentile: "行业分位",
  severance_rule: "离职补偿",
  median_monthly_take_home: "中位数月薪",
  range: "范围",
  base: "基本",
  performance: "绩效",
  bonus: "奖金",
  stock: "股权",
  // welfare
  social_insurance_base: "社保基数",
  commercial_insurance: "商业保险",
  annual_leave_days: "年假天数",
  subsidies: "补贴",
  // worklife
  avg_overtime_hours: "月均加班",
  overtime_culture: "加班文化",
  overtime_pay: "加班费",
  after_work_disturbance: "下班打扰",
  // growth
  promotion_cycle: "晋升周期",
  training_system: "培训体系",
  internal_mobility: "内部转岗",
  track_potential: "发展上限",
  // reputation
  active_review_summary: "在职评价",
  former_review_summary: "离职评价",
  turnover_rate: "流动率",
  negative_events: "负面事件",
};

// 格式化 metrics 值为可读字符串
export function formatMetricValue(value: unknown): string {
  if (value == null || value === "") return "-";
  if (Array.isArray(value)) return value.join("、");
  if (typeof value === "object") {
    // 处理嵌套对象，如 { median_monthly_take_home: 8500, range: "6000-12000" }
    const entries = Object.entries(value).filter(
      ([, v]) => v != null && v !== ""
    );
    return entries
      .map(([k, v]) => `${METRIC_LABELS[k] ?? k}: ${formatMetricValue(v)}`)
      .join("；");
  }
  // 小数（薪资结构占比等）转百分比
  if (typeof value === "number" && value > 0 && value < 1) {
    return `${Math.round(value * 100)}%`;
  }
  return String(value);
}
