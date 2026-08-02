"use client";

import { getCompanySummary } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import TrafficLightGrid from "@/components/TrafficLightGrid";
import { SectionSkeleton, SectionError } from "./SectionSkeleton";

export default function SummarySection({ companyId }: { companyId: number }) {
  const { data: summary, loading, error, reload } = useAsync(
    () => getCompanySummary(companyId),
    [companyId]
  );

  if (loading) {
    return (
      <section className="max-w-[960px] mx-auto px-4 mt-6">
        <SectionSkeleton height={120} />
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="max-w-[960px] mx-auto px-4 mt-6">
        <SectionError message="评分数据加载失败" onRetry={reload} />
      </section>
    );
  }

  return (
    <section className="max-w-[960px] mx-auto px-4 mt-6">
      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">综合评分</span>
          <span className="text-3xl font-bold text-emote-mint-500">
            {summary.overall_score}
          </span>
        </div>
        <TrafficLightGrid summary={summary} />
      </div>
    </section>
  );
}
