"use client";

import { useState, useCallback, FormEvent } from "react";
import { Search } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

interface SearchBoxProps {
  initialValue?: string;
  onSearch: (keyword: string) => void;
  placeholder?: string;
  showHistory?: boolean;
}

export default function SearchBox({
  initialValue = "",
  onSearch,
  placeholder = "搜索公司名称，如 特斯拉、立讯精密、达能",
  showHistory = true,
}: SearchBoxProps) {
  const [keyword, setKeyword] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const { searchHistory, addSearchHistory, removeSearchHistory } = useAppStore();

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = keyword.trim();
      if (!trimmed) return;
      addSearchHistory(trimmed);
      onSearch(trimmed);
      setIsFocused(false);
    },
    [keyword, onSearch, addSearchHistory]
  );

  const handleHistoryClick = useCallback(
    (historyKeyword: string) => {
      setKeyword(historyKeyword);
      addSearchHistory(historyKeyword);
      onSearch(historyKeyword);
      setIsFocused(false);
    },
    [onSearch, addSearchHistory]
  );

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-card border border-border rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-[var(--emote-sky-400)] shadow-float">
          <span className="pl-5 text-muted-foreground">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            data-dom-id="index-search-box"
            className="w-full h-14 px-4 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-base"
          />
          <button
            type="submit"
            data-dom-id="index-search-btn"
            className="h-10 px-6 mr-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-[var(--emote-charcoal-800)] transition-colors"
          >
            搜索
          </button>
        </div>
      </form>

      {showHistory && isFocused && searchHistory.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card shadow-float overflow-hidden">
          <div className="px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>搜索历史</span>
            <button
              type="button"
              onClick={() => useAppStore.getState().clearSearchHistory()}
              className="text-foreground hover:underline"
            >
              清空
            </button>
          </div>
          <ul>
            {searchHistory.map((historyKeyword) => (
              <li
                key={historyKeyword}
                className="flex items-center justify-between px-3 py-2 hover:bg-secondary cursor-pointer"
                onMouseDown={() => handleHistoryClick(historyKeyword)}
              >
                <span className="text-sm text-foreground">{historyKeyword}</span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    removeSearchHistory(historyKeyword);
                  }}
                  className="text-xs text-destructive"
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
