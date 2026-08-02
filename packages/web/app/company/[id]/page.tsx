import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  Award,
  Building2,
  TrendingUp,
} from "lucide-react";
import { getCompany } from "@/lib/api";
import CompareButton from "@/components/CompareButton";
import SummarySection from "@/components/company/SummarySection";
import AnalysisSection from "@/components/company/AnalysisSection";
import DimensionsSection from "@/components/company/DimensionsSection";
import ReviewsSection from "@/components/company/ReviewsSection";
import type { CompanyListItem } from "@/lib/types";

interface CompanyPageProps {
  params: { id: string };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const companyId = Number(params.id);
  const company = await getCompany(companyId);

  if (!company) {
    notFound();
  }

  const companyListItem: CompanyListItem = {
    id: company.id,
    name: company.name,
    short_name: company.short_name,
    industry: company.industry,
    scale: company.scale,
    location: company.location,
    logo_url: company.logo_url,
    tags: company.tags,
    status: company.status,
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[960px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            data-dom-id="detail-back"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回搜索
          </Link>
          <CompareButton company={companyListItem} />
        </div>
      </div>

      <section className="max-w-[960px] mx-auto px-4 pt-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={company.short_name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-lg object-cover bg-secondary"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-emote-charcoal-900 text-white flex items-center justify-center text-xl font-bold">
                  {company.short_name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-base font-semibold text-foreground leading-tight">
                  {company.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {company.industry || "暂无行业"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-xs text-muted-foreground border border-border">
              <Building2 className="w-3.5 h-3.5" />
              {company.scale || "规模未知"}
            </span>
            {company.is_listed && company.stock_code && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-xs text-muted-foreground border border-border">
                <TrendingUp className="w-3.5 h-3.5" />
                {company.stock_code}
              </span>
            )}
            {company.is_listed && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emote-mint-50 text-xs text-emote-mint-700 border border-emote-mint-200">
                <Award className="w-3.5 h-3.5" />
                上市
              </span>
            )}
          </div>
        </div>
      </section>

      <SummarySection companyId={company.id} />
      <AnalysisSection companyId={company.id} />
      <DimensionsSection companyId={company.id} />
      <ReviewsSection companyId={company.id} />

      <footer className="max-w-[960px] mx-auto px-4 mt-10">
        <div className="border-t border-border pt-6 flex flex-col items-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            返回顶部
          </a>
          <p className="text-xs text-muted-foreground text-center">
            © 2026 真职 Zjob · 让每一次职业选择更真实
          </p>
        </div>
      </footer>
    </>
  );
}
