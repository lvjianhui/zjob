import {
  Company,
  CompanyAnalysisResponse,
  CompanyDimensionsResponse,
  CompanyListItem,
  CompanySummaryResponse,
  CompareResponse,
  Review,
} from "./types";

export const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    name: "立讯精密工业股份有限公司",
    short_name: "立讯精密",
    en_name: "Luxshare Precision Industry Co., Ltd.",
    industry: "电子制造 / 消费电子精密制造",
    scale: "10万人以上",
    location: "东莞、深圳、昆山",
    logo_url: "https://via.placeholder.com/120?text=Luxshare",
    is_listed: true,
    stock_code: "002475.SZ",
    fortune500_trend: {
      "2022": null,
      "2023": null,
      "2024": null,
      "2025": null,
      "2026": null,
    },
    industry_ranking: "全球消费电子精密制造龙头，苹果核心供应商",
    tags: ["果链", "电子制造", "大厂", "上市公司"],
    status: "active",
    source_urls: {
      official: "https://www.luxshare-ict.com",
      exchange: "https://www.szse.cn",
    },
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: 2,
    name: "特斯拉（上海）有限公司",
    short_name: "特斯拉上海",
    en_name: "Tesla (Shanghai) Co., Ltd.",
    industry: "新能源汽车制造",
    scale: "1-5万人",
    location: "上海临港",
    logo_url: "https://via.placeholder.com/120?text=Tesla",
    is_listed: true,
    stock_code: "TSLA (NASDAQ)",
    fortune500_trend: {
      "2022": 392,
      "2023": 152,
      "2024": 128,
      "2025": 110,
      "2026": 95,
    },
    industry_ranking: "全球新能源汽车头部企业，上海超级工厂产能全球领先",
    tags: ["新能源汽车", "500强", "外资", "上海"],
    status: "active",
    source_urls: {
      official: "https://www.tesla.cn",
      exchange: "https://www.nasdaq.com",
    },
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: 3,
    name: "达能中国",
    short_name: "达能",
    en_name: "Danone China",
    industry: "食品饮料 / 快消",
    scale: "1-5万人",
    location: "上海",
    logo_url: "https://via.placeholder.com/120?text=Danone",
    is_listed: true,
    stock_code: "BN (Euronext)",
    fortune500_trend: {
      "2022": null,
      "2023": null,
      "2024": null,
      "2025": null,
      "2026": null,
    },
    industry_ranking: "全球食品饮料巨头，中国婴幼儿营养品与饮用水市场领先",
    tags: ["快消", "外资", "食品饮料", "上海"],
    status: "active",
    source_urls: {
      official: "https://www.danone.com",
      exchange: "https://www.euronext.com",
    },
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
];

