import type {
  Company,
  CompanyListItem,
  CompanySummaryResponse,
  CompanyDimensionsResponse,
  CompanyAnalysisResponse,
  Review,
  CompareResponse,
  AuditLog,
  TokenResponse,
  DimensionKey,
} from "./types";

export const MOCK_COMPANIES: Company[] = [
    {
      "id": 1,
      "name": "立讯精密工业股份有限公司",
      "short_name": "立讯精密",
      "en_name": "Luxshare Precision Industry Co., Ltd.",
      "industry": "电子制造 / 消费电子精密制造",
      "scale": "10万人以上",
      "location": "东莞、深圳、昆山",
      "logo_url": "https://via.placeholder.com/120?text=Luxshare",
      "is_listed": true,
      "stock_code": "002475.SZ",
      "fortune500_trend": {
        "2022": null,
        "2023": null,
        "2024": null,
        "2025": null,
        "2026": null
      },
      "industry_ranking": "全球消费电子精密制造龙头，苹果核心供应商",
      "tags": [
        "果链",
        "电子制造",
        "大厂",
        "上市公司"
      ],
      "status": "active",
      "source_urls": {
        "official": "https://www.luxshare-ict.com",
        "exchange": "https://www.szse.cn"
      },
      "created_at": "2026-07-30T17:05:10.869Z",
      "updated_at": "2026-07-30T17:05:10.872Z"
    },
    {
      "id": 2,
      "name": "特斯拉（上海）有限公司",
      "short_name": "特斯拉上海",
      "en_name": "Tesla (Shanghai) Co., Ltd.",
      "industry": "新能源汽车制造",
      "scale": "1-5万人",
      "location": "上海临港",
      "logo_url": "https://via.placeholder.com/120?text=Tesla",
      "is_listed": true,
      "stock_code": "TSLA (NASDAQ)",
      "fortune500_trend": {
        "2022": 392,
        "2023": 152,
        "2024": 128,
        "2025": 110,
        "2026": 95
      },
      "industry_ranking": "全球新能源汽车头部企业，上海超级工厂产能全球领先",
      "tags": [
        "新能源汽车",
        "500强",
        "外资",
        "上海"
      ],
      "status": "active",
      "source_urls": {
        "official": "https://www.tesla.cn",
        "exchange": "https://www.nasdaq.com"
      },
      "created_at": "2026-07-30T17:05:10.873Z",
      "updated_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 3,
      "name": "达能中国",
      "short_name": "达能",
      "en_name": "Danone China",
      "industry": "食品饮料 / 快消",
      "scale": "1-5万人",
      "location": "上海",
      "logo_url": "https://via.placeholder.com/120?text=Danone",
      "is_listed": true,
      "stock_code": "BN (Euronext)",
      "fortune500_trend": {
        "2022": null,
        "2023": null,
        "2024": null,
        "2025": null,
        "2026": null
      },
      "industry_ranking": "全球食品饮料巨头，中国婴幼儿营养品与饮用水市场领先",
      "tags": [
        "快消",
        "外资",
        "食品饮料",
        "上海"
      ],
      "status": "active",
      "source_urls": {
        "official": "https://www.danone.com",
        "exchange": "https://www.euronext.com"
      },
      "created_at": "2026-07-30T17:05:10.873Z",
      "updated_at": "2026-07-30T17:05:10.873Z"
    }
  ];

