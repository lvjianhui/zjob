import { Calculator, CircleCheck } from "lucide-react";
import type { CompanyAnalysisResponse } from "@/lib/types";

function formatMoney(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export default function RealWageCard({
  analysis,
}: {
  analysis: CompanyAnalysisResponse;
}) {
  const wage = analysis.real_hourly_wage;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-md bg-emote-sky-100 flex items-center justify-center text-emote-sky-600">
          <Calculator className="w-4 h-4" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          真实时薪交叉验证
        </h2>
      </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emote-charcoal-50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">月到手</p>
            <p className="text-lg font-bold text-foreground">
              ¥{formatMoney(wage.monthly_take_home)}
            </p>
          </div>
          <div className="bg-emote-charcoal-50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">月工时</p>
            <p className="text-lg font-bold text-foreground">
              {Math.round(wage.monthly_work_hours)}h
            </p>
          </div>
          <div className="bg-emote-mint-50 rounded-lg p-3 text-center border border-emote-mint-200">
            <p className="text-xs text-emote-mint-700 mb-1">真实时薪</p>
            <p className="text-lg font-bold text-emote-mint-600">
              ¥{wage.hourly_wage.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground">行业 P50</span>
          <span className="font-semibold text-foreground">
            ¥{wage.industry_p50_hourly.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-muted-foreground">百分位</span>
          <span className="font-semibold text-emote-mint-600">
            {wage.percentile}%
          </span>
        </div>

        <div className="bg-emote-charcoal-50 rounded-lg p-3 flex items-start gap-2">
          <CircleCheck className="w-4 h-4 text-emote-mint-500 mt-0.5 shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">
            {wage.verdict}
          </p>
        </div>
      </div>
  );
}
