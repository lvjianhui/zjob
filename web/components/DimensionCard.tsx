import {
  Landmark,
  Banknote,
  ShieldCheck,
  Clock,
  TrendingUp,
  MessageSquare,
  LucideIcon,
} from "lucide-react";
import {
  DimensionData,
  DIMENSIONS_META,
  DIMENSION_LABELS,
  DIMENSION_ACCENT,
  LEVEL_COLORS,
} from "@/lib/types";

interface DimensionCardProps {
  dimension: DimensionData;
}

const ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  clock: Clock,
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
};

function formatMetricValue(value: unknown): string {
  if (value === null || value === undefined) return "暂无数据";
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "number")
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (Array.isArray(value)) return value.join("、") || "无";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatMetricKey(key: string): string {
  const spaced = key.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export default function DimensionCard({ dimension }: DimensionCardProps) {
  const meta = DIMENSIONS_META.find((m) => m.key === dimension.dimension_key);
  const accent = meta?.accent ?? "charcoal";
  const accentStyles = DIMENSION_ACCENT[accent];
  const label = DIMENSION_LABELS[dimension.dimension_key];
  const colors = LEVEL_COLORS[dimension.level];
  const metrics = dimension.metrics || {};
  const Icon = meta ? ICON_MAP[meta.icon] : undefined;

  return (
    <article
      data-dom-id={`dimension-card-${dimension.dimension_key}`}
      className="bg-card border border-border rounded-xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center ${accentStyles.bg} ${accentStyles.text}`}
          >
            {Icon ? <Icon className="w-4 h-4" /> : null}
          </div>
          <h3 className="text-base font-semibold text-foreground">{label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          <span className={`text-lg font-bold ${colors.text}`}>
            {dimension.score}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {dimension.summary || "暂无总结"}
      </p>

      {Object.keys(metrics).length > 0 && (
        <ul className="space-y-2 text-sm">
          {Object.entries(metrics).map(([key, value]) => (
            <li key={key} className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">
                {formatMetricKey(key)}
              </span>
              <span className="font-medium text-foreground text-right">
                {formatMetricValue(value)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">决策意义：</span>
          {meta?.decisionMeaning || ""}
        </p>
      </div>
    </article>
  );
}
