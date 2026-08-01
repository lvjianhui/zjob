"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { Building2, TrendingUp, Layers, Circle, AlertCircle } from "lucide-react";
import {
  Company,
  DimensionData,
  DimensionKey,
  TrafficLightLevel,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
} from "@/lib/types";

type CompanyPayload = Omit<Company, "id" | "created_at" | "updated_at">;

interface AdminFormProps {
  initialCompany?: Company | null;
  initialDimensions?: DimensionData[];
  isNew?: boolean;
  saving?: boolean;
  onSave: (company: CompanyPayload, dimensions: DimensionData[]) => void;
  onCancel: () => void;
}

interface DimState {
  dimension_key: DimensionKey;
  score: number;
  level: TrafficLightLevel;
  summary: string;
  metricsText: string;
  source_note: string;
}

const emptyCompany: CompanyPayload = {
  name: "",
  short_name: "",
  en_name: "",
  industry: "",
  scale: "",
  location: "",
  logo_url: "",
  is_listed: false,
  stock_code: "",
  fortune500_trend: {},
  industry_ranking: "",
  tags: [],
  status: "active",
  source_urls: {},
};

function toPayload(c: Company | null): CompanyPayload {
  if (!c) return { ...emptyCompany };
  return {
    name: c.name,
    short_name: c.short_name,
    en_name: c.en_name ?? "",
    industry: c.industry ?? "",
    scale: c.scale ?? "",
    location: c.location ?? "",
    logo_url: c.logo_url ?? "",
    is_listed: c.is_listed,
    stock_code: c.stock_code ?? "",
    fortune500_trend: c.fortune500_trend ?? {},
    industry_ranking: c.industry_ranking ?? "",
    tags: c.tags ?? [],
    status: c.status,
    source_urls: c.source_urls ?? {},
  };
}

function initDimensions(initial?: DimensionData[]): DimState[] {
  return DIMENSION_ORDER.map((key) => {
    const d = initial?.find((x) => x.dimension_key === key);
    return {
      dimension_key: key,
      score: d?.score ?? 0,
      level: d?.level ?? "yellow",
      summary: d?.summary ?? "",
      metricsText: d?.metrics ? JSON.stringify(d.metrics, null, 2) : "",
      source_note: d?.source_note ?? "",
    };
  });
}

const DIMENSION_BALL: Record<DimensionKey, string> = {
  basic: "bg-emote-sky-100 text-emote-sky-700",
  compensation: "bg-emote-mint-100 text-emote-mint-700",
  welfare: "bg-emote-lavender-100 text-emote-lavender-700",
  worklife: "bg-emote-cream-100 text-emote-cream-700",
  growth: "bg-emote-rose-100 text-emote-rose-700",
  reputation: "bg-emote-charcoal-100 text-emote-charcoal-700",
};

const LEVEL_META: Record<
  TrafficLightLevel,
  { label: string; className: string }
> = {
  green: { label: "优秀", className: "text-success" },
  yellow: { label: "一般", className: "text-warning" },
  red: { label: "较差", className: "text-error" },
};

const inputClass =
  "w-full h-[var(--size-input-height)] px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm";