export const MOCK_DIMENSIONS: Record<number, CompanyDimensionsResponse> = {
  1: {
    company_id: 1,
    name: "立讯精密工业股份有限公司",
    dimensions: [
      {
        dimension_key: "basic",
        score: 78,
        level: "yellow",
        summary: "苹果核心供应商，规模庞大、上市透明，但世界500强尚未入榜，处于景气赛道但毛利承压。",
        metrics: {
          scale_level: "大厂（10万人以上）",
          listed_info: "深交所主板，股票代码 002475.SZ",
          fortune500_5y: "近5年未入榜世界500强",
          industry_status: "全球消费电子精密制造龙头，苹果核心供应链",
        },
        source_note: "公司年报、深交所公告、公开财报",
      },
      {
        dimension_key: "compensation",
        score: 62,
        level: "yellow",
        summary: "普工月薪到手约8,500元，处于行业P50，但薪资结构中绩效占比较高，淡旺季波动大。",
        metrics: {
          real_salary_range: {
            median_monthly_take_home: 8500,
            range: "6000-12000",
          },
          salary_structure: {
            base: 0.7,
            performance: 0.2,
            bonus: 0.1,
          },
          percentile: "P50",
          severance_rule: "N+1，依法缴纳",
        },
        source_note: "看准网、Boss直聘招聘JD、内部反馈",
      },
      {
        dimension_key: "welfare",
        score: 58,
        level: "red",
        summary: "五险一金多按最低基数缴纳，有餐补和宿舍，但整体福利保障在大型制造企业中偏弱。",
        metrics: {
          social_insurance_base: "多数岗位按最低基数缴纳",
          commercial_insurance: "补充医疗（部分岗位）",
          annual_leave_days: 5,
          subsidies: ["餐补", "员工宿舍", "夜班补贴"],
        },
        source_note: "招聘JD、员工反馈、脉脉",
      },
      {
        dimension_key: "worklife",
        score: 52,
        level: "red",
        summary: "产线岗位月均加班约60小时，旺季存在强制加班，工作节奏快，真实时薪被摊薄。",
        metrics: {
          avg_overtime_hours: 60,
          overtime_culture: "产线旺季强制加班，管理严格",
          overtime_pay: "按法定标准支付加班费",
          after_work_disturbance: "较低，下班基本无工作消息",
        },
        source_note: "脉脉、看准网、小红书",
      },
      {
        dimension_key: "growth",
        score: 65,
        level: "yellow",
        summary: "晋升周期1-2年，有岗位技能培训，但内部转岗机会有限，消费电子赛道增速放缓。",
        metrics: {
          promotion_cycle: "1-2年",
          training_system: "入职培训 + 岗位技能培训",
          internal_mobility: "有限，需内部竞聘",
          track_potential: "中",
        },
        source_note: "公司官网、招聘JD、脉脉",
      },
      {
        dimension_key: "reputation",
        score: 60,
        level: "yellow",
        summary: "在职员工认为工作稳定但枯燥；离职员工反馈管理严格、流动性大，旺季招工争议时有发生。",
        metrics: {
          active_review_summary: "工作稳定，但重复性高、枯燥",
          former_review_summary: "管理严格，流水线压力大，流动性高",
          turnover_rate: 0.25,
          negative_events: "旺季招工、劳务派遣争议",
        },
        source_note: "脉脉、看准网、知乎、小红书",
      },
    ],
  },
  2: {
    company_id: 2,
    name: "特斯拉（上海）有限公司",
    dimensions: [
      {
        dimension_key: "basic",
        score: 88,
        level: "green",
        summary: "世界500强排名持续上升，上海超级工厂是全球产能标杆，技术领先、品牌强势。",
        metrics: {
          scale_level: "中大型（1-5万人）",
          listed_info: "NASDAQ 上市，股票代码 TSLA",
          fortune500_5y: "392→152→128→110→95，持续上升",
          industry_status: "全球新能源汽车头部，上海超级工厂产能领先",
        },
        source_note: "财富500强榜单、公司年报、公开财报",
      },
      {
        dimension_key: "compensation",
        score: 85,
        level: "green",
        summary: "一线技术工人月薪到手约18,500元，处于行业P75，年终奖与股票期权对核心岗位有吸引力。",
        metrics: {
          real_salary_range: {
            median_monthly_take_home: 18500,
            range: "12000-28000",
          },
          salary_structure: {
            base: 0.75,
            performance: 0.15,
            stock: 0.1,
          },
          percentile: "P75",
          severance_rule: "N+1，部分岗位有竞业限制",
        },
        source_note: "看准网、脉脉、Boss直聘",
      },
      {
        dimension_key: "welfare",
        score: 72,
        level: "yellow",
        summary: "五险一金按实际工资缴纳，补充商业保险覆盖较全，但年假与补贴在制造业中属中等水平。",
        metrics: {
          social_insurance_base: "按实际工资全额缴纳",
          commercial_insurance: "补充医疗 + 意外险 + 家属医疗",
          annual_leave_days: 10,
          subsidies: ["餐补", "交通补贴", "夜班补贴"],
        },
        source_note: "公司官网、员工反馈、脉脉",
      },
      {
        dimension_key: "worklife",
        score: 68,
        level: "yellow",
        summary: "产线节奏快，月均加班约40小时，加班费按法定支付，下班打扰较少，整体工作强度偏高。",
        metrics: {
          avg_overtime_hours: 40,
          overtime_culture: "目标导向，旺季加班较多",
          overtime_pay: "按法定标准支付",
          after_work_disturbance: "较低",
        },
        source_note: "脉脉、小红书、看准网",
      },
      {
        dimension_key: "growth",
        score: 80,
        level: "green",
        summary: "技术与管理双通道晋升较清晰，培训体系完善，新能源赛道潜力高，3年后具备行业溢价能力。",
        metrics: {
          promotion_cycle: "1-2年",
          training_system: "入职培训 + 技术认证 + 海外轮岗机会",
          internal_mobility: "较多，跨工厂/跨部门机会",
          track_potential: "高",
        },
        source_note: "公司官网、LinkedIn、脉脉",
      },
      {
        dimension_key: "reputation",
        score: 75,
        level: "yellow",
        summary: "在职员工认可品牌光环与技术成长；部分岗位反馈工作强度大、KPI压力大，离职员工两极分化。",
        metrics: {
          active_review_summary: "技术前沿、成长快、品牌光环强",
          former_review_summary: "工作强度大，KPI严格，部分岗位流动性高",
          turnover_rate: 0.18,
          negative_events: "产线节奏与裁员传闻偶有报道",
        },
        source_note: "脉脉、LinkedIn、知乎、小红书",
      },
    ],
  },
  3: {
    company_id: 3,
    name: "达能中国",
    dimensions: [
      {
        dimension_key: "basic",
        score: 82,
        level: "green",
        summary: "全球食品饮料巨头，品牌历史悠久，中国业务稳健，虽非世界500强但行业地位稳固。",
        metrics: {
          scale_level: "中大型（1-5万人）",
          listed_info: "巴黎泛欧交易所上市，股票代码 BN",
          fortune500_5y: "近5年未入榜世界500强",
          industry_status: "全球食品饮料巨头，中国婴幼儿营养品与饮用水市场领先",
        },
        source_note: "公司年报、Euronext公告",
      },
      {
        dimension_key: "compensation",
        score: 70,
        level: "yellow",
        summary: "市场岗位月薪到手约14,000元，处于行业P50-P75，福利折现后整体报酬具备竞争力。",
        metrics: {
          real_salary_range: {
            median_monthly_take_home: 14000,
            range: "10000-22000",
          },
          salary_structure: {
            base: 0.8,
            performance: 0.15,
            bonus: 0.05,
          },
          percentile: "P60",
          severance_rule: "N+1，法定标准",
        },
        source_note: "看准网、脉脉、LinkedIn",
      },
      {
        dimension_key: "welfare",
        score: 85,
        level: "green",
        summary: "五险一金足额缴纳，商业保险覆盖家属，年假15天起，弹性福利平台完善。",
        metrics: {
          social_insurance_base: "按实际工资全额缴纳",
          commercial_insurance: "补充医疗 + 意外险 + 家属医疗",
          annual_leave_days: 15,
          subsidies: ["餐补", "交通补贴", "通讯补贴", "节日礼金", "弹性福利积分"],
        },
        source_note: "公司官网、员工反馈、脉脉",
      },
      {
        dimension_key: "worklife",
        score: 78,
        level: "yellow",
        summary: "整体加班文化温和，月均加班约20小时，支持部分岗位弹性办公，工作与生活平衡较好。",
        metrics: {
          avg_overtime_hours: 20,
          overtime_culture: "温和，业务节点偶有加班",
          overtime_pay: "可申请调休或加班费",
          after_work_disturbance: "低，尊重下班时间",
        },
        source_note: "脉脉、小红书、看准网",
      },
      {
        dimension_key: "growth",
        score: 76,
        level: "green",
        summary: "管培生体系成熟，晋升路径清晰，培训资源丰富，快消赛道稳定但增长放缓。",
        metrics: {
          promotion_cycle: "2-3年",
          training_system: "达能学院 + 管培轮岗 + 海外交流",
          internal_mobility: "较多，跨品牌/跨职能机会",
          track_potential: "中",
        },
        source_note: "公司官网、LinkedIn、脉脉",
      },
      {
        dimension_key: "reputation",
        score: 80,
        level: "green",
        summary: "在职员工认可企业文化与人性化管理，离职员工评价整体正面，雇主品牌较好。",
        metrics: {
          active_review_summary: "企业文化好，管理人性化，福利到位",
          former_review_summary: "平台大但晋升偏慢，适合长期稳定发展",
          turnover_rate: 0.12,
          negative_events: "暂无重大负面事件",
        },
        source_note: "脉脉、LinkedIn、看准网",
      },
    ],
  },
};

