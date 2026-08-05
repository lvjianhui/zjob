import type { Review } from "@/lib/types";
import { REVIEW_SOURCE_LABELS, SENTIMENT_LABELS } from "@/lib/types";

interface ReviewCardProps {
  review: Review;
}

const sentimentStyles: Record<string, string> = {
  positive: "bg-emote-mint-50 text-emote-mint-700",
  neutral: "bg-secondary text-muted-foreground",
  negative: "bg-emote-rose-50 text-emote-rose-700",
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const sourceLabel = REVIEW_SOURCE_LABELS[review.source] || review.source;
  const sentimentLabel =
    SENTIMENT_LABELS[review.sentiment] || review.sentiment;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
          {sourceLabel}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            sentimentStyles[review.sentiment] ||
            "bg-secondary text-muted-foreground"
          }`}
        >
          {sentimentLabel}
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        {review.content_summary || "无内容摘要"}
      </p>
    </div>
  );
}
