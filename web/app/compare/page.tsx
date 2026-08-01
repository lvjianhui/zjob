"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Banknote, Lightbulb, Plus, X } from "lucide-react";
import { compareCompanies, getCompanyAnalysis } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import CompareTable from "@/components/CompareTable";
import RadarChartComponent from "@/components/RadarChart";
import type {
  CompanyAnalysisResponse,
  CompareCompanyItem,
  CompareResponse,
} from "@/lib/types";

const BAR_COLORS = [
  "var(--emote-mint-500)",
  "var(--emote-sky-400)",
  "var(--emote-cream-500)",
  "var(--emote-rose-500)",
  "var(--emote-lavender-500)",
];

function scoreChipClass(score: number): string {
  if (score >= 80) return "bg-emote-mint-100 text-emote-mint-700";
  if (score >= 60) return "bg-emote-cream-100 text-emote-cream-700";
  return "bg-emote-rose-100 text-emote-rose-700";
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ComparePage() {
  const { compareCandidates, removeCompareCandidate } = useAppStore();
  const [data, setData] = useState<CompareResponse | null>(null);
  const [analyses, setAnalyses] = useState<CompanyAnalysisResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareCandidates.length < 2) {
      setData(null);
      setAnalyses([]);
      return;
    }
    setLoading(true);
    const ids = compareCandidates.map((c) => c.id);
    compareCompanies(ids)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
    Promise.all(ids.map((id) => getCompanyAnalysis(id))).then((res) =>
      setAnalyses(
        res.filter((a): a is CompanyAnalysisResponse => a !== null)
      )
    );
  }, [compareCandidates]);

  const companyItemMap = new Map<number, CompareCompanyItem>(
    (data?.companies ?? []).map((c) => [c.company_id, c])
  );
  const shortNameMap = new Map<number, string>(
    compareCandidates.map((c) => [c.id, c.short_name])
  );

  const today = todayString();

  // 结论摘要：选取综合评分最高的公司
  let conclusion = "请至少选择 2 家公司进行对比。";
  if (data && data.companies.length > 0) {
    const sorted = [...data.companies].sort(
      (a, b) => b.overall_score - a.overall_score
    );
    const top = sorted[0];
    if (sorted.length < 2) {
      conclusion = `${top.short_name}综合评分 ${top.overall_score} 分，建议再添加公司进行横向对比。`;
    } else {
      conclusion = `${top.short_name}综合最优（${top.overall_score}分）；其他公司可结合维度差异判断。`;
    }
  }

  const maxHourly = analyses.reduce(
    (m, a) => Math.max(m, a.real_hourly_wage.hourly_wage),
    0
  );

  return (
    <>
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[960px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            data-dom-id="compare-back"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-[var(--emote-sky-600)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回搜索</span>
          </Link>
          <Link
            href="/"
            data-dom-id="compare-add-company"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 h-10 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
          >
            <Plus className="w-4 h-4" />
            <span>添加公司</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 py-6 space-y-8 flex-1 w-full">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
            公司对比
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            已选 {compareCandidates.length} 家公司横向对比，数据来自平台真实面试与在职反馈
          </p>
        </div>

        {compareCandidates.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              对比篮为空，请先去首页添加 2-5 家公司
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover"
            >
              去添加
            </Link>
          </div>
        ) : compareCandidates.length === 1 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              已选择 1 家公司，请至少再添加 1 家进行对比
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {compareCandidates.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm text-foreground"
                >
                  {c.short_name}
                </span>
              ))}
            </div>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover"
            >
              继续添加
            </Link>
          </div>
        ) : (
          <>
            <section
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              aria-label="已选公司"
            >
              {compareCandidates.map((c) => {
                const item = companyItemMap.get(c.id);
                const score = item?.overall_score;
                return (
                  <article
                    key={c.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">
                          {c.short_name}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.industry || ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCompareCandidate(c.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`删除${c.short_name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-3xl font-extrabold text-foreground">
                        {score !== undefined ? score : "--"}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          score !== undefined
                            ? scoreChipClass(score)
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        综合评分
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>

            {loading ? (
              <div className="space-y-4">
                <div className="h-64 rounded-xl bg-secondary animate-pulse" />
                <div className="h-80 rounded-xl bg-secondary animate-pulse" />
              </div>
            ) : data ? (
              <>
                <CompareTable data={data} onRemove={removeCompareCandidate} />

                {analyses.length > 0 && (
                  <section
                    className="rounded-xl border border-border bg-card p-4 shadow-card"
                    aria-label="真实时薪对比"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Banknote className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-base font-semibold text-foreground">
                        真实时薪对比
                      </h3>
                    </div>
                    <div
                      className="grid gap-4 h-40"
                      style={{
                        gridTemplateColumns: `repeat(${analyses.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {analyses.map((a, i) => {
                        const wage = a.real_hourly_wage.hourly_wage;
                        const pct = maxHourly > 0 ? wage / maxHourly : 0;
                        const barPx = Math.max(8, Math.round(pct * 112));
                        const name = shortNameMap.get(a.company_id) ?? "";
                        return (
                          <div
                            key={a.company_id}
                            className="flex flex-col items-center gap-2 h-full justify-end"
                          >
                            <span className="text-sm font-bold text-foreground">
                              ¥{wage}
                            </span>
                            <div
                              className="w-12 rounded-t-lg"
                              style={{
                                height: `${barPx}px`,
                                backgroundColor:
                                  BAR_COLORS[i % BAR_COLORS.length],
                              }}
                            />
                            <span className="text-xs text-muted-foreground text-center">
                              {name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      * 时薪按样本岗位月平均收入与每周估算工时折算，仅供参考。
                    </p>
                  </section>
                )}

                <RadarChartComponent data={data} />

                <section
                  className="rounded-xl border border-border bg-secondary/40 p-4"
                  aria-label="结论摘要"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-0.5 shrink-0 text-emote-cream-500" />
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        结论摘要
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                        {conclusion}
                      </p>
                    </div>
                  </div>
                </section>
              </>
            ) : null}
          </>
        )}
      </div>

      <footer className="mt-12 border-t border-border bg-background">
        <div className="max-w-[960px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>真职 Zjob · 让每一份工作都值得期待</p>
          <p>数据更新于 {today}</p>
        </div>
      </footer>
    </>
  );
}
