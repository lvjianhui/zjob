import { Gauge, Landmark, type LucideIcon } from "lucide-react";
import {
  Banknote,
  Clock,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  CompanySummaryResponse,
  DIMENSIONS_META,
  LEVEL_COLORS,
} from "@/lib/types";

const DIMENSION_ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  banknote: Banknote,
  "shield-check": ShieldCheck,
  clock: Clock,
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
};

interface TrafficLightGridProps {
  summary: CompanySummaryResponse;
}

export default function TrafficLightGrid({ summary }: TrafficLightGridProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">六维红绿灯总览</h2>
      </div>
      <div
        data-dom-id="detail-traffic-light-grid"
        className="space-y-2"
      >
        {summary.dimensions.map((dim) => {
          const color = LEVEL_COLORS[dim.level];
          const meta = DIMENSIONS_META.find((m) => m.key === dim.key);
          const Icon = meta
            ? DIMENSION_ICON_MAP[meta.icon] ?? Landmark
            : Landmark;
          const borderColor =
            dim.level === "green"
              ? "border-emote-mint-200"
              : dim.level === "yellow"
                ? "border-emote-cream-200"
                : "border-emote-rose-200";
          return (
            <div
              key={dim.key}
              className={`${color.bg} ${borderColor} border rounded-lg p-3 flex items-center gap-3`}
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color.hex}22` }}
              >
                <Icon className="w-4 h-4" style={{ color: color.hex }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${color.dot}`}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {dim.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {meta?.oneLiner}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className="text-lg font-bold"
                  style={{ color: color.hex }}
                >
                  {dim.score}
                </span>
                <p className="text-[10px] text-muted-foreground">分</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* 图例 */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emote-mint-500" />
          绿灯 ≥80
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emote-cream-500" />
          黄灯 60-79
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emote-rose-500" />
          红灯 &lt;60
        </span>
      </div>
    </div>
  );
}
