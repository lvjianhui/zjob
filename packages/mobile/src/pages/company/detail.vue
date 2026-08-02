<template>
  <view class="page">
    <!-- 顶栏 -->
    <view class="topbar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">&#xe612;</text>
      </view>
      <text class="topbar-title">{{ company?.short_name || company?.name || '公司详情' }}</text>
      <view class="topbar-right" />
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="skeleton-area">
      <view class="skeleton-block" style="height: 200rpx" />
      <view class="skeleton-block" style="height: 300rpx" />
      <view class="skeleton-block" style="height: 400rpx" />
    </view>

    <view v-else-if="company" class="content">
      <!-- 公司头部 -->
      <view class="company-header">
        <view class="company-logo">
          <text class="logo-text">{{ company.short_name?.charAt(0) || company.name.charAt(0) }}</text>
        </view>
        <view class="company-info">
          <text class="company-name">{{ company.name }}</text>
          <text class="company-meta">
            {{ company.industry || '未知行业' }} · {{ company.scale || '未知规模' }}
          </text>
          <text v-if="company.location" class="company-meta">
            {{ company.location }}
          </text>
        </view>
      </view>

      <!-- 红绿灯总览 -->
      <view v-if="summary" class="card">
        <view class="card-header">
          <text class="card-title">六维红绿灯总览</text>
          <view class="overall-score">
            <text class="overall-score-num">{{ (summary.overall_score / 10).toFixed(1) }}</text>
            <text class="overall-score-label">综合评分</text>
          </view>
        </view>
        <view class="traffic-light-grid">
          <view
            v-for="dim in summary.dimensions"
            :key="dim.key"
            class="tl-item"
          >
            <view class="tl-dot" :style="{ backgroundColor: getLevelColor(dim.level) }" />
            <text class="tl-label">{{ dim.label }}</text>
            <text class="tl-score">{{ (dim.score / 10).toFixed(1) }}</text>
          </view>
        </view>
      </view>

      <!-- 六维详情 -->
      <view v-if="dimensions" class="card">
        <text class="card-title">六维度详情</text>
        <view
          v-for="dim in dimensions.dimensions"
          :key="dim.dimension_key"
          class="dim-detail"
        >
          <view class="dim-detail-header">
            <view
              class="dim-detail-icon"
              :style="{
                backgroundColor: getAccentBg(getAccent(dim.dimension_key)),
              }"
            >
              <text
                class="dim-detail-icon-text"
                :style="{ color: getAccentText(getAccent(dim.dimension_key)) }"
              >{{ getDimLabel(dim.dimension_key).charAt(0) }}</text>
            </view>
            <view class="dim-detail-info">
              <text class="dim-detail-title">{{ getDimLabel(dim.dimension_key) }}</text>
              <view class="dim-detail-score-row">
                <view class="score-bar">
                  <view
                    class="score-bar-fill"
                    :style="{
                      width: `${dim.score}%`,
                      backgroundColor: getLevelColor(dim.level),
                    }"
                  />
                </view>
                <text class="dim-detail-score">{{ (dim.score / 10).toFixed(1) }}</text>
              </view>
            </view>
          </view>
          <text v-if="dim.summary" class="dim-detail-summary">{{ dim.summary }}</text>

          <!-- Metrics -->
          <view v-if="dim.metrics" class="metrics-list">
            <view
              v-for="(value, key) in dim.metrics"
              :key="String(key)"
              class="metric-item"
            >
              <text class="metric-label">{{ getMetricLabel(String(key)) }}</text>
              <text class="metric-value">{{ formatMetricValue(value) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 真实时薪分析 -->
      <view v-if="analysis" class="card">
        <text class="card-title">真实时薪分析</text>
        <view class="wage-box">
          <view class="wage-main">
            <text class="wage-amount">¥{{ analysis.real_hourly_wage.hourly_wage.toFixed(0) }}</text>
            <text class="wage-unit">/小时</text>
          </view>
          <view class="wage-meta">
            <view class="wage-meta-item">
              <text class="wage-meta-label">月到手</text>
              <text class="wage-meta-value">¥{{ (analysis.real_hourly_wage.monthly_take_home / 1000).toFixed(1) }}k</text>
            </view>
            <view class="wage-meta-item">
              <text class="wage-meta-label">月工时</text>
              <text class="wage-meta-value">{{ analysis.real_hourly_wage.monthly_work_hours.toFixed(0) }}h</text>
            </view>
            <view class="wage-meta-item">
              <text class="wage-meta-label">行业P50</text>
              <text class="wage-meta-value">¥{{ analysis.real_hourly_wage.industry_p50_hourly.toFixed(0) }}</text>
            </view>
            <view class="wage-meta-item">
              <text class="wage-meta-label">行业分位</text>
              <text class="wage-meta-value">P{{ analysis.real_hourly_wage.percentile }}</text>
            </view>
          </view>
          <text class="wage-verdict">{{ analysis.real_hourly_wage.verdict }}</text>
        </view>
      </view>

      <!-- 口碑 -->
      <view v-if="reviews.length > 0" class="card">
        <text class="card-title">真实口碑</text>
        <view
          v-for="review in reviews"
          :key="review.id"
          class="review-item"
        >
          <view class="review-header">
            <text class="review-source">{{ getSourceLabel(review.source) }}</text>
            <text class="review-sentiment" :class="'sentiment-' + review.sentiment">
              {{ getSentimentLabel(review.sentiment) }}
            </text>
          </view>
          <text class="review-content">{{ review.content_summary }}</text>
        </view>
      </view>
    </view>

    <!-- 未找到 -->
    <view v-else class="empty-state">
      <text class="empty-text">未找到该公司</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getCompany,
  getCompanyDimensions,
  getCompanySummary,
  getCompanyAnalysis,
  getCompanyReviews,
} from "@/utils/api";
import type {
  Company,
  CompanyDimensionsResponse,
  CompanySummaryResponse,
  CompanyAnalysisResponse,
  Review,
  DimensionKey,
  DimensionAccent,
} from "@/utils/types";
import {
  LEVEL_COLORS,
  DIMENSIONS_META,
  DIMENSION_ACCENT,
  DIMENSION_LABELS,
  REVIEW_SOURCE_LABELS,
  SENTIMENT_LABELS,
  METRIC_LABELS,
  formatMetricValue,
} from "@/utils/constants";

const companyId = ref(0);
const company = ref<Company | null>(null);
const dimensions = ref<CompanyDimensionsResponse | null>(null);
const summary = ref<CompanySummaryResponse | null>(null);
const analysis = ref<CompanyAnalysisResponse | null>(null);
const reviews = ref<Review[]>([]);
const loading = ref(true);

onLoad((options: any) => {
  companyId.value = Number(options.id);
});

onMounted(async () => {
  if (!companyId.value) return;
  loading.value = true;
  try {
    const [c, dims, sum, ana, revs] = await Promise.all([
      getCompany(companyId.value),
      getCompanyDimensions(companyId.value),
      getCompanySummary(companyId.value),
      getCompanyAnalysis(companyId.value),
      getCompanyReviews(companyId.value, 10, 0),
    ]);
    company.value = c;
    dimensions.value = dims;
    summary.value = sum;
    analysis.value = ana;
    reviews.value = revs;
  } finally {
    loading.value = false;
  }
});

function getLevelColor(level: string): string {
  return LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]?.hex || "#bdbdc2";
}

