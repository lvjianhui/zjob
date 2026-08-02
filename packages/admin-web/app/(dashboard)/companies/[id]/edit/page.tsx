"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminForm from "@/components/AdminForm";
import {
  createCompany,
  getCompany,
  getAdminCompanyDimensions,
  updateCompany,
  updateCompanyDimensions,
} from "@/lib/api";
import { Company, DimensionData } from "@/lib/types";

type CompanyPayload = Omit<Company, "id" | "created_at" | "updated_at">;

export default function CompanyEditPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const isNew = rawId === "new";
  const companyId = isNew ? null : Number(rawId);

  const [company, setCompany] = useState<Company | null>(null);
  const [dimensions, setDimensions] = useState<DimensionData[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setCompany(null);
      setDimensions([]);
      return;
    }
    if (!companyId) return;
    setLoading(true);
    Promise.all([getCompany(companyId), getAdminCompanyDimensions(companyId)])
      .then(([companyData, dimsData]) => {
        setCompany(companyData);
        setDimensions(dimsData?.dimensions || []);
      })
      .finally(() => setLoading(false));
  }, [companyId, isNew]);

  const handleSave = async (
    companyData: CompanyPayload,
    dimsData: DimensionData[]
  ) => {
    setSaving(true);
    try {
      let id = companyId;
      if (isNew) {
        const created = await createCompany(companyData);
        id = created.id;
      } else if (companyId) {
        await updateCompany(companyId, companyData);
      }
      if (id && dimsData.length > 0) {
        await updateCompanyDimensions(
          id,
          dimsData.map((d) => ({
            dimension_key: d.dimension_key,
            score: d.score,
            level: d.level,
            summary: d.summary || undefined,
            metrics: d.metrics || undefined,
            source_note: d.source_note || undefined,
          }))
        );
      }
      router.push("/companies");
    } catch (err) {
      alert(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/companies");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-secondary/50 animate-pulse" />
        <div className="h-96 rounded-lg border border-border bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <AdminForm
      initialCompany={company}
      initialDimensions={dimensions}
      isNew={isNew}
      saving={saving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