export const MOCK_DIMENSIONS: Record<number, CompanyDimensionsResponse> = {
  1: {
    company_id: 1,
    name: "立讯精密工业股份有限公司",
    dimensions: [
          {
            "id": 1,
            "company_id": 1,
            "dimension_key": "basic",
            "score": 78,
            "level": "yellow",
            "summary": "苹果核心供应商，规模庞大、上市透明，但世界500强尚未入榜，处于景气赛道但毛利承压。",
            "metrics": {
              "scale_level": "大厂（10万人以上）",
              "listed_info": "深交所主板，股票代码 002475.SZ",
              "fortune500_5y": "近5年未入榜世界500强",
              "industry_status": "全球消费电子精密制造龙头，苹果核心供应链"
            },
            "source_note": "公司年报、深交所公告、公开财报",
            "updated_at": "2026-07-30T17:05:10.872Z"
          },
          {
            "id": 2,
            "company_id": 1,
            "dimension_key": "compensation",
            "score": 62,
            "level": "yellow",
            "summary": "普工月薪到手约8,500元，处于行业P50，但薪资结构中绩效占比较高，淡旺季波动大。",
            "metrics": {
              "real_salary_range": {
                "median_monthly_take_home": 8500,
                "range": "6000-12000"
              },
              "salary_structure": {
                "base": 0.7,
                "performance": 0.2,
                "bonus": 0.1
              },
              "percentile": "P50",
              "severance_rule": "N+1，依法缴纳"
            },
            "source_note": "看准网、Boss直聘招聘JD、内部反馈",
            "updated_at": "2026-07-30T17:05:10.872Z"
          },
          {
            "id": 3,
            "company_id": 1,
            "dimension_key": "welfare",
            "score": 58,
            "level": "red",
            "summary": "五险一金多按最低基数缴纳，有餐补和宿舍，但整体福利保障在大型制造企业中偏弱。",
            "metrics": {
              "social_insurance_base": "多数岗位按最低基数缴纳",
              "commercial_insurance": "补充医疗（部分岗位）",
              "annual_leave_days": 5,
              "subsidies": [
                "餐补",
                "员工宿舍",
                "夜班补贴"
              ]
            },
            "source_note": "招聘JD、员工反馈、脉脉",
            "updated_at": "2026-07-30T17:05:10.872Z"
          },
          {
            "id": 4,
            "company_id": 1,
            "dimension_key": "worklife",
            "score": 52,
            "level": "red",
            "summary": "产线岗位月均加班约60小时，旺季存在强制加班，工作节奏快，真实时薪被摊薄。",
            "metrics": {
              "avg_overtime_hours": 60,
              "overtime_culture": "产线旺季强制加班，管理严格",
              "overtime_pay": "按法定标准支付加班费",
              "after_work_disturbance": "较低，下班基本无工作消息"
            },
            "source_note": "脉脉、看准网、小红书",
            "updated_at": "2026-07-30T17:05:10.872Z"
          },
          {
            "id": 5,
            "company_id": 1,
            "dimension_key": "growth",
            "score": 65,
            "level": "yellow",
            "summary": "晋升周期1-2年，有岗位技能培训，但内部转岗机会有限，消费电子赛道增速放缓。",
            "metrics": {
              "promotion_cycle": "1-2年",
              "training_system": "入职培训 + 岗位技能培训",
              "internal_mobility": "有限，需内部竞聘",
              "track_potential": "中"
            },
            "source_note": "公司官网、招聘JD、脉脉",
            "updated_at": "2026-07-30T17:05:10.872Z"
          },
          {
            "id": 6,
            "company_id": 1,
            "dimension_key": "reputation",
            "score": 60,
            "level": "yellow",
            "summary": "在职员工认为工作稳定但枯燥；离职员工反馈管理严格、流动性大，旺季招工争议时有发生。",
            "metrics": {
              "active_review_summary": "工作稳定，但重复性高、枯燥",
              "former_review_summary": "管理严格，流水线压力大，流动性高",
              "turnover_rate": 0.25,
              "negative_events": "旺季招工、劳务派遣争议"
            },
            "source_note": "脉脉、看准网、知乎、小红书",
            "updated_at": "2026-07-30T17:05:10.872Z"
          }
        ],
  },
  2: {
    company_id: 2,
    name: "特斯拉（上海）有限公司",
    dimensions: [
          {
            "id": 7,
            "company_id": 2,
            "dimension_key": "basic",
            "score": 88,
            "level": "green",
            "summary": "世界500强排名持续上升，上海超级工厂是全球产能标杆，技术领先、品牌强势。",
            "metrics": {
              "scale_level": "中大型（1-5万人）",
              "listed_info": "NASDAQ 上市，股票代码 TSLA",
              "fortune500_5y": "392→152→128→110→95，持续上升",
              "industry_status": "全球新能源汽车头部，上海超级工厂产能领先"
            },
            "source_note": "财富500强榜单、公司年报、公开财报",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 8,
            "company_id": 2,
            "dimension_key": "compensation",
            "score": 85,
            "level": "green",
            "summary": "一线技术工人月薪到手约18,500元，处于行业P75，年终奖与股票期权对核心岗位有吸引力。",
            "metrics": {
              "real_salary_range": {
                "median_monthly_take_home": 18500,
                "range": "12000-28000"
              },
              "salary_structure": {
                "base": 0.75,
                "performance": 0.15,
                "stock": 0.1
              },
              "percentile": "P75",
              "severance_rule": "N+1，部分岗位有竞业限制"
            },
            "source_note": "看准网、脉脉、Boss直聘",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 9,
            "company_id": 2,
            "dimension_key": "welfare",
            "score": 72,
            "level": "yellow",
            "summary": "五险一金按实际工资缴纳，补充商业保险覆盖较全，但年假与补贴在制造业中属中等水平。",
            "metrics": {
              "social_insurance_base": "按实际工资全额缴纳",
              "commercial_insurance": "补充医疗 + 意外险 + 家属医疗",
              "annual_leave_days": 10,
              "subsidies": [
                "餐补",
                "交通补贴",
                "夜班补贴"
              ]
            },
            "source_note": "公司官网、员工反馈、脉脉",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 10,
            "company_id": 2,
            "dimension_key": "worklife",
            "score": 68,
            "level": "yellow",
            "summary": "产线节奏快，月均加班约40小时，加班费按法定支付，下班打扰较少，整体工作强度偏高。",
            "metrics": {
              "avg_overtime_hours": 40,
              "overtime_culture": "目标导向，旺季加班较多",
              "overtime_pay": "按法定标准支付",
              "after_work_disturbance": "较低"
            },
            "source_note": "脉脉、小红书、看准网",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 11,
            "company_id": 2,
            "dimension_key": "growth",
            "score": 80,
            "level": "green",
            "summary": "技术与管理双通道晋升较清晰，培训体系完善，新能源赛道潜力高，3年后具备行业溢价能力。",
            "metrics": {
              "promotion_cycle": "1-2年",
              "training_system": "入职培训 + 技术认证 + 海外轮岗机会",
              "internal_mobility": "较多，跨工厂/跨部门机会",
              "track_potential": "高"
            },
            "source_note": "公司官网、LinkedIn、脉脉",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 12,
            "company_id": 2,
            "dimension_key": "reputation",
            "score": 75,
            "level": "yellow",
            "summary": "在职员工认可品牌光环与技术成长；部分岗位反馈工作强度大、KPI压力大，离职员工两极分化。",
            "metrics": {
              "active_review_summary": "技术前沿、成长快、品牌光环强",
              "former_review_summary": "工作强度大，KPI严格，部分岗位流动性高",
              "turnover_rate": 0.18,
              "negative_events": "产线节奏与裁员传闻偶有报道"
            },
            "source_note": "脉脉、LinkedIn、知乎、小红书",
            "updated_at": "2026-07-30T17:05:10.873Z"
          }
        ],
  },
  3: {
    company_id: 3,
    name: "达能中国",
    dimensions: [
          {
            "id": 13,
            "company_id": 3,
            "dimension_key": "basic",
            "score": 82,
            "level": "green",
            "summary": "全球食品饮料巨头，品牌历史悠久，中国业务稳健，虽非世界500强但行业地位稳固。",
            "metrics": {
              "scale_level": "中大型（1-5万人）",
              "listed_info": "巴黎泛欧交易所上市，股票代码 BN",
              "fortune500_5y": "近5年未入榜世界500强",
              "industry_status": "全球食品饮料巨头，中国婴幼儿营养品与饮用水市场领先"
            },
            "source_note": "公司年报、Euronext公告",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 14,
            "company_id": 3,
            "dimension_key": "compensation",
            "score": 70,
            "level": "yellow",
            "summary": "市场岗位月薪到手约14,000元，处于行业P50-P75，福利折现后整体报酬具备竞争力。",
            "metrics": {
              "real_salary_range": {
                "median_monthly_take_home": 14000,
                "range": "10000-22000"
              },
              "salary_structure": {
                "base": 0.8,
                "performance": 0.15,
                "bonus": 0.05
              },
              "percentile": "P60",
              "severance_rule": "N+1，法定标准"
            },
            "source_note": "看准网、脉脉、LinkedIn",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 15,
            "company_id": 3,
            "dimension_key": "welfare",
            "score": 85,
            "level": "green",
            "summary": "五险一金足额缴纳，商业保险覆盖家属，年假15天起，弹性福利平台完善。",
            "metrics": {
              "social_insurance_base": "按实际工资全额缴纳",
              "commercial_insurance": "补充医疗 + 意外险 + 家属医疗",
              "annual_leave_days": 15,
              "subsidies": [
                "餐补",
                "交通补贴",
                "通讯补贴",
                "节日礼金",
                "弹性福利积分"
              ]
            },
            "source_note": "公司官网、员工反馈、脉脉",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 16,
            "company_id": 3,
            "dimension_key": "worklife",
            "score": 78,
            "level": "yellow",
            "summary": "整体加班文化温和，月均加班约20小时，支持部分岗位弹性办公，工作与生活平衡较好。",
            "metrics": {
              "avg_overtime_hours": 20,
              "overtime_culture": "温和，业务节点偶有加班",
              "overtime_pay": "可申请调休或加班费",
              "after_work_disturbance": "低，尊重下班时间"
            },
            "source_note": "脉脉、小红书、看准网",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 17,
            "company_id": 3,
            "dimension_key": "growth",
            "score": 76,
            "level": "green",
            "summary": "管培生体系成熟，晋升路径清晰，培训资源丰富，快消赛道稳定但增长放缓。",
            "metrics": {
              "promotion_cycle": "2-3年",
              "training_system": "达能学院 + 管培轮岗 + 海外交流",
              "internal_mobility": "较多，跨品牌/跨职能机会",
              "track_potential": "中"
            },
            "source_note": "公司官网、LinkedIn、脉脉",
            "updated_at": "2026-07-30T17:05:10.873Z"
          },
          {
            "id": 18,
            "company_id": 3,
            "dimension_key": "reputation",
            "score": 80,
            "level": "green",
            "summary": "在职员工认可企业文化与人性化管理，离职员工评价整体正面，雇主品牌较好。",
            "metrics": {
              "active_review_summary": "企业文化好，管理人性化，福利到位",
              "former_review_summary": "平台大但晋升偏慢，适合长期稳定发展",
              "turnover_rate": 0.12,
              "negative_events": "暂无重大负面事件"
            },
            "source_note": "脉脉、LinkedIn、看准网",
            "updated_at": "2026-07-30T17:05:10.873Z"
          }
        ],
  }
};

