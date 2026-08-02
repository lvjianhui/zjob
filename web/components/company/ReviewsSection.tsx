"use client";

import { MessagesSquare } from "lucide-react";
import { getCompanyReviews } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import ReviewCard from "@/components/ReviewCard";
import { SectionSkeleton, SectionError } from "./SectionSkeleton";

export default function ReviewsSection({
  companyId,
}: {
  companyId: number;
}) {
  const { data: reviews, loading, error, reload } = useAsync(
    () => getCompanyReviews(companyId),
    [companyId]
  );

  if (loading) {
    return (
      <section className="max-w-[960px] mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MessagesSquare className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            精选真实口碑
          </h2>
        </div>
        <div className="space-y-3">
          <SectionSkeleton rows={3} />
          <SectionSkeleton rows={3} />
        </div>
      </section>
    );
  }

  if (error || !reviews) {
    return (
      <section className="max-w-[960px] mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MessagesSquare className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            精选真实口碑
          </h2>
        </div>
        <SectionError message="口碑数据加载失败" onRetry={reload} />
      </section>
    );
  }

  const approvedReviews = reviews.filter(
    (r) => r.audit_status === "approved"
  );

  return (
    <section className="max-w-[960px] mx-auto px-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessagesSquare className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">
          精选真实口碑
        </h2>
      </div>
      {approvedReviews.length > 0 ? (
        <div className="space-y-3">
          {approvedReviews.map((review, idx) => (
            <ReviewCard key={review.id ?? idx} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">暂无口碑数据</p>
      )}
    </section>
  );
}
