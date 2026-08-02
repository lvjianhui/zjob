"use client";

import { Loader2 } from "lucide-react";

interface SectionSkeletonProps {
  height?: number;
  rows?: number;
  icon?: boolean;
  title?: string;
}

/**
 * 区块加载骨架屏：带旋转图标 + 占位条
 */
export function SectionSkeleton({
  height,
  rows = 3,
  icon = true,
  title,
}: SectionSkeletonProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card animate-pulse">
      {icon || title ? (
        <div className="flex items-center gap-2 mb-4">
          {icon && (
            <div className="w-4 h-4 rounded bg-muted-foreground/20" />
          )}
          {title ? (
            <div className="h-4 w-24 rounded bg-muted-foreground/20" />
          ) : null}
        </div>
      ) : null}
      {height ? (
        <div
          className="w-full rounded bg-muted-foreground/10"
          style={{ height }}
        />
      ) : (
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded bg-muted-foreground/10"
              style={{ width: `${90 - i * 15}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function SectionError({ message, onRetry }: SectionErrorProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{message || "数据加载失败"}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto text-xs text-emote-mint-600 hover:text-emote-mint-700 transition-colors"
          >
            重试
          </button>
        )}
      </div>
    </div>
  );
}