export const MOCK_SUMMARIES: Record<number, CompanySummaryResponse> = {
  1: {
    "company_id": 1,
    "name": "立讯精密工业股份有限公司",
    "overall_score": 63,
    "dimensions": [
      {
        "key": "basic",
        "label": "企业基本面",
        "level": "yellow",
        "score": 78
      },
      {
        "key": "compensation",
        "label": "薪酬竞争力",
        "level": "yellow",
        "score": 62
      },
      {
        "key": "welfare",
        "label": "福利保障",
        "level": "red",
        "score": 58
      },
      {
        "key": "worklife",
        "label": "工作节奏",
        "level": "red",
        "score": 52
      },
      {
        "key": "growth",
        "label": "成长与制度",
        "level": "yellow",
        "score": 65
      },
      {
        "key": "reputation",
        "label": "真实口碑",
        "level": "yellow",
        "score": 60
      }
    ]
  },
  2: {
    "company_id": 2,
    "name": "特斯拉（上海）有限公司",
    "overall_score": 78,
    "dimensions": [
      {
        "key": "basic",
        "label": "企业基本面",
        "level": "green",
        "score": 88
      },
      {
        "key": "compensation",
        "label": "薪酬竞争力",
        "level": "green",
        "score": 85
      },
      {
        "key": "welfare",
        "label": "福利保障",
        "level": "yellow",
        "score": 72
      },
      {
        "key": "worklife",
        "label": "工作节奏",
        "level": "yellow",
        "score": 68
      },
      {
        "key": "growth",
        "label": "成长与制度",
        "level": "green",
        "score": 80
      },
      {
        "key": "reputation",
        "label": "真实口碑",
        "level": "yellow",
        "score": 75
      }
    ]
  },
  3: {
    "company_id": 3,
    "name": "达能中国",
    "overall_score": 79,
    "dimensions": [
      {
        "key": "basic",
        "label": "企业基本面",
        "level": "green",
        "score": 82
      },
      {
        "key": "compensation",
        "label": "薪酬竞争力",
        "level": "yellow",
        "score": 70
      },
      {
        "key": "welfare",
        "label": "福利保障",
        "level": "green",
        "score": 85
      },
      {
        "key": "worklife",
        "label": "工作节奏",
        "level": "yellow",
        "score": 78
      },
      {
        "key": "growth",
        "label": "成长与制度",
        "level": "green",
        "score": 76
      },
      {
        "key": "reputation",
        "label": "真实口碑",
        "level": "green",
        "score": 80
      }
    ]
  }
};

