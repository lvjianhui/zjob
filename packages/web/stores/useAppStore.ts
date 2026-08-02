"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompanyListItem } from "@/lib/types";

interface AppState {
  searchHistory: string[];
  compareCandidates: CompanyListItem[];
  addSearchHistory: (keyword: string) => void;
  removeSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
  addCompareCandidate: (company: CompanyListItem) => void;
  removeCompareCandidate: (companyId: number) => void;
  clearCompareCandidates: () => void;
  isComparing: (companyId: number) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      searchHistory: [],
      compareCandidates: [],

      addSearchHistory: (keyword) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;
        set((state) => ({
          searchHistory: [
            trimmed,
            ...state.searchHistory.filter((k) => k !== trimmed),
          ].slice(0, 10),
        }));
      },

      removeSearchHistory: (keyword) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter((k) => k !== keyword),
        })),

      clearSearchHistory: () => set({ searchHistory: [] }),

      addCompareCandidate: (company) =>
        set((state) => {
          if (state.compareCandidates.some((c) => c.id === company.id)) {
            return state;
          }
          if (state.compareCandidates.length >= 5) {
            return state;
          }
          return {
            compareCandidates: [...state.compareCandidates, company],
          };
        }),

      removeCompareCandidate: (companyId) =>
        set((state) => ({
          compareCandidates: state.compareCandidates.filter(
            (c) => c.id !== companyId
          ),
        })),

      clearCompareCandidates: () => set({ compareCandidates: [] }),

      isComparing: (companyId) =>
        get().compareCandidates.some((c) => c.id === companyId),
    }),
    {
      name: "zjob-app-store",
    }
  )
);
