"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Building2,
  CheckCircle,
  Clock,
  Archive,
} from "lucide-react";
import { deleteCompany, listAdminCompanies } from "@/lib/api";
import { Company } from "@/lib/types";

const statusMeta: Record<
  string,
  { label: string; className: string; Icon: typeof CheckCircle }
> = {
  active: {
    label: "活跃",
    className: "bg-emote-mint-100 text-emote-mint-800",
    Icon: CheckCircle,
  },
  pending: {
    label: "待审核",
    className: "bg-emote-cream-100 text-emote-cream-800",
    Icon: Clock,
  },
  archived: {
    label: "已归档",
    className: "bg-emote-rose-100 text-emote-rose-800",
    Icon: Archive,
  },
};

function getStatusMeta(status: string) {
  return (
    statusMeta[status] || {
      label: status,
      className: "bg-secondary text-secondary-foreground",
      Icon: CheckCircle,
    }
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = () => {
    setLoading(true);
    listAdminCompanies(100)
      .then(setCompanies)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定删除公司 "${name}" 吗？`)) return;
    try {
      await deleteCompany(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.short_name || "").toLowerCase().includes(q) ||
        (c.industry || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [companies, query, statusFilter]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">
            公司管理
          </h1>
          <p className="text-muted-foreground">查看、编辑和审核入驻公司</p>
        </div>
        <Link
          href="/admin/companies/new/edit"
          data-dom-id="companies-add"
          className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors shadow-card"
        >
          <Plus className="w-4 h-4" />
          <span>新增公司</span>
        </Link>
      </div>

      {/* Search / Filter */}
      <section className="mb-6 p-4 rounded-lg border border-border bg-card shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-dom-id="companies-search"
              placeholder="搜索公司名称、行业…"
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="relative sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-dom-id="companies-filter-status"
              className="w-full h-10 pl-9 pr-8 rounded-md border border-input bg-background text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="pending">待审核</option>
              <option value="archived">已归档</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Company List */}
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-md bg-secondary/40 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              暂无公司数据
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((company) => {
                const meta = getStatusMeta(company.status);
                const StatusIcon = meta.Icon;
                return (
                  <div
                    key={company.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-surface-container border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {company.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {company.industry || "未填写行业"}
                          {company.scale ? ` · ${company.scale}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${meta.className}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {meta.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            更新：{formatDate(company.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/admin/companies/${company.id}/edit`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-info hover:text-emote-sky-700 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        编辑
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(company.id, company.name)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-destructive hover:text-emote-rose-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        删除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      <section className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          共 {filtered.length} 家公司
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
