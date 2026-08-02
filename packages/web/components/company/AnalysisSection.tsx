"use client";

import { getCompanyAnalysis } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import RealWageCard from "@/components/RealWageCard";
import { SectionSkeleton, SectionError } from "./SectionSkeleton";

export default function AnalysisSection({
  companyId,
}: {
  companyId: number;
}) {
  const { data: analysis, loading, error, reload } = useAsync(
    () => getCompanyAnalysis(companyId),
    [companyId]
  );

  if (loading) {
    return (
      <section className="max-w-[960px] mx-auto px-4 mt-6">
        <SectionSkeleton height={200} />
      </section>
    );
  }

  if (error || !analysis) {
    return null;
  }

  return (
    <section className="max-w-[960px] mx-auto px-4 mt-6">
      <RealWageCard analysis={analysis} />
    </section>
  );
}
