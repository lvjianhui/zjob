"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import { listAdminCompanies, listAdminReviews, updateReview } from "@/lib/api";
import { Review, ReviewAuditStatus } from "@/lib/types";

type FilterKey = "all" | ReviewAuditStatus;

const FILTERS: { key: FilterKey; label: string; domId: string }[] = [
  { key: "all", label: "全部", domId: "reviews-filter-all" },
  { key: "pending", label: "待审核", domId: "reviews-filter-pending" },
  { key: "approved", label: "已通过", domId: "reviews-filter-approved" },
  { key: "rejected", label: "已拒绝", domId: "reviews-filter-rejected" },
];

const PAGE_SIZE = 10;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [companyNames, setCompanyNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([
      listAdminReviews({
        audit_status: filter === "all" ? undefined : filter,
        limit: 100,
      }),
      listAdminCompanies(100),
    ])
      .then(([reviewData, companies]) => {
        setReviews(reviewData);
        const nameMap: Record<number, string> = {};
        companies.forEach((c) => {
          nameMap[c.id] = c.name;
        });
        setCompanyNames(nameMap);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    setPage(1);
  }, [filter]);

  const handleAuditChange = async (
    reviewId: number,
    status: "pending" | "approved" | "rejected"
  ) => {
    try {
      await updateReview(reviewId, { audit_status: status });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "审核失败");
    }
  };

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedReviews = useMemo(
    () =>
      reviews.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [reviews, safePage]
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">
          口碑审核
        </h1>
        <p className="text-muted-foreground">处理用户提交的口碑评价</p>
      </div>

      {/* Filters */}
      <nav className="mb-6">
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
          role="tablist"
          aria-label="审核筛选"
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                data-dom-id={f.domId}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Review List */}
      <section className="mb-6">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-lg border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : pagedReviews.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
            暂无口碑数据
          </div>
        ) : (
          <div
            data-dom-id="reviews-table"
            className="flex flex-col gap-4"
          >
            {pagedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                companyName={
                  review.company_id ? companyNames[review.company_id] : undefined
                }
                showAuditActions
                onAuditChange={handleAuditChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      <section className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          共 {reviews.length} 条口碑
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </button>
          <span className="text-sm text-muted-foreground">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
