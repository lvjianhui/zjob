"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Clock,
  CheckCircle2,
  Activity,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { listAdminCompanies, listAdminReviews, listAuditLogs } from "@/lib/api";
import { AuditLog, Company, Review } from "@/lib/types";

const actionMeta: Record<
  string,
  { label: string; className: string }
> = {
  create: {
    label: "新增",
    className: "bg-emote-mint-50 text-emote-mint-600",
  },
  approve: {
    label: "审核通过",
    className: "bg-emote-mint-50 text-emote-mint-600",
  },
  reject: {
    label: "驳回",
    className: "bg-emote-rose-50 text-emote-rose-600",
  },
  delete: {
    label: "删除",
    className: "bg-emote-rose-50 text-emote-rose-600",
  },
  pending: {
    label: "待审核",
    className: "bg-emote-cream-50 text-emote-cream-600",
  },
  update: {
    label: "编辑",
    className: "bg-secondary text-secondary-foreground",
  },
};

const targetLabel: Record<string, string> = {
  company: "公司",
  dimension: "维度",
  review: "口碑",
};

function getActionMeta(action: string) {
  return (
    actionMeta[action] || {
      label: action,
      className: "bg-secondary text-secondary-foreground",
    }
  );
}

function getTargetName(log: AuditLog): string {
  const detail = (log.detail as Record<string, unknown> | null) ?? null;
  const fromDetail =
    (detail?.name as string | undefined) ||
    (detail?.target_name as string | undefined);
  if (fromDetail) return fromDetail;
  return `#${log.target_id}`;
}

export default function AdminHomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listAdminCompanies(100),
      listAdminReviews({ limit: 100 }),
      listAuditLogs(10),
    ])
      .then(([companyData, reviewData, logData]) => {
        setCompanies(companyData);
        setReviews(reviewData);
        setLogs(logData);
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = reviews.filter((r) => r.audit_status === "pending").length;
  const approvedCount = reviews.filter((r) => r.audit_status === "approved").length;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">
          后台概览
        </h1>
        <p className="text-muted-foreground">欢迎回来，运营同学</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div
              data-dom-id="dash-stats-companies"
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Building2 className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5">
                {companies.length}
              </div>
              <div className="text-sm text-muted-foreground">公司总数</div>
            </div>

            <div
              data-dom-id="dash-stats-pending-reviews"
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-emote-cream-50">
                  <Clock className="w-5 h-5 text-emote-cream-500" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5">
                {pendingCount}
              </div>
              <div className="text-sm text-muted-foreground">待审核口碑</div>
            </div>

            <div
              data-dom-id="dash-stats-approved-reviews"
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-emote-mint-50">
                  <CheckCircle2 className="w-5 h-5 text-emote-mint-500" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5">
                {approvedCount}
              </div>
              <div className="text-sm text-muted-foreground">已审核口碑</div>
            </div>

            <div
              data-dom-id="dash-stats-today-ops"
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-emote-sky-50">
                  <Activity className="w-5 h-5 text-emote-sky-400" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5">
                {logs.length}
              </div>
              <div className="text-sm text-muted-foreground">今日操作</div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Link
              href="/companies"
              data-dom-id="dash-companies"
              className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="p-3 rounded-xl bg-primary text-primary-foreground">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground mb-0.5">公司管理</div>
                <div className="text-sm text-muted-foreground">
                  查看、编辑和审核入驻公司
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            <Link
              href="/reviews"
              data-dom-id="dash-reviews"
              className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="p-3 rounded-xl bg-primary text-primary-foreground">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground mb-0.5">口碑审核</div>
                <div className="text-sm text-muted-foreground">
                  处理用户提交的口碑评价
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>

          {/* Recent Operation Logs */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">最近操作日志</h2>
              <Link
                href="/companies"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table data-dom-id="dash-logs-table" className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left font-medium text-muted-foreground">
                      操作人
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left font-medium text-muted-foreground">
                      时间
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left font-medium text-muted-foreground">
                      对象类型
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left font-medium text-muted-foreground">
                      动作
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left font-medium text-muted-foreground">
                      对象名称
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 sm:px-6 py-6 text-center text-muted-foreground"
                      >
                        暂无操作日志
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const meta = getActionMeta(log.action);
                      return (
                        <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 sm:px-6 py-3 font-medium text-foreground">
                            {log.username || "系统"}
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-muted-foreground">
                            {new Date(log.created_at).toLocaleString("zh-CN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-muted-foreground">
                            {targetLabel[log.target_type] || log.target_type}
                          </td>
                          <td className="px-4 sm:px-6 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-foreground">
                            {getTargetName(log)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