export const MOCK_ANALYSES: Record<number, CompanyAnalysisResponse> = {
  1: {
    "company_id": 1,
    "real_hourly_wage": {
      "monthly_take_home": 8500,
      "monthly_work_hours": 234,
      "hourly_wage": 36.3,
      "industry_p50_hourly": 31.9,
      "percentile": 47,
      "verdict": "真实时薪 36.3 元高于行业 P50，但需结合加班强度综合判断"
    },
    "surface_vs_kitchen": {
      "surface": "全球消费电子精密制造龙头，苹果核心供应商",
      "kitchen": "在职员工认为工作稳定但枯燥；离职员工反馈管理严格、流动性大，旺季招工争议时有发生。",
      "insight": "品牌光环与实际工作强度并存，建议结合岗位与个人职业规划综合判断。"
    },
    "growth_forecast_3y": {
      "track_potential": "中",
      "promotion_path": "1-2年",
      "forecast": "晋升周期1-2年，有岗位技能培训，但内部转岗机会有限，消费电子赛道增速放缓。"
    }
  },
  2: {
    "company_id": 2,
    "real_hourly_wage": {
      "monthly_take_home": 18500,
      "monthly_work_hours": 214,
      "hourly_wage": 86.4,
      "industry_p50_hourly": 76,
      "percentile": 59,
      "verdict": "真实时薪 86.4 元高于行业 P50，但需结合加班强度综合判断"
    },
    "surface_vs_kitchen": {
      "surface": "全球新能源汽车头部企业，上海超级工厂产能全球领先",
      "kitchen": "在职员工认可品牌光环与技术成长；部分岗位反馈工作强度大、KPI压力大，离职员工两极分化。",
      "insight": "品牌光环与实际工作强度并存，建议结合岗位与个人职业规划综合判断。"
    },
    "growth_forecast_3y": {
      "track_potential": "高",
      "promotion_path": "1-2年",
      "forecast": "技术与管理双通道晋升较清晰，培训体系完善，新能源赛道潜力高，3年后具备行业溢价能力。"
    }
  },
  3: {
    "company_id": 3,
    "real_hourly_wage": {
      "monthly_take_home": 14000,
      "monthly_work_hours": 194,
      "hourly_wage": 72.2,
      "industry_p50_hourly": 63.5,
      "percentile": 59,
      "verdict": "真实时薪 72.2 元高于行业 P50，但需结合加班强度综合判断"
    },
    "surface_vs_kitchen": {
      "surface": "全球食品饮料巨头，中国婴幼儿营养品与饮用水市场领先",
      "kitchen": "在职员工认可企业文化与人性化管理，离职员工评价整体正面，雇主品牌较好。",
      "insight": "品牌光环与实际工作强度并存，建议结合岗位与个人职业规划综合判断。"
    },
    "growth_forecast_3y": {
      "track_potential": "中",
      "promotion_path": "2-3年",
      "forecast": "管培生体系成熟，晋升路径清晰，培训资源丰富，快消赛道稳定但增长放缓。"
    }
  }
};

