-- 真职（Zjob）Phase 1 种子数据 SQL
-- 等价于 seed/seed.py + seed/seed_companies.json 的纯 SQL 版本
-- 可直接通过 psql 导入：psql -U zjob -d zjob_db -f server/seed/seed_data.sql
-- 数据来源：packages/mobile/src/utils/mockData.ts（已删除）
-- 注意：依赖 server/app/models 中的表结构与枚举类型，建议先运行 Base.metadata.create_all 或 Alembic 迁移后再导入

BEGIN;

-- ============ 清理旧数据（如存在） ============
TRUNCATE TABLE reviews RESTART IDENTITY CASCADE;
TRUNCATE TABLE dimension_data RESTART IDENTITY CASCADE;
TRUNCATE TABLE companies RESTART IDENTITY CASCADE;

-- ============ 公司 ============
INSERT INTO companies (
  id, name, short_name, en_name, industry, scale, location, logo_url,
  is_listed, stock_code, fortune500_trend, industry_ranking, tags,
  status, source_urls, created_at, updated_at
) VALUES
(
  1,
  '立讯精密工业股份有限公司',
  '立讯精密',
  'Luxshare Precision Industry Co., Ltd.',
  '电子制造 / 消费电子精密制造',
  '10万人以上',
  '东莞、深圳、昆山',
  'https://via.placeholder.com/120?text=Luxshare',
  true,
  '002475.SZ',
  '{"2022":null,"2023":null,"2024":null,"2025":null,"2026":null}'::jsonb,
  '全球消费电子精密制造龙头，苹果核心供应商',
  '["果链","电子制造","大厂","上市公司"]'::jsonb,
  'active',
  '{"official":"https://www.luxshare-ict.com","exchange":"https://www.szse.cn"}'::jsonb,
  '2026-07-01T00:00:00+00:00',
  '2026-07-01T00:00:00+00:00'
),
(
  2,
  '特斯拉（上海）有限公司',
  '特斯拉上海',
  'Tesla (Shanghai) Co., Ltd.',
  '新能源汽车制造',
  '1-5万人',
  '上海临港',
  'https://via.placeholder.com/120?text=Tesla',
  true,
  'TSLA (NASDAQ)',
  '{"2022":392,"2023":152,"2024":128,"2025":110,"2026":95}'::jsonb,
  '全球新能源汽车头部企业，上海超级工厂产能全球领先',
  '["新能源汽车","500强","外资","上海"]'::jsonb,
  'active',
  '{"official":"https://www.tesla.cn","exchange":"https://www.nasdaq.com"}'::jsonb,
  '2026-07-01T00:00:00+00:00',
  '2026-07-01T00:00:00+00:00'
),
(
  3,
  '达能中国',
  '达能',
  'Danone China',
  '食品饮料 / 快消',
  '1-5万人',
  '上海',
  'https://via.placeholder.com/120?text=Danone',
  true,
  'BN (Euronext)',
  '{"2022":null,"2023":null,"2024":null,"2025":null,"2026":null}'::jsonb,
  '全球食品饮料巨头，中国婴幼儿营养品与饮用水市场领先',
  '["快消","外资","食品饮料","上海"]'::jsonb,
  'active',
  '{"official":"https://www.danone.com","exchange":"https://www.euronext.com"}'::jsonb,
  '2026-07-01T00:00:00+00:00',
  '2026-07-01T00:00:00+00:00'
);

