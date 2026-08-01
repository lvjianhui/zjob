"use client";

import { Plus, Check } from "lucide-react";
import { CompanyListItem } from "@/lib/types";
import { useAppStore } from "@/stores/useAppStore";

interface CompareButtonProps {
  company: CompanyListItem;
}

export default function CompareButton({ company }: CompareButtonProps) {
  const { isComparing, addCompareCandidate, removeCompareCandidate, compareCandidates } =
    useAppStore();
  const comparing = isComparing(company.id);
  const isFull = compareCandidates.length >= 5;

  const handleClick = () => {
    if (comparing) {
      removeCompareCandidate(company.id);
    } else if (!isFull) {
      addCompareCandidate(company);
    }
  };

  return (
    <button
      type="button"
      data-dom-id="detail-compare-btn"
      onClick={handleClick}
      disabled={!comparing && isFull}
      className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-secondary hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded-md"
    >
      {comparing ? (
        <Check className="w-4 h-4" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      {comparing ? "已加入对比" : "加入对比"}
    </button>
  );
}
