"use client";

import { Layers } from "lucide-react";
import { getCompanyDimensions } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import DimensionCard from "@/components/DimensionCard";
import { SectionSkeleton, SectionError } from "./SectionSkeleton";
import { DIMENSION_ORDER } from "@/lib/types";

export default function DimensionsSection({
  companyId,
}: {
  companyId: number;
}) {
  const { data: dimensionsData, loading, error, reload } = useAsync(
    () => getCompanyDimensions(companyId),
    [companyId]
  );

  if (loading) {
    return (
      <section className="max-w-[960px] mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">六维度详情</h2>
        </div>
        <div className="space-y-4">
          <SectionSkeleton rows={4} />
          <SectionSkeleton rows={4} />
        </div>
      </section>
    );
  }

  if (error || !dimensionsData) {
    return (
      <section className="max-w-[960px] mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">六维度详情</h2>
        </div>
        <SectionError message="维度数据加载失败" onRetry={reload} />
      </section>
    );
  }

  const dimensionsMap = new Map(
    (dimensionsData.dimensions || []).map((d) => [d.dimension_key, d])
  );

  return (
    <section className="max-w-[960px] mx-auto px-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">六维度详情</h2>
      </div>
      <div className="space-y-4">
        {DIMENSION_ORDER.map((key) => {
          const dim = dimensionsMap.get(key);
          if (!dim) return null;
          return <DimensionCard key={key} dimension={dim} />;
        })}
      </div>
    </section>
  );
}