-- ============ 维度数据 ============
INSERT INTO dimension_data (
  id, company_id, dimension_key, score, level, summary, metrics, source_note, updated_at
) VALUES
-- 公司 1：立讯精密
(
  1, 1, 'basic', 78, 'yellow',
  '苹果核心供应商，规模庞大、上市透明，但世界500强尚未入榜，处于景气赛道但毛利承压。',
  '{
    "scale_level": "大厂（10万人以上）",
    "listed_info": "深交所主板，股票代码 002475.SZ",
    "fortune500_5y": "近5年未入榜世界500强",
    "industry_status": "全球消费电子精密制造龙头，苹果核心供应链"
  }'::jsonb,
  '公司年报、深交所公告、公开财报',
  '2026-07-01T00:00:00+00:00'
),
(
  2, 1, 'compensation', 62, 'yellow',
  '普工月薪到手约8,500元，处于行业P50，但薪资结构中绩效占比较高，淡旺季波动大。',
  '{
    "real_salary_range": {"median_monthly_take_home": 8500, "range": "6000-12000"},
    "salary_structure": {"base": 0.7, "performance": 0.2, "bonus": 0.1},
    "percentile": "P50",
    "severance_rule": "N+1，依法缴纳"
  }'::jsonb,
  '看准网、Boss直聘招聘JD、内部反馈',
  '2026-07-01T00:00:00+00:00'
),
(
  3, 1, 'welfare', 58, 'red',
  '五险一金多按最低基数缴纳，有餐补和宿舍，但整体福利保障在大型制造企业中偏弱。',
  '{
    "social_insurance_base": "多数岗位按最低基数缴纳",
    "commercial_insurance": "补充医疗（部分岗位）",
    "annual_leave_days": 5,
    "subsidies": ["餐补", "员工宿舍", "夜班补贴"]
  }'::jsonb,
  '招聘JD、员工反馈、脉脉',
  '2026-07-01T00:00:00+00:00'
),
(
  4, 1, 'worklife', 52, 'red',
  '产线岗位月均加班约60小时，旺季存在强制加班，工作节奏快，真实时薪被摊薄。',
  '{
    "avg_overtime_hours": 60,
    "overtime_culture": "产线旺季强制加班，管理严格",
    "overtime_pay": "按法定标准支付加班费",
    "after_work_disturbance": "较低，下班基本无工作消息"
  }'::jsonb,
  '脉脉、看准网、小红书',
  '2026-07-01T00:00:00+00:00'
),
(
  5, 1, 'growth', 65, 'yellow',
  '晋升周期1-2年，有岗位技能培训，但内部转岗机会有限，消费电子赛道增速放缓。',
  '{
    "promotion_cycle": "1-2年",
    "training_system": "入职培训 + 岗位技能培训",
    "internal_mobility": "有限，需内部竞聘",
    "track_potential": "中"
  }'::jsonb,
  '公司官网、招聘JD、脉脉',
  '2026-07-01T00:00:00+00:00'
),
(
  6, 1, 'reputation', 60, 'yellow',
  '在职员工认为工作稳定但枯燥；离职员工反馈管理严格、流动性大，旺季招工争议时有发生。',
  '{
    "active_review_summary": "工作稳定，但重复性高、枯燥",
    "former_review_summary": "管理严格，流水线压力大，流动性高",
    "turnover_rate": 0.25,
    "negative_events": "旺季招工、劳务派遣争议"
  }'::jsonb,
  '脉脉、看准网、知乎、小红书',
  '2026-07-01T00:00:00+00:00'
),
-- 公司 2：特斯拉上海
(
  7, 2, 'basic', 88, 'green',
  '世界500强排名持续上升，上海超级工厂是全球产能标杆，技术领先、品牌强势。',
  '{
    "scale_level": "中大型（1-5万人）",
    "listed_info": "NASDAQ 上市，股票代码 TSLA",
    "fortune500_5y": "392→152→128→110→95，持续上升",
    "industry_status": "全球新能源汽车头部，上海超级工厂产能领先"
  }'::jsonb,
  '财富500强榜单、公司年报、公开财报',
  '2026-07-01T00:00:00+00:00'
),
(
  8, 2, 'compensation', 85, 'green',
  '一线技术工人月薪到手约18,500元，处于行业P75，年终奖与股票期权对核心岗位有吸引力。',
  '{
    "real_salary_range": {"median_monthly_take_home": 18500, "range": "12000-28000"},
    "salary_structure": {"base": 0.75, "performance": 0.15, "stock": 0.1},
    "percentile": "P75",
    "severance_rule": "N+1，部分岗位有竞业限制"
  }'::jsonb,
  '看准网、脉脉、Boss直聘',
  '2026-07-01T00:00:00+00:00'
),
(
  9, 2, 'welfare', 72, 'yellow',
  '五险一金按实际工资缴纳，补充商业保险覆盖较全，但年假与补贴在制造业中属中等水平。',
  '{
    "social_insurance_base": "按实际工资全额缴纳",
    "commercial_insurance": "补充医疗 + 意外险 + 家属医疗",
    "annual_leave_days": 10,
    "subsidies": ["餐补", "交通补贴", "夜班补贴"]
  }'::jsonb,
  '公司官网、员工反馈、脉脉',
  '2026-07-01T00:00:00+00:00'
),
(
  10, 2, 'worklife', 68, 'yellow',
  '产线节奏快，月均加班约40小时，加班费按法定支付，下班打扰较少，整体工作强度偏高。',
  '{
    "avg_overtime_hours": 40,
    "overtime_culture": "目标导向，旺季加班较多",
    "overtime_pay": "按法定标准支付",
    "after_work_disturbance": "较低"
  }'::jsonb,
  '脉脉、小红书、看准网',
  '2026-07-01T00:00:00+00:00'
),
(
  11, 2, 'growth', 80, 'green',
  '技术与管理双通道晋升较清晰，培训体系完善，新能源赛道潜力高，3年后具备行业溢价能力。',
  '{
    "promotion_cycle": "1-2年",
    "training_system": "入职培训 + 技术认证 + 海外轮岗机会",
    "internal_mobility": "较多，跨工厂/跨部门机会",
    "track_potential": "高"
  }'::jsonb,
  '公司官网、LinkedIn、脉脉',
  '2026-07-01T00:00:00+00:00'
),
(
  12, 2, 'reputation', 75, 'yellow',
  '在职员工认可品牌光环与技术成长；部分岗位反馈工作强度大、KPI压力大，离职员工两极分化。',
  '{
    "active_review_summary": "技术前沿、成长快、品牌光环强",
    "former_review_summary": "工作强度大，KPI严格，部分岗位流动性高",
    "turnover_rate": 0.18,
    "negative_events": "产线节奏与裁员传闻偶有报道"
  }'::jsonb,
  '脉脉、LinkedIn、知乎、小红书',
  '2026-07-01T00:00:00+00:00'
),
-- 公司 3：达能中国
(
  13, 3, 'basic', 82, 'green',
  '全球食品饮料巨头，品牌历史悠久，中国业务稳健，虽非世界500强但行业地位稳固。',
  '{
    "scale_level": "中大型（1-5万人）",
    "listed_info": "巴黎泛欧交易所上市，股票代码 BN",
    "fortune500_5y": "近5年未入榜世界500强",
    "industry_status": "全球食品饮料巨头，中国婴幼儿营养品与饮用水市场领先"
  }'::jsonb,
  '公司年报、Euronext公告',
  '2026-07-01T00:00:00+00:00'
),
(
  14, 3, 'compensation', 70, 'yellow',
  '市场岗位月薪到手约14,000元，处于行业P50-P75，福利折现后整体报酬具备竞争力。',
  '{
    "real_salary_range": {"median_monthly_take_home": 14000, "range": "10000-22000"},
    "salary_structure": {"base": 0.8, "performance": 0.15, "bonus": 0.05},
    "percentile": "P60",
    "severance_rule": "N+1，法定标准"
  }'::jsonb,
  '看准网、脉脉、LinkedIn',
  '2026-07-01T00:00:00+00:00'
),
(
  15, 3, 'welfare', 85, 'green',
  '五险一金足额缴纳，商业保险覆盖家属，年假15天起，弹性福利平台完善。',
  '{
    "social_insurance_base": "按实际工资全额缴纳",
    "commercial_insurance": "补充医疗 + 意外险 + 家属医疗",
    "annual_leave_days": 15,
    "subsidies": ["餐补", "交通补贴", "通讯补贴", "节日礼金", "弹性福利积分"]
  }'::jsonb,
  '公司官网、员工反馈、脉脉',
  '2026-07-01T00:00:00+00:00'
),
(
  16, 3, 'worklife', 78, 'yellow',
  '整体加班文化温和，月均加班约20小时，支持部分岗位弹性办公，工作与生活平衡较好。',
  '{
    "avg_overtime_hours": 20,
    "overtime_culture": "温和，业务节点偶有加班",
    "overtime_pay": "可申请调休或加班费",
    "after_work_disturbance": "低，尊重下班时间"
  }'::jsonb,
  '脉脉、小红书、看准网',
  '2026-07-01T00:00:00+00:00'
),
(
  17, 3, 'growth', 76, 'green',
  '管培生体系成熟，晋升路径清晰，培训资源丰富，快消赛道稳定但增长放缓。',
  '{
    "promotion_cycle": "2-3年",
    "training_system": "达能学院 + 管培轮岗 + 海外交流",
    "internal_mobility": "较多，跨品牌/跨职能机会",
    "track_potential": "中"
  }'::jsonb,
  '公司官网、LinkedIn、脉脉',
  '2026-07-01T00:00:00+00:00'
),
(
  18, 3, 'reputation', 80, 'green',
  '在职员工认可企业文化与人性化管理，离职员工评价整体正面，雇主品牌较好。',
  '{
    "active_review_summary": "企业文化好，管理人性化，福利到位",
    "former_review_summary": "平台大但晋升偏慢，适合长期稳定发展",
    "turnover_rate": 0.12,
    "negative_events": "暂无重大负面事件"
  }'::jsonb,
  '脉脉、LinkedIn、看准网',
  '2026-07-01T00:00:00+00:00'
);