export const MOCK_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: 101,
      company_id: 1,
      source: "kanzhun",
      sentiment: "neutral",
      content_summary: "普工到手8k左右，加班多，旺季能过万，但累是真的累。",
      original_url: "https://www.kanzhun.com",
      published_at: "2026-04-15",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 102,
      company_id: 1,
      source: "maimai",
      sentiment: "negative",
      content_summary: "管理很严，流水线节奏快，干一年就换了一批人。",
      original_url: "https://maimai.cn",
      published_at: "2026-05-20",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 103,
      company_id: 1,
      source: "xiaohongshu",
      sentiment: "positive",
      content_summary: "宿舍环境还可以，食堂便宜，适合想攒钱的人。",
      original_url: "https://www.xiaohongshu.com",
      published_at: "2026-06-01",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
  ],
  2: [
    {
      id: 201,
      company_id: 2,
      source: "maimai",
      sentiment: "positive",
      content_summary: "技术培训很系统，能学到东西，薪资在制造业里算高的。",
      original_url: "https://maimai.cn",
      published_at: "2026-03-10",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 202,
      company_id: 2,
      source: "xiaohongshu",
      sentiment: "neutral",
      content_summary: "临港工厂加班确实多，但加班费给足，适合短期攒钱。",
      original_url: "https://www.xiaohongshu.com",
      published_at: "2026-04-22",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 203,
      company_id: 2,
      source: "zhihu",
      sentiment: "negative",
      content_summary: "KPI压力大，末位淘汰明显，身体吃不消。",
      original_url: "https://www.zhihu.com",
      published_at: "2026-05-18",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 204,
      company_id: 2,
      source: "linkedin",
      sentiment: "positive",
      content_summary: "全球化视野，流程规范，对工程师是很好跳板。",
      original_url: "https://www.linkedin.com",
      published_at: "2026-06-05",
      audit_status: "pending",
      created_at: "2026-07-01T00:00:00Z",
    },
  ],
  3: [
    {
      id: 301,
      company_id: 3,
      source: "linkedin",
      sentiment: "positive",
      content_summary: "外企氛围，尊重员工，年假多，适合追求稳定的人。",
      original_url: "https://www.linkedin.com",
      published_at: "2026-02-28",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 302,
      company_id: 3,
      source: "maimai",
      sentiment: "neutral",
      content_summary: "薪资不算最高，但福利折算后还可以，晋升要看机遇。",
      original_url: "https://maimai.cn",
      published_at: "2026-04-10",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 303,
      company_id: 3,
      source: "kanzhun",
      sentiment: "positive",
      content_summary: "培训体系很完善，管培生项目含金量高。",
      original_url: "https://www.kanzhun.com",
      published_at: "2026-05-30",
      audit_status: "approved",
      created_at: "2026-07-01T00:00:00Z",
    },
  ],
};

