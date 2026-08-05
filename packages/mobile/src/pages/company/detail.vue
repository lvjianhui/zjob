<template>
  <view class="page" :style="{ '--status-bar-height': statusBarHeight + 'px', '--tabbar-height': tabbarHeight + 'px', '--nav-bar-height': navBarHeight + 'px' }">
    <view class="topbar">
      <view class="topbar-left" @tap="goBack">
        <Icon name="back" :size="40" color="#18181b" />
      </view>
      <text class="topbar-title">{{ company?.short_name || company?.name || '公司详情' }}</text>
      <view class="topbar-right">
        <view class="topbar-action" aria-label="收藏" @tap="onFavorite">
          <Icon name="heart" :size="36" color="#18181b" />
        </view>
        <view class="topbar-action" aria-label="分享" @tap="onShare">
          <Icon name="share" :size="36" color="#18181b" />
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="skeleton-area">
      <view class="skeleton-block" style="height: 200rpx" />
      <view class="skeleton-block" style="height: 300rpx" />
      <view class="skeleton-block" style="height: 400rpx" />
    </view>

    <scroll-view v-else-if="company" class="content" scroll-y>
      <!-- 公司头部卡片 -->
      <view class="company-card">
        <view class="company-card-top">
          <view class="company-left">
            <view class="company-logo">
              <text class="logo-text">{{ company.short_name?.charAt(0) || company.name.charAt(0) }}</text>
            </view>
            <view class="company-info">
              <text class="company-name">{{ company.name }}</text>
              <text class="company-industry">{{ company.industry || '未知行业' }}</text>
            </view>
          </view>
          <view class="company-score">
            <text class="score-num">{{ summary ? summary.overall_score : '--' }}</text>
            <text class="score-label">综合评分</text>
          </view>
        </view>
        <view class="company-tags">
          <view v-if="company.scale" class="tag tag-default">
            <Icon name="building-2" :size="24" color="#72727d" />
            <text class="tag-text">{{ company.scale }}</text>
          </view>
          <view v-if="company.stock_code" class="tag tag-default">
            <Icon name="trending" :size="24" color="#72727d" />
            <text class="tag-text">{{ company.stock_code }}</text>
          </view>
          <view v-if="company.is_listed" class="tag tag-mint">
            <Icon name="award" :size="24" color="#047857" />
            <text class="tag-text tag-text-mint">上市企业</text>
          </view>
        </view>
      </view>

      <!-- 红绿灯总览 -->
      <view v-if="dimensions" class="section">
        <view class="section-header">
          <view class="card-header-left">
            <Icon name="gauge" :size="28" color="#72727d" />
            <text class="card-title">六维红绿灯总览</text>
          </view>
          <view class="legend">
            <view class="legend-item">
              <view class="legend-dot" style="background: #22c55e" />
              <text class="legend-text">≥80</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot" style="background: #f59e0b" />
              <text class="legend-text">60+</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot" style="background: #ef4444" />
              <text class="legend-text">{{ '<' }}60</text>
            </view>
          </view>
        </view>
        <view class="tl-grid">
          <view
            v-for="dim in dimensions.dimensions"
            :key="dim.dimension_key"
            class="tl-card"
          >
            <view class="tl-card-top">
              <view class="tl-icon-wrap" :style="{ backgroundColor: getLevelAlphaBg(dim.level) }">
                <Icon :name="getDimIcon(dim.dimension_key)" :size="28" :color="getLevelColor(dim.level)" />
              </view>
              <text class="tl-score" :style="{ color: getLevelColor(dim.level) }">{{ dim.score }}</text>
            </view>
            <text class="tl-title">{{ getDimLabel(dim.dimension_key) }}</text>
            <text v-if="dim.summary" class="tl-desc">{{ dim.summary }}</text>
          </view>
        </view>
      </view>

      <!-- 真实时薪交叉验证 -->
      <view v-if="analysis" class="card">
        <view class="wage-header">
          <view class="wage-icon">
            <Icon name="calculator" :size="28" color="#0284c7" />
          </view>
          <text class="wage-title">真实时薪交叉验证</text>
        </view>
        <view class="wage-grid">
          <view class="wage-cell">
            <text class="wage-cell-label">月到手</text>
            <text class="wage-cell-value">¥{{ formatMoney(analysis.real_hourly_wage.monthly_take_home) }}</text>
          </view>
          <view class="wage-cell">
            <text class="wage-cell-label">月工时</text>
            <text class="wage-cell-value">{{ analysis.real_hourly_wage.monthly_work_hours.toFixed(0) }}h</text>
          </view>
          <view class="wage-cell wage-cell-highlight">
            <text class="wage-cell-label wage-cell-label-highlight">真实时薪</text>
            <text class="wage-cell-value wage-cell-value-highlight">¥{{ analysis.real_hourly_wage.hourly_wage.toFixed(1) }}</text>
          </view>
        </view>
        <view class="wage-row">
          <text class="wage-row-label">行业 P50</text>
          <text class="wage-row-value">¥{{ analysis.real_hourly_wage.industry_p50_hourly.toFixed(1) }}</text>
        </view>
        <view class="wage-row">
          <text class="wage-row-label">百分位</text>
          <text class="wage-row-value wage-row-value-highlight">{{ analysis.real_hourly_wage.percentile }}%</text>
        </view>
        <view class="wage-verdict">
          <Icon name="circle-check" :size="28" color="#10b981" />
          <text class="wage-verdict-text">{{ analysis.real_hourly_wage.verdict }}</text>
        </view>
      </view>

      <!-- 六维详情 -->
      <view v-if="dimensions" class="section">
        <view class="section-header">
          <view class="card-header-left">
            <Icon name="layers" :size="28" color="#72727d" />
            <text class="card-title">六维度详情</text>
          </view>
        </view>
        <view class="dim-list">
          <view
            v-for="dim in dimensions.dimensions"
            :key="dim.dimension_key"
            class="dim-card"
          >
            <view class="dim-header">
              <view class="dim-icon" :style="{ backgroundColor: getAccentBg(getAccent(dim.dimension_key)) }">
                <Icon :name="getDimIcon(dim.dimension_key)" :size="32" :color="getAccentText(getAccent(dim.dimension_key))" />
              </view>
              <view class="dim-title-row">
                <text class="dim-title">{{ getDimLabel(dim.dimension_key) }}</text>
              </view>
              <view class="dim-score-area">
                <view class="dim-level-dot" :style="{ backgroundColor: getLevelColor(dim.level) }" />
                <text class="dim-score" :style="{ color: getLevelColor(dim.level) }">{{ dim.score }}</text>
              </view>
            </view>

            <text v-if="dim.summary" class="dim-summary">{{ dim.summary }}</text>

            <view
              class="decision-box"
              :style="{
                backgroundColor: hexToRgba(getLevelColor(dim.level), 0.08),
                borderLeftColor: getLevelColor(dim.level),
              }"
            >
              <text class="decision-label" :style="{ color: getLevelColor(dim.level) }">决策意义</text>
              <text class="decision-text">{{ getDecisionMeaning(dim.dimension_key) }}</text>
            </view>

            <view v-if="dim.metrics" class="metric-tags">
              <view
                v-for="(value, key) in dim.metrics"
                :key="String(key)"
                class="metric-tag"
              >
                <text class="metric-tag-label">{{ getMetricLabel(String(key)) }}</text>
                <text class="metric-tag-value">{{ formatMetricValue(value) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 精选口碑 -->
      <view v-if="reviews.length > 0" class="section">
        <view class="section-header">
          <view class="card-header-left">
            <Icon name="message-square" :size="28" color="#72727d" />
            <text class="card-title">精选口碑</text>
          </view>
        </view>
        <view class="review-list">
          <view
            v-for="review in reviews"
            :key="review.id"
            class="review-card"
          >
            <view class="review-tags">
              <text class="review-source-tag">{{ getSourceLabel(review.source) }}</text>
              <text class="review-sentiment-tag" :class="'sentiment-' + review.sentiment">
                {{ getSentimentLabel(review.sentiment) }}
              </text>
            </view>
            <text class="review-content">{{ review.content_summary }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 未找到 -->
    <view v-else class="empty-state">
      <text class="empty-text">未找到该公司</text>
    </view>

    <!-- 分享二维码弹窗 -->
    <view v-if="shareVisible" class="share-mask" @tap="closeShare">
      <view class="share-card" @tap.stop>
        <view class="share-close" aria-label="关闭" @tap="closeShare">
          <Icon name="close" :size="36" color="#72727d" />
        </view>
        <text class="share-title">扫码查看公司详情</text>
        <text class="share-subtitle">{{ company?.name || '公司详情' }}</text>
        <view class="share-qr-wrap">
          <image class="share-qr" :src="qrCodeData" mode="aspectFit" />
        </view>
        <text class="share-tip">扫描二维码即可查看「{{ company?.name || '该公司' }}」的六维评分详情</text>
      </view>
    </view>

    <!-- #ifndef H5 -->
    <TabBar />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import UQRCode from "uqrcodejs";
import TabBar from "@/components/TabBar/TabBar.vue";
import Icon from "@/components/Icon/Icon.vue";
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
  getSystemLayout,
} from "@/utils/constants";

const { statusBarHeight, tabbarHeight } = getSystemLayout();
// 非 H5 端使用原生导航栏（状态栏 + 44px），H5 端 topbar 高度由 CSS 单独处理
const navBarHeight = statusBarHeight + 44;
const companyId = ref(0);
const company = ref<Company | null>(null);
const dimensions = ref<CompanyDimensionsResponse | null>(null);
const summary = ref<CompanySummaryResponse | null>(null);
const analysis = ref<CompanyAnalysisResponse | null>(null);
const reviews = ref<Review[]>([]);
const loading = ref(true);
const shareVisible = ref(false);
const qrCodeData = ref("");

// 生成公司详情页的分享 URL（扫码后可直达）
function buildShareUrl(): string {
  const id = companyId.value;
  // #ifdef H5
  const origin = window.location.origin;
  return `${origin}/#/pages/company/detail?id=${id}`;
  // #endif
  // #ifndef H5
  return `https://zjob.example.com/company/${id}`;
  // #endif
}

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

function getLevelAlphaBg(level: string): string {
  return LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]?.alphaBg || "rgba(189, 189, 194, 0.133)";
}

function formatMoney(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getDimLabel(key: string): string {
  return DIMENSION_LABELS[key as DimensionKey] || key;
}

function getDimIcon(key: string): string {
  const meta = DIMENSIONS_META.find((m) => m.key === key);
  return meta?.icon || "info";
}

function getOneLiner(key: string): string {
  const meta = DIMENSIONS_META.find((m) => m.key === key);
  return meta?.oneLiner || "";
}

function getDecisionMeaning(key: string): string {
  const meta = DIMENSIONS_META.find((m) => m.key === key);
  return meta?.decisionMeaning || "";
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

function onFavorite() {
  uni.showToast({ title: "收藏功能开发中", icon: "none" });
}

function onShare() {
  const url = buildShareUrl();
  const qr = new UQRCode();
  qr.data = url;
  qr.make();
  qrCodeData.value = buildQrSvg(qr);
  shareVisible.value = true;
}

// 从 UQRCode 模块矩阵构建 SVG data URI（全端兼容，与 Icon.vue 同方案）
function buildQrSvg(qr: any): string {
  const count = qr.moduleCount;
  const size = 240;
  const cell = size / count;
  let rects = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#ffffff"/><g fill="#18181b">${rects}</g></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function closeShare() {
  shareVisible.value = false;
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f7f8;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1rpx solid #e4e4e7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  height: 112rpx;
  padding-top: var(--status-bar-height);
}

.topbar-left {
  padding: 8rpx 0;
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
  display: flex;
  align-items: center;
  gap: 8rpx;
  justify-content: flex-end;
}

.topbar-action {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  padding: 24rpx 32rpx;
  min-height: calc(100vh - var(--status-bar-height) - 112rpx);
  /* #ifndef H5 */
  padding-bottom: calc(var(--tabbar-height) + 32rpx);
  /* #endif */
  /* #ifdef H5 */
  padding-bottom: 64rpx;
  /* #endif */
  box-sizing: border-box;
}

.skeleton-area {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.skeleton-block {
  border-radius: 16px;
  background: #efeff1;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== 公司头部卡片 ===== */
.company-card {
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 16px;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.company-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.company-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
  min-width: 0;
}

.company-logo {
  width: 112rpx;
  height: 112rpx;
  border-radius: 16rpx;
  background: #18181b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
}

.company-info {
  flex: 1;
  min-width: 0;
}

.company-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #18181b;
  line-height: 1.3;
}

.company-industry {
  display: block;
  font-size: 24rpx;
  color: #72727d;
  margin-top: 4rpx;
}

.company-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.score-num {
  font-size: 48rpx;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
}

.score-label {
  font-size: 22rpx;
  color: #72727d;
  margin-top: 8rpx;
}

.company-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e4e4e7;
}

.tag-default {
  background: #f7f7f8;
}

.tag-mint {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.tag-text {
  font-size: 22rpx;
  font-weight: 500;
  color: #72727d;
}

.tag-text-mint {
  color: #047857;
}

/* ===== 通用卡片 ===== */
.card {
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 16px;
  padding: 32rpx;
  margin-top: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.card-icon {
  font-size: 32rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #18181b;
}

.legend {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.legend-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
}

.legend-text {
  font-size: 20rpx;
  color: #72727d;
}

/* ===== 区块（无边框、无padding、无阴影） ===== */
.section {
  margin-top: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding: 0 4rpx;
}

/* ===== 红绿灯总览 ===== */
.tl-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.tl-card {
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 16px;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tl-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tl-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tl-score {
  font-size: 36rpx;
  font-weight: 800;
}

.tl-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #18181b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tl-desc {
  font-size: 22rpx;
  color: #72727d;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* ===== 六维详情 ===== */
.dim-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dim-card {
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 16px;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.dim-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.dim-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dim-title-row {
  flex: 1;
  min-width: 0;
}

.dim-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #18181b;
}

.dim-score-area {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.dim-level-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.dim-score {
  font-size: 40rpx;
  font-weight: 800;
  color: #18181b;
}

.dim-summary {
  display: block;
  font-size: 26rpx;
  color: #72727d;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.decision-box {
  border-left: 4rpx solid #fde047;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 16rpx;
}

.decision-label {
  display: block;
  font-size: 22rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.decision-text {
  display: block;
  font-size: 24rpx;
  color: #18181b;
  line-height: 1.5;
}

.metric-tags {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.metric-tag {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.metric-tag-label {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  height: 40rpx;
  padding: 0 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  background: #f4f4f5;
  color: #72727d;
  margin-top: 2rpx;
}

.metric-tag-value {
  font-size: 26rpx;
  font-weight: 500;
  color: #18181b;
  flex: 1;
  min-width: 0;
  line-height: 1.5;
}

/* ===== 真实时薪交叉验证 ===== */
.wage-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.wage-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wage-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #18181b;
}

.wage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.wage-cell {
  background: #f7f7f8;
  border-radius: 12rpx;
  padding: 20rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.wage-cell-highlight {
  background: #f0fdf4;
  border: 1rpx solid #a7f3d0;
}

.wage-cell-label {
  font-size: 22rpx;
  color: #72727d;
}

.wage-cell-label-highlight {
  color: #047857;
}

.wage-cell-value {
  font-size: 30rpx;
  font-weight: 700;
  color: #18181b;
}

.wage-cell-value-highlight {
  color: #059669;
}

.wage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.wage-row-label {
  font-size: 24rpx;
  color: #72727d;
}

.wage-row-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #18181b;
}

.wage-row-value-highlight {
  color: #059669;
}

.wage-verdict {
  background: #f7f7f8;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-top: 8rpx;
}

.wage-verdict-text {
  font-size: 24rpx;
  color: #18181b;
  line-height: 1.6;
  flex: 1;
}

/* ===== 精选口碑 ===== */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.review-card {
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 16px;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.review-tags {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.review-source-tag {
  font-size: 22rpx;
  font-weight: 500;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #f4f4f5;
  color: #72727d;
}

.review-sentiment-tag {
  font-size: 22rpx;
  font-weight: 500;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}

.sentiment-positive {
  background: #ecfdf5;
  color: #047857;
}

.sentiment-neutral {
  background: #f4f4f5;
  color: #72727d;
}

.sentiment-negative {
  background: #fff1f2;
  color: #be123c;
}

.review-content {
  font-size: 26rpx;
  color: #18181b;
  line-height: 1.6;
}

/* ===== 空状态 ===== */
.empty-state {
  padding: 160rpx 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #72727d;
}

/* ===== 分享二维码弹窗 ===== */
.share-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
}

.share-card {
  position: relative;
  width: 100%;
  max-width: 560rpx;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
}

.share-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #18181b;
  text-align: center;
  margin-bottom: 8rpx;
}

.share-subtitle {
  display: block;
  font-size: 24rpx;
  color: #72727d;
  text-align: center;
  margin-bottom: 32rpx;
}

.share-qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.share-qr {
  width: 384rpx;
  height: 384rpx;
  border-radius: 16rpx;
}

.share-tip {
  display: block;
  font-size: 22rpx;
  color: #72727d;
  text-align: center;
  line-height: 1.6;
}
</style>