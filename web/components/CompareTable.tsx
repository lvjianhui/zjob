import { X } from "lucide-react";
import {
  CompareResponse,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  LEVEL_COLORS,
} from "@/lib/types";

interface CompareTableProps {
  data: CompareResponse;
  onRemove?: (companyId: number) => void;
}

export default function CompareTable({ data, onRemove }: CompareTableProps) {
  if (!data.companies.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        暂无对比公司，请先添加 2-5 家公司
      </div>
    );
  }

  return (
    <section
      data-dom-id="compare-table"
      className="rounded-xl border border-border bg-card overflow-hidden shadow-card"
    >
      <div className="px-4 py-3 border-b border-border bg-secondary/50">
        <h3 className="text-base font-semibold text-foreground">六维度逐项对比</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/30">
              <th className="text-left px-4 py-3 font-semibold text-foreground w-[140px]">
                维度
              </th>
              {data.companies.map((company) => (
                <th
                  key={company.company_id}
                  className="text-center px-4 py-3 font-semibold text-foreground min-w-[140px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{company.short_name}</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {company.industry}
                      </div>
                    </div>
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(company.company_id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`删除${company.short_name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-4 py-3 font-medium text-foreground">综合评分</td>
              {data.companies.map((company) => (
                <td key={company.company_id} className="px-4 py-3 text-center">
                  <span className="text-lg font-bold text-foreground">
                    {company.overall_score}
                  </span>
                </td>
              ))}
            </tr>
            {DIMENSION_ORDER.map((key) => (
              <tr key={key}>
                <td className="px-4 py-3 font-medium text-foreground">
                  {DIMENSION_LABELS[key] || key}
                </td>
                {data.companies.map((company) => {
                  const dim = company.dimensions.find((d) => d.key === key);
                  if (!dim) {
                    return (
                      <td
                        key={company.company_id}
                        className="px-4 py-3 text-center text-muted-foreground"
                      >
                        —
                      </td>
                    );
                  }
                  const colors = LEVEL_COLORS[dim.level];
                  return (
                    <td key={company.company_id} className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="font-semibold text-foreground">
                          {dim.score}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