-- ============ 口碑评论 ============
INSERT INTO reviews (
  id, company_id, source, sentiment, content_summary, original_url,
  published_at, audit_status, created_at
) VALUES
-- 公司 1：立讯精密
(
  1, 1, 'kanzhun', 'neutral',
  '普工到手8k左右，加班多，旺季能过万，但累是真的累。',
  'https://www.kanzhun.com',
  '2026-04-15', 'approved', '2026-07-01T00:00:00+00:00'
),
(
  2, 1, 'maimai', 'negative',
  '管理很严，流水线节奏快，干一年就换了一批人。',
  'https://maimai.cn',
  '2026-05-20', 'approved', '2026-07-01T00:00:00+00:00'
),
(
  3, 1, 'xiaohongshu', 'positive',
  '宿舍环境还可以，食堂便宜，适合想攒钱的人。',
  'https://www.xiaohongshu.com',
  '2026-06-01', 'approved', '2026-07-01T00:00:00+00:00'
),
-- 公司 2：特斯拉上海
(
  4, 2, 'maimai', 'positive',
  '技术培训很系统，能学到东西，薪资在制造业里算高的。',
  'https://maimai.cn',
  '2026-03-10', 'approved', '2026-07-01T00:00:00+00:00'
),
(
  5, 2, 'xiaohongshu', 'neutral',
  '临港工厂加班确实多，但加班费给足，适合短期攒钱。',
  'https://www.xiaohongshu.com',
  '2026-04-22', 'approved', '2026-07-01T00:00:00+00:00'
),
(
  6, 2, 'zhihu', 'negative',
  'KPI压力大，末位淘汰明显，身体吃不消。',
  'https://www.zhihu.com',
  '2026-05-18', 'approved', '2026-07-01T00:00:00+00:00'
),
(
  7, 2, 'linkedin', 'positive',
  '全球化视野，流程规范，对工程师是很好跳板。',
  'https://www.linkedin.com',
  '2026-06-05', 'pending', '2026-07-01T00:00:00+00:00'
),
-- 公司 3：达能中国
(
  8, 3, 'linkedin', 'positive',
  '外企氛围，尊重员工，年假多，适合追求稳定的人。',
  'https://www.linkedin.com',
  '2026-02-28', 'approved', '2026-07-01T00:00:00+00:00'
),
(
  9, 3, 'maimai', 'neutral',
  '薪资不算最高，但福利折算后还可以，晋升要看机遇。',
  'https://maimai.cn',
  '2026-04-10', 'approved', '2026-07-01T00:00:00+00:00'
),
(
  10, 3, 'kanzhun', 'positive',
  '培训体系很完善，管培生项目含金量高。',
  'https://www.kanzhun.com',
  '2026-05-30', 'approved', '2026-07-01T00:00:00+00:00'
);

-- ============ 重置序列，避免后续自增主键冲突 ============
SELECT setval('companies_id_seq',       (SELECT COALESCE(MAX(id), 1) FROM companies));
SELECT setval('dimension_data_id_seq',  (SELECT COALESCE(MAX(id), 1) FROM dimension_data));
SELECT setval('reviews_id_seq',         (SELECT COALESCE(MAX(id), 1) FROM reviews));

COMMIT;

-- ============ 校验 ============
-- SELECT COUNT(*) AS companies_count      FROM companies;
-- SELECT COUNT(*) AS dimension_data_count FROM dimension_data;
-- SELECT COUNT(*) AS reviews_count        FROM reviews;
