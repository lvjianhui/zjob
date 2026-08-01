"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Radar as RadarIcon } from "lucide-react";
import { CompareResponse, DIMENSION_ORDER } from "@/lib/types";

interface RadarChartProps {
  data: CompareResponse;
}

const DIMENSION_LABELS: Record<string, string> = {
  basic: "基本面",
  compensation: "薪酬",
  welfare: "福利",
  worklife: "节奏",
  growth: "成长",
  reputation: "口碑",
};

const COLORS = ["#22c55e", "#38bdf8", "#f59e0b", "#f43f5e", "#a855f7"];

export default function RadarChartComponent({ data }: RadarChartProps) {
  if (!data.companies.length) return null;

  const chartData = DIMENSION_ORDER.map((key) => {
    const row: Record<string, number | string> = {
      subject: DIMENSION_LABELS[key] || key,
    };
    data.companies.forEach((company) => {
      const dim = company.dimensions.find((d) => d.key === key);
      row[company.short_name] = dim?.score ?? 0;
    });
    return row;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <RadarIcon className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">综合雷达图</h3>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            {data.companies.map((company, index) => (
              <Radar
                key={company.company_id}
                name={company.short_name}
                dataKey={company.short_name}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.15}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
