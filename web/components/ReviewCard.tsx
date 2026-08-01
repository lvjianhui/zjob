"use client";

import {
  MessageSquare,
  Search,
  Heart,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import {
  Review,
  ReviewSource,
  REVIEW_SOURCE_LABELS,
  SENTIMENT_LABELS,
  AUDIT_STATUS_LABELS,
} from "@/lib/types";

interface ReviewCardProps {
  review: Review;
  showAuditActions?: boolean;
  onAuditChange?: (
    reviewId: number,
    status: "pending" | "approved" | "rejected"
  ) => void;
  companyName?: string;
}

const platformIcons: Record<ReviewSource, LucideIcon> = {
  maimai: MessageSquare,
  kanzhun: Search,
  xiaohongshu: Heart,
  zhihu: HelpCircle,
  linkedin: MessageSquare,
  other: MessageSquare,
};

const sentimentStyles: Record<string, string> = {
  positive: "bg-emote-mint-50 text-emote-mint-700",
  neutral: "bg-emote-cream-50 text-emote-cream-700",
  negative: "bg-emote-rose-50 text-emote-rose-700",
};

const statusStyles: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-emote-mint-50 text-emote-mint-700",
  rejected: "bg-emote-rose-50 text-emote-rose-700",
};

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 0) return d.toLocaleDateString("zh-CN");
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 2) return "昨天";
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`;
  return d.toLocaleDateString("zh-CN");
}

export default function ReviewCard({
  review,
  showAuditActions = false,
  onAuditChange,
  companyName,
}: ReviewCardProps) {
  const PlatformIcon = platformIcons[review.source] || MessageSquare;
  const sourceLabel = REVIEW_SOURCE_LABELS[review.source] || review.source;
  const sentimentLabel = SENTIMENT_LABELS[review.sentiment] || review.sentiment;
  const statusLabel = AUDIT_STATUS_LABELS[review.audit_status] || review.audit_status;
  const reviewId = review.id;

  return (
    <article className="rounded-lg border border-border bg-card shadow-card p-4 sm:p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emote-sky-50 text-emote-sky-600 shrink-0">
            <PlatformIcon className="w-4 h-4" />
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {sourceLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              sentimentStyles[review.sentiment] ||
              "bg-secondary text-secondary-foreground"
            }`}
          >
            {sentimentLabel}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              statusStyles[review.audit_status] ||
              "bg-secondary text-secondary-foreground"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
      {companyName && (
        <div className="text-xs text-muted-foreground mb-2">{companyName}</div>
      )}
      <p className="text-sm text-foreground line-clamp-2 mb-3">
        {review.content_summary || "无内容摘要"}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {timeAgo(review.published_at || review.created_at)}
        </span>
        {showAuditActions && onAuditChange && reviewId !== undefined && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAuditChange(reviewId, "approved")}
              data-dom-id={`reviews-approve-${reviewId}`}
              className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              通过
            </button>
            <button
              type="button"
              onClick={() => onAuditChange(reviewId, "rejected")}
              data-dom-id={`reviews-reject-${reviewId}`}
              className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-destructive text-destructive-foreground hover:bg-emote-rose-600 transition-colors"
            >
              拒绝
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