function getDimLabel(key: string): string {
  return DIMENSION_LABELS[key as DimensionKey] || key;
}

function getAccent(key: string): string {
  const meta = DIMENSIONS_META.find((m) => m.key === key);
  return meta?.accent || "charcoal";
}

function getAccentBg(accent: string): string {
  return DIMENSION_ACCENT[accent]?.bg || "#efeff1";
}

function getAccentText(accent: string): string {
  return DIMENSION_ACCENT[accent]?.text || "#414149";
}

function getMetricLabel(key: string): string {
  return METRIC_LABELS[key] || key;
}

function getSourceLabel(source: string): string {
  return REVIEW_SOURCE_LABELS[source as keyof typeof REVIEW_SOURCE_LABELS] || source;
}

function getSentimentLabel(s: string): string {
  return SENTIMENT_LABELS[s as keyof typeof SENTIMENT_LABELS] || s;
}

function goBack() {
  uni.navigateBack({
    fail: () => uni.switchTab({ url: "/pages/index/index" }),
  });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1rpx solid #efeff1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  height: 112rpx;
  padding-top: var(--status-bar-height);
}

.back-btn {
  padding: 8rpx 0;
}

.back-icon {
  font-size: 40rpx;
  color: #18181b;
}

.topbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #18181b;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-right {
  width: 60rpx;
}