export default function AdminForm({
  initialCompany,
  initialDimensions,
  isNew = false,
  saving = false,
  onSave,
  onCancel,
}: AdminFormProps) {
  const [company, setCompany] = useState<CompanyPayload>(() =>
    toPayload(initialCompany ?? null)
  );
  const [dims, setDims] = useState<DimState[]>(() =>
    initDimensions(initialDimensions)
  );
  const [sourceUrl, setSourceUrl] = useState<string>(() => {
    const urls = initialCompany?.source_urls ?? {};
    const first = Object.values(urls)[0];
    return typeof first === "string" ? first : "";
  });
  const [tagsText, setTagsText] = useState<string>(() =>
    (initialCompany?.tags ?? []).join(", ")
  );
  const [errors, setErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handler = () => formRef.current?.requestSubmit();
    window.addEventListener("admin:save-company", handler);
    return () => window.removeEventListener("admin:save-company", handler);
  }, []);

  const updateDim = (key: DimensionKey, patch: Partial<DimState>) => {
    setDims((prev) =>
      prev.map((d) => (d.dimension_key === key ? { ...d, ...patch } : d))
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!company.name.trim()) {
      errs.push("公司名称不能为空");
    }

    const parsedDims: DimensionData[] = dims.map((d) => {
      if (!Number.isInteger(d.score) || d.score < 0 || d.score > 100) {
        errs.push(`${DIMENSION_LABELS[d.dimension_key]} 分数需为 0-100 的整数`);
      }
      let metrics: Record<string, unknown> = {};
      const text = d.metricsText.trim();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            !Array.isArray(parsed)
          ) {
            metrics = parsed as Record<string, unknown>;
          } else {
            errs.push(`${DIMENSION_LABELS[d.dimension_key]} 关键指标需为 JSON 对象`);
          }
        } catch {
          errs.push(`${DIMENSION_LABELS[d.dimension_key]} 关键指标 JSON 格式错误`);
        }
      }
      return {
        dimension_key: d.dimension_key,
        score: d.score,
        level: d.level,
        summary: d.summary,
        metrics,
        source_note: d.source_note,
      };
    });

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    const payload: CompanyPayload = {
      ...company,
      name: company.name.trim(),
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      source_urls: sourceUrl.trim() ? { default: sourceUrl.trim() } : {},
    };
    onSave(payload, parsedDims);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">
            {isNew ? "新增公司" : "编辑公司"}
          </h1>
          <p className="text-muted-foreground">
            维护公司主信息与六维度评分数据
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            data-dom-id="company-edit-cancel"
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-surface-container-low transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            data-dom-id="company-edit-save"
            className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors shadow-card disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {/* 公司主信息卡片 */}
      <section className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface-container-low">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emote-sky-600" />
            公司主信息
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              公司名称
            </label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              placeholder="例如：真职科技有限公司"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                简称
              </label>
              <input
                type="text"
                value={company.short_name}
                onChange={(e) =>
                  setCompany({ ...company, short_name: e.target.value })
                }
                placeholder="真职"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                英文名
              </label>
              <input
                type="text"
                value={company.en_name ?? ""}
                onChange={(e) =>
                  setCompany({ ...company, en_name: e.target.value })
                }
                placeholder="Zjob Tech"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                行业
              </label>
              <input
                type="text"
                value={company.industry ?? ""}
                onChange={(e) =>
                  setCompany({ ...company, industry: e.target.value })
                }
                placeholder="互联网"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                规模
              </label>
              <select
                value={company.scale ?? ""}
                onChange={(e) =>
                  setCompany({ ...company, scale: e.target.value })
                }
                className={`${inputClass} appearance-none`}
              >
                <option value="">请选择</option>
                <option value="1-50">1-50 人</option>
                <option value="51-200">51-200 人</option>
                <option value="201-1000">201-1000 人</option>
                <option value="1001-5000">1001-5000 人</option>
                <option value="5001-10000">5001-10000 人</option>
                <option value="10000+">10000+ 人</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              总部城市
            </label>
            <input
              type="text"
              value={company.location ?? ""}
              onChange={(e) =>
                setCompany({ ...company, location: e.target.value })
              }
              placeholder="北京"
              className={inputClass}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emote-sky-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">上市状态</p>
                <p className="text-xs text-muted-foreground">
                  开启后需填写股票代码
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={company.is_listed}
                onChange={(e) =>
                  setCompany({ ...company, is_listed: e.target.checked })
                }
                className="sr-only peer"
              />
              <span className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emote-sky-500" />
            </label>
          </div>
          {company.is_listed && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                股票代码
              </label>
              <input
                type="text"
                value={company.stock_code ?? ""}
                onChange={(e) =>
                  setCompany({ ...company, stock_code: e.target.value })
                }
                placeholder="例如：ZJOB"
                className={inputClass}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Logo URL
            </label>
            <input
              type="url"
              value={company.logo_url ?? ""}
              onChange={(e) =>
                setCompany({ ...company, logo_url: e.target.value })
              }
              placeholder="https://example.com/logo.png"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              标签
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="用逗号分隔，例如：独角兽, 弹性工作, 五险一金"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              来源链接
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/source"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* 六维度数据区 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Layers className="w-5 h-5 text-emote-sky-600" />
          <h2 className="text-base font-semibold text-foreground">六维度数据</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {dims.map((d, idx) => {
            const levelMeta = LEVEL_META[d.level];
            return (
              <article
                key={d.dimension_key}
                className="bg-card rounded-lg border border-border shadow-card overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border bg-surface-container-low flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${DIMENSION_BALL[d.dimension_key]}`}
                    >
                      {idx + 1}
                    </span>
                    {DIMENSION_LABELS[d.dimension_key]}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${levelMeta.className}`}
                  >
                    <Circle className="w-3 h-3 fill-current" />
                    {levelMeta.label}
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        综合分数
                      </label>
                      <output className="text-sm font-semibold text-emote-sky-600">
                        {d.score}
                      </output>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={d.score}
                      onChange={(e) =>
                        updateDim(d.dimension_key, {
                          score: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-emote-sky-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>100</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      评级
                    </label>
                    <select
                      value={d.level}
                      onChange={(e) =>
                        updateDim(d.dimension_key, {
                          level: e.target.value as TrafficLightLevel,
                        })
                      }
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="green">绿灯 - 优秀</option>
                      <option value="yellow">黄灯 - 一般</option>
                      <option value="red">红灯 - 较差</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      一句话总结
                    </label>
                    <input
                      type="text"
                      value={d.summary}
                      onChange={(e) =>
                        updateDim(d.dimension_key, { summary: e.target.value })
                      }
                      placeholder="一句话概括该维度表现"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      关键指标 JSON
                    </label>
                    <textarea
                      rows={3}
                      value={d.metricsText}
                      onChange={(e) =>
                        updateDim(d.dimension_key, {
                          metricsText: e.target.value,
                        })
                      }
                      placeholder='{"key": "value"}'
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono resize-y"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      数据来源说明
                    </label>
                    <input
                      type="text"
                      value={d.source_note}
                      onChange={(e) =>
                        updateDim(d.dimension_key, {
                          source_note: e.target.value,
                        })
                      }
                      placeholder="例如：年报、公开市场数据"
                      className={inputClass}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 表单验证提示 */}
      {errors.length > 0 && (
        <div
          className="rounded-md border border-[#e11d48]/20 bg-[var(--color-error-container)] p-3 space-y-2"
          aria-live="polite"
        >
          <div className="flex items-start gap-2 text-[var(--color-on-error-container)]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">表单验证提示</p>
              <p className="text-xs mt-0.5">
                请检查必填项是否完整，评分需在 0-100 之间。
              </p>
            </div>
          </div>
          <ul className="text-xs text-[var(--color-on-error-container)] space-y-1 pl-6 list-disc">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 底部操作区 */}
      <div className="pt-2 pb-6 flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={saving}
          data-dom-id="company-edit-save"
          className="flex-1 h-[var(--size-button-height)] rounded-md bg-primary text-primary-foreground text-base font-semibold hover:bg-primary-hover transition-colors shadow-card-hover disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          data-dom-id="company-edit-cancel"
          className="flex-1 h-[var(--size-button-height)] rounded-md border border-input bg-background text-foreground text-base font-medium hover:bg-surface-container-low transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