export const MOCK_REVIEWS: Review[] = [
    {
      "id": 1,
      "company_id": 1,
      "source": "kanzhun",
      "sentiment": "neutral",
      "content_summary": "普工到手8k左右，加班多，旺季能过万，但累是真的累。",
      "original_url": "https://www.kanzhun.com",
      "published_at": "2026-04-15",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 2,
      "company_id": 1,
      "source": "maimai",
      "sentiment": "negative",
      "content_summary": "管理很严，流水线节奏快，干一年就换了一批人。",
      "original_url": "https://maimai.cn",
      "published_at": "2026-05-20",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 3,
      "company_id": 1,
      "source": "xiaohongshu",
      "sentiment": "positive",
      "content_summary": "宿舍环境还可以，食堂便宜，适合想攒钱的人。",
      "original_url": "https://www.xiaohongshu.com",
      "published_at": "2026-06-01",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 4,
      "company_id": 2,
      "source": "maimai",
      "sentiment": "positive",
      "content_summary": "技术培训很系统，能学到东西，薪资在制造业里算高的。",
      "original_url": "https://maimai.cn",
      "published_at": "2026-03-10",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 5,
      "company_id": 2,
      "source": "xiaohongshu",
      "sentiment": "neutral",
      "content_summary": "临港工厂加班确实多，但加班费给足，适合短期攒钱。",
      "original_url": "https://www.xiaohongshu.com",
      "published_at": "2026-04-22",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 6,
      "company_id": 2,
      "source": "zhihu",
      "sentiment": "negative",
      "content_summary": "KPI压力大，末位淘汰明显，身体吃不消。",
      "original_url": "https://www.zhihu.com",
      "published_at": "2026-05-18",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 7,
      "company_id": 2,
      "source": "linkedin",
      "sentiment": "positive",
      "content_summary": "全球化视野，流程规范，对工程师是很好跳板。",
      "original_url": "https://www.linkedin.com",
      "published_at": "2026-06-05",
      "audit_status": "pending",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 8,
      "company_id": 3,
      "source": "linkedin",
      "sentiment": "positive",
      "content_summary": "外企氛围，尊重员工，年假多，适合追求稳定的人。",
      "original_url": "https://www.linkedin.com",
      "published_at": "2026-02-28",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 9,
      "company_id": 3,
      "source": "maimai",
      "sentiment": "neutral",
      "content_summary": "薪资不算最高，但福利折算后还可以，晋升要看机遇。",
      "original_url": "https://maimai.cn",
      "published_at": "2026-04-10",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 10,
      "company_id": 3,
      "source": "kanzhun",
      "sentiment": "positive",
      "content_summary": "培训体系很完善，管培生项目含金量高。",
      "original_url": "https://www.kanzhun.com",
      "published_at": "2026-05-30",
      "audit_status": "approved",
      "created_at": "2026-07-30T17:05:10.873Z"
    }
  ];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
      "id": 1,
      "user_id": 1,
      "username": "admin",
      "action": "create",
      "target_type": "company",
      "target_id": 1,
      "detail": {
        "name": "立讯精密工业股份有限公司"
      },
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "username": "admin",
      "action": "create",
      "target_type": "company",
      "target_id": 2,
      "detail": {
        "name": "特斯拉（上海）有限公司"
      },
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 3,
      "user_id": 1,
      "username": "admin",
      "action": "create",
      "target_type": "company",
      "target_id": 3,
      "detail": {
        "name": "达能中国"
      },
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 4,
      "user_id": 2,
      "username": "operator",
      "action": "approve",
      "target_type": "review",
      "target_id": 1,
      "detail": {
        "source": "kanzhun"
      },
      "created_at": "2026-07-30T17:05:10.873Z"
    },
    {
      "id": 5,
      "user_id": 2,
      "username": "operator",
      "action": "update",
      "target_type": "dimension",
      "target_id": 2,
      "detail": {
        "dimension_key": "compensation"
      },
      "created_at": "2026-07-30T17:05:10.873Z"
    }
  ];