function determineTrafficLight(score: number): import("./types").TrafficLightLevel {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

function getDimensionMetric(
  companyId: number,
  key: import("./types").DimensionKey,
  metricName: string
): unknown {
  const dims = MOCK_DIMENSIONS[companyId]?.dimensions || [];
  const dim = dims.find((d) => d.dimension_key === key);
  return dim?.metrics?.[metricName] ?? null;
}

export function buildMockSummary(companyId: number): CompanySummaryResponse | null {
  const company = MOCK_COMPANIES.find((c) => c.id === companyId);
  const dims = MOCK_DIMENSIONS[companyId]?.dimensions;
  if (!company || !dims) return null;

  const dimensions = [
    "basic",
    "compensation",
    "welfare",
    "worklife",
    "growth",
    "reputation",
  ].map((key) => {
    const dim = dims.find((d) => d.dimension_key === key);
    const score = dim?.score ?? 0;
    return {
      key: key as import("./types").DimensionKey,
      label: {
        basic: "企业基本面",
        compensation: "薪酬竞争力",
        welfare: "福利保障",
        worklife: "工作节奏",
        growth: "成长与制度",
        reputation: "真实口碑",
      }[key as import("./types").DimensionKey],
      level: dim?.level ?? determineTrafficLight(score),
      score,
    };
  });

  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  );

  return {
    company_id: company.id,
    name: company.name,
    overall_score: overallScore,
    dimensions,
  };
}

