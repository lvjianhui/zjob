// 真职（Zjob）六维度配置常量
// 跨端共享：Web / 小程序均引用此处的维度元数据，确保展示一致。

export type DimensionKey =
  | "basic"
  | "compensation"
  | "welfare"
  | "worklife"
  | "growth"
  | "reputation";

export type TrafficLightLevel = "green" | "yellow" | "red";

// 维度图标底色所用的 emote 色族（与 design 的 emote-* 调色板对应）
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
  /** lucide 图标名（kebab-case），用于维度卡片 / 六维亮点展示 */
  icon: string;
  /** 维度图标徽章所用的 emote 色族 */
  accent: DimensionAccent;
}

export const DIMENSIONS: DimensionMeta[] = [
  {
    key: "basic",
    label: "企业基本面",
    oneLiner: "多大 / 多稳 / 多强",
    decisionMeaning: "判断公司处于上升期/平台期/衰退期，决定职业是顺风还是逆风。",
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

// 红绿灯等级 → emote 色阶（与 design 的 traffic-light 一致）
export const LEVEL_COLORS: Record<TrafficLightLevel, string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
};

// 等级判定阈值（分数 → 红绿灯）
export function levelFromScore(score: number): TrafficLightLevel {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}
