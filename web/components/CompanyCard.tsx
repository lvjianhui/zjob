"use client";

import Link from "next/link";
import Image from "next/image";
import { MouseEvent } from "react";
import { Building2 } from "lucide-react";
import {
  CompanyListItem,
  CompanySummaryResponse,
  DIMENSION_ORDER,
  TrafficLightLevel,
} from "@/lib/types";
import { useAppStore } from "@/stores/useAppStore";

interface CompanyCardProps {
  company: CompanyListItem;
  summary?: CompanySummaryResponse;
  showCompareAction?: boolean;
}

function levelFromScore(score: number): TrafficLightLevel {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

export default function CompanyCard({
  company,
  summary,
  showCompareAction = true,
}: CompanyCardProps) {
  const { compareCandidates, addCompareCandidate, removeCompareCandidate, isComparing } =
    useAppStore();
  const comparing = isComparing(company.id);
  const isFull = compareCandidates.length >= 5;

  const handleCompareToggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (comparing) {
      removeCompareCandidate(company.id);
    } else if (!isFull) {
      addCompareCandidate(company);
    }
  };

  const level = summary ? levelFromScore(summary.overall_score) : null;
  const scoreBadgeClass =
    level === "green"
      ? "bg-emote-mint-100 text-emote-mint-900"
      : level === "yellow"
        ? "bg-emote-cream-100 text-emote-cream-700"
        : "bg-emote-rose-100 text-emote-rose-700";

  return (
    <article className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer">
      <Link href={`/company/${company.id}`} className="block">
        <div className="flex items-start justify-between mb-4">
          <div className="shrink-0">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.short_name}
                width={48}
                height={48}
                className="rounded-lg object-cover bg-secondary"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                <Building2 className="w-6 h-6" />
              </div>
            )}
          </div>
          {summary && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${scoreBadgeClass}`}
            >
              {summary.overall_score} 综合
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">
          {company.short_name || company.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {company.industry || "行业未知"} · {company.scale || "规模未知"}
        </p>

        {summary && (
          <div className="grid grid-cols-6 gap-1.5">
            {DIMENSION_ORDER.map((key) => {
              const dim = summary.dimensions.find((d) => d.key === key);
              if (!dim) {
                return (
                  <span
                    key={key}
                    className="aspect-square rounded-full bg-secondary"
                  />
                );
              }
              const dotColor =
                dim.level === "green"
                  ? "bg-emote-mint-400"
                  : dim.level === "yellow"
                    ? "bg-emote-cream-400"
                    : "bg-emote-rose-400";
              return (
                <span
                  key={key}
                  className={`aspect-square rounded-full ${dotColor}`}
                  title={dim.label}
                />
              );
            })}
          </div>
        )}
      </Link>

      {showCompareAction && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleCompareToggle}
            disabled={!comparing && isFull}
            className={
              comparing
                ? "text-sm px-3 py-1.5 rounded-full border transition-colors bg-emote-rose-50 text-emote-rose-600 border-emote-rose-200"
                : isFull
                  ? "text-sm px-3 py-1.5 rounded-full border transition-colors bg-secondary text-muted-foreground border-border cursor-not-allowed"
                  : "text-sm px-3 py-1.5 rounded-full border transition-colors bg-emote-sky-50 text-emote-sky-600 border-emote-sky-200 hover:bg-emote-sky-100"
            }
          >
            {comparing ? "移出对比" : "加入对比"}
          </button>
        </div>
      )}
    </article>
  );
}