.content {
  padding: 32rpx;
  padding-bottom: 160rpx;
}

.skeleton-area {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.skeleton-block {
  border-radius: 24rpx;
  background: #f7f7f8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.company-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx 0;
}

.company-logo {
  width: 112rpx;
  height: 112rpx;
  border-radius: 24rpx;
  background: #f7f7f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #72727d;
}

.company-info {
  flex: 1;
  min-width: 0;
}

.company-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #18181b;
  margin-bottom: 8rpx;
}

.company-meta {
  display: block;
  font-size: 24rpx;
  color: #72727d;
  margin-top: 4rpx;
}

.card {
  background: #ffffff;
  border: 1rpx solid #efeff1;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-top: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #18181b;
}

.overall-score {
  text-align: right;
}

.overall-score-num {
  font-size: 48rpx;
  font-weight: 800;
  color: #18181b;
}

.overall-score-label {
  display: block;
  font-size: 22rpx;
  color: #72727d;
}

.traffic-light-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.tl-item {
  width: calc(33.33% - 16rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.tl-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.tl-label {
  font-size: 22rpx;
  color: #72727d;
}

.tl-score {
  font-size: 28rpx;
  font-weight: 700;
  color: #18181b;
}

.dim-detail {
  padding: 24rpx 0;
  border-top: 1rpx solid #efeff1;
}

.dim-detail:first-of-type {
  border-top: none;
  padding-top: 0;
}

.dim-detail-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.dim-detail-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dim-detail-icon-text {
  font-size: 32rpx;
  font-weight: 600;
}

.dim-detail-info {
  flex: 1;
  min-width: 0;
}

.dim-detail-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 8rpx;
}

.dim-detail-score-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.score-bar {
  flex: 1;
  height: 12rpx;
  border-radius: 999rpx;
  background: #f7f7f8;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 999rpx;
}

.dim-detail-score {
  font-size: 28rpx;
  font-weight: 700;
  color: #18181b;
  width: 64rpx;
  text-align: right;
}

.dim-detail-summary {
  font-size: 26rpx;
  color: #72727d;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.metric-label {
  font-size: 24rpx;
  color: #72727d;
  flex-shrink: 0;
}

.metric-value {
  font-size: 24rpx;
  color: #18181b;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.wage-box {
  margin-top: 16rpx;
}

.wage-main {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.wage-amount {
  font-size: 64rpx;
  font-weight: 800;
  color: #18181b;
}

.wage-unit {
  font-size: 28rpx;
  color: #72727d;
}

.wage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.wage-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.wage-meta-label {
  font-size: 22rpx;
  color: #72727d;
}

.wage-meta-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #18181b;
}

.wage-verdict {
  font-size: 26rpx;
  color: #72727d;
  line-height: 1.6;
  padding: 24rpx;
  background: #f7f7f8;
  border-radius: 16rpx;
}

.review-item {
  padding: 24rpx 0;
  border-top: 1rpx solid #efeff1;
}

.review-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.review-source {
  font-size: 24rpx;
  color: #72727d;
  font-weight: 500;
}

.review-sentiment {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}

.sentiment-positive {
  background: #dcfce7;
  color: #15803d;
}

.sentiment-neutral {
  background: #efeff1;
  color: #55555e;
}

.sentiment-negative {
  background: #ffe4e6;
  color: #be123c;
}

.review-content {
  font-size: 28rpx;
  color: #18181b;
  line-height: 1.6;
}

.empty-state {
  padding: 160rpx 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #72727d;
}
</style>