export function buildMockAnalysis(companyId: number): CompanyAnalysisResponse | null {
  const company = MOCK_COMPANIES.find((c) => c.id === companyId);
  if (!company) return null;

  const salaryRange = (getDimensionMetric(companyId, "compensation", "real_salary_range") as
    | { median_monthly_take_home?: number }
    | undefined) || { median_monthly_take_home: 12000 };
  const overtime = (getDimensionMetric(companyId, "worklife", "avg_overtime_hours") as
    | number
    | undefined) ?? 40;

  const monthlyTakeHome = Number(salaryRange.median_monthly_take_home ?? 12000);
  const avgOvertime = Number(overtime);
  const monthlyWorkHours = 21.75 * 8 + avgOvertime;
  const hourlyWage = monthlyTakeHome / monthlyWorkHours;
  const industryP50 = (company.industry || "").includes("制造") ? 50 : 70;

  let percentile = 25;
  let verdict = "表面薪资可观，但折算真实时薪后低于行业 P50";
  if (hourlyWage >= industryP50 * 1.2) {
    percentile = 75;
    verdict = "高薪伴随高强度加班，真实时薪仍显著高于行业 P50";
  } else if (hourlyWage >= industryP50) {
    percentile = 60;
    verdict = "真实时薪高于行业 P50，但加班强度不可忽视";
  } else if (hourlyWage >= industryP50 * 0.8) {
    percentile = 40;
    verdict = "真实时薪接近行业 P50，性价比一般";
  }

  return {
    company_id: company.id,
    real_hourly_wage: {
      monthly_take_home: monthlyTakeHome,
      monthly_work_hours: Math.round(monthlyWorkHours * 10) / 10,
      hourly_wage: Math.round(hourlyWage * 10) / 10,
      industry_p50_hourly: industryP50,
      percentile,
      verdict,
    },
    surface_vs_kitchen: {
      surface:
        (getDimensionMetric(companyId, "basic", "industry_status") as string | undefined) ||
        `${company.name} 为行业知名公司`,
      kitchen:
        (getDimensionMetric(companyId, "reputation", "former_review_summary") as string | undefined) ||
        "内部反馈褒贬不一，需关注岗位差异",
      insight: `${company.industry || "该行业"} 赛道竞争激烈，品牌光环与实际工作强度并存，建议结合真实时薪与岗位具体情况判断`,
    },
    growth_forecast_3y: {
      track_potential:
        (getDimensionMetric(companyId, "growth", "track_potential") as string | undefined) || "中",
      promotion_path:
        (getDimensionMetric(companyId, "growth", "promotion_path") as string | undefined) ||
        "晋升路径待核实",
      forecast:
        (getDimensionMetric(companyId, "growth", "track_potential") as string | undefined) ===
        "高"
          ? "3 年后具备行业溢价能力，跳槽空间较大"
          : "3 年后具备行业平均水平竞争力",
    },
  };
}

export function buildMockCompare(companyIds: number[]): CompareResponse {
  const companies = companyIds
    .map((id) => {
      const company = MOCK_COMPANIES.find((c) => c.id === id);
      const summary = buildMockSummary(id);
      if (!company || !summary) return null;
      return {
        company_id: company.id,
        name: company.name,
        short_name: company.short_name,
        industry: company.industry || "",
        overall_score: summary.overall_score,
        dimensions: summary.dimensions,
      };
    })
    .filter(Boolean) as CompareResponse["companies"];

  return {
    companies,
    dimension_keys: ["basic", "compensation", "welfare", "worklife", "growth", "reputation"],
  };
}

export function searchMockCompanies(q: string): CompanyListItem[] {
  const keyword = q.trim().toLowerCase();
  if (!keyword) {
    return MOCK_COMPANIES.filter((c) => c.status === "active").map(toListItem);
  }
  return MOCK_COMPANIES.filter(
    (c) =>
      c.status === "active" &&
      (c.name.toLowerCase().includes(keyword) ||
        c.short_name.toLowerCase().includes(keyword) ||
        (c.en_name?.toLowerCase().includes(keyword) ?? false) ||
        (c.industry?.toLowerCase().includes(keyword) ?? false))
  ).map(toListItem);
}

function toListItem(company: Company): CompanyListItem {
  return {
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
}
