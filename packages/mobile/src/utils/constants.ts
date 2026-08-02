/**
 * 真职 Zjob 常量定义
 * 从 web/lib/types.ts 移植
 */

import type {
  DimensionKey,
  DimensionAccent,
  TrafficLightLevel,
  ReviewSource,
  ReviewSentiment,
  ReviewAuditStatus,
} from "./types";

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
  { bg: string; text: string; dot: string; hex: string }
> = {
  green: {
    bg: "#f0fdf4",
    text: "#15803d",
    dot: "#22c55e",
    hex: "#22c55e",
  },
  yellow: {
    bg: "#fffbeb",
    text: "#b45309",
    dot: "#f59e0b",
    hex: "#f59e0b",
  },
  red: {
    bg: "#fff1f2",
    text: "#be123c",
    dot: "#f43f5e",
    hex: "#ef4444",
  },
};

export interface DimensionMeta {
  key: DimensionKey;
  label: string;
  oneLiner: string;
  decisionMeaning: string;
  icon: string;
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
    icon: "shield",
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
    icon: "trending",
    accent: "lavender",
  },
  {
    key: "reputation",
    label: "真实口碑",
    oneLiner: "一线员工 / 离职反馈",
    decisionMeaning:
      "HR 展示的是橱窗，在职/离职员工展示的是厨房，这里最接近真相。",
    icon: "message",
    accent: "rose",
  },
];

export const DIMENSION_ACCENT: Record<
  string,
  { bg: string; text: string }
> = {
  charcoal: { bg: "#efeff1", text: "#414149" },
  mint: { bg: "#dcfce7", text: "#16a34a" },
  cream: { bg: "#fef3c7", text: "#d97706" },
  lavender: { bg: "#f3e8ff", text: "#9333ea" },
  rose: { bg: "#ffe4e6", text: "#e11d48" },
  sky: { bg: "#e0f2fe", text: "#0284c7" },
};

export const METRIC_LABELS: Record<string, string> = {
  scale_level: "规模级别",
  listed_info: "上市信息",
  fortune500_5y: "世界500强（近5年）",
  industry_status: "行业地位",
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
  social_insurance_base: "社保基数",
  commercial_insurance: "商业保险",
  annual_leave_days: "年假天数",
  subsidies: "补贴",
  avg_overtime_hours: "月均加班",
  overtime_culture: "加班文化",
  overtime_pay: "加班费",
  after_work_disturbance: "下班打扰",
  promotion_cycle: "晋升周期",
  training_system: "培训体系",
  internal_mobility: "内部转岗",
  track_potential: "发展上限",
  active_review_summary: "在职评价",
  former_review_summary: "离职评价",
  turnover_rate: "流动率",
  negative_events: "负面事件",
};

export function formatMetricValue(value: any): string {
  if (value == null || value === "") return "-";
  if (Array.isArray(value)) return value.join("、");
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(
      ([, v]) => v != null && v !== ""
    );
    return entries
      .map(([k, v]) => `${METRIC_LABELS[k] ?? k}: ${formatMetricValue(v)}`)
      .join("；");
  }
  if (typeof value === "number" && value > 0 && value < 1) {
    return `${Math.round(value * 100)}%`;
  }
  return String(value);
}

export function scoreToLevel(score: number): TrafficLightLevel {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}