const dimensionOrder: DimensionKey[] = [
  "basic",
  "compensation",
  "welfare",
  "worklife",
  "growth",
  "reputation",
];

export function mockSearchCompanies(q: string): CompanyListItem[] {
  const query = q.trim().toLowerCase();
  return MOCK_COMPANIES.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.short_name.toLowerCase().includes(query) ||
      c.en_name?.toLowerCase().includes(query) ||
      c.industry?.toLowerCase().includes(query)
  ).map((c) => ({
    id: c.id,
    name: c.name,
    short_name: c.short_name,
    industry: c.industry,
    scale: c.scale,
    location: c.location,
    logo_url: c.logo_url,
    tags: c.tags,
    status: c.status,
  }));
}

export function mockGetCompany(id: number): Company | undefined {
  return MOCK_COMPANIES.find((c) => c.id === id);
}

export function mockGetDimensions(id: number): CompanyDimensionsResponse | undefined {
  return MOCK_DIMENSIONS[id];
}

export function mockGetSummary(id: number): CompanySummaryResponse | undefined {
  return MOCK_SUMMARIES[id];
}

export function mockGetAnalysis(id: number): CompanyAnalysisResponse | undefined {
  return MOCK_ANALYSES[id];
}

export function mockGetReviews(id: number): Review[] {
  return MOCK_REVIEWS.filter((r) => r.company_id === id && r.audit_status === "approved");
}

