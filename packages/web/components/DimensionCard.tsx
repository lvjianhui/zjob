import {
  Landmark,
  Banknote,
  ShieldCheck,
  Clock,
  TrendingUp,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import {
  type DimensionData,
  DIMENSIONS_META,
  DIMENSION_LABELS,
  DIMENSION_ACCENT,
  LEVEL_COLORS,
  METRIC_LABELS,
  formatMetricValue,
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

/** #f59e0b -> rgba(245, 158, 11, alpha) */
function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatMetricKey(key: string): string {
  return METRIC_LABELS[key] ?? key;
}

export default function DimensionCard({ dimension }: DimensionCardProps) {
  const meta = DIMENSIONS_META.find((m) => m.key === dimension.dimension_key);
  const accent = meta?.accent ?? "charcoal";
  const accentStyles = DIMENSION_ACCENT[accent];
  const label = DIMENSION_LABELS[dimension.dimension_key];
  const colors = LEVEL_COLORS[dimension.level];
  const metrics = dimension.metrics || {};
  const Icon = meta ? ICON_MAP[meta.icon] : undefined;
  const levelHex = colors.hex;

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

      <div
        className="rounded-lg p-3 mb-3 border-l-2"
        style={{
          backgroundColor: hexToRgba(levelHex, 0.08),
          borderColor: levelHex,
        }}
      >
        <p className="text-xs font-semibold mb-0.5" style={{ color: levelHex }}>
          决策意义
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {meta?.decisionMeaning || ""}
        </p>
      </div>

      {Object.keys(metrics).length > 0 && (
        <ul className="space-y-2.5">
          {Object.entries(metrics).map(([key, value]) => (
            <li key={key} className="flex items-start gap-2">
              <span className="inline-flex items-center shrink-0 h-5 px-2 rounded text-xs font-medium bg-secondary text-muted-foreground mt-0.5">
                {formatMetricKey(key)}
              </span>
              <span className="text-sm font-medium text-foreground leading-relaxed flex-1 min-w-0">
                {formatMetricValue(value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