export function mockCompare(companyIds: number[]): CompareResponse {
  const companies = companyIds
    .map((id) => {
      const c = mockGetCompany(id);
      const summary = mockGetSummary(id);
      if (!c || !summary) return null;
      return {
        company_id: c.id,
        name: c.name,
        short_name: c.short_name,
        industry: c.industry || "",
        overall_score: summary.overall_score,
        dimensions: summary.dimensions,
      };
    })
    .filter(Boolean) as CompareResponse["companies"];

  return {
    companies,
    dimension_keys: dimensionOrder,
  };
}

export function mockLogin(
  username: string,
  password: string
): TokenResponse {
  if (username === "admin" && password === "admin") {
    return {
      access_token: "mock-admin-token",
      token_type: "bearer",
      role: "admin",
    };
  }
  if (username === "operator" && password === "operator") {
    return {
      access_token: "mock-operator-token",
      token_type: "bearer",
      role: "operator",
    };
  }
  throw new Error("用户名或密码错误");
}

export function mockGetAdminCompanies(): Company[] {
  return MOCK_COMPANIES;
}

export function mockGetAdminReviews(): Review[] {
  return MOCK_REVIEWS;
}

export function mockUpdateReview(
  id: number,
  data: Partial<Review>
): Review {
  const review = MOCK_REVIEWS.find((r) => r.id === id);
  if (!review) throw new Error("口碑不存在");
  Object.assign(review, data, { updated_at: new Date().toISOString() });
  return review;
}

export function mockGetAuditLogs(): AuditLog[] {
  return MOCK_AUDIT_LOGS;
}
